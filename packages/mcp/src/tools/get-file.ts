/**
 * get_file tool
 * Retrieve complete file content from the repository
 */

import { getFileContent, type FileContent } from '../services/github.js';

export interface GetFileInput {
  path: string;
}

export interface GetFileOutput {
  success: boolean;
  file: FileContent | null;
  error?: string;
}

export const getFileTool = {
  name: 'get_file',
  description: 'Get complete file content from the repository',
  inputSchema: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'File path relative to repository root (e.g., "apps/web/src/routes/index.tsx")',
      },
    },
    required: ['path'],
  },
};

export async function executeGetFile(input: GetFileInput): Promise<GetFileOutput> {
  const { path } = input;

  try {
    const file = await getFileContent(path);

    if (!file) {
      return {
        success: false,
        file: null,
        error: `File not found: ${path}`,
      };
    }

    return {
      success: true,
      file,
    };
  } catch (error) {
    return {
      success: false,
      file: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
