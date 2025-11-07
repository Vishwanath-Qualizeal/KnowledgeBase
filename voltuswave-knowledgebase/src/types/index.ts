// src/types/index.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  pages?: number;
  selected: boolean;
  color: string;
  source: string;
  sourceType: string;
  chunks?: number;
  uploadDate?: Date;
}

export interface QueryResult {
  text: string;
  relevance: number;
  documentId?: string;
  partitionId?: string;
  sourceFile?: string;
  tags?: Record<string, string[]>;
}

export interface QueryResponse {
  question: string;
  answer: string;
  relevantSources: QueryResult[];
  noResult: boolean;
}

export interface DocumentInfo {
  documentId: string;
  fileName: string;
  uploadDate: string;
  chunkCount: number;
  status: string;
}

export interface ImportDocumentRequest {
  documentId: string;
  file: File;
}

export interface AskRequest {
  question: string;
  filters?: {
    documentIds?: string[];
  };
  minRelevance?: number;
}

export interface ChunkData {
  id: string;
  text: string;
  tokens: number;
  page: number;
  embedding: string;
}
