/**
 * File scanner with gitignore support
 * Discovers files to be indexed based on inclusion/exclusion patterns
 */

import { glob } from 'glob';
import ignore from 'ignore';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { FileInfo } from '../types.js';

const INCLUDE_PATTERNS = [
  'apps/**/*.{ts,tsx,js,jsx}',
  'packages/**/*.{ts,tsx,js,jsx}',
  'docs/**/*.md',
  '*.md',
];

const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.gen.ts',
  '**/coverage/**',
  '**/test-results/**',
  '.env*',
  '*.log',
  '*.lock',
  '.git/**',
  '.vscode/**',
  '.idea/**',
  'packages/embeddings/**', // Prevent circular indexing
];

/**
 * Load gitignore rules from the repository
 */
function loadGitignore(rootDir: string): ReturnType<typeof ignore> {
  const ig = ignore();

  try {
    const gitignorePath = join(rootDir, '.gitignore');
    const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
    ig.add(gitignoreContent);
  } catch (error) {
    console.warn('No .gitignore found, using default exclusions only');
  }

  // Add our custom exclusions
  ig.add(EXCLUDE_PATTERNS);

  return ig;
}

/**
 * Scan the repository for files to index
 */
export async function scanFiles(rootDir: string): Promise<FileInfo[]> {
  console.log('🔍 Scanning files...');

  const ig = loadGitignore(rootDir);
  const files: FileInfo[] = [];

  // Find all matching files
  for (const pattern of INCLUDE_PATTERNS) {
    const matches = await glob(pattern, {
      cwd: rootDir,
      absolute: false,
      nodir: true,
      dot: false,
    });

    for (const match of matches) {
      // Check if file should be ignored
      if (ig.ignores(match)) {
        continue;
      }

      const fullPath = join(rootDir, match);

      try {
        const stats = statSync(fullPath);
        files.push({
          path: match,
          size: stats.size,
          lastModified: stats.mtime,
        });
      } catch (error) {
        console.warn(`Failed to stat file: ${match}`, error);
      }
    }
  }

  console.log(`✅ Found ${files.length} files to index`);
  return files;
}
