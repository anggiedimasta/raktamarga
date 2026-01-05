/**
 * Pinecone service for MCP server
 * Handles vector similarity search
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config.js';

let pineconeClient: Pinecone | null = null;

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    filePath: string;
    fileName: string;
    language: string;
    chunkType?: string;
    name?: string;
    startLine: number;
    endLine: number;
  };
}

/**
 * Get or create Pinecone client
 */
function getClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
  }
  return pineconeClient;
}

/**
 * Search for similar vectors in a namespace
 */
export async function searchVectors(
  embedding: number[],
  namespace: 'code' | 'docs',
  limit: number = 5,
  filter?: Record<string, unknown>,
): Promise<SearchResult[]> {
  const client = getClient();
  const index = client.index(config.pinecone.index);

  const queryResponse = await index.namespace(namespace).query({
    vector: embedding,
    topK: limit,
    includeMetadata: true,
  });

  return queryResponse.matches?.map((match) => ({
    id: match.id,
    score: match.score ?? 0,
    content: (match.metadata?.content as string) || '',
    metadata: {
      filePath: (match.metadata?.filePath as string) || '',
      fileName: (match.metadata?.fileName as string) || '',
      language: (match.metadata?.language as string) || '',
      chunkType: match.metadata?.chunkType as string | undefined,
      name: match.metadata?.name as string | undefined,
      startLine: (match.metadata?.startLine as number) || 0,
      endLine: (match.metadata?.endLine as number) || 0,
    },
  })) || [];
}

/**
 * Search code namespace
 */
export async function searchCode(
  embedding: number[],
  limit: number = 5,
  packageFilter?: string,
): Promise<SearchResult[]> {
  const filter = packageFilter ? { package: packageFilter } : undefined;
  return searchVectors(embedding, 'code', limit, filter);
}

/**
 * Search docs namespace
 */
export async function searchDocs(
  embedding: number[],
  limit: number = 5,
): Promise<SearchResult[]> {
  return searchVectors(embedding, 'docs', limit);
}
