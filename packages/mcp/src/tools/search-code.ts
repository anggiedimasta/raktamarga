/**
 * search_code tool
 * Semantic search across source code
 */

import { generateQueryEmbedding } from '../services/embedder.js';
import { searchCode, type SearchResult } from '../services/pinecone.js';

export interface SearchCodeInput {
  query: string;
  limit?: number;
  package?: string;
}

export interface SearchCodeOutput {
  results: SearchResult[];
  query: string;
  totalFound: number;
}

export const searchCodeTool = {
  name: 'search_code',
  description: 'Search codebase for relevant code snippets using semantic search',
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
      package: {
        type: 'string',
        description: 'Filter by package name (web, api, db, etc.)',
      },
    },
    required: ['query'],
  },
};

export async function executeSearchCode(input: SearchCodeInput): Promise<SearchCodeOutput> {
  const { query, limit = 5, package: packageFilter } = input;

  // Generate embedding for the query
  const embedding = await generateQueryEmbedding(query);

  // Search Pinecone
  const results = await searchCode(embedding, limit, packageFilter);

  return {
    results,
    query,
    totalFound: results.length,
  };
}
