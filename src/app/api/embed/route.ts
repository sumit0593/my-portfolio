import { NextResponse } from "next/server";
import { ensureIndex, getPortfolioIndex, PORTFOLIO_NAMESPACE, PineconeMetadata } from "@/lib/pinecone";
import { generateEmbeddings, chunkText } from "@/lib/embeddings";
import { minisearchManager, SearchDocument } from "@/lib/search/minisearch";
import { embedLimiter, getRateLimitToken } from "@/lib/rate-limit";
import fs from "fs";
import path from "path";

/**
 * Helper to process all text files in data/profile
 */
function processProfileDir(): SearchDocument[] {
  const profileDir = path.join(process.cwd(), "data", "profile");
  const docs: SearchDocument[] = [];

  if (!fs.existsSync(profileDir)) return docs;

  const files = fs.readdirSync(profileDir).filter(f => f.endsWith(".txt"));

  for (const file of files) {
    const sectionName = file.replace(".txt", "");
    const content = fs.readFileSync(path.join(profileDir, file), "utf-8");
    const chunks = chunkText(content, sectionName);

    chunks.forEach((text, i) => {
      docs.push({
        id: `profile-${sectionName}-${i}`,
        text,
        title: `Profile: ${sectionName}`,
        source: `data/profile/${file}`,
        type: "profile",
        section: sectionName
      });
    });
  }
  return docs;
}

/**
 * Process metadata.json and extract highly valuable structured search docs
 */
function processMetadata(): SearchDocument[] {
  const metaPath = path.join(process.cwd(), "data", "metadata", "metadata.json");
  const docs: SearchDocument[] = [];

  if (!fs.existsSync(metaPath)) return docs;

  const raw = fs.readFileSync(metaPath, "utf-8");
  const meta = JSON.parse(raw);

  // Projects
  if (meta.projects) {
    meta.projects.forEach((proj: any, i: number) => {
      docs.push({
        id: `meta-project-${i}`,
        text: `Project: ${proj.title}. ${proj.description}. Tech: ${proj.tech_stack?.join(", ")}.`,
        title: proj.title,
        source: "metadata.json",
        type: "project",
        section: "projects",
        recruiter_keywords: proj.recruiter_keywords || [],
        semantic_tags: proj.semantic_tags || [],
        // pass raw fields to be used in Pinecone metadata
        _raw: proj
      } as any);
    });
  }

  return docs;
}

export async function POST(req: Request) {
  try {
    // H-05: Protect with admin API key — this is a destructive admin-only operation
    const adminKey = req.headers.get("x-admin-key");
    if (!process.env.ADMIN_EMBED_KEY || adminKey !== process.env.ADMIN_EMBED_KEY) {
      return NextResponse.json({ error: "Forbidden. Admin API key required." }, { status: 403 });
    }

    // Rate limiting — max 2 per hour
    const token = getRateLimitToken(req);
    const { success: withinLimit } = embedLimiter.check(2, token);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. This endpoint is limited to 2 calls per hour." },
        { status: 429 }
      );
    }

    const docs = [...processProfileDir(), ...processMetadata()];

    if (docs.length === 0) {
      return NextResponse.json({ error: "No documents found to embed." }, { status: 400 });
    }

    // 1. Ensure Pinecone Index
    await ensureIndex();
    const index = getPortfolioIndex();

    // Clear existing namespace in Pinecone to delete stale/removed records
    try {
      await index.namespace(PORTFOLIO_NAMESPACE).deleteAll();
      console.log("[Pinecone] Cleared namespace:", PORTFOLIO_NAMESPACE);
    } catch (e) {
      console.warn("[Pinecone] Could not clear namespace:", e);
    }

    // 2. Generate Embeddings in Batches
    const texts = docs.map(d => d.text);
    const embeddings = await generateEmbeddings(texts);

    // 3. Prepare Pinecone Vectors
    const vectors = docs.map((doc, i) => {
      const meta: PineconeMetadata = {
        text: doc.text,
        title: doc.title,
        source: doc.source,
        type: doc.type,
        section: doc.section,
        recruiter_keywords: doc.recruiter_keywords || [],
        semantic_tags: doc.semantic_tags || [],
        priority_score: (doc as any)._raw?.priority_score || 5
      };

      return {
        id: doc.id,
        values: embeddings[i],
        metadata: meta
      };
    });

    // 4. Upsert to Pinecone in Batches
    const batchSize = 50;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert({ records: batch as any, namespace: PORTFOLIO_NAMESPACE });
    }

    // 5. Build and Save MiniSearch Index
    minisearchManager.clearIndex();
    minisearchManager.addDocuments(docs);
    minisearchManager.saveIndex();

    return NextResponse.json({
      success: true,
      message: `Successfully embedded ${vectors.length} chunks into Pinecone and MiniSearch.`,
      chunksIndexed: vectors.length
    });

  } catch (error: any) {
    console.error("Embedding Error:", error?.message);
    return NextResponse.json(
      { error: "Unknown error during embedding pipeline." },
      { status: 500 }
    );
  }
}
