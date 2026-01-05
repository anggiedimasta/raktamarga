/**
 * Incremental update logic
 * Handles selective re-indexing based on git diff
 */

import type { GitDiffResult, FileInfo } from '../types.js';
import { deleteVectorsByFilePath } from './index.js';

/**
 * Filter files based on git diff
 * Returns only files that need to be re-indexed
 */
export function getFilesToReindex(
  allFiles: FileInfo[],
  diff: GitDiffResult,
): { filesToIndex: FileInfo[]; filesToDelete: string[] } {
  const changedPaths = new Set([...diff.added, ...diff.modified]);

  // Filter to only changed files
  const filesToIndex = allFiles.filter(file => changedPaths.has(file.path));

  // Files to delete
  const filesToDelete = diff.deleted;

  return { filesToIndex, filesToDelete };
}

/**
 * Handle incremental update
 */
export async function handleIncrementalUpdate(
  allFiles: FileInfo[],
  diff: GitDiffResult,
): Promise<FileInfo[]> {
  const { filesToIndex, filesToDelete } = getFilesToReindex(allFiles, diff);

  console.log(`📊 Incremental update: ${filesToIndex.length} files to index, ${filesToDelete.length} files to delete`);

  // Delete vectors for deleted and modified files
  const filesToDeleteVectors = [...filesToDelete, ...filesToIndex.map(f => f.path)];

  for (const filePath of filesToDeleteVectors) {
    await deleteVectorsByFilePath(filePath);
  }

  return filesToIndex;
}
