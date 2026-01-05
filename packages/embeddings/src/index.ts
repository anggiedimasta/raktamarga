/**
 * Main entry point for the embeddings indexer
 * Orchestrates the entire pipeline: scan → chunk → embed → index
 */

import { scanFiles } from './scanner/index.js';
import { getChangedFiles } from './scanner/git-diff.js';
import { chunkFiles } from './chunker/index.js';
import { generateEmbeddingsBatch } from './embedder/batch.js';
import { upsertVectors, deleteAllVectors } from './indexer/index.js';
import { handleIncrementalUpdate } from './indexer/incremental.js';
import { config } from './config.js';

/**
 * Main indexing function
 */
async function main() {
  console.log('🚀 Starting codebase indexing...\n');

  const startTime = Date.now();
  const isFullIndex = process.argv.includes('--full');

  try {
    // Step 1: Scan files
    const allFiles = await scanFiles(config.rootDir);

    if (allFiles.length === 0) {
      console.log('No files to index. Exiting.');
      return;
    }

    // Step 2: Determine which files to index
    let filesToIndex = allFiles;

    if (!isFullIndex) {
      // Incremental update
      const diff = getChangedFiles(config.rootDir);
      const totalChanges = diff.added.length + diff.modified.length + diff.deleted.length;

      if (totalChanges === 0) {
        console.log('No changes detected. Exiting.');
        return;
      }

      filesToIndex = await handleIncrementalUpdate(allFiles, diff);

      if (filesToIndex.length === 0) {
        console.log('No files to re-index after processing deletions. Exiting.');
        return;
      }
    } else {
      // Full re-index: delete all existing vectors
      console.log('🔄 Full re-index requested. Deleting all existing vectors...');
      await deleteAllVectors();
    }

    // Step 3: Chunk files
    const chunks = await chunkFiles(filesToIndex, config.rootDir);

    if (chunks.length === 0) {
      console.log('No chunks created. Exiting.');
      return;
    }

    // Step 4: Generate embeddings
    const embeddings = await generateEmbeddingsBatch(chunks, (current, total) => {
      const progress = Math.min(100, Math.round((current / total) * 100));
      console.log(`Progress: ${progress}% (${current}/${total})`);
    });

    // Step 5: Upsert to Pinecone
    await upsertVectors(embeddings);

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n✨ Indexing complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Files processed: ${filesToIndex.length}`);
    console.log(`   - Chunks created: ${chunks.length}`);
    console.log(`   - Vectors upserted: ${embeddings.size}`);
    console.log(`   - Duration: ${duration}s`);
    console.log(`   - Mode: ${isFullIndex ? 'Full index' : 'Incremental update'}`);

  } catch (error) {
    console.error('\n❌ Indexing failed:', error);
    process.exit(1);
  }
}

// Run the indexer
main();
