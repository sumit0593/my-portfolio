import { NextResponse } from "next/server";
import { retrieveHybridContext } from "@/lib/orchestrator";
import { classifyQuery } from "@/lib/router/queryClassifier";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required." }, { status: 400 });
    }

    const classification = classifyQuery(query);
    const { chunks } = await retrieveHybridContext(query, 10);

    return NextResponse.json({
      success: true,
      query,
      classification,
      topK: chunks.length,
      chunks: chunks.map(c => ({
        id: c.id,
        score: c.score,
        source: c.source,
        text_preview: c.text.substring(0, 100) + "...",
        metadata: c.metadata
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Debug retrieval failed." }, { status: 500 });
  }
}
