// src/services/api.ts - UPDATED to handle actual backend response

import axios, { AxiosInstance } from 'axios';
import {
  QueryResponse,
  DocumentInfo,
  ImportDocumentRequest,
  AskRequest,
  Book,
  ChunkData,
} from '../types';

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://13.235.114.200:5150/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000,
    });

    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.config.url, response.data);
        return response;
      },
      (error) => {
        console.error('API Error:', error.config?.url, error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async importDocument(request: ImportDocumentRequest): Promise<any> {
    const formData = new FormData();
    formData.append('DocumentId', request.documentId);
    formData.append('File', request.file);

    const response = await this.api.post('/Memory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  }

  async listDocuments(): Promise<DocumentInfo[]> {
    try {
      const response = await this.api.get('/Memory/documents');

      if (response.data.documents) {
        return response.data.documents;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response structure:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error listing documents:', error);

      if (error.response?.status === 404) {
        return [];
      }

      throw error;
    }
  }

  async getDocumentInfo(documentId: string): Promise<DocumentInfo> {
    const response = await this.api.get(`/Memory/documents/${documentId}`);
    return response.data;
  }

  /**
   * Get document chunks (partitions) for inspection
   * Backend returns: { documentId, chunkCount, chunks: string[] }
   */
  async getDocumentChunks(documentId: string): Promise<{ documentId: string; chunkCount: number; chunks: string[] }> {
    try {
      const response = await this.api.get('/Memory/inspect', {
        params: { documentId }
      });

      console.log('Chunks response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching chunks:', error);
      throw error;
    }
  }

  async askQuestion(request: AskRequest): Promise<QueryResponse> {
    try {
      const params: any = {
        question: request.question,
      };

      if (request.filters?.documentIds && request.filters.documentIds.length > 0) {
        params.documentId = request.filters.documentIds[0];
        console.log('Querying with documentId:', params.documentId);
      }

      console.log('Ask request params:', params);

      const response = await this.api.get('/Memory/ask', { params });

      console.log('Ask response:', response.data);

      const backendResponse = response.data;

      const queryResponse: QueryResponse = {
        question: backendResponse.question || request.question,
        answer: backendResponse.text || backendResponse.Text || backendResponse.result || backendResponse.Result || 'No answer provided',
        noResult: backendResponse.noResult || backendResponse.NoResult || false,
        relevantSources: (backendResponse.relevantSources || backendResponse.RelevantSources || []).map((source: any) => ({
          text: source.text || source.Text || source.SourceContent || '',
          relevance: source.relevance || source.Relevance || source.score || 0,
          documentId: source.documentId || source.DocumentId || source.SourceName || '',
          partitionId: source.partitionId || source.PartitionId || '',
          sourceFile: source.sourceName || source.SourceName || source.Link || '',
          tags: source.tags || source.Tags || {},
        })),
      };

      console.log('Transformed query response:', queryResponse);

      return queryResponse;
    } catch (error: any) {
      console.error('Error in askQuestion:', error);
      throw error;
    }
  }

  async askQuestionMultiple(
    question: string,
    documentIds: string[],
    books: Book[]
  ): Promise<QueryResponse> {
    try {
      if (documentIds.length === 0) {
        return this.askQuestion({ question });
      }

      if (documentIds.length === 1) {
        return this.askQuestion({
          question,
          filters: { documentIds },
        });
      }

      const results = await Promise.all(
        documentIds.map(docId =>
          this.askQuestion({
            question,
            filters: { documentIds: [docId] },
          }).catch(err => {
            console.error(`Error querying ${docId}:`, err);
            return null;
          })
        )
      );

      const validResults = results.filter(r => r !== null) as QueryResponse[];

      if (validResults.length === 0) {
        return {
          question,
          answer: 'No results found.',
          noResult: true,
          relevantSources: [],
        };
      }

      const usefulResults = validResults.filter(r => !r.noResult);

      if (usefulResults.length === 0) {
        return {
          question,
          answer: 'No relevant information found in the selected books.',
          noResult: true,
          relevantSources: [],
        };
      }

      const combinedAnswer = usefulResults
        .map((r, i) => {
          const docId = documentIds[results.indexOf(r)];
          const book = books.find(b => b.id === docId);
          const title = book?.title || docId;
          return `**[${title}]**\n${r.answer}`;
        })
        .join('\n\n---\n\n');

      const combinedSources = usefulResults.flatMap(r => r.relevantSources || []);

      return {
        question,
        answer: combinedAnswer,
        noResult: false,
        relevantSources: combinedSources,
      };
    } catch (error) {
      console.error('Error in askQuestionMultiple:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<any> {
    const response = await this.api.delete(`/Memory/documents/${documentId}`);
    return response.data;
  }

  async forceDeleteDocument(documentId: string): Promise<any> {
    const response = await this.api.delete(`/Memory/documents/${documentId}/force`);
    return response.data;
  }

  async getFileHashes(): Promise<any> {
    const response = await this.api.get('/Memory/file-hashes');
    return response.data;
  }

  async clearFileHashes(): Promise<any> {
    const response = await this.api.delete('/Memory/file-hashes');
    return response.data;
  }
}

export const apiService = new APIService();
