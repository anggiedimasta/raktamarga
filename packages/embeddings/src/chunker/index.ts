/**
 * Chunker orchestrator
 * Routes files to appropriate chunker based on file type
 */

import { readFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import type { Chunk, FileInfo } from '../types.js';
import { parseCodeFile } from './ast-parser.js';
import { splitMarkdown } from './markdown-splitter.js';
import { splitIntoChunks } from './fallback-splitter.js';
import { config } from '../config.js';

/**
 * Determine package name from file path
 */
function getPackageName(filePath: string): string {
  const parts = filePath.split('/');

  if (parts[0] === 'apps' && parts.length > 1) {
    return parts[1];
  }

  if (parts[0] === 'packages' && parts.length > 1) {
    return parts[1];
  }

  return 'root';
}

/**
 * Determine language from file extension
 */
function getLanguage(filePath: string): string {
  const ext = extname(filePath);

  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
      return 'javascript';
    case '.md':
      return 'markdown';
    case '.json':
      return 'json';
    case '.yaml':
    case '.yml':
      return 'yaml';
    default:
      return 'text';
  }
}

/**
 * Chunk a single file
 */
export async function chunkFile(file: FileInfo, rootDir: string): Promise<Chunk[]> {
  const fullPath = join(rootDir, file.path);
  const content = readFileSync(fullPath, 'utf-8');

  const baseMetadata = {
    filePath: file.path,
    fileName: basename(file.path),
    language: getLanguage(file.path),
    package: getPackageName(file.path),
    lastModified: file.lastModified.toISOString(),
  };

  const ext = extname(file.path);

  // Route to appropriate chunker
  if (ext === '.md') {
    return splitMarkdown(content, file.path, baseMetadata);
  }

  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    const astChunks = parseCodeFile(content, file.path, baseMetadata);

    // If AST parsing failed or returned no chunks, use fallback
    if (astChunks.length === 0) {
      return splitIntoChunks(
        content,
        file.path,
        baseMetadata,
        config.chunking.size,
        config.chunking.overlap,
      );
    }

    return astChunks;
  }

  // Fallback for other file types
  return splitIntoChunks(
    content,
    file.path,
    baseMetadata,
    config.chunking.size,
    config.chunking.overlap,
  );
}

/**
 * Chunk multiple files
 */
export async function chunkFiles(files: FileInfo[], rootDir: string): Promise<Chunk[]> {
  console.log(`📦 Chunking ${files.length} files...`);

  const allChunks: Chunk[] = [];

  for (const file of files) {
    try {
      const chunks = await chunkFile(file, rootDir);
      allChunks.push(...chunks);
    } catch (error) {
      console.warn(`Failed to chunk file: ${file.path}`, error);
    }
  }

  console.log(`✅ Created ${allChunks.length} chunks`);
  return allChunks;
}
