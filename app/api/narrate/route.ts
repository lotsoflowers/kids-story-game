import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.MUNSIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "MUNSIT_API_KEY is not set" }, { status: 500 });
  }

  // Default voice "Arwa" — fusha (MSA) female. The faseeh-v1-preview
  // model is the high-quality (non-streaming) variant, recommended for
  // longer story narration where latency matters less than fidelity.
  const voiceId = process.env.MUNSIT_VOICE_ID || "OUOdy43qiHKwzVLRScXFnUe8";
  const modelId = process.env.MUNSIT_MODEL_ID || "faseeh-v1-preview";

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const munsitRes = await fetch(
    `https://api.munsit.com/api/v1/text-to-speech/${encodeURIComponent(modelId)}`,
    {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text,
        stability: 0.5,
        speed: 0.95,
        streaming: false,
      }),
    },
  );

  if (!munsitRes.ok) {
    const detail = await munsitRes.text();
    return NextResponse.json(
      { error: "Munsit request failed", status: munsitRes.status, detail },
      { status: 502 },
    );
  }

  const audioBuffer = await munsitRes.arrayBuffer();
  return new NextResponse(audioBuffer, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}
