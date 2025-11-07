// src/App.tsx

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/MainContent/Header';
import { QueryInput } from './components/MainContent/QueryInput';
import { ResultsDisplay } from './components/MainContent/ResultsDisplay';
import { SourceModal } from './components/Modals/SourceModal';
import { ChunksModal } from './components/Modals/ChunksModal';
import { useBooks } from './hooks/useBooks';
import { apiService } from './services/api';
import { QueryResponse, Book } from './types';

function App() {
  const {
    books,
    loading: booksLoading,
    selectedBooks,
    toggleBook,
    addBook,
    deleteBook,
  } = useBooks();

  const [queryResults, setQueryResults] = useState<QueryResponse[]>([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [sourceModalBook, setSourceModalBook] = useState<Book | null>(null);
  const [chunksModalBook, setChunksModalBook] = useState<Book | null>(null);

  // const handleQuery = async (question: string) => {
  //   if (selectedBooks.length === 0) {
  //     alert('Please select at least one book to query');
  //     return;
  //   }

  //   setQueryLoading(true);

  //   try {
  //     const response = await apiService.askQuestion({
  //       question,
  //       filters: {
  //         documentIds: selectedBooks.map((book) => book.id),
  //       },
  //       minRelevance: 0.5,
  //     });

  //     // Add the new result to the top of the results list
  //     setQueryResults((prev) => [response, ...prev]);
  //   } catch (error: any) {
  //     console.error('Error querying:', error);
  //     alert(error.response?.data?.message || 'Failed to query. Please try again.');
  //   } finally {
  //     setQueryLoading(false);
  //   }
  // };

  const handleQuery = async (question: string) => {
    if (selectedBooks.length === 0) {
      alert('Please select at least one book to query');
      return;
    }

    setQueryLoading(true);

    try {
      const documentIds = selectedBooks.map((book) => book.id);

      // Use the multiple-document query method
      const response = await apiService.askQuestionMultiple(question, documentIds, books);

      setQueryResults((prev) => [response, ...prev]);
    } catch (error: any) {
      console.error('Error querying:', error);
      alert(error.response?.data?.message || 'Failed to query. Please try again.');
    } finally {
      setQueryLoading(false);
    }
  };

  const handleViewSource = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setSourceModalBook(book);
    }
  };

  const handleViewChunks = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setChunksModalBook(book);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar
        books={books}
        selectedCount={selectedBooks.length}
        onToggleBook={toggleBook}
        onAddBook={addBook}
        onDeleteBook={deleteBook}
        onViewSource={handleViewSource}
        onViewChunks={handleViewChunks}
        loading={booksLoading}
      />

      <main className="flex-1 flex flex-col">
        <Header selectedBooks={selectedBooks} />

        <QueryInput
          onQuery={handleQuery}
          disabled={selectedBooks.length === 0}
          loading={queryLoading}
        />

        <ResultsDisplay results={queryResults} loading={queryLoading} />
      </main>

      <SourceModal
        isOpen={sourceModalBook !== null}
        book={sourceModalBook}
        onClose={() => setSourceModalBook(null)}
      />

      <ChunksModal
        isOpen={chunksModalBook !== null}
        book={chunksModalBook}
        onClose={() => setChunksModalBook(null)}
      />
    </div>
  );
}

export default App;
