/**
 * GitHub service for MCP server
 * Retrieves file content from the repository
 */

import { Octokit } from 'octokit';
import { config } from '../config.js';

let octokitClient: Octokit | null = null;

/**
 * Get or create Octokit client
 */
function getClient(): Octokit {
  if (!octokitClient) {
    octokitClient = new Octokit({
      auth: config.github.token || undefined,
    });
  }
  return octokitClient;
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
  sha: string;
}

/**
 * Get file content from GitHub
 */
export async function getFileContent(path: string): Promise<FileContent | null> {
  const client = getClient();
  const [owner, repo] = config.github.repo.split('/');

  try {
    const response = await client.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: config.github.branch,
    });

    if ('content' in response.data && response.data.type === 'file') {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      const language = inferLanguage(path);

      return {
        path,
        content,
        language,
        sha: response.data.sha,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch file ${path}:`, error);
    return null;
  }
}

/**
 * Infer language from file extension
 */
function inferLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    md: 'markdown',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return languageMap[ext || ''] || 'text';
}
