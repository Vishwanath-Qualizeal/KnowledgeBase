// src/components/Modals/ChunksModal.tsx

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { apiService } from '../../services/api';

interface ChunksModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
}

interface ChunkDisplay {
  id: number;
  text: string;
  tokens: number;
  characterCount: number;
}

export const ChunksModal: React.FC<ChunksModalProps> = ({ isOpen, book, onClose }) => {
  const [chunks, setChunks] = useState<ChunkDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChunks = async () => {
      if (!book || !isOpen) {
        setChunks([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching chunks for document:', book.id);
        
        const response = await apiService.getDocumentChunks(book.id);
        
        console.log('Chunks data:', response);

        // Transform backend chunks (string[]) into display format
        const chunkDisplays: ChunkDisplay[] = response.chunks.map((chunkText, index) => {
          // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
          const estimatedTokens = Math.ceil(chunkText.length / 4);

          return {
            id: index + 1,
            text: chunkText,
            tokens: estimatedTokens,
            characterCount: chunkText.length,
          };
        });

        setChunks(chunkDisplays);
      } catch (err: any) {
        console.error('Error fetching chunks:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load chunks');
      } finally {
        setLoading(false);
      }
    };

    fetchChunks();
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const exportAllChunks = () => {
    const allText = chunks.map(chunk => `=== Chunk ${chunk.id} ===\n${chunk.text}\n`).join('\n\n');
    copyToClipboard(allText);
  };

  const getTotalStats = () => {
    const totalChars = chunks.reduce((sum, chunk) => sum + chunk.characterCount, 0);
    const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
    const avgChunkSize = chunks.length > 0 ? Math.round(totalChars / chunks.length) : 0;
    
    return { totalChars, totalTokens, avgChunkSize };
  };

  const stats = getTotalStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col border border-gray-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Document Chunks</h2>
              <p className="text-sm text-gray-400 mt-1">
                {book.title} • {book.author}
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

          {/* Statistics Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Chunks</p>
              <p className="text-lg text-white font-semibold">{chunks.length}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Tokens</p>
              <p className="text-lg text-white font-semibold">{stats.totalTokens.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Characters</p>
              <p className="text-lg text-white font-semibold">{stats.totalChars.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Avg Chunk Size</p>
              <p className="text-lg text-white font-semibold">{stats.avgChunkSize} chars</p>
            </div>
          </div>

          {/* Export Button */}
          {chunks.length > 0 && (
            <button
              onClick={exportAllChunks}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy All Chunks to Clipboard
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg
                  className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
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
                <p className="text-white text-lg">Loading chunks...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-400 font-semibold">Error Loading Chunks</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && chunks.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400">No chunks found for this document</p>
            </div>
          )}

          {!loading && !error && chunks.map((chunk) => (
            <div key={chunk.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded">
                    Chunk {chunk.id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {chunk.tokens.toLocaleString()} tokens • {chunk.characterCount.toLocaleString()} chars
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(chunk.text)}
                  className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1.5 px-2 py-1 hover:bg-gray-700 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{chunk.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
