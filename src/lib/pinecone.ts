import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not defined.");
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "dummy-key-for-build",
});

export const INDEX_NAME = process.env.PINECONE_INDEX || 'portfolio';
export const PORTFOLIO_NAMESPACE = 'portfolio';
export const EMBEDDING_DIMENSION = 3072; // gemini-embedding-001 output dimension

export const getPortfolioIndex = () => pinecone.index<PineconeMetadata>(INDEX_NAME);

export interface PineconeMetadata extends Record<string, any> {
  text: string;
  title: string;
  source: string;
  type?: string;
  section?: string;
  recruiter_keywords?: string[];
  semantic_tags?: string[];
  ai_specializations?: string[];
  architecture_tags?: string[];
  skills?: string[];
  project_name?: string;
  priority_score?: number;
  experience_level?: string;
}

/**
 * Ensures the Pinecone index exists with the correct dimension.
 */
export async function ensureIndex(): Promise<void> {
  const indexList = await pinecone.listIndexes();
  const existing = indexList.indexes?.find((idx) => idx.name === INDEX_NAME);

  if (existing) {
    if (existing.dimension === EMBEDDING_DIMENSION) {
      return; // Index exists and dimension matches
    }
    
    console.log(`[Pinecone] Deleting index due to dimension mismatch. Found: ${existing.dimension}, Expected: ${EMBEDDING_DIMENSION}`);
    await pinecone.deleteIndex(INDEX_NAME);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log(`[Pinecone] Creating index ${INDEX_NAME} with dimension ${EMBEDDING_DIMENSION}`);
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

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const desc = await pinecone.describeIndex(INDEX_NAME);
    if (desc.status?.ready) {
      ready = true;
      break;
    }
  }

  if (!ready) {
    throw new Error(`[Pinecone] Index "${INDEX_NAME}" did not become ready after 90 seconds.`);
  }
}
