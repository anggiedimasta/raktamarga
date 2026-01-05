/**
 * Configuration for the MCP server
 * Loads environment variables
 */

import { join, dirname } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

// Load .env file from repository root (search parent directories)
function findAndLoadEnv(): string {
  let currentDir = process.cwd();
  const root = '/';

  while (currentDir !== root) {
    const envPath = join(currentDir, '.env');

    if (existsSync(envPath)) {
      console.log(`Loading .env from: ${envPath}`);
      const envContent = readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      return currentDir;
    }

    currentDir = dirname(currentDir);
  }

  console.warn('No .env file found, using environment variables only');
  return process.cwd();
}

const rootDir = findAndLoadEnv();

export interface MCPConfig {
  gemini: {
    apiKey: string;
    model: string;
  };
  pinecone: {
    apiKey: string;
    index: string;
  };
  github: {
    token: string;
    repo: string;
    branch: string;
  };
  rootDir: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || '';
}

export const config: MCPConfig = {
  gemini: {
    apiKey: getEnvVar('GEMINI_API_KEY'),
    model: getOptionalEnvVar('EMBEDDING_MODEL', 'text-embedding-004'),
  },
  pinecone: {
    apiKey: getEnvVar('PINECONE_API_KEY'),
    index: getOptionalEnvVar('PINECONE_INDEX', 'raktamarga'),
  },
  github: {
    token: getOptionalEnvVar('GITHUB_TOKEN'),
    repo: getOptionalEnvVar('GITHUB_REPO', 'anggiedimasta/raktamarga'),
    branch: getOptionalEnvVar('GITHUB_BRANCH', 'main'),
  },
  rootDir,
};
