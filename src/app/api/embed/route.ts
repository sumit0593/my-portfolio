import { NextResponse } from "next/server";
import { upsertDocument } from "@/lib/rag";
import fs from "fs";
import path from "path";

/**
 * Flatten metadata.json into embedding-friendly text chunks.
 * Each section becomes a separate document for better semantic retrieval.
 */
function flattenMetadata(metadata: Record<string, any>): string[] {
  const chunks: string[] = [];

  // Personal info & summary
  if (metadata.personal_info) {
    const p = metadata.personal_info;
    chunks.push(
      `Name: ${p.name}. Title: ${p.title}. Location: ${p.location || ""}. ` +
      `Summary: ${p.summary || ""}. ` +
      `Search Keywords: ${(p.search_keywords || []).join(", ")}.`
    );
  }

  // Skills
  if (metadata.skills) {
    const skillLines = Object.entries(metadata.skills)
      .map(([category, items]) => `${category}: ${(items as string[]).join(", ")}`)
      .join(". ");
    chunks.push(`Technical Skills — ${skillLines}`);
  }

  // Experience
  if (metadata.experience) {
    for (const exp of metadata.experience) {
      chunks.push(
        `Experience: ${exp.role} at ${exp.company} (${exp.duration}, ${exp.location}). ` +
        `Highlights: ${exp.highlights.join(" ")} ` +
        `Tags: ${(exp.tags || []).join(", ")}.`
      );
    }
  }

  // Projects
  if (metadata.projects) {
    for (const proj of metadata.projects) {
      chunks.push(
        `Project: ${proj.title} — ${proj.category}. ` +
        `Description: ${proj.description} ` +
        `Tech Stack: ${proj.tech_stack.join(", ")}. ` +
        `Semantic Tags: ${(proj.semantic_tags || []).join(", ")}.`
      );
    }
  }

  // Education
  if (metadata.education) {
    const eduText = metadata.education
      .map((e: any) => `${e.degree} from ${e.institution} (${e.duration})`)
      .join(". ");
    chunks.push(`Education: ${eduText}.`);
  }

  // Certifications
  if (metadata.certifications) {
    for (const cert of metadata.certifications) {
      chunks.push(
        `Certification: ${cert.title} from ${cert.institution} (${cert.duration}). ` +
        `Highlights: ${cert.highlights.join(" ")}`
      );
    }
  }

  // Achievements
  if (metadata.key_achievements) {
    chunks.push(
      `Key Achievements: ${metadata.key_achievements.join(" ")}`
    );
  }

  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * POST /api/embed
 * Seeds the Pinecone vector index with portfolio data from resume.txt AND metadata.json.
 */
export async function POST(req: Request) {
  try {
    // --- 1. Index resume.txt ---
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

    const resumeResult = await upsertDocument(
      resumeContent,
      "Sumit Kumar — Portfolio Resume",
      "resume"
    );

    // --- 2. Index metadata.json ---
    let metadataChunksCount = 0;
    const metadataPath = path.join(process.cwd(), "src", "data", "metadata.json");
    if (fs.existsSync(metadataPath)) {
      try {
        const metadataRaw = fs.readFileSync(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataRaw);
        const metadataChunks = flattenMetadata(metadata);
        const metadataText = metadataChunks.join("\n\n");

        if (metadataText.trim().length > 0) {
          const metaResult = await upsertDocument(
            metadataText,
            "Sumit Kumar — Structured Portfolio Metadata",
            "metadata"
          );
          metadataChunksCount = metaResult.chunksCount;
        }
      } catch {
        // metadata.json parsing failed — continue with resume only
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully embedded ${resumeResult.chunksCount} resume chunks and ${metadataChunksCount} metadata chunks into Pinecone.`,
      resumeChunks: resumeResult.chunksCount,
      metadataChunks: metadataChunksCount,
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
