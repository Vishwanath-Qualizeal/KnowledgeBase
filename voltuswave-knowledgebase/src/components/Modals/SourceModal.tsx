// src/components/Modals/SourceModal.tsx

import React from 'react';
import { Book } from '../../types';

interface SourceModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ isOpen, book, onClose }) => {
  if (!isOpen || !book) return null;

  const getFileIcon = () => {
    switch (book.sourceType) {
      case 'pdf':
        return (
          <div className="w-12 h-12 bg-red-500 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case 'docx':
      case 'doc':
        return (
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Source: {book.title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {book.author} • {book.source}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-3 mb-4">
            {getFileIcon()}
            <div>
              <p className="font-semibold text-white">{book.source}</p>
              <p className="text-sm text-gray-400">
                {book.sourceType.toUpperCase()} Document
                {book.pages ? ` • ${book.pages} pages` : ''}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">Document Information:</strong>
              <br />
              <br />
              This is the source document for <em>"{book.title}"</em> by {book.author}.
              <br />
              <br />
              The document has been processed and split into {book.chunks || 'multiple'} chunks for
              efficient retrieval and querying.
              <br />
              <br />
              {book.sourceType === 'pdf' && (
                <span className="text-gray-400 italic">
                  PDF documents are automatically parsed and indexed for semantic search.
                </span>
              )}
              {(book.sourceType === 'docx' || book.sourceType === 'doc') && (
                <span className="text-gray-400 italic">
                  Word documents are processed to extract text and structure for optimal search results.
                </span>
              )}
              {book.sourceType === 'txt' && (
                <span className="text-gray-400 italic">
                  Text files are chunked intelligently to preserve context and meaning.
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> Full document viewer functionality can be implemented using
              libraries like PDF.js for PDFs or document preview APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
