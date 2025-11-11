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

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{book.title}</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Document Header */}
          <div className="flex items-center gap-4 mb-6">
            {getFileIcon()}
            <div className="flex-1">
              <p className="font-semibold text-white text-lg">{book.source}</p>
              <p className="text-sm text-gray-400 mt-1">
                {book.sourceType.toUpperCase()} Document
              </p>
            </div>
          </div>

          {/* Document Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Original File Name */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400 uppercase font-semibold">Original File Name</p>
              </div>
              <p className="text-sm text-white break-all">{book.source}</p>
            </div>

            {/* Upload Date & Time */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400 uppercase font-semibold">Upload Date & Time</p>
              </div>
              <p className="text-sm text-white">{formatDate(book.uploadDate)}</p>
            </div>

            {/* Document ID */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <p className="text-xs text-gray-400 uppercase font-semibold">Document ID</p>
              </div>
              <p className="text-xs text-white font-mono break-all">{book.id}</p>
            </div>

            {/* Chunks */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <p className="text-xs text-gray-400 uppercase font-semibold">Chunks</p>
              </div>
              <p className="text-sm text-white">
                {book.chunks || 0} chunks
                {book.chunks && book.chunks > 0 && (
                  <span className="ml-2 text-xs text-gray-400">
                    (~{Math.round((book.chunks || 0) * 512)} tokens)
                  </span>
                )}
              </p>
            </div>

            {/* File Type */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs text-gray-400 uppercase font-semibold">File Type</p>
              </div>
              <p className="text-sm text-white uppercase">{book.sourceType}</p>
            </div>

            {/* Processing Status */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
              </div>
              <p className="text-sm text-white">
                {book.processingState === 'ready' ? (
                  <span className="text-green-400">✓ Ready</span>
                ) : book.processingState === 'processing' ? (
                  <span className="text-yellow-400">⟳ Processing</span>
                ) : book.processingState === 'error' ? (
                  <span className="text-red-400">✗ Error</span>
                ) : (
                  <span className="text-green-400">✓ Ready</span>
                )}
              </p>
            </div>
          </div>

          {/* Document Processing Information */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">Document Processing:</strong>
              <br />
              <br />
              This document has been processed using advanced text extraction and chunking algorithms.
              {book.chunks && book.chunks > 0 && (
                <>
                  {' '}
                  It has been split into <strong className="text-white">{book.chunks} semantic chunks</strong> for
                  efficient retrieval and querying.
                </>
              )}
              <br />
              <br />
              {book.sourceType === 'pdf' && (
                <span className="text-gray-400 italic">
                  PDF documents are automatically parsed and indexed using text extraction algorithms. Vector embeddings
                  are generated for semantic search capabilities.
                </span>
              )}
              {(book.sourceType === 'docx' || book.sourceType === 'doc') && (
                <span className="text-gray-400 italic">
                  Word documents are processed to extract text and preserve document structure. Formatting is analyzed
                  to maintain context during chunking.
                </span>
              )}
              {book.sourceType === 'txt' && (
                <span className="text-gray-400 italic">
                  Text files are intelligently chunked to preserve context and meaning. Natural language boundaries are
                  respected for optimal search results.
                </span>
              )}
            </p>
          </div>

          {/* Future Enhancement Note */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-400 font-semibold mb-1">Document Preview (Coming Soon)</p>
                {/* <p className="text-xs text-blue-300/80">
                  Full document viewer functionality can be implemented using libraries like PDF.js for PDFs,
                  Mammoth.js for Word documents, or document preview APIs. This would allow you to view the actual
                  document content directly in this modal.
                </p> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
