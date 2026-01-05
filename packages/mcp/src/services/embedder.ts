/**
 * Gemini embeddings service for MCP server
 * Generates embeddings for search queries
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Get or create Gemini client
 */
function getClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return geminiClient;
}

/**
 * Generate embedding for a search query
 * Uses RETRIEVAL_QUERY task type (optimized for queries vs documents)
 */
export async function generateQueryEmbedding(text: string): Promise<number[]> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: config.gemini.model });

  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType: 'RETRIEVAL_QUERY' as const,
    outputDimensionality: 512,
  } as Parameters<typeof model.embedContent>[0]);

  return result.embedding.values;
}
