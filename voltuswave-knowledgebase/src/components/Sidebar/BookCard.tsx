// src/components/Sidebar/BookCard.tsx

import React from 'react';
import { Book } from '../../types';

interface BookCardProps {
  book: Book;
  onToggle: (bookId: string) => void;
  onViewSource?: (bookId: string) => void;
  onViewChunks?: (bookId: string) => void;
  onDelete?: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onToggle,
  onViewSource,
  onViewChunks,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete?.(book.id);
    }
  };

  return (
    <div
      onClick={() => onToggle(book.id)}
      className={`book-card bg-gray-900 border-2 rounded-lg p-4 ${
        book.selected ? 'selected border-blue-500 bg-gray-800' : 'border-gray-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-16 ${book.color} rounded flex-shrink-0 shadow-lg`} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{book.title}</h3>
          <p className="text-sm text-gray-400 truncate">{book.author}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>{book.sourceType.toUpperCase()}</span>
            {book.chunks !== undefined && (
              <>
                <span>•</span>
                <span>{book.chunks} chunks</span>
              </>
            )}
          </div>
        </div>
        {book.selected && (
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-800 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewSource?.(book.id);
          }}
          className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 flex-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          View Source
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewChunks?.(book.id);
          }}
          className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 flex-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          Chunks
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
