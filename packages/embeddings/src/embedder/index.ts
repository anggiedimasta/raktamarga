/**
 * Embeddings client for Google Gemini
 * Generates embeddings using the configured provider
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Chunk } from '../types.js';
import { config } from '../config.js';

let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Get or create Gemini client
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return geminiClient;
}

/**
 * Generate embedding using Gemini
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: config.gemini.model });

  try {
    const result = await model.embedContent({
      content: { parts: [{ text }], role: 'user' },
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 512,
    });
    return result.embedding.values;
  } catch (error) {
    console.error('Gemini embedding generation failed:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple chunks with retry logic
 */
export async function generateEmbeddings(chunks: Chunk[]): Promise<Map<Chunk, number[]>> {
  console.log(`🤖 Generating embeddings for ${chunks.length} chunks using Gemini...`);

  const embeddings = new Map<Chunk, number[]>();

  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content);
      embeddings.set(chunk, embedding);
    } catch (error) {
      console.error(`Failed to generate embedding for chunk in ${chunk.metadata.filePath}:`, error);
      throw error;
    }
  }

  console.log(`✅ Generated ${embeddings.size} embeddings`);
  return embeddings;
}
