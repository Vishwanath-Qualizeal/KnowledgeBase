// src/components/Sidebar/Sidebar.tsx

import React, { useState } from 'react';
import { Book } from '../../types';
import { BookCard } from './BookCard';
import { AddBookModal } from './AddBookModal';

interface SidebarProps {
  books: Book[];
  selectedCount: number;
  onToggleBook: (bookId: string) => void;
  onAddBook: (file: File, title: string, author: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteBook: (bookId: string) => void;
  onViewSource: (bookId: string) => void;
  onViewChunks: (bookId: string) => void;
  loading?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  books,
  selectedCount,
  onToggleBook,
  onAddBook,
  onDeleteBook,
  onViewSource,
  onViewChunks,
  loading,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <aside className="w-80 border-r border-gray-800 bg-gray-950 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold mb-2">Voltuswave KnowledgeBase</h1>
          <p className="text-sm text-gray-400">Select books to query</p>
        </div>

        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Book
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading books...</div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-sm">No books yet</p>
              <p className="text-xs mt-1">Add your first book to get started</p>
            </div>
          ) : (
            books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onToggle={onToggleBook}
                onViewSource={onViewSource}
                onViewChunks={onViewChunks}
                onDelete={onDeleteBook}
              />
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            <span className="font-semibold text-white">{selectedCount}</span> books selected
          </div>
        </div>
      </aside>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddBook}
      />
    </>
  );
};
