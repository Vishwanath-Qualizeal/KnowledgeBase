// src/components/Sidebar/AddBookModal.tsx

import React, { useState } from 'react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (file: File, title: string, author: string) => Promise<{ success: boolean; error?: string }>;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename if not set
      if (!title) {
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileNameWithoutExt);
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await onAdd(file, title, author);
      
      if (result.success) {
        // Reset form
        setTitle('');
        setAuthor('');
        setFile(null);
        onClose();
      } else {
        setError(result.error || 'Failed to upload document');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setTitle('');
      setAuthor('');
      setFile(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Add New Book</h2>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="text-gray-400 hover:text-white transition disabled:opacity-50"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-300 mb-2">
              Book Title *
            </label>
            <input
              type="text"
              id="bookTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label htmlFor="bookAuthor" className="block text-sm font-medium text-gray-300 mb-2">
              Author *
            </label>
            <input
              type="text"
              id="bookAuthor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={uploading}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label htmlFor="bookFile" className="block text-sm font-medium text-gray-300 mb-2">
              Upload File *
            </label>
            <div className="relative">
              <input
                type="file"
                id="bookFile"
                onChange={handleFileChange}
                disabled={uploading}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />
              <label
                htmlFor="bookFile"
                className={`block w-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg px-4 py-8 text-center cursor-pointer hover:border-blue-500 transition ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg
                  className="w-12 h-12 text-gray-500 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-400">
                  {file ? (
                    <span className="text-blue-400">Selected: {file.name}</span>
                  ) : (
                    <>
                      Click to upload or drag and drop
                      <br />
                      <span className="text-xs">PDF, DOCX, or TXT (Max 50MB)</span>
                    </>
                  )}
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !title || !author || !file}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Uploading...
                </>
              ) : (
                'Add Book'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
