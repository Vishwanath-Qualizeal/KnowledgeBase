// // // src/services/api.ts - UPDATED VERSION

// // import axios, { AxiosInstance } from 'axios';
// // import {
// //   QueryResponse,
// //   DocumentInfo,
// //   ImportDocumentRequest,
// //   AskRequest,
// // } from '../types';

// // class APIService {
// //   private api: AxiosInstance;

// //   constructor() {
// //     this.api = axios.create({
// //       baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5150/api',
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //       timeout: 120000, // 2 minutes for large file uploads
// //     });

// //     // Add response interceptor for debugging
// //     this.api.interceptors.response.use(
// //       (response) => {
// //         console.log('API Response:', response.config.url, response.data);
// //         return response;
// //       },
// //       (error) => {
// //         console.error('API Error:', error.config?.url, error.response?.data || error.message);
// //         return Promise.reject(error);
// //       }
// //     );
// //   }

// //   /**
// //    * Import/Upload a document
// //    */
// //   async importDocument(request: ImportDocumentRequest): Promise<any> {
// //     const formData = new FormData();
// //     formData.append('DocumentId', request.documentId);
// //     formData.append('File', request.file);

// //     const response = await this.api.post('/Memory/import', formData, {
// //       headers: {
// //         'Content-Type': 'multipart/form-data',
// //       },
// //       onUploadProgress: (progressEvent) => {
// //         if (progressEvent.total) {
// //           const percentCompleted = Math.round(
// //             (progressEvent.loaded * 100) / progressEvent.total
// //           );
// //           console.log(`Upload Progress: ${percentCompleted}%`);
// //         }
// //       },
// //     });

// //     return response.data;
// //   }

// //   /**
// //    * List all documents
// //    */
// //   async listDocuments(): Promise<DocumentInfo[]> {
// //     try {
// //       const response = await this.api.get('/Memory/documents');

// //       // Handle different response structures
// //       if (response.data.documents) {
// //         // Backend returns { documents: [...] }
// //         return response.data.documents;
// //       } else if (Array.isArray(response.data)) {
// //         // Backend returns [...]
// //         return response.data;
// //       } else {
// //         // Unknown structure
// //         console.warn('Unexpected response structure:', response.data);
// //         return [];
// //       }
// //     } catch (error: any) {
// //       console.error('Error listing documents:', error);

// //       // Return empty array instead of throwing
// //       // This allows the app to continue working even if no documents exist
// //       if (error.response?.status === 404) {
// //         return [];
// //       }

// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get document information by ID
// //    */
// //   async getDocumentInfo(documentId: string): Promise<DocumentInfo> {
// //     const response = await this.api.get(`/Memory/documents/${documentId}`);
// //     return response.data;
// //   }

// //   /**
// //    * Ask a question using RAG
// //    */
// //   async askQuestion(request: AskRequest): Promise<QueryResponse> {
// //     const response = await this.api.post('/Memory/ask', request);
// //     return response.data;
// //   }

// //   /**
// //    * Delete a document
// //    */
// //   async deleteDocument(documentId: string): Promise<any> {
// //     const response = await this.api.delete(`/Memory/documents/${documentId}`);
// //     return response.data;
// //   }

// //   /**
// //    * Force delete a document (for stuck documents)
// //    */
// //   async forceDeleteDocument(documentId: string): Promise<any> {
// //     const response = await this.api.delete(`/Memory/documents/${documentId}/force`);
// //     return response.data;
// //   }

// //   /**
// //    * Get file hash mappings (debug endpoint)
// //    */
// //   async getFileHashes(): Promise<any> {
// //     const response = await this.api.get('/Memory/file-hashes');
// //     return response.data;
// //   }

// //   /**
// //    * Clear file hash store
// //    */
// //   async clearFileHashes(): Promise<any> {
// //     const response = await this.api.delete('/Memory/file-hashes');
// //     return response.data;
// //   }
// // }

// // export const apiService = new APIService();


// // src/services/api.ts - FIXED for correct ask endpoint

// import axios, { AxiosInstance } from 'axios';
// import {
//   QueryResponse,
//   DocumentInfo,
//   ImportDocumentRequest,
//   AskRequest,
// } from '../types';

// class APIService {
//   private api: AxiosInstance;

//   constructor() {
//     this.api = axios.create({
//       baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5150/api',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       timeout: 120000, // 2 minutes for large file uploads
//     });

//     // Add response interceptor for debugging
//     this.api.interceptors.response.use(
//       (response) => {
//         console.log('API Response:', response.config.url, response.data);
//         return response;
//       },
//       (error) => {
//         console.error('API Error:', error.config?.url, error.response?.data || error.message);
//         return Promise.reject(error);
//       }
//     );
//   }

//   /**
//    * Import/Upload a document
//    */
//   async importDocument(request: ImportDocumentRequest): Promise<any> {
//     const formData = new FormData();
//     formData.append('DocumentId', request.documentId);
//     formData.append('File', request.file);

//     const response = await this.api.post('/Memory/import', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//       onUploadProgress: (progressEvent) => {
//         if (progressEvent.total) {
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           console.log(`Upload Progress: ${percentCompleted}%`);
//         }
//       },
//     });

//     return response.data;
//   }

//   /**
//    * List all documents
//    */
//   async listDocuments(): Promise<DocumentInfo[]> {
//     try {
//       const response = await this.api.get('/Memory/documents');

//       // Handle different response structures
//       if (response.data.documents) {
//         return response.data.documents;
//       } else if (Array.isArray(response.data)) {
//         return response.data;
//       } else {
//         console.warn('Unexpected response structure:', response.data);
//         return [];
//       }
//     } catch (error: any) {
//       console.error('Error listing documents:', error);

//       if (error.response?.status === 404) {
//         return [];
//       }

//       throw error;
//     }
//   }

//   /**
//    * Get document information by ID
//    */
//   async getDocumentInfo(documentId: string): Promise<DocumentInfo> {
//     const response = await this.api.get(`/Memory/documents/${documentId}`);
//     return response.data;
//   }

//   /**
//    * Ask a question using RAG
//    * FIXED: Backend uses GET with query parameters, not POST
//    */
//   async askQuestion(request: AskRequest): Promise<QueryResponse> {
//     try {
//       // Build query parameters
//       const params: any = {
//         question: request.question,
//       };

//       // If specific documents are selected, query each one
//       // The backend accepts a single documentId parameter
//       if (request.filters?.documentIds && request.filters.documentIds.length > 0) {
//         // For multiple documents, we'll query each and combine results
//         // Or just use the first one for now
//         const documentId = request.filters.documentIds[0];
//         params.documentId = documentId;

//         console.log('Querying with documentId:', documentId);
//       }

//       console.log('Ask request params:', params);

//       // Use GET with query parameters
//       const response = await this.api.get('/Memory/ask', { params });

//       console.log('Ask response:', response.data);

//       // Transform backend response to match frontend expectations
//       // Backend returns MemoryAnswer object
//       const memoryAnswer = response.data;

//       // Build QueryResponse
//       const queryResponse: QueryResponse = {
//         question: request.question,
//         answer: memoryAnswer.Result || memoryAnswer.result || 'No answer provided',
//         noResult: memoryAnswer.NoResult || memoryAnswer.noResult || false,
//         relevantSources: (memoryAnswer.RelevantSources || memoryAnswer.relevantSources || []).map((source: any) => ({
//           text: source.Text || source.text || '',
//           relevance: source.Relevance || source.relevance || 0,
//           documentId: source.DocumentId || source.documentId || source.SourceName || '',
//           partitionId: source.PartitionId || source.partitionId || '',
//           sourceFile: source.SourceName || source.sourceName || source.Link || '',
//           tags: source.Tags || source.tags || {},
//         })),
//       };

//       return queryResponse;
//     } catch (error: any) {
//       console.error('Error in askQuestion:', error);
//       throw error;
//     }
//   }

//   /**
//    * Ask question across multiple documents
//    * Queries each document separately and combines results
//    */
//   async askQuestionMultiple(question: string, documentIds: string[]): Promise<QueryResponse> {
//     try {
//       if (documentIds.length === 0) {
//         // Query all documents (no filter)
//         return this.askQuestion({ question });
//       }

//       if (documentIds.length === 1) {
//         // Single document query
//         return this.askQuestion({
//           question,
//           filters: { documentIds },
//         });
//       }

//       // Multiple documents - query each and combine
//       const results = await Promise.all(
//         documentIds.map(docId =>
//           this.askQuestion({
//             question,
//             filters: { documentIds: [docId] },
//           }).catch(err => {
//             console.error(`Error querying ${docId}:`, err);
//             return null;
//           })
//         )
//       );

//       // Combine results
//       const validResults = results.filter(r => r !== null) as QueryResponse[];

//       if (validResults.length === 0) {
//         return {
//           question,
//           answer: 'No results found across selected documents.',
//           noResult: true,
//           relevantSources: [],
//         };
//       }

//       // Combine answers and sources
//       const combinedAnswer = validResults.map(r => r.answer).join('\n\n');
//       const combinedSources = validResults.flatMap(r => r.relevantSources || []);

//       return {
//         question,
//         answer: combinedAnswer,
//         noResult: false,
//         relevantSources: combinedSources,
//       };
//     } catch (error) {
//       console.error('Error in askQuestionMultiple:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete a document
//    */
//   async deleteDocument(documentId: string): Promise<any> {
//     const response = await this.api.delete(`/Memory/documents/${documentId}`);
//     return response.data;
//   }

//   /**
//    * Force delete a document (for stuck documents)
//    */
//   async forceDeleteDocument(documentId: string): Promise<any> {
//     const response = await this.api.delete(`/Memory/documents/${documentId}/force`);
//     return response.data;
//   }

//   /**
//    * Get file hash mappings (debug endpoint)
//    */
//   async getFileHashes(): Promise<any> {
//     const response = await this.api.get('/Memory/file-hashes');
//     return response.data;
//   }

//   /**
//    * Clear file hash store
//    */
//   async clearFileHashes(): Promise<any> {
//     const response = await this.api.delete('/Memory/file-hashes');
//     return response.data;
//   }
// }

// export const apiService = new APIService();


// src/services/api.ts - UPDATED to handle actual backend response

import axios, { AxiosInstance } from 'axios';
import {
  QueryResponse,
  DocumentInfo,
  ImportDocumentRequest,
  AskRequest,
  Book,
} from '../types';

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5150/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    });

    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.config.url, response.data);
        return response;
      },
      (error) => {
        console.error('API Error:', error.config?.url, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async importDocument(request: ImportDocumentRequest): Promise<any> {
    const formData = new FormData();
    formData.append('DocumentId', request.documentId);
    formData.append('File', request.file);

    const response = await this.api.post('/Memory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  }

  async listDocuments(): Promise<DocumentInfo[]> {
    try {
      const response = await this.api.get('/Memory/documents');

      if (response.data.documents) {
        return response.data.documents;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error listing documents:', error);

      if (error.response?.status === 404) {
        return [];
      }

      throw error;
    }
  }

  async getDocumentInfo(documentId: string): Promise<DocumentInfo> {
    const response = await this.api.get(`/Memory/documents/${documentId}`);
    return response.data;
  }

  /**
   * Ask a question using RAG
   * Backend returns: { text, noResult, question, relevantSources, tokenUsage }
   */
  async askQuestion(request: AskRequest): Promise<QueryResponse> {
    try {
      const params: any = {
        question: request.question,
      };

      if (request.filters?.documentIds && request.filters.documentIds.length > 0) {
        params.documentId = request.filters.documentIds[0];
        console.log('Querying with documentId:', params.documentId);
      }

      console.log('Ask request params:', params);

      const response = await this.api.get('/Memory/ask', { params });

      console.log('Ask response:', response.data);

      // Backend returns { text, noResult, question, relevantSources, tokenUsage }
      const backendResponse = response.data;

      // Transform to frontend format
      const queryResponse: QueryResponse = {
        question: backendResponse.question || request.question,
        answer: backendResponse.text || backendResponse.Text || backendResponse.result || backendResponse.Result || 'No answer provided',
        noResult: backendResponse.noResult || backendResponse.NoResult || false,
        relevantSources: (backendResponse.relevantSources || backendResponse.RelevantSources || []).map((source: any) => ({
          text: source.text || source.Text || source.SourceContent || '',
          relevance: source.relevance || source.Relevance || source.score || 0,
          documentId: source.documentId || source.DocumentId || source.SourceName || '',
          partitionId: source.partitionId || source.PartitionId || '',
          sourceFile: source.sourceName || source.SourceName || source.Link || '',
          tags: source.tags || source.Tags || {},
        })),
      };

      console.log('Transformed query response:', queryResponse);

      return queryResponse;
    } catch (error: any) {
      console.error('Error in askQuestion:', error);
      throw error;
    }
  }

  // async askQuestionMultiple(question: string, documentIds: string[]): Promise<QueryResponse> {
  //   try {
  //     if (documentIds.length === 0) {
  //       return this.askQuestion({ question });
  //     }

  //     if (documentIds.length === 1) {
  //       return this.askQuestion({
  //         question,
  //         filters: { documentIds },
  //       });
  //     }

  //     const results = await Promise.all(
  //       documentIds.map(docId =>
  //         this.askQuestion({
  //           question,
  //           filters: { documentIds: [docId] },
  //         }).catch(err => {
  //           console.error(`Error querying ${docId}:`, err);
  //           return null;
  //         })
  //       )
  //     );

  //     const validResults = results.filter(r => r !== null) as QueryResponse[];

  //     if (validResults.length === 0) {
  //       return {
  //         question,
  //         answer: 'No results found across selected documents.',
  //         noResult: true,
  //         relevantSources: [],
  //       };
  //     }

  //     const combinedAnswer = validResults.map(r => r.answer).join('\n\n');
  //     const combinedSources = validResults.flatMap(r => r.relevantSources || []);

  //     return {
  //       question,
  //       answer: combinedAnswer,
  //       noResult: false,
  //       relevantSources: combinedSources,
  //     };
  //   } catch (error) {
  //     console.error('Error in askQuestionMultiple:', error);
  //     throw error;
  //   }
  // }

  // src/services/api.ts — updated askQuestionMultiple

  async askQuestionMultiple(
    question: string,
    documentIds: string[],
    books: Book[]
  ): Promise<QueryResponse> {
    try {
      if (documentIds.length === 0) {
        return this.askQuestion({ question });
      }

      if (documentIds.length === 1) {
        return this.askQuestion({
          question,
          filters: { documentIds },
        });
      }

      const results = await Promise.all(
        documentIds.map(docId =>
          this.askQuestion({
            question,
            filters: { documentIds: [docId] },
          }).catch(err => {
            console.error(`Error querying ${docId}:`, err);
            return null;
          })
        )
      );

      const validResults = results.filter(r => r !== null) as QueryResponse[];

      if (validResults.length === 0) {
        return {
          question,
          answer: 'No results found.',
          noResult: true,
          relevantSources: [],
        };
      }

      // ---- NEW: only keep answers that actually contain information ----
      const usefulResults = validResults.filter(r => !r.noResult);

      if (usefulResults.length === 0) {
        return {
          question,
          answer: 'No relevant information found in the selected books.',
          noResult: true,
          relevantSources: [],
        };
      }

      // Combine only the useful answers, label them with the book title
      const combinedAnswer = usefulResults
        .map((r, i) => {
          const docId = documentIds[results.indexOf(r)];   // match original order
          const book = books.find(b => b.id === docId);
          const title = book?.title || docId;
          return `**[${title}]**\n${r.answer}`;
        })
        .join('\n\n---\n\n');

      const combinedSources = usefulResults.flatMap(r => r.relevantSources || []);

      return {
        question,
        answer: combinedAnswer,
        noResult: false,
        relevantSources: combinedSources,
      };
    } catch (error) {
      console.error('Error in askQuestionMultiple:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<any> {
    const response = await this.api.delete(`/Memory/documents/${documentId}`);
    return response.data;
  }

  async forceDeleteDocument(documentId: string): Promise<any> {
    const response = await this.api.delete(`/Memory/documents/${documentId}/force`);
    return response.data;
  }

  async getFileHashes(): Promise<any> {
    const response = await this.api.get('/Memory/file-hashes');
    return response.data;
  }

  async clearFileHashes(): Promise<any> {
    const response = await this.api.delete('/Memory/file-hashes');
    return response.data;
  }
}

export const apiService = new APIService();