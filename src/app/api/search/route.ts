import { NextResponse } from "next/server";
import { retrieveHybridContext } from "@/lib/orchestrator";
import { requireAuth } from "@/lib/api-auth";
import { searchLimiter, getRateLimitToken } from "@/lib/rate-limit";
import { searchQuerySchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    // Authentication check
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    // Rate limiting — max 30 requests per minute
    const token = getRateLimitToken(req);
    const { success: withinLimit } = searchLimiter.check(30, token);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Validate query parameters
    const { searchParams } = new URL(req.url);
    const parseResult = searchQuerySchema.safeParse({
      q: searchParams.get("q"),
      limit: searchParams.get("limit"),
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters.", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { q: query, limit } = parseResult.data;

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
    console.error("Search API Error:", error?.message);
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}
