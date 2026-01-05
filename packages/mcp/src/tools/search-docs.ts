/**
 * search_docs tool
 * Semantic search across documentation
 */

import { generateQueryEmbedding } from '../services/embedder.js';
import { searchDocs, type SearchResult } from '../services/pinecone.js';

export interface SearchDocsInput {
  query: string;
  limit?: number;
}

export interface SearchDocsOutput {
  results: SearchResult[];
  query: string;
  totalFound: number;
}

export const searchDocsTool = {
  name: 'search_docs',
  description: 'Search markdown documentation using semantic search',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query',
      },
      limit: {
        type: 'number',
        default: 5,
        description: 'Maximum number of results to return',
      },
    },
    required: ['query'],
  },
};

export async function executeSearchDocs(input: SearchDocsInput): Promise<SearchDocsOutput> {
  const { query, limit = 5 } = input;

  // Generate embedding for the query
  const embedding = await generateQueryEmbedding(query);

  // Search Pinecone docs namespace
  const results = await searchDocs(embedding, limit);

  return {
    results,
    query,
    totalFound: results.length,
  };
}
