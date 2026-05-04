import { NextResponse } from "next/server";
import { upsertDocument } from "@/lib/rag";
import fs from "fs";
import path from "path";

/**
 * POST /api/embed
 * Seeds the Pinecone vector index with portfolio data from resume.txt.
 */
export async function POST(req: Request) {
  try {
    const resumePath = path.join(process.cwd(), "resume.txt");
    if (!fs.existsSync(resumePath)) {
      return NextResponse.json(
        { error: "resume.txt not found in project root" },
        { status: 404 }
      );
    }

    const resumeContent = fs.readFileSync(resumePath, "utf-8");

    if (!resumeContent.trim()) {
      return NextResponse.json(
        { error: "resume.txt is empty" },
        { status: 400 }
      );
    }




    const result = await upsertDocument(
      resumeContent,
      "Sumit Kumar — Portfolio Resume",
      "resume"
    );



    return NextResponse.json({
      success: true,
      message: `Successfully embedded ${result.chunksCount} chunks into Pinecone (dimension: 3072).`,
      chunksCount: result.chunksCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Unknown error during embedding pipeline.",
      },
      { status: 500 }
    );
  }
}
