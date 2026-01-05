/**
 * Git diff detection for incremental updates
 * Detects changed files since last commit
 */

import { execSync } from 'node:child_process';
import type { GitDiffResult } from '../types.js';

/**
 * Get changed files since HEAD~1
 */
export function getChangedFiles(rootDir: string): GitDiffResult {
  console.log('🔄 Detecting changed files...');

  const result: GitDiffResult = {
    added: [],
    modified: [],
    deleted: [],
  };

  try {
    // Get diff with name-status
    const output = execSync('git diff HEAD~1 --name-status', {
      cwd: rootDir,
      encoding: 'utf-8',
    });

    const lines = output.trim().split('\n').filter(Boolean);

    for (const line of lines) {
      const [status, ...pathParts] = line.split('\t');
      const path = pathParts.join('\t'); // Handle paths with tabs

      // Only include indexable files
      if (!isIndexableFile(path)) {
        continue;
      }

      switch (status) {
        case 'A':
          result.added.push(path);
          break;
        case 'M':
          result.modified.push(path);
          break;
        case 'D':
          result.deleted.push(path);
          break;
        default:
          // Handle renames, copies, etc. as modifications
          if (status.startsWith('R') || status.startsWith('C')) {
            result.modified.push(path);
          }
      }
    }

    const totalChanges = result.added.length + result.modified.length + result.deleted.length;
    console.log(`✅ Detected ${totalChanges} changed files (${result.added.length} added, ${result.modified.length} modified, ${result.deleted.length} deleted)`);

  } catch (error) {
    console.warn('Failed to get git diff, will perform full index:', error);
  }

  return result;
}

/**
 * Check if a file should be indexed based on extension
 */
function isIndexableFile(path: string): boolean {
  const indexableExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md'];
  return indexableExtensions.some(ext => path.endsWith(ext));
}
