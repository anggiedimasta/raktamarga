/**
 * TypeScript/JavaScript AST parser
 * Extracts semantic chunks (functions, classes, exports) from code files
 */

import { parse } from '@typescript-eslint/parser';
import type { Chunk, ChunkMetadata } from '../types.js';

interface SemanticChunk {
  type: 'function' | 'class' | 'export';
  name: string;
  content: string;
  startLine: number;
  endLine: number;
  imports: string[];
  exports: string[];
}

/**
 * Parse TypeScript/JavaScript file and extract semantic chunks
 */
export function parseCodeFile(
  content: string,
  filePath: string,
  metadata: Pick<ChunkMetadata, 'filePath' | 'fileName' | 'language' | 'package' | 'lastModified'>,
): Chunk[] {
  try {
    const ast = parse(content, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      loc: true,
    });

    const chunks: Chunk[] = [];
    const lines = content.split('\n');
    const imports: string[] = [];
    const exports: string[] = [];

    // Extract imports and exports
    if (ast.body) {
      for (const node of ast.body) {
        // Track imports
        if (node.type === 'ImportDeclaration' && node.source) {
          imports.push(node.source.value as string);
        }

        // Track exports
        if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
          if (node.type === 'ExportDefaultDeclaration') {
            exports.push('default');
          } else if (node.declaration) {
            // @ts-ignore - declaration types vary
            const name = node.declaration.id?.name || node.declaration.name;
            if (name) exports.push(name);
          }
        }

        // Extract function declarations
        if (node.type === 'FunctionDeclaration' && node.id && node.loc) {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;
          const chunkContent = lines.slice(startLine - 1, endLine).join('\n');

          chunks.push({
            content: chunkContent,
            metadata: {
              ...metadata,
              chunkType: 'function' as const,
              name: node.id.name,
              imports,
              exports,
              startLine,
              endLine,
            },
          });
        }

        // Extract class declarations
        if (node.type === 'ClassDeclaration' && node.id && node.loc) {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;
          const chunkContent = lines.slice(startLine - 1, endLine).join('\n');

          chunks.push({
            content: chunkContent,
            metadata: {
              ...metadata,
              chunkType: 'class' as const,
              name: node.id.name,
              imports,
              exports,
              startLine,
              endLine,
            },
          });
        }

        // Extract exported arrow functions and const declarations
        if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration' && node.loc) {
          const startLine = node.loc.start.line;
          const endLine = node.loc.end.line;
          const chunkContent = lines.slice(startLine - 1, endLine).join('\n');

          // @ts-ignore - declarations exist on VariableDeclaration
          const name = node.declaration.declarations[0]?.id?.name || 'export';

          chunks.push({
            content: chunkContent,
            metadata: {
              ...metadata,
              chunkType: 'export' as const,
              name,
              imports,
              exports,
              startLine,
              endLine,
            },
          });
        }
      }
    }

    // If no chunks were extracted, return the whole file as one chunk
    if (chunks.length === 0) {
      chunks.push({
        content,
        metadata: {
          ...metadata,
          chunkType: 'file' as const,
          name: '',
          imports,
          exports,
          startLine: 1,
          endLine: lines.length,
        },
      });
    }

    return chunks;
  } catch (error) {
    console.warn(`Failed to parse ${filePath}, will use fallback chunker:`, error);
    return [];
  }
}
