import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  console.warn("PINECONE_API_KEY is not defined.");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "dummy-key-for-build",
});

export const INDEX_NAME = process.env.PINECONE_INDEX || 'portfolio';
export const PORTFOLIO_NAMESPACE = 'portfolio';
export const EMBEDDING_DIMENSION = 3072; // gemini-embedding-001 output dimension

export const getPortfolioIndex = () => pinecone.index(INDEX_NAME);

/**
 * Ensures the Pinecone index exists with the correct dimension.
 * If the index already exists, it is deleted and recreated to guarantee
 * the dimension matches the current embedding model (3072 for gemini-embedding-001).
 */
export async function ensureIndex(): Promise<void> {
  console.log(`[Pinecone] Checking if index "${INDEX_NAME}" exists...`);

  const indexList = await pinecone.listIndexes();
  const existing = indexList.indexes?.find((idx) => idx.name === INDEX_NAME);

  if (existing) {
    console.log(`[Pinecone] Index "${INDEX_NAME}" exists (dimension: ${existing.dimension}). Deleting...`);
    await pinecone.deleteIndex(INDEX_NAME);
    // Wait for deletion to propagate
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(`[Pinecone] Deleted index "${INDEX_NAME}".`);
  }

  console.log(`[Pinecone] Creating index "${INDEX_NAME}" with dimension ${EMBEDDING_DIMENSION}...`);
  await pinecone.createIndex({
    name: INDEX_NAME,
    dimension: EMBEDDING_DIMENSION,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1',
      },
    },
  });

  // Wait for the index to become ready
  console.log(`[Pinecone] Waiting for index to become ready...`);
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const desc = await pinecone.describeIndex(INDEX_NAME);
    if (desc.status?.ready) {
      ready = true;
      break;
    }
    console.log(`[Pinecone] Index not ready yet, attempt ${i + 1}/30...`);
  }

  if (!ready) {
    throw new Error(`[Pinecone] Index "${INDEX_NAME}" did not become ready after 90 seconds.`);
  }

  console.log(`[Pinecone] Index "${INDEX_NAME}" is ready ✓`);
}
