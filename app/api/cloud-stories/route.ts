import { NextRequest, NextResponse } from "next/server";
import {
  CloudStory,
  isCloudConfigured,
  listCloudStories,
  newCloudStoryId,
  saveCloudStory,
} from "@/lib/cloud-library";

export const runtime = "nodejs";

export async function GET() {
  if (!isCloudConfigured()) {
    return NextResponse.json({ stories: [], configured: false });
  }
  try {
    const stories = await listCloudStories(50);
    return NextResponse.json({ stories, configured: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: "تعذّر تحميل المكتبة",
        detail: e instanceof Error ? e.message : "unknown",
        stories: [],
        configured: true,
      },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isCloudConfigured()) {
    return NextResponse.json(
      { error: "Cloud library not configured", configured: false },
      { status: 503 },
    );
  }

  let body: Partial<CloudStory>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || !Array.isArray(body.paragraphs) || body.paragraphs.length === 0) {
    return NextResponse.json(
      { error: "Missing title or paragraphs" },
      { status: 400 },
    );
  }

  const story: CloudStory = {
    id: body.id || newCloudStoryId(),
    title: String(body.title).slice(0, 200),
    paragraphs: body.paragraphs.map((p) => String(p).slice(0, 4000)).slice(0, 10),
    imageUrl: body.imageUrl ? String(body.imageUrl).slice(0, 1500) : null,
    imagePrompt: body.imagePrompt ? String(body.imagePrompt).slice(0, 1000) : "",
    storyPrompt: body.storyPrompt ? String(body.storyPrompt).slice(0, 2000) : "",
    createdAt: Date.now(),
  };

  try {
    await saveCloudStory(story);
    return NextResponse.json({ story, configured: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: "تعذّر حفظ القصة",
        detail: e instanceof Error ? e.message : "unknown",
      },
      { status: 502 },
    );
  }
}
