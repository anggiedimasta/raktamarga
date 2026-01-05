/**
 * Markdown splitter
 * Splits markdown files by headers (h1, h2, h3)
 */

import type { Chunk, ChunkMetadata } from '../types.js';

interface Section {
  header: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
}

/**
 * Split markdown content by headers
 */
export function splitMarkdown(
  content: string,
  filePath: string,
  metadata: Pick<ChunkMetadata, 'filePath' | 'fileName' | 'language' | 'package' | 'lastModified'>,
): Chunk[] {
  const lines = content.split('\n');
  const sections: Section[] = [];

  let currentSection: Section | null = null;
  let currentLine = 1;

  for (const line of lines) {
    // Check for headers (h1, h2, h3)
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        header: headerMatch[2],
        level: headerMatch[1].length,
        content: line + '\n',
        startLine: currentLine,
        endLine: currentLine,
      };
    } else if (currentSection) {
      // Add to current section
      currentSection.content += line + '\n';
      currentSection.endLine = currentLine;
    } else {
      // Content before first header
      if (!currentSection) {
        currentSection = {
          header: filePath.split('/').pop() || 'Document',
          level: 0,
          content: line + '\n',
          startLine: currentLine,
          endLine: currentLine,
        };
      }
    }

    currentLine++;
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // Convert sections to chunks
  return sections.map(section => ({
    content: section.content.trim(),
    metadata: {
      ...metadata,
      chunkType: 'section' as const,
      name: section.header,
      exports: [],
      imports: [],
      startLine: section.startLine,
      endLine: section.endLine,
    },
  }));
}
