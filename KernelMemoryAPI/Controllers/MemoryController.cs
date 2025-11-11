using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.KernelMemory;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Cryptography;
using MongoDB.Driver;
using MongoDB.Bson;

namespace KernelMemoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MemoryController : ControllerBase
    {
        private readonly IKernelMemory _memory;
        private readonly ILogger<MemoryController> _logger;
        private readonly IMongoDatabase _mongoDatabase;

        // Store file hash -> document ID mapping to prevent duplicate file content
        private static readonly Dictionary<string, string> FileHashStore = new();

        public MemoryController(IKernelMemory memory, ILogger<MemoryController> logger, IMongoDatabase mongoDatabase)
        {
            _memory = memory;
            _logger = logger;
            _mongoDatabase = mongoDatabase;
        }

        public class ImportDocumentRequest
        {
            [Required]
            public string DocumentId { get; set; } = string.Empty;

            [Required]
            public IFormFile? File { get; set; }
        }

        private async Task<string> CalculateFileHashAsync(IFormFile file)
        {
            using var stream = file.OpenReadStream();
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var hashBytes = await Task.Run(() => sha256.ComputeHash(stream));
            return Convert.ToBase64String(hashBytes);
        }

        /// <summary>
        /// Direct MongoDB deletion as a fallback when Kernel Memory's DeleteDocumentAsync doesn't work
        /// </summary>
        /// <summary>
        /// Direct MongoDB deletion as a fallback when Kernel Memory's DeleteDocumentAsync doesn't work
        /// </summary>
        private async Task<(bool success, int deletedCount)> DirectMongoDeleteAsync(string documentId)
        {
            try
            {
                _logger.LogInformation("Attempting direct MongoDB deletion for document: {DocId}", documentId);
                
                // Get all collections
                var collectionNames = await (await _mongoDatabase.ListCollectionNamesAsync()).ToListAsync();
                _logger.LogInformation("Found {Count} MongoDB collections", collectionNames.Count);
                
                int totalDeleted = 0;
                int maxRetries = 3;
                
                // Retry deletion multiple times as chunks may be in different states
                for (int retry = 1; retry <= maxRetries; retry++)
                {
                    _logger.LogInformation("MongoDB deletion attempt {Retry} of {Max} for {DocId}", retry, maxRetries, documentId);
                    
                    int deletedThisRound = 0;
                    
                    foreach (var collectionName in collectionNames)
                    {
                        try
                        {
                            var collection = _mongoDatabase.GetCollection<BsonDocument>(collectionName);
                            
                            // Build comprehensive filter for all possible field patterns Kernel Memory might use
                            var filterList = new List<FilterDefinition<BsonDocument>>
                            {
                                // Direct document_id field
                                Builders<BsonDocument>.Filter.Eq("document_id", documentId),
                                
                                // _id field (exact match)
                                Builders<BsonDocument>.Filter.Eq("_id", documentId),
                                
                                // Tags with __document_id
                                Builders<BsonDocument>.Filter.Eq("tags.__document_id", documentId),
                                
                                // Tags as array containing document_id
                                Builders<BsonDocument>.Filter.AnyEq("tags", documentId),
                                
                                // Payload with document_id
                                Builders<BsonDocument>.Filter.Eq("payload.document_id", documentId),
                                
                                // Index name containing document ID
                                Builders<BsonDocument>.Filter.Eq("index", documentId),
                                
                                // Regex patterns for _id starting with document ID
                                Builders<BsonDocument>.Filter.Regex("_id", new BsonRegularExpression($"^{System.Text.RegularExpressions.Regex.Escape(documentId)}", "i")),
                                
                                // Regex for _id containing document ID anywhere
                                Builders<BsonDocument>.Filter.Regex("_id", new BsonRegularExpression(System.Text.RegularExpressions.Regex.Escape(documentId), "i")),
                                
                                // Document ID in tags array as string
                                Builders<BsonDocument>.Filter.Regex("tags.__document_id", new BsonRegularExpression(System.Text.RegularExpressions.Regex.Escape(documentId), "i")),
                                
                                // Check if any field value equals the document ID
                                Builders<BsonDocument>.Filter.ElemMatch("tags", 
                                    Builders<BsonDocument>.Filter.Eq("__document_id", documentId))
                            };
                            
                            var filter = Builders<BsonDocument>.Filter.Or(filterList);
                            
                            var deleteResult = await collection.DeleteManyAsync(filter);
                            
                            if (deleteResult.DeletedCount > 0)
                            {
                                _logger.LogInformation("Deleted {Count} documents from collection {Collection} for document ID {DocId} (attempt {Retry})", 
                                    deleteResult.DeletedCount, collectionName, documentId, retry);
                                deletedThisRound += (int)deleteResult.DeletedCount;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Error deleting from collection {Collection} (attempt {Retry})", collectionName, retry);
                        }
                    }
                    
                    totalDeleted += deletedThisRound;
                    
                    if (deletedThisRound == 0)
                    {
                        // No more documents found
                        _logger.LogInformation("No more documents found in attempt {Retry}, stopping", retry);
                        break;
                    }
                    
                    // Wait between retries to allow for any propagation
                    if (retry < maxRetries)
                    {
                        await Task.Delay(1000);
                    }
                }
                
                if (totalDeleted > 0)
                {
                    _logger.LogInformation("Direct MongoDB deletion successful: deleted {Count} total documents for {DocId}", 
                        totalDeleted, documentId);
                    return (true, totalDeleted);
                }
                else
                {
                    _logger.LogWarning("Direct MongoDB deletion found no documents to delete for {DocId}", documentId);
                    return (false, 0);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during direct MongoDB deletion for {DocId}", documentId);
                return (false, 0);
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportDocument([FromForm] ImportDocumentRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            // Calculate file hash to detect duplicates
            var fileHash = await CalculateFileHashAsync(request.File);
            _logger.LogInformation("File hash: {Hash} for document {DocId}", fileHash, request.DocumentId);

            // Check for duplicate file content AND verify the document still exists
            if (FileHashStore.TryGetValue(fileHash, out var existingDocId))
            {
                _logger.LogInformation("Hash collision detected. Checking if document {ExistingDocId} still exists...", existingDocId);
                
                // Verify the document actually exists in the database
                bool documentStillExists = false;
                try
                {
                    documentStillExists = await _memory.IsDocumentReadyAsync(existingDocId);
                    _logger.LogInformation("Document {ExistingDocId} exists check: {Exists}", existingDocId, documentStillExists);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error checking if document {ExistingDocId} exists. Assuming it doesn't.", existingDocId);
                    documentStillExists = false;
                }
                
                // If document doesn't exist, remove the stale hash mapping
                if (!documentStillExists)
                {
                    _logger.LogWarning("Document {ExistingDocId} no longer exists. Removing stale hash mapping.", existingDocId);
                    FileHashStore.Remove(fileHash);
                }
                else
                {
                    // Document exists, reject the duplicate upload
                    return BadRequest(new
                    {
                        message = $"This file content already exists with document ID: '{existingDocId}'. Please use a different file or the existing document ID.",
                        existingDocumentId = existingDocId,
                        fileHash = fileHash
                    });
                }
            }

            // Save the uploaded file to a temporary path
            var tempFile = Path.Combine(Path.GetTempPath(), request.File.FileName);
            await using (var stream = System.IO.File.Create(tempFile))
            {
                await request.File.CopyToAsync(stream);
            }

            // Check if the document ID already exists
            try
            {
                if (await _memory.IsDocumentReadyAsync(request.DocumentId))
                {
                    _logger.LogInformation("Document {DocId} already exists.", request.DocumentId);
                    System.IO.File.Delete(tempFile); // Clean up
                    return Ok(new { message = $"Document '{request.DocumentId}' already exists." });
                }
            }
            catch
            {
                // Document doesn't exist yet, which is what we want
            }

            try
            {
                // Import the document from the temporary file into Kernel Memory
                _logger.LogInformation("Importing document {DocId} from temporary file {Path}", request.DocumentId, tempFile);
                await _memory.ImportDocumentAsync(tempFile, documentId: request.DocumentId);

                // Wait for document to be fully indexed (up to 5 minutes)
                var maxWaitTime = TimeSpan.FromMinutes(5);
                var checkInterval = TimeSpan.FromSeconds(2);
                var startTime = DateTime.UtcNow;
                var isReady = false;
                
                _logger.LogInformation("Waiting for document {DocId} to be indexed (max wait: {MaxWait} minutes)", 
                    request.DocumentId, maxWaitTime.TotalMinutes);

                while (DateTime.UtcNow - startTime < maxWaitTime)
                {
                    try
                    {
                        isReady = await _memory.IsDocumentReadyAsync(request.DocumentId);
                        
                        if (isReady)
                        {
                            var elapsed = DateTime.UtcNow - startTime;
                            _logger.LogInformation("Document {DocId} is now ready after {Elapsed} seconds", 
                                request.DocumentId, elapsed.TotalSeconds);
                            break;
                        }
                    }
                    catch
                    {
                        // Document not ready yet
                    }

                    await Task.Delay(checkInterval);
                }

                // Store the file hash to prevent future duplicates
                FileHashStore[fileHash] = request.DocumentId;

                if (isReady)
                {
                    _logger.LogInformation("Successfully imported document {DocId} with hash {Hash}", 
                        request.DocumentId, fileHash);

                    return Ok(new
                    {
                        message = $"Document '{request.DocumentId}' imported successfully.",
                        documentId = request.DocumentId,
                        fileHash = fileHash,
                        isReady = true,
                        status = "Ready"
                    });
                }
                else
                {
                    _logger.LogWarning("Document {DocId} import initiated but not ready within timeout", request.DocumentId);
                    
                    return StatusCode(202, new // 202 Accepted
                    {
                        message = $"Document '{request.DocumentId}' upload accepted. Processing may take a few minutes.",
                        documentId = request.DocumentId,
                        fileHash = fileHash,
                        isReady = false,
                        status = "Processing",
                        note = "The document is being processed. Please check back in a few minutes."
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing document {DocId}", request.DocumentId);
                return StatusCode(500, new { message = "Error importing document", error = ex.Message });
            }
            finally
            {
                // Clean up the temporary file
                if (System.IO.File.Exists(tempFile))
                {
                    System.IO.File.Delete(tempFile);
                }
            }
        }

        [HttpGet("ask")]
        public async Task<IActionResult> Ask(
            [FromQuery] string? documentId,
            [FromQuery, Required] string question)
        {
            _logger.LogInformation("Received question: '{Question}' for documentId: '{DocId}'",
                question, documentId ?? "ALL");

            try
            {
                MemoryAnswer answer;

                if (!string.IsNullOrEmpty(documentId))
                {
                    answer = await _memory.AskAsync(
                        question,
                        filter: MemoryFilters.ByDocument(documentId)
                    );
                    _logger.LogInformation("Document-specific search completed for {DocId}", documentId);
                }
                else
                {
                    answer = await _memory.AskAsync(question);
                    _logger.LogInformation("Global search completed across all documents");
                }

                return Ok(answer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ask request");
                return StatusCode(500, new { message = "An error occurred while processing the question.", error = ex.Message });
            }
        }

        [HttpGet("inspect")]
        public async Task<IActionResult> Inspect([FromQuery, Required] string documentId)
        {
            var results = await _memory.SearchAsync(
                query: "*",
                filter: MemoryFilters.ByDocument(documentId),
                limit: 1000 // Increase limit to get all chunks
            );

            if (!results.Results.Any())
                return NotFound(new { message = "No data found for this document." });

            // Get ALL partitions from ALL results
            var chunks = results.Results
                .SelectMany(r => r.Partitions.Select(p => p.Text))
                .ToList();

            _logger.LogInformation("Inspect returned {Count} chunks for document {DocId}", chunks.Count, documentId);

            return Ok(new { documentId, chunkCount = chunks.Count, chunks });
        }

        // NEW ENDPOINTS FOR DOCUMENT MANAGEMENT

        /// <summary>
        /// Get all available documents in the memory store
        /// </summary>
        // [HttpGet("documents")]
        // public async Task<IActionResult> GetAllDocuments()
        // {
        //     try
        //     {
        //         _logger.LogInformation("Retrieving all documents from memory store");

        //         // Search for all documents with a wildcard query
        //         var results = await _memory.SearchAsync(
        //             query: "*",
        //             limit: 1000 // Adjust based on your needs
        //         );

        //         if (!results.Results.Any())
        //         {
        //             _logger.LogInformation("No search results found");
        //             return Ok(new
        //             {
        //                 message = "No documents found in the memory store.",
        //                 documents = new List<object>(),
        //                 totalCount = 0
        //             });
        //         }

        //         // Group results by document ID and get document info
        //         var documents = results.Results
        //             .SelectMany(r => r.Partitions)
        //             .GroupBy(p => p.Tags.ContainsKey("__document_id") ? p.Tags["__document_id"].FirstOrDefault() : "unknown")
        //             .Where(g => !string.IsNullOrEmpty(g.Key) && g.Key != "unknown")
        //             .Select(g => new
        //             {
        //                 DocumentId = g.Key,
        //                 ChunkCount = g.Count(),
        //                 TotalCharacters = g.Sum(p => p.Text.Length),
        //                 FirstChunkPreview = g.First().Text.Length > 100
        //                     ? g.First().Text.Substring(0, 100) + "..."
        //                     : g.First().Text,
        //                 Tags = new Dictionary<string, List<string>>() // Simplified for now
        //             })
        //             .OrderBy(d => d.DocumentId)
        //             .ToList();

        //         _logger.LogInformation("Found {DocumentCount} documents in memory store", documents.Count);

        //         return Ok(new
        //         {
        //             documents,
        //             totalCount = documents.Count,
        //             message = $"Found {documents.Count} documents in the memory store."
        //         });
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "Error retrieving documents from memory store");
        //         return StatusCode(500, new { message = "An error occurred while retrieving documents.", error = ex.Message });
        //     }
        // }


        // MemoryController.cs - FIXED GetAllDocuments method
// Replace the existing [HttpGet("documents")] method (lines 350-406) with this:

/// <summary>
/// Get all documents from memory store
/// Uses direct MongoDB query as fallback when SearchAsync doesn't work
/// </summary>
[HttpGet("documents")]
public async Task<IActionResult> GetAllDocuments()
{
    try
    {
        _logger.LogInformation("Retrieving all documents from memory store");

        // Method 1: Try Kernel Memory SearchAsync first
        var results = await _memory.SearchAsync(
            query: "*",
            limit: 1000
        );

        var documents = new List<object>();

        if (results.Results.Any())
        {
            // Group results by document ID and get document info
            documents = results.Results
                .SelectMany(r => r.Partitions)
                .GroupBy(p => p.Tags.ContainsKey("__document_id") ? p.Tags["__document_id"].FirstOrDefault() : "unknown")
                .Where(g => !string.IsNullOrEmpty(g.Key) && g.Key != "unknown")
                .Select(g => new
                {
                    DocumentId = g.Key,
                    FileName = g.Key, // Add fileName for frontend compatibility
                    ChunkCount = g.Count(),
                    UploadDate = DateTime.UtcNow.ToString("o"), // Add upload date
                    Status = "Ready",
                    TotalCharacters = g.Sum(p => p.Text.Length),
                    FirstChunkPreview = g.First().Text.Length > 100
                        ? g.First().Text.Substring(0, 100) + "..."
                        : g.First().Text
                })
                .OrderBy(d => d.DocumentId)
                .Cast<object>()
                .ToList();

            _logger.LogInformation("Found {DocumentCount} documents via SearchAsync", documents.Count);
        }
        else
        {
            _logger.LogWarning("SearchAsync returned no results, trying direct MongoDB query");

            // Method 2: Fallback to direct MongoDB query
            try
            {
                var collection = _mongoDatabase.GetCollection<BsonDocument>("_ix__kernel_memory_single_index");
                
                // Get distinct document IDs from tags
                var pipeline = new[]
                {
                    new BsonDocument("$match", new BsonDocument("tags.__document_id", new BsonDocument("$exists", true))),
                    new BsonDocument("$group", new BsonDocument
                    {
                        { "_id", "$tags.__document_id" },
                        { "count", new BsonDocument("$sum", 1) },
                        { "firstText", new BsonDocument("$first", "$payload") }
                    })
                };

                var aggregateResult = await collection.Aggregate<BsonDocument>(pipeline).ToListAsync();

                foreach (var doc in aggregateResult)
                {
                    var docIdArray = doc["_id"].AsBsonArray;
                    if (docIdArray != null && docIdArray.Count > 0)
                    {
                        var documentId = docIdArray[0].AsString;
                        var chunkCount = doc["count"].ToInt32();

                        documents.Add(new
                        {
                            DocumentId = documentId,
                            FileName = documentId, // Use documentId as fileName
                            ChunkCount = chunkCount,
                            UploadDate = DateTime.UtcNow.ToString("o"),
                            Status = "Ready"
                        });
                    }
                }

                _logger.LogInformation("Found {DocumentCount} documents via direct MongoDB query", documents.Count);
            }
            catch (Exception mongoEx)
            {
                _logger.LogError(mongoEx, "Direct MongoDB query also failed");
            }
        }

        if (documents.Count == 0)
        {
            _logger.LogInformation("No documents found by any method");
            return Ok(new
            {
                message = "No documents found in the memory store.",
                documents = new List<object>(),
                totalCount = 0
            });
        }

        return Ok(new
        {
            documents,
            totalCount = documents.Count,
            message = $"Found {documents.Count} documents in the memory store."
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving documents from memory store");
        return StatusCode(500, new { message = "An error occurred while retrieving documents.", error = ex.Message });
    }
}





        /// <summary>
        /// Debug endpoint to check if any documents exist at all, including non-ready ones
        /// </summary>
        [HttpGet("documents/debug")]
        public async Task<IActionResult> GetAllDocumentsDebug()
        {
            try
            {
                _logger.LogInformation("DEBUG: Retrieving ALL documents including non-ready ones");

                // Search for all documents with a wildcard query
                var results = await _memory.SearchAsync(
                    query: "*",
                    limit: 1000
                );

                if (!results.Results.Any())
                {
                    return Ok(new
                    {
                        message = "No documents found in the memory store at all.",
                        totalDocuments = 0,
                        documents = new List<object>()
                    });
                }

                // Group results by document ID
                var documentGroups = results.Results
                    .SelectMany(r => r.Partitions)
                    .GroupBy(p => p.Tags.ContainsKey("__document_id") ? p.Tags["__document_id"].FirstOrDefault() : "unknown")
                    .ToList();

                var allDocuments = new List<object>();
                
                foreach (var group in documentGroups)
                {
                    var documentId = group.Key;
                    if (string.IsNullOrEmpty(documentId) || documentId == "unknown")
                        continue;

                    bool isReady = false;
                    string status = "Unknown";
                    
                    try
                    {
                        isReady = await _memory.IsDocumentReadyAsync(documentId);
                        status = isReady ? "Ready" : "Processing";
                    }
                    catch (Exception ex)
                    {
                        status = $"Error: {ex.Message}";
                    }

                    allDocuments.Add(new
                    {
                        DocumentId = documentId,
                        IsReady = isReady,
                        Status = status,
                        ChunkCount = group.Count()
                    });
                }

                _logger.LogInformation("DEBUG: Found {TotalCount} documents", allDocuments.Count);

                return Ok(new
                {
                    totalDocuments = allDocuments.Count,
                    documents = allDocuments.OrderBy(d => ((dynamic)d).DocumentId).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving debug documents");
                return StatusCode(500, new { message = "Error retrieving documents", error = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed information about a specific document
        /// </summary>
        [HttpGet("documents/{documentId}")]
        public async Task<IActionResult> GetDocumentDetails(string documentId)
        {
            try
            {
                _logger.LogInformation("Retrieving details for document: {DocId}", documentId);

                // Check if document exists and is ready
                var isReady = await _memory.IsDocumentReadyAsync(documentId);
                if (!isReady)
                {
                    return NotFound(new { message = $"Document '{documentId}' not found or not ready." });
                }

                // Get all chunks for this document
                var results = await _memory.SearchAsync(
                    query: "*",
                    filter: MemoryFilters.ByDocument(documentId),
                    limit: 1000
                );

                if (!results.Results.Any())
                {
                    return NotFound(new { message = $"No data found for document '{documentId}'." });
                }

                var allPartitions = results.Results.SelectMany(r => r.Partitions).ToList();

                var documentDetails = new
                {
                    DocumentId = documentId,
                    IsReady = isReady,
                    ChunkCount = allPartitions.Count,
                    TotalCharacters = allPartitions.Sum(p => p.Text.Length),
                    AverageChunkSize = allPartitions.Any() ? (int)allPartitions.Average(p => p.Text.Length) : 0,
                    Tags = new Dictionary<string, List<string>>(), // Simplified for now
                    Chunks = allPartitions.Select((p, index) => new
                    {
                        Index = index + 1,
                        CharacterCount = p.Text.Length,
                        Preview = p.Text.Length > 200 ? p.Text.Substring(0, 200) + "..." : p.Text,
                        FullText = p.Text // Include full text if needed
                    }).ToList()
                };

                _logger.LogInformation("Retrieved details for document {DocId}: {ChunkCount} chunks, {TotalChars} characters",
                    documentId, documentDetails.ChunkCount, documentDetails.TotalCharacters);

                return Ok(documentDetails);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving details for document {DocId}", documentId);
                return StatusCode(500, new { message = "An error occurred while retrieving document details.", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if a specific document exists and is ready
        /// </summary>
        [HttpGet("documents/{documentId}/status")]
        public async Task<IActionResult> GetDocumentStatus(string documentId)
        {
            try
            {
                _logger.LogInformation("Checking status for document: {DocId}", documentId);

                var isReady = await _memory.IsDocumentReadyAsync(documentId);

                return Ok(new
                {
                    DocumentId = documentId,
                    IsReady = isReady,
                    Status = isReady ? "Ready" : "Not Found or Processing",
                    Message = isReady
                        ? $"Document '{documentId}' is ready for querying."
                        : $"Document '{documentId}' not found or still processing."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking status for document {DocId}", documentId);
                return StatusCode(500, new { message = "An error occurred while checking document status.", error = ex.Message });
            }
        }

        /// <summary>
        /// Get a list of just document IDs (lightweight endpoint)
        /// </summary>
        [HttpGet("documents/ids")]
        public async Task<IActionResult> GetDocumentIds()
        {
            try
            {
                _logger.LogInformation("Retrieving all document IDs");

                var results = await _memory.SearchAsync(
                    query: "*",
                    limit: 1000
                );

                if (!results.Results.Any())
                {
                    _logger.LogInformation("No search results found");
                    return Ok(new
                    {
                        documentIds = new List<string>(),
                        totalCount = 0,
                        message = "No documents found."
                    });
                }

                var potentialDocumentIds = results.Results
                    .SelectMany(r => r.Partitions)
                    .Where(p => p.Tags.ContainsKey("__document_id"))
                    .Select(p => p.Tags["__document_id"].FirstOrDefault())
                    .Where(id => !string.IsNullOrEmpty(id))
                    .Distinct()
                    .ToList();

                _logger.LogInformation("Found {Count} potential document IDs from search", potentialDocumentIds.Count);

                // Just return all document IDs - don't filter by ready status
                // The frontend can check status separately if needed
                var orderedIds = potentialDocumentIds.OrderBy(id => id).ToList();

                _logger.LogInformation("Returning {DocumentCount} unique document IDs", orderedIds.Count);

                return Ok(new
                {
                    documentIds = orderedIds,
                    totalCount = orderedIds.Count,
                    message = $"Found {orderedIds.Count} document(s)."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving document IDs");
                return StatusCode(500, new { message = "An error occurred while retrieving document IDs.", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a specific document from memory store
        /// </summary>
        [HttpDelete("documents/{documentId}")]
        public async Task<IActionResult> DeleteDocument(string documentId)
        {
            try
            {
                _logger.LogInformation("Attempting to delete document: {DocId}", documentId);

                // First verify the document exists
                try
                {
                    await _memory.IsDocumentReadyAsync(documentId);
                    _logger.LogInformation("Document {DocId} exists and is being deleted", documentId);
                }
                catch
                {
                    _logger.LogWarning("Document {DocId} status check failed, attempting delete anyway", documentId);
                }

                // Try Kernel Memory's deletion with multiple attempts
                int maxKernelMemoryAttempts = 3;
                bool kernelMemoryDeletionSuccessful = false;
                
                for (int attempt = 1; attempt <= maxKernelMemoryAttempts; attempt++)
                {
                    _logger.LogInformation("Kernel Memory delete attempt {Attempt} of {Max} for document: {DocId}", 
                        attempt, maxKernelMemoryAttempts, documentId);
                    
                    try
                    {
                        await _memory.DeleteDocumentAsync(documentId);
                        _logger.LogInformation("Called DeleteDocumentAsync for document: {DocId} (attempt {Attempt})", 
                            documentId, attempt);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "DeleteDocumentAsync threw exception on attempt {Attempt} for {DocId}", 
                            attempt, documentId);
                    }
                    
                    // Wait with progressive delay (2s, 4s, 6s)
                    int delayMs = 2000 * attempt;
                    await Task.Delay(delayMs);
                    
                    // Check if chunks still exist
                    var verifyResults = await _memory.SearchAsync(
                        query: "*",
                        filter: MemoryFilters.ByDocument(documentId),
                        limit: 100 // Check more chunks
                    );
                    
                    var remainingChunks = verifyResults.Results.Count();
                    _logger.LogInformation("After attempt {Attempt}: {RemainingChunks} chunks remain for {DocId}", 
                        attempt, remainingChunks, documentId);
                    
                    if (remainingChunks == 0)
                    {
                        kernelMemoryDeletionSuccessful = true;
                        _logger.LogInformation("Document {DocId} successfully deleted via Kernel Memory on attempt {Attempt}", 
                            documentId, attempt);
                        break;
                    }
                }
                
                // If Kernel Memory deletion didn't remove all chunks, try direct MongoDB deletion
                if (!kernelMemoryDeletionSuccessful)
                {
                    _logger.LogWarning("Kernel Memory deletion incomplete for {DocId}, attempting direct MongoDB deletion", documentId);
                    
                    var (mongoSuccess, deletedCount) = await DirectMongoDeleteAsync(documentId);
                    
                    if (mongoSuccess && deletedCount > 0)
                    {
                        _logger.LogInformation("Direct MongoDB deletion successful for {DocId}: deleted {Count} records", 
                            documentId, deletedCount);
                        
                        // Wait for deletion to propagate
                        await Task.Delay(3000);
                        
                        // Final verification
                        var finalVerify = await _memory.SearchAsync(
                            query: "*",
                            filter: MemoryFilters.ByDocument(documentId),
                            limit: 100
                        );
                        
                        var remainingAfterMongo = finalVerify.Results.Count();
                        _logger.LogInformation("After MongoDB deletion: {RemainingChunks} chunks remain for {DocId}", 
                            remainingAfterMongo, documentId);
                        
                        if (remainingAfterMongo > 0)
                        {
                            _logger.LogWarning("Some chunks still exist after MongoDB deletion for {DocId}: {Count} remaining", 
                                documentId, remainingAfterMongo);
                            
                            // Try one more round of Kernel Memory + MongoDB deletion
                            _logger.LogInformation("Attempting final cleanup round for {DocId}", documentId);
                            
                            try
                            {
                                await _memory.DeleteDocumentAsync(documentId);
                                await Task.Delay(2000);
                                
                                var (finalMongoSuccess, finalMongoDeleted) = await DirectMongoDeleteAsync(documentId);
                                if (finalMongoDeleted > 0)
                                {
                                    _logger.LogInformation("Final cleanup deleted {Count} more chunks for {DocId}", 
                                        finalMongoDeleted, documentId);
                                }
                                
                                await Task.Delay(2000);
                                
                                // Ultimate verification
                                var ultimateVerify = await _memory.SearchAsync(
                                    query: "*",
                                    filter: MemoryFilters.ByDocument(documentId),
                                    limit: 100
                                );
                                
                                var ultimateRemaining = ultimateVerify.Results.Count();
                                
                                if (ultimateRemaining > 0)
                                {
                                    return StatusCode(500, new
                                    {
                                        message = $"Document '{documentId}' partially deleted. {ultimateRemaining} chunks could not be removed.",
                                        documentId = documentId,
                                        remainingChunks = ultimateRemaining,
                                        error = "Some chunks persist after multiple deletion attempts",
                                        suggestion = "Wait a few minutes and try deleting again, or contact support"
                                    });
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Error during final cleanup for {DocId}", documentId);
                            }
                        }
                    }
                    else
                    {
                        _logger.LogError("Both Kernel Memory and direct MongoDB deletion failed for {DocId}", documentId);
                        
                        return StatusCode(500, new 
                        { 
                            message = $"Document '{documentId}' deletion failed. The document could not be removed from storage.",
                            documentId = documentId,
                            error = "Both Kernel Memory API and direct MongoDB deletion attempts failed",
                            suggestion = "Check MongoDB connection and try again",
                            technicalDetails = "The document may have already been deleted or may be in an inconsistent state"
                        });
                    }
                }

                // ALWAYS remove from hash store, regardless of deletion success
                // This prevents orphaned hash entries from blocking future uploads
                var hashToRemove = FileHashStore.FirstOrDefault(kvp => kvp.Value == documentId).Key;
                if (!string.IsNullOrEmpty(hashToRemove))
                {
                    FileHashStore.Remove(hashToRemove);
                    _logger.LogInformation("Removed hash mapping for document {DocId}", documentId);
                }
                else
                {
                    _logger.LogInformation("No hash mapping found for document {DocId}", documentId);
                }

                _logger.LogInformation("Successfully deleted document: {DocId}", documentId);

                return Ok(new
                {
                    message = $"Document '{documentId}' deleted successfully.",
                    documentId = documentId,
                    method = kernelMemoryDeletionSuccessful ? "KernelMemory" : "DirectMongoDB",
                    verified = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocId}", documentId);
                return StatusCode(500, new { 
                    message = "An error occurred while deleting the document.", 
                    error = ex.Message,
                    documentId = documentId
                });
            }
        }

        /// <summary>
        /// Force delete a document and all its chunks from MongoDB (for stuck/corrupted documents)
        /// </summary>
        [HttpDelete("documents/{documentId}/force")]
        public async Task<IActionResult> ForceDeleteDocument(string documentId)
        {
            try
            {
                _logger.LogWarning("Force deleting document: {DocId}", documentId);

                // Try multiple delete attempts
                for (int attempt = 1; attempt <= 3; attempt++)
                {
                    _logger.LogInformation("Force delete attempt {Attempt} for {DocId}", attempt, documentId);
                    
                    try
                    {
                        await _memory.DeleteDocumentAsync(documentId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Delete attempt {Attempt} failed for {DocId}", attempt, documentId);
                    }
                    
                    await Task.Delay(1000 * attempt); // Progressive delay: 1s, 2s, 3s
                }
                
                // Verify chunks are gone
                var remainingChunks = await _memory.SearchAsync(
                    query: "*",
                    filter: MemoryFilters.ByDocument(documentId),
                    limit: 100
                );
                
                var chunkCount = remainingChunks.Results.Count();
                
                // Remove from hash store
                var hashToRemove = FileHashStore.FirstOrDefault(kvp => kvp.Value == documentId).Key;
                if (!string.IsNullOrEmpty(hashToRemove))
                {
                    FileHashStore.Remove(hashToRemove);
                }
                
                if (chunkCount > 0)
                {
                    _logger.LogError("Force delete incomplete: {ChunkCount} chunks remain for {DocId}", 
                        chunkCount, documentId);
                    
                    return StatusCode(207, new // 207 Multi-Status
                    {
                        message = $"Document '{documentId}' partially deleted.",
                        documentId = documentId,
                        remainingChunks = chunkCount,
                        warning = "Some chunks may still exist in MongoDB. Manual database cleanup may be required.",
                        recommendation = "Contact your database administrator to manually remove chunks."
                    });
                }
                
                _logger.LogInformation("Force delete successful: {DocId}", documentId);
                
                return Ok(new
                {
                    message = $"Document '{documentId}' force deleted successfully.",
                    documentId = documentId,
                    attempts = 3,
                    verified = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error force deleting document {DocId}", documentId);
                return StatusCode(500, new { 
                    message = "An error occurred during force delete.", 
                    error = ex.Message,
                    documentId = documentId
                });
            }
        }

        // OPTIONAL: Debug endpoints for file hash management

        /// <summary>
        /// Get current file hash mappings (for debugging)
        /// </summary>
        [HttpGet("file-hashes")]
        public IActionResult GetFileHashes()
        {
            return Ok(new
            {
                fileHashes = FileHashStore.ToDictionary(kvp => kvp.Value, kvp => kvp.Key),
                totalMappings = FileHashStore.Count,
                message = "Current file hash mappings"
            });
        }

        /// <summary>
        /// Clear file hash store (for testing)
        /// </summary>
        [HttpDelete("file-hashes")]
        public IActionResult ClearFileHashes()
        {
            var count = FileHashStore.Count;
            FileHashStore.Clear();
            return Ok(new
            {
                message = $"File hash store cleared. Removed {count} mappings.",
                clearedMappings = count
            });
        }
    }
}