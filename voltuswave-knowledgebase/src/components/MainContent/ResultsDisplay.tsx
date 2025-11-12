// src/components/MainContent/ResultsDisplay.tsx

import React, { useState } from 'react';
import { QueryResponse } from '../../types';

interface ResultsDisplayProps {
  results: QueryResponse[];
  loading?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, loading }) => {
  const [expandedSources, setExpandedSources] = useState<{ [key: string]: boolean }>({});

  const toggleSource = (resultIndex: number, sourceIndex: number) => {
    const key = `${resultIndex}-${sourceIndex}`;
    setExpandedSources(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  };

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
        {results.map((result, resultIndex) => (
          <div key={resultIndex} className="query-result">
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

              {/* Enhanced Sources Section */}
              {!result.noResult && result.relevantSources && result.relevantSources.length > 0 && (
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-300">
                        Relevant Sources
                      </p>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        {result.relevantSources.length} {result.relevantSources.length === 1 ? 'chunk' : 'chunks'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      These are the exact document chunks used to generate the answer
                    </p>
                  </div>

                  <div className="space-y-3">
                    {result.relevantSources.map((source, sourceIndex) => {
                      const key = `${resultIndex}-${sourceIndex}`;
                      const isExpanded = expandedSources[key];
                      const preview = source.text.substring(0, 200);
                      const needsExpansion = source.text.length > 200;

                      return (
                        <div
                          key={sourceIndex}
                          className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                        >
                          {/* Source Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-md border border-blue-500/30">
                                Source {sourceIndex + 1}
                              </span>
                              {source.relevance && (
                                <div className="flex items-center gap-1">
                                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                      style={{ width: `${source.relevance * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400 font-medium">
                                    {(source.relevance * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => copyToClipboard(source.text)}
                              className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1 px-2 py-1 hover:bg-gray-700 rounded"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </button>
                          </div>

                          {/* Source Content */}
                          <div className="relative">
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {isExpanded || !needsExpansion ? source.text : `${preview}...`}
                            </p>
                            {needsExpansion && (
                              <button
                                onClick={() => toggleSource(resultIndex, sourceIndex)}
                                className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition font-medium flex items-center gap-1"
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    Show Full Text ({source.text.length} characters)
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Source Metadata */}
                          <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {source.documentId && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-mono">{source.documentId}</span>
                                </div>
                              )}
                              {source.sourceFile && (
                                <div className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>{source.sourceFile}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {source.text.length} characters • ~{Math.ceil(source.text.length / 4)} tokens
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Info Box */}
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-400 flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>
                        These are the actual document chunks that were semantically matched to your question and used by the AI to generate the answer above. 
                        Higher relevance scores indicate better matches.
                      </span>
                    </p>
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
