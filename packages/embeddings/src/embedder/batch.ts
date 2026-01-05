/**
 * Batch processing for embeddings
 * Handles batching and rate limiting for Gemini API
 */

import type { Chunk } from '../types.js';
import { generateEmbedding } from './index.js';

const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY = 100; // ms between batches

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process chunks in batches with rate limiting
 */
export async function generateEmbeddingsBatch(
  chunks: Chunk[],
  onProgress?: (current: number, total: number) => void,
): Promise<Map<Chunk, number[]>> {
  const embeddings = new Map<Chunk, number[]>();
  const batches: Chunk[][] = [];

  // Split into batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    batches.push(chunks.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${chunks.length} chunks in ${batches.length} batches...`);

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Process batch in parallel
    const batchPromises = batch.map(async chunk => {
      const embedding = await generateEmbedding(chunk.content);
      return { chunk, embedding };
    });

    const results = await Promise.all(batchPromises);

    // Store results
    for (const { chunk, embedding } of results) {
      embeddings.set(chunk, embedding);
    }

    // Report progress
    if (onProgress) {
      onProgress((i + 1) * BATCH_SIZE, chunks.length);
    }

    // Rate limiting between batches
    if (i < batches.length - 1) {
      await sleep(RATE_LIMIT_DELAY);
    }
  }

  return embeddings;
}
