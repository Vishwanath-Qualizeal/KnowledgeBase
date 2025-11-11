import { useState, useEffect, useCallback } from 'react';
import { Book, DocumentInfo } from '../types';
import { apiService } from '../services/api';

const BOOK_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-indigo-500',
];

// Store book metadata in localStorage
const BOOK_METADATA_KEY = 'voltuswave-book-metadata';

interface BookMetadata {
  [documentId: string]: {
    title: string;
    author: string;
    fileName: string;
    uploadDate: string;
  };
}

const getStoredMetadata = (): BookMetadata => {
  try {
    const stored = localStorage.getItem(BOOK_METADATA_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveMetadata = (metadata: BookMetadata) => {
  try {
    localStorage.setItem(BOOK_METADATA_KEY, JSON.stringify(metadata));
  } catch (err) {
    console.error('Failed to save metadata:', err);
  }
};

const addBookMetadata = (documentId: string, title: string, author: string, fileName: string) => {
  const metadata = getStoredMetadata();
  metadata[documentId] = {
    title,
    author,
    fileName,
    uploadDate: new Date().toISOString(),
  };
  saveMetadata(metadata);
};

const removeBookMetadata = (documentId: string) => {
  const metadata = getStoredMetadata();
  delete metadata[documentId];
  saveMetadata(metadata);
};

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching documents from backend...');
      const documents = await apiService.listDocuments();
      console.log('Backend response:', documents);

      // Get stored metadata
      const metadata = getStoredMetadata();

      const booksData: Book[] = documents.map((doc: any, index: number) => {
        const docId = doc.documentId || doc.DocumentId || doc.id || 'Unknown';

        // Check if we have stored metadata for this document
        const storedMeta = metadata[docId];

        let title: string;
        let author: string;
        let fileName: string;

        if (storedMeta) {
          // Use stored metadata
          title = storedMeta.title;
          author = storedMeta.author;
          fileName = storedMeta.fileName;
        } else {
          // Fall back to document ID
          fileName = doc.fileName || doc.FileName || docId;
          title = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
          author = doc.author || 'Unknown Author';
        }

        return {
          id: docId,
          title: title,
          author: author,
          pages: doc.pages || 0,
          selected: false,
          color: BOOK_COLORS[index % BOOK_COLORS.length],
          source: fileName,
          sourceType: fileName.split('.').pop()?.toLowerCase() || 'unknown',
          chunks: doc.chunkCount || doc.ChunkCount || doc.chunks || 0,
          uploadDate: storedMeta?.uploadDate ? new Date(storedMeta.uploadDate) : new Date(),
          processingState: 'ready',
        };
      });

      console.log('Processed books:', booksData);
      
      // Smart merge: preserve any books that were recently added but might not be in backend yet
      setBooks(prevBooks => {
        // Get IDs from backend response
        const backendIds = new Set(booksData.map(b => b.id));
        
        // Keep books from previous state that are not in backend response
        // These are likely recently uploaded books still being processed
        const recentlyAddedBooks = prevBooks.filter(book => {
          // Only keep books that are less than 60 seconds old and not in backend response
          if (!book.uploadDate) return false;
          const bookAge = Date.now() - book.uploadDate.getTime();
          return !backendIds.has(book.id) && bookAge < 60000;
        });
        
        // Merge: recently added books first, then backend books
        const mergedBooks = [...recentlyAddedBooks, ...booksData];
        
        // Preserve selection state and processing state for books that exist in both
        return mergedBooks.map(book => {
          const prevBook = prevBooks.find(pb => pb.id === book.id);
          if (prevBook) {
            return { 
              ...book, 
              selected: prevBook.selected,
              // If book is now in backend, mark as ready
              processingState: backendIds.has(book.id) ? 'ready' as const : prevBook.processingState,
              processingMessage: backendIds.has(book.id) ? undefined : prevBook.processingMessage,
            };
          }
          return book;
        });
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch documents';
      setError(errorMessage);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const toggleBook = useCallback((bookId: string) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookId ? { ...book, selected: !book.selected } : book
      )
    );
  }, []);

  const addBook = useCallback(
    async (file: File, title: string, author: string) => {
      try {
        setLoading(true);
        setError(null);

        // Generate document ID with clean format
        // Use title as base, make it URL-friendly
        const cleanTitle = title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with dash
          .replace(/^-|-$/g, '');        // Remove leading/trailing dashes

        const timestamp = Date.now();
        const documentId = `${cleanTitle}-${timestamp}`;

        console.log('Uploading document:', {
          documentId,
          fileName: file.name,
          title,
          author
        });

        // Upload document
        const response = await apiService.importDocument({
          documentId,
          file,
        });

        console.log('Upload response:', response);

        // Store metadata for this book
        addBookMetadata(documentId, title, author, file.name);

        // Add book to UI immediately with processing state
        const newBook: Book = {
          id: documentId,
          title: title,
          author: author,
          pages: 0,
          selected: false,
          color: BOOK_COLORS[books.length % BOOK_COLORS.length],
          source: file.name,
          sourceType: file.name.split('.').pop()?.toLowerCase() || '',
          chunks: 0,
          uploadDate: new Date(),
          processingState: 'processing',
          processingMessage: 'Processing document...',
        };

        setBooks(prevBooks => [newBook, ...prevBooks]);

        console.log('Book added to list:', newBook);

        // Poll backend until document appears (up to 30 seconds)
        const pollForDocument = async (attempts = 0, maxAttempts = 15) => {
          if (attempts >= maxAttempts) {
            console.log('Max polling attempts reached. Document may still be processing.');
            // Mark as error state
            setBooks(prevBooks => 
              prevBooks.map(book => 
                book.id === documentId 
                  ? { ...book, processingState: 'error' as const, processingMessage: 'Processing timeout - try refreshing' }
                  : book
              )
            );
            return;
          }

          try {
            // Update processing message with attempt number
            setBooks(prevBooks => 
              prevBooks.map(book => 
                book.id === documentId 
                  ? { ...book, processingMessage: `Processing... (${attempts + 1}/15)` }
                  : book
              )
            );

            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            const documents = await apiService.listDocuments();
            const foundDoc = documents.find((doc: any) => {
              const docId = doc.documentId || doc.DocumentId || doc.id;
              return docId === documentId;
            });

            if (foundDoc) {
              console.log('Document found in backend, updating state...');
              // Mark as ready before refreshing
              setBooks(prevBooks => 
                prevBooks.map(book => 
                  book.id === documentId 
                    ? { ...book, processingState: 'ready' as const, processingMessage: 'Ready!' }
                    : book
                )
              );
              // Wait a moment to show "Ready!" message
              await new Promise(resolve => setTimeout(resolve, 500));
              // Document is ready, refresh the full list to get accurate chunk counts
              await fetchBooks();
            } else {
              // Document not ready yet, poll again
              console.log(`Polling attempt ${attempts + 1}/${maxAttempts} - document not ready yet`);
              await pollForDocument(attempts + 1, maxAttempts);
            }
          } catch (err) {
            console.error('Error polling for document:', err);
            // Mark as error on exception
            setBooks(prevBooks => 
              prevBooks.map(book => 
                book.id === documentId 
                  ? { ...book, processingState: 'error' as const, processingMessage: 'Processing error' }
                  : book
              )
            );
          }
        };

        // Start polling in the background
        pollForDocument();

        return { success: true, documentId };
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to add book';
        setError(errorMessage);
        console.error('Error adding book:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [books.length, fetchBooks]
  );

  const deleteBook = useCallback(
    async (bookId: string) => {
      try {
        setLoading(true);
        setError(null);

        console.log('Deleting document:', bookId);
        await apiService.deleteDocument(bookId);

        // Remove from local state
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));

        // Remove metadata
        removeBookMetadata(bookId);

        console.log('Book deleted:', bookId);

        return { success: true };
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete book';
        setError(errorMessage);
        console.error('Error deleting book:', err);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const selectedBooks = books.filter((book) => book.selected);

  return {
    books,
    loading,
    error,
    selectedBooks,
    toggleBook,
    addBook,
    deleteBook,
    refreshBooks: fetchBooks,
  };
};
