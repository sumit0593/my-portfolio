import { NextResponse } from "next/server";
import { retrieveHybridContext } from "@/lib/orchestrator";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required." }, { status: 400 });
    }

    const { chunks, intent } = await retrieveHybridContext(query, limit);

    return NextResponse.json({
      success: true,
      query,
      intent,
      results: chunks.map(c => ({
        id: c.id,
        score: c.score,
        text: c.text,
        source: c.source,
        metadata: c.metadata
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Search failed." }, { status: 500 });
  }
}
