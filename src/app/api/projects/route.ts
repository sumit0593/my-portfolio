import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { globalCache } from "@/lib/cache";

function getProjects() {
  const cacheKey = "metadata-projects";
  let projects = globalCache.metadataCache.get(cacheKey);

  if (!projects) {
    const metaPath = path.join(process.cwd(), "data", "metadata", "metadata.json");
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      projects = meta.projects || [];
      // Sort by priority score
      projects.sort((a: any, b: any) => (b.priority_score || 0) - (a.priority_score || 0));
      globalCache.metadataCache.set(cacheKey, projects);
    } else {
      projects = [];
    }
  }
  return projects;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const tech = searchParams.get("tech");

    let projects = getProjects();

    if (category) {
      projects = projects.filter((p: any) => p.category?.toLowerCase().includes(category.toLowerCase()));
    }

    if (tech) {
      projects = projects.filter((p: any) => 
        p.tech_stack?.some((t: string) => t.toLowerCase() === tech.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load projects." }, { status: 500 });
  }
}
