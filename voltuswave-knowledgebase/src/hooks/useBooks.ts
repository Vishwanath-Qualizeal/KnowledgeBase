// // // // src/hooks/useBooks.ts - FIXED VERSION

// // // import { useState, useEffect, useCallback } from 'react';
// // // import { Book, DocumentInfo } from '../types';
// // // import { apiService } from '../services/api';

// // // const BOOK_COLORS = [
// // //   'bg-purple-500',
// // //   'bg-blue-500',
// // //   'bg-green-500',
// // //   'bg-orange-500',
// // //   'bg-pink-500',
// // //   'bg-red-500',
// // //   'bg-yellow-500',
// // //   'bg-indigo-500',
// // // ];

// // // export const useBooks = () => {
// // //   const [books, setBooks] = useState<Book[]>([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [error, setError] = useState<string | null>(null);

// // //   const fetchBooks = useCallback(async () => {
// // //     try {
// // //       setLoading(true);
// // //       setError(null);

// // //       console.log('Fetching documents from backend...');
// // //       const documents = await apiService.listDocuments();
// // //       console.log('Backend response:', documents);

// // //       // Handle the actual backend response structure
// // //       const booksData: Book[] = documents.map((doc: any, index: number) => {
// // //         // The backend returns documentId, not fileName
// // //         // We'll use documentId as the title
// // //         const docId = doc.documentId || doc.id || 'Unknown';
// // //         const fileName = doc.fileName || docId;

// // //         return {
// // //           id: docId,
// // //           title: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension safely
// // //           author: doc.author || 'Unknown Author',
// // //           pages: doc.pages || 0,
// // //           selected: false,
// // //           color: BOOK_COLORS[index % BOOK_COLORS.length],
// // //           source: fileName,
// // //           sourceType: fileName.split('.').pop()?.toLowerCase() || 'unknown',
// // //           chunks: doc.chunkCount || doc.chunks || 0,
// // //           uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
// // //         };
// // //       });

// // //       console.log('Processed books:', booksData);
// // //       setBooks(booksData);
// // //     } catch (err: any) {
// // //       const errorMessage = err.message || 'Failed to fetch documents';
// // //       setError(errorMessage);
// // //       console.error('Error fetching books:', err);

// // //       // Don't throw - just set empty books array
// // //       setBooks([]);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   useEffect(() => {
// // //     fetchBooks();
// // //   }, [fetchBooks]);

// // //   const toggleBook = useCallback((bookId: string) => {
// // //     setBooks((prevBooks) =>
// // //       prevBooks.map((book) =>
// // //         book.id === bookId ? { ...book, selected: !book.selected } : book
// // //       )
// // //     );
// // //   }, []);

// // //   const addBook = useCallback(
// // //     async (file: File, title: string, author: string) => {
// // //       try {
// // //         setLoading(true);
// // //         setError(null);

// // //         // Generate document ID from title and timestamp
// // //         const documentId = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

// // //         console.log('Uploading document:', { documentId, fileName: file.name });

// // //         // Upload document
// // //         const response = await apiService.importDocument({
// // //           documentId,
// // //           file,
// // //         });

// // //         console.log('Upload response:', response);

// // //         // Refresh books list after successful upload
// // //         await fetchBooks();

// // //         return { success: true, documentId };
// // //       } catch (err: any) {
// // //         const errorMessage = err.response?.data?.message || err.message || 'Failed to add book';
// // //         setError(errorMessage);
// // //         console.error('Error adding book:', err);
// // //         return { success: false, error: errorMessage };
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     },
// // //     [fetchBooks]
// // //   );

// // //   const deleteBook = useCallback(
// // //     async (bookId: string) => {
// // //       try {
// // //         setLoading(true);
// // //         setError(null);

// // //         console.log('Deleting document:', bookId);
// // //         await apiService.deleteDocument(bookId);

// // //         // Remove from local state immediately
// // //         setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));

// // //         return { success: true };
// // //       } catch (err: any) {
// // //         const errorMessage = err.response?.data?.message || err.message || 'Failed to delete book';
// // //         setError(errorMessage);
// // //         console.error('Error deleting book:', err);
// // //         return { success: false, error: errorMessage };
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     },
// // //     []
// // //   );

// // //   const selectedBooks = books.filter((book) => book.selected);

// // //   return {
// // //     books,
// // //     loading,
// // //     error,
// // //     selectedBooks,
// // //     toggleBook,
// // //     addBook,
// // //     deleteBook,
// // //     refreshBooks: fetchBooks,
// // //   };
// // // };

// // // src/hooks/useBooks.ts - WITH WORKAROUND

// // import { useState, useEffect, useCallback } from 'react';
// // import { Book, DocumentInfo } from '../types';
// // import { apiService } from '../services/api';

// // const BOOK_COLORS = [
// //   'bg-purple-500',
// //   'bg-blue-500',
// //   'bg-green-500',
// //   'bg-orange-500',
// //   'bg-pink-500',
// //   'bg-red-500',
// //   'bg-yellow-500',
// //   'bg-indigo-500',
// // ];

// // export const useBooks = () => {
// //   const [books, setBooks] = useState<Book[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   const fetchBooks = useCallback(async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);

// //       console.log('Fetching documents from backend...');
// //       const documents = await apiService.listDocuments();
// //       console.log('Backend response:', documents);

// //       // Handle the actual backend response structure
// //       const booksData: Book[] = documents.map((doc: any, index: number) => {
// //         const docId = doc.documentId || doc.DocumentId || doc.id || 'Unknown';
// //         const fileName = doc.fileName || doc.FileName || docId;

// //         return {
// //           id: docId,
// //           title: fileName.replace(/\.[^/.]+$/, ''),
// //           author: doc.author || 'Unknown Author',
// //           pages: doc.pages || 0,
// //           selected: false,
// //           color: BOOK_COLORS[index % BOOK_COLORS.length],
// //           source: fileName,
// //           sourceType: fileName.split('.').pop()?.toLowerCase() || 'unknown',
// //           chunks: doc.chunkCount || doc.ChunkCount || doc.chunks || 0,
// //           uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
// //         };
// //       });

// //       console.log('Processed books:', booksData);
// //       setBooks(booksData);
// //     } catch (err: any) {
// //       const errorMessage = err.message || 'Failed to fetch documents';
// //       setError(errorMessage);
// //       console.error('Error fetching books:', err);

// //       // Don't throw - just keep current books
// //       // This allows the app to work even if backend endpoint fails
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchBooks();
// //   }, [fetchBooks]);

// //   const toggleBook = useCallback((bookId: string) => {
// //     setBooks((prevBooks) =>
// //       prevBooks.map((book) =>
// //         book.id === bookId ? { ...book, selected: !book.selected } : book
// //       )
// //     );
// //   }, []);

// //   const addBook = useCallback(
// //     async (file: File, title: string, author: string) => {
// //       try {
// //         setLoading(true);
// //         setError(null);

// //         // Generate document ID from title and timestamp
// //         const documentId = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

// //         console.log('Uploading document:', { documentId, fileName: file.name });

// //         // Upload document
// //         const response = await apiService.importDocument({
// //           documentId,
// //           file,
// //         });

// //         console.log('Upload response:', response);

// //         // WORKAROUND: Manually add the book to state after successful upload
// //         // The backend GET /documents endpoint doesn't work reliably with MongoDB Atlas
// //         // So we add the book directly instead of refetching
// //         const newBook: Book = {
// //           id: documentId,
// //           title: title,
// //           author: author,
// //           pages: 0,
// //           selected: false,
// //           color: BOOK_COLORS[books.length % BOOK_COLORS.length],
// //           source: file.name,
// //           sourceType: file.name.split('.').pop()?.toLowerCase() || '',
// //           chunks: 0, // We don't know the chunk count yet
// //           uploadDate: new Date(),
// //         };

// //         // Add to the beginning of the books list
// //         setBooks(prevBooks => [newBook, ...prevBooks]);

// //         console.log('Book added to list:', newBook);

// //         // Try to fetch from backend anyway (in case it works)
// //         // This will update chunk counts if successful
// //         setTimeout(() => {
// //           fetchBooks().catch(err => {
// //             console.log('Background fetch failed, but that\'s okay - book is already in list');
// //           });
// //         }, 2000);

// //         return { success: true, documentId };
// //       } catch (err: any) {
// //         const errorMessage = err.response?.data?.message || err.message || 'Failed to add book';
// //         setError(errorMessage);
// //         console.error('Error adding book:', err);
// //         return { success: false, error: errorMessage };
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //     [books.length, fetchBooks]
// //   );

// //   const deleteBook = useCallback(
// //     async (bookId: string) => {
// //       try {
// //         setLoading(true);
// //         setError(null);

// //         console.log('Deleting document:', bookId);
// //         await apiService.deleteDocument(bookId);

// //         // Remove from local state immediately
// //         setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));

// //         console.log('Book deleted:', bookId);

// //         return { success: true };
// //       } catch (err: any) {
// //         const errorMessage = err.response?.data?.message || err.message || 'Failed to delete book';
// //         setError(errorMessage);
// //         console.error('Error deleting book:', err);
// //         return { success: false, error: errorMessage };
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //     []
// //   );

// //   const selectedBooks = books.filter((book) => book.selected);

// //   return {
// //     books,
// //     loading,
// //     error,
// //     selectedBooks,
// //     toggleBook,
// //     addBook,
// //     deleteBook,
// //     refreshBooks: fetchBooks,
// //   };
// // };





// // src/hooks/useBooks.ts - WITH WORKAROUND

// import { useState, useEffect, useCallback } from 'react';
// import { Book, DocumentInfo } from '../types';
// import { apiService } from '../services/api';

// const BOOK_COLORS = [
//   'bg-purple-500',
//   'bg-blue-500',
//   'bg-green-500',
//   'bg-orange-500',
//   'bg-pink-500',
//   'bg-red-500',
//   'bg-yellow-500',
//   'bg-indigo-500',
// ];

// export const useBooks = () => {
//   const [books, setBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchBooks = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       console.log('Fetching documents from backend...');
//       const documents = await apiService.listDocuments();
//       console.log('Backend response:', documents);

//       // Handle the actual backend response structure
//       const booksData: Book[] = documents.map((doc: any, index: number) => {
//         const docId = doc.documentId || doc.DocumentId || doc.id || 'Unknown';
//         const fileName = doc.fileName || doc.FileName || docId;

//         return {
//           id: docId,
//           title: fileName.replace(/\.[^/.]+$/, ''),
//           author: doc.author || 'Unknown Author',
//           pages: doc.pages || 0,
//           selected: false,
//           color: BOOK_COLORS[index % BOOK_COLORS.length],
//           source: fileName,
//           sourceType: fileName.split('.').pop()?.toLowerCase() || 'unknown',
//           chunks: doc.chunkCount || doc.ChunkCount || doc.chunks || 0,
//           uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
//         };
//       });

//       console.log('Processed books:', booksData);
//       setBooks(booksData);
//     } catch (err: any) {
//       const errorMessage = err.message || 'Failed to fetch documents';
//       setError(errorMessage);
//       console.error('Error fetching books:', err);

//       // Don't throw - just keep current books
//       // This allows the app to work even if backend endpoint fails
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchBooks();
//   }, [fetchBooks]);

//   const toggleBook = useCallback((bookId: string) => {
//     setBooks((prevBooks) =>
//       prevBooks.map((book) =>
//         book.id === bookId ? { ...book, selected: !book.selected } : book
//       )
//     );
//   }, []);

//   const addBook = useCallback(
//     async (file: File, title: string, author: string) => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Generate document ID from title and timestamp
//         const documentId = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

//         console.log('Uploading document:', { documentId, fileName: file.name });

//         // Upload document
//         const response = await apiService.importDocument({
//           documentId,
//           file,
//         });

//         console.log('Upload response:', response);

//         // WORKAROUND: Manually add the book to state after successful upload
//         // The backend GET /documents endpoint doesn't work reliably with MongoDB Atlas
//         // So we add the book directly instead of refetching
//         const newBook: Book = {
//           id: documentId,
//           title: title,
//           author: author,
//           pages: 0,
//           selected: false,
//           color: BOOK_COLORS[books.length % BOOK_COLORS.length],
//           source: file.name,
//           sourceType: file.name.split('.').pop()?.toLowerCase() || '',
//           chunks: 0, // We don't know the chunk count yet
//           uploadDate: new Date(),
//         };

//         // Add to the beginning of the books list
//         setBooks(prevBooks => [newBook, ...prevBooks]);

//         console.log('Book added to list:', newBook);

//         // Try to fetch from backend anyway (in case it works)
//         // This will update chunk counts if successful
//         setTimeout(() => {
//           fetchBooks().catch(err => {
//             console.log('Background fetch failed, but that\'s okay - book is already in list');
//           });
//         }, 2000);

//         return { success: true, documentId };
//       } catch (err: any) {
//         const errorMessage = err.response?.data?.message || err.message || 'Failed to add book';
//         setError(errorMessage);
//         console.error('Error adding book:', err);
//         return { success: false, error: errorMessage };
//       } finally {
//         setLoading(false);
//       }
//     },
//     [books.length, fetchBooks]
//   );

//   const deleteBook = useCallback(
//     async (bookId: string) => {
//       try {
//         setLoading(true);
//         setError(null);

//         console.log('Deleting document:', bookId);
//         await apiService.deleteDocument(bookId);

//         // Remove from local state immediately
//         setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));

//         console.log('Book deleted:', bookId);

//         return { success: true };
//       } catch (err: any) {
//         const errorMessage = err.response?.data?.message || err.message || 'Failed to delete book';
//         setError(errorMessage);
//         console.error('Error deleting book:', err);
//         return { success: false, error: errorMessage };
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   const selectedBooks = books.filter((book) => book.selected);

//   return {
//     books,
//     loading,
//     error,
//     selectedBooks,
//     toggleBook,
//     addBook,
//     deleteBook,
//     refreshBooks: fetchBooks,
//   };
// };


// src/hooks/useBooks.ts - WITH BETTER NAMING

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
        };
      });

      console.log('Processed books:', booksData);
      setBooks(booksData);
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

        // Add book to UI immediately
        const newBook: Book = {
          id: documentId,
          title: title,  // Use the actual title, not the document ID!
          author: author, // Use the actual author!
          pages: 0,
          selected: false,
          color: BOOK_COLORS[books.length % BOOK_COLORS.length],
          source: file.name,
          sourceType: file.name.split('.').pop()?.toLowerCase() || '',
          chunks: 0,
          uploadDate: new Date(),
        };

        setBooks(prevBooks => [newBook, ...prevBooks]);

        console.log('Book added to list:', newBook);

        // Try to fetch from backend to update chunk count
        setTimeout(() => {
          fetchBooks().catch(err => {
            console.log('Background fetch failed, but book is in list');
          });
        }, 2000);

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