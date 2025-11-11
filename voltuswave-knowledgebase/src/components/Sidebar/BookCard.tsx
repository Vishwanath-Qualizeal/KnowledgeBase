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
  const isProcessing = book.processingState === 'processing';
  const isError = book.processingState === 'error';
  const isReady = book.processingState === 'ready';
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      onDelete?.(book.id);
    }
  };

  const handleToggle = () => {
    // Don't allow selection if still processing
    if (isProcessing) {
      return;
    }
    onToggle(book.id);
  };

  return (
    <div
      onClick={handleToggle}
      className={`book-card bg-gray-900 border-2 rounded-lg p-4 ${
        book.selected ? 'selected border-blue-500 bg-gray-800' : 'border-gray-800'
      } ${isProcessing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className={`w-12 h-16 ${book.color} rounded flex-shrink-0 shadow-lg`} />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{book.title}</h3>
          <p className="text-sm text-gray-400 truncate">{book.author}</p>
          
          {/* Processing Status */}
          {isProcessing && book.processingMessage && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1">
                <div className="text-xs text-yellow-400 font-medium">
                  {book.processingMessage}
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Status */}
          {isError && book.processingMessage && (
            <div className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {book.processingMessage}
            </div>
          )}
          
          {/* Ready Status - show chunks info */}
          {!isProcessing && !isError && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>{book.sourceType.toUpperCase()}</span>
              {book.chunks !== undefined && book.chunks > 0 && (
                <>
                  <span>•</span>
                  <span>{book.chunks} chunks</span>
                </>
              )}
            </div>
          )}
        </div>
        {book.selected && !isProcessing && (
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
            if (!isProcessing) onViewSource?.(book.id);
          }}
          disabled={isProcessing}
          className={`text-xs ${isProcessing ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'} transition flex items-center gap-1 flex-1`}
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
            if (!isProcessing) onViewChunks?.(book.id);
          }}
          disabled={isProcessing}
          className={`text-xs ${isProcessing ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'} transition flex items-center gap-1 flex-1`}
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
