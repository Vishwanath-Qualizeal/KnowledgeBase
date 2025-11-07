// src/components/Modals/ChunksModal.tsx

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';

interface ChunksModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
}

export const ChunksModal: React.FC<ChunksModalProps> = ({ isOpen, book, onClose }) => {
  const [mockChunks, setMockChunks] = useState<any[]>([]);

  useEffect(() => {
    if (book && isOpen) {
      // Generate mock chunks for demonstration
      const chunks = [];
      const chunkCount = book.chunks || 10;

      for (let i = 1; i <= Math.min(chunkCount, 20); i++) {
        chunks.push({
          id: i,
          text: generateMockChunkText(book.title, i),
          tokens: Math.floor(Math.random() * 300) + 200,
          page: Math.ceil((i / chunkCount) * (book.pages || 100)),
          embedding: '1536 dimensions',
        });
      }

      setMockChunks(chunks);
    }
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Chunks: {book.title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {book.chunks || mockChunks.length} chunks • {book.author}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mockChunks.map((chunk) => (
            <div key={chunk.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    Chunk {chunk.id}
                  </span>
                  <span className="text-xs text-gray-500">{chunk.tokens} tokens</span>
                </div>
                <button
                  onClick={() => copyToClipboard(chunk.text)}
                  className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <p className="text-sm text-gray-300 leading-relaxed">{chunk.text}</p>
              <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-4 text-xs text-gray-500">
                <span>Page {chunk.page}</span>
                <span>•</span>
                <span>Embedding: {chunk.embedding}</span>
              </div>
            </div>
          ))}

          {book.chunks && book.chunks > 20 && (
            <div className="text-center p-4 text-sm text-gray-400">
              Showing first 20 of {book.chunks} chunks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function generateMockChunkText(bookTitle: string, chunkNumber: number): string {
  const samples = [
    `This section discusses the fundamental principles outlined in "${bookTitle}". The key concepts revolve around understanding market dynamics and customer behavior patterns. By analyzing these patterns, organizations can make more informed decisions about product development and market positioning.`,
    `In this chapter, the author explores the relationship between innovation and market success. The text emphasizes the importance of validated learning and iterative development processes. These methodologies help teams reduce waste and focus on what truly matters to customers.`,
    `The following passage examines strategic approaches to building sustainable competitive advantages. It highlights the significance of creating unique value propositions that resonate with target audiences. Understanding these principles is crucial for long-term business success.`,
    `This segment delves into practical frameworks for decision-making in uncertain environments. The author presents case studies and real-world examples that illustrate key concepts. These examples provide valuable insights into how successful companies navigate complex challenges.`,
    `Here, the text focuses on organizational culture and its impact on innovation. The discussion covers how leadership styles and team dynamics influence creative output. Building the right culture is essential for fostering continuous improvement and adaptation.`,
  ];

  return samples[chunkNumber % samples.length];
}
