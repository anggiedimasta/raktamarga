/**
 * Fallback chunker for files that can't be parsed semantically
 * Uses fixed-size chunking with overlap
 */

import type { Chunk, ChunkMetadata } from '../types.js';

/**
 * Split content into fixed-size chunks with overlap
 */
export function splitIntoChunks(
  content: string,
  filePath: string,
  metadata: Pick<ChunkMetadata, 'filePath' | 'fileName' | 'language' | 'package' | 'lastModified'>,
  chunkSize: number,
  overlap: number,
): Chunk[] {
  const chunks: Chunk[] = [];
  const lines = content.split('\n');

  let currentChunk = '';
  let currentStartLine = 1;
  let currentLine = 1;

  for (const line of lines) {
    currentChunk += line + '\n';

    // Check if we've reached chunk size
    if (currentChunk.length >= chunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          ...metadata,
          chunkType: 'file' as const,
          name: '',
          exports: [],
          imports: [],
          startLine: currentStartLine,
          endLine: currentLine,
        },
      });

      // Calculate overlap
      const overlapLines = Math.floor((overlap / chunkSize) * (currentLine - currentStartLine + 1));
      const startOverlapLine = Math.max(currentStartLine, currentLine - overlapLines + 1);

      // Create new chunk with overlap
      currentChunk = lines.slice(startOverlapLine - 1, currentLine).join('\n') + '\n';
      currentStartLine = startOverlapLine;
    }

    currentLine++;
  }

  // Add remaining content
  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {
        ...metadata,
        chunkType: 'file' as const,
        name: '',
        exports: [],
        imports: [],
        startLine: currentStartLine,
        endLine: currentLine - 1,
      },
    });
  }

  return chunks;
}
