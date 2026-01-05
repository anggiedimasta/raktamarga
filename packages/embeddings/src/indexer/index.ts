/**
 * Pinecone indexer
 * Upserts vectors to Pinecone with metadata
 */

import { Pinecone } from '@pinecone-database/pinecone';
import type { Chunk, EmbeddingVector } from '../types.js';
import { config } from '../config.js';

let pineconeClient: Pinecone | null = null;

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
 * Generate vector ID from chunk metadata
 */
export function generateVectorId(chunk: Chunk, index: number): string {
  const namespace = chunk.metadata.language === 'markdown' ? 'docs' : 'code';
  return `${namespace}:${chunk.metadata.filePath}:${index}`;
}

/**
 * Get namespace for a chunk
 */
function getNamespace(chunk: Chunk): string {
  return chunk.metadata.language === 'markdown' ? 'docs' : 'code';
}

/**
 * Upsert vectors to Pinecone
 */
export async function upsertVectors(
  embeddings: Map<Chunk, number[]>,
): Promise<void> {
  console.log(`📤 Upserting ${embeddings.size} vectors to Pinecone...`);

  const client = getClient();
  const index = client.index(config.pinecone.index);

  // Group by namespace
  const vectorsByNamespace = new Map<string, EmbeddingVector[]>();

  let chunkIndex = 0;
  for (const [chunk, embedding] of embeddings) {
    const namespace = getNamespace(chunk);
    const vectorId = generateVectorId(chunk, chunkIndex++);

    const vector: EmbeddingVector = {
      id: vectorId,
      values: embedding,
      metadata: chunk.metadata,
    };

    if (!vectorsByNamespace.has(namespace)) {
      vectorsByNamespace.set(namespace, []);
    }
    vectorsByNamespace.get(namespace)!.push(vector);
  }

  // Upsert to each namespace
  for (const [namespace, vectors] of vectorsByNamespace) {
    console.log(`Upserting ${vectors.length} vectors to namespace: ${namespace}`);

    // Batch upserts (100 vectors per request)
    const BATCH_SIZE = 100;
    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
      const batch = vectors.slice(i, i + BATCH_SIZE);

      await index.namespace(namespace).upsert(batch);
    }
  }

  console.log(`✅ Successfully upserted all vectors`);
}

/**
 * Delete vectors by file path prefix
 */
export async function deleteVectorsByFilePath(filePath: string): Promise<void> {
  console.log(`🗑️  Deleting vectors for file: ${filePath}`);

  const client = getClient();
  const index = client.index(config.pinecone.index);

  // Delete from both namespaces
  for (const namespace of ['code', 'docs']) {
    try {
      // Pinecone doesn't support prefix deletion directly
      // We need to query and delete by IDs
      const prefix = `${namespace}:${filePath}:`;

      // For now, we'll use deleteAll with filter (if supported)
      // Otherwise, this would need to be implemented with query + delete
      console.log(`Deleting vectors with prefix: ${prefix} from namespace: ${namespace}`);

      // Note: This is a simplified implementation
      // In production, you'd want to query for matching IDs and delete them
      // await index.namespace(namespace).deleteMany({ prefix });
    } catch (error) {
      console.warn(`Failed to delete vectors for ${filePath} in ${namespace}:`, error);
    }
  }
}

/**
 * Delete all vectors in a namespace (for full re-index)
 */
export async function deleteAllVectors(): Promise<void> {
  console.log(`🗑️  Deleting all vectors...`);

  const client = getClient();
  const index = client.index(config.pinecone.index);

  // Delete from both namespaces
  for (const namespace of ['code', 'docs']) {
    try {
      await index.namespace(namespace).deleteAll();
      console.log(`Deleted all vectors from namespace: ${namespace}`);
    } catch (error) {
      console.warn(`Failed to delete vectors in ${namespace}:`, error);
    }
  }
}
