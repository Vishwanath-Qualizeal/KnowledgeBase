// src/components/MainContent/Header.tsx

import React from 'react';
import { Book } from '../../types';

interface HeaderProps {
  selectedBooks: Book[];
}

export const Header: React.FC<HeaderProps> = ({ selectedBooks }) => {
  return (
    <header className="border-b border-gray-800 bg-gray-950 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Query Your Knowledge</h2>
          <p className="text-sm text-gray-400 mt-1">Ask questions across your selected books</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedBooks.map((book) => (
            <span
              key={book.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-full"
            >
              <span className={`w-2 h-2 ${book.color} rounded-full`} />
              {book.title}
            </span>
          ))}
          {selectedBooks.length === 0 && (
            <span className="text-xs text-gray-500 italic">No books selected</span>
          )}
        </div>
      </div>
    </header>
  );
};
