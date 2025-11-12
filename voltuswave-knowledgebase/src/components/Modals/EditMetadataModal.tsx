// src/components/Modals/EditMetadataModal.tsx

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';

interface EditMetadataModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSave: (bookId: string, title: string, author: string) => void;
}

export const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  isOpen,
  book,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
    }
  }, [book]);

  const handleSave = () => {
    if (!book) return;
    
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    
    if (!author.trim()) {
      alert('Author is required');
      return;
    }

    onSave(book.id, title.trim(), author.trim());
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setAuthor('');
    onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Edit Document Metadata</h2>
            <button
              onClick={handleClose}
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

        <div className="p-6 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              <strong>Current Document ID:</strong> {book.id}
            </p>
            <p className="text-xs text-blue-300 mt-1">
              This will update the display name and author for this document.
            </p>
          </div>

          <div>
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-300 mb-2">
              Document Title *
            </label>
            <input
              type="text"
              id="editTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document title"
            />
          </div>

          <div>
            <label htmlFor="editAuthor" className="block text-sm font-medium text-gray-300 mb-2">
              Author *
            </label>
            <input
              type="text"
              id="editAuthor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter author name"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
