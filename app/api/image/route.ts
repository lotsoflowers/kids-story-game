import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
  }

  const model = process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-2.5-flash-image";

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const styledPrompt = `Children's storybook illustration. Soft, warm, friendly cartoon style. Bright colors, gentle shapes. No text, letters, or words anywhere in the image. Subject: ${prompt}`;

  const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "Kids Story Builder",
    },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: styledPrompt }],
    }),
  });

  if (!orRes.ok) {
    const text = await orRes.text();
    return NextResponse.json(
      { error: "OpenRouter image request failed", status: orRes.status, detail: text },
      { status: 502 },
    );
  }

  const data = await orRes.json();
  const message = data?.choices?.[0]?.message ?? {};

  // OpenRouter returns image data in a few possible shapes depending on
  // provider. We try them in order: explicit `images` array → `content`
  // array of parts → string content with embedded data URI.
  let imageUrl: string | null = null;

  if (Array.isArray(message.images) && message.images.length > 0) {
    const first = message.images[0];
    imageUrl = first?.image_url?.url ?? first?.url ?? null;
  }

  if (!imageUrl && Array.isArray(message.content)) {
    for (const part of message.content as ContentPart[]) {
      if (part.type === "image_url" && part.image_url?.url) {
        imageUrl = part.image_url.url;
        break;
      }
    }
  }

  if (!imageUrl && typeof message.content === "string") {
    const match = message.content.match(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/);
    if (match) imageUrl = match[0];
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: "No image returned", raw: JSON.stringify(message).slice(0, 800) },
      { status: 502 },
    );
  }

  return NextResponse.json({ imageUrl });
}
