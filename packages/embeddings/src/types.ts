/**
 * Type definitions for the embeddings package
 */

export interface ChunkMetadata {
  // File info
  filePath: string;
  fileName: string;
  language: string;
  package: string;

  // Semantic info (code files only)
  chunkType: 'function' | 'class' | 'export' | 'section' | 'file';
  name: string;
  exports: string[];
  imports: string[];

  // Position
  startLine: number;
  endLine: number;

  // Git info
  lastModified: string;

  // Index signature for Pinecone compatibility
  [key: string]: string | number | string[] | boolean;
}

export interface Chunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface FileInfo {
  path: string;
  size: number;
  lastModified: Date;
}

export interface GitDiffResult {
  added: string[];
  modified: string[];
  deleted: string[];
}

export interface EmbeddingVector {
  id: string;
  values: number[];
  metadata: ChunkMetadata;
}
