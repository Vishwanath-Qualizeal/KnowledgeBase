// src/components/MainContent/ResultsDisplay.tsx

import React from 'react';
import { QueryResponse } from '../../types';

interface ResultsDisplayProps {
  results: QueryResponse[];
  loading?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
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
              <p className="text-gray-400">Searching through your books...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-lg font-medium">No queries yet</p>
              <p className="text-sm mt-2">
                Select books and ask a question to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
      <div className="max-w-4xl mx-auto space-y-6">
        {results.map((result, index) => (
          <div key={index} className="query-result">
            {/* Question */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-medium mb-1">Your Question</p>
                  <p className="text-white">{result.question}</p>
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-medium mb-2">Answer</p>
                  {result.noResult ? (
                    <p className="text-gray-300 leading-relaxed">
                      I couldn't find relevant information in the selected books to answer this question.
                      Try rephrasing your question or selecting different books.
                    </p>
                  ) : (
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
                  )}
                </div>
              </div>

              {/* Sources */}
              {!result.noResult && result.relevantSources && result.relevantSources.length > 0 && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm font-medium text-gray-400 mb-3">
                    Sources ({result.relevantSources.length})
                  </p>
                  <div className="space-y-3">
                    {result.relevantSources.map((source, sourceIndex) => (
                      <div
                        key={sourceIndex}
                        className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                              Source {sourceIndex + 1}
                            </span>
                            {source.relevance && (
                              <span className="text-xs text-gray-500">
                                Relevance: {(source.relevance * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          {source.sourceFile && (
                            <span className="text-xs text-gray-500">{source.sourceFile}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{source.text}</p>
                        {source.documentId && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <span className="text-xs text-gray-500">Document ID: {source.documentId}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
