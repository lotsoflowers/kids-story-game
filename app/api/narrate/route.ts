import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Google Translate's unofficial TTS endpoint. Free, keyless, decent
// MSA pronunciation. Hard limit: ~200 characters per request, so we
// chunk on sentence boundaries. The endpoint expects User-Agent to
// look like a real browser — without it Google returns 403.
const GTTS_BASE =
  "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ar";

const MAX_CHUNK_CHARS = 190;
const CHUNK_TIMEOUT_MS = 12_000;

// Split into chunks ≤ MAX_CHUNK_CHARS, preferring to break on Arabic
// sentence terminators (. ! ? ؟ ) then whitespace, then hard-cut as
// a last resort.
function chunkText(text: string): string[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?؟])\s+/);

  const chunks: string[] = [];
  let buf = "";

  const push = () => {
    if (buf.trim()) chunks.push(buf.trim());
    buf = "";
  };

  for (const s of sentences) {
    if (s.length <= MAX_CHUNK_CHARS) {
      if ((buf + " " + s).trim().length > MAX_CHUNK_CHARS) push();
      buf = (buf + " " + s).trim();
    } else {
      // Sentence is itself too long — hard-cut it on word boundaries.
      push();
      const words = s.split(/\s+/);
      let cur = "";
      for (const w of words) {
        if ((cur + " " + w).trim().length > MAX_CHUNK_CHARS) {
          chunks.push(cur.trim());
          cur = w;
        } else {
          cur = (cur + " " + w).trim();
        }
      }
      if (cur) chunks.push(cur);
    }
  }
  push();
  return chunks;
}

async function fetchChunk(text: string): Promise<Uint8Array> {
  const url = `${GTTS_BASE}&q=${encodeURIComponent(text)}&textlen=${text.length}`;
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), CHUNK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      signal: ctl.signal,
    });
    if (!res.ok) {
      throw new Error(`gtts ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: NextRequest) {
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

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    return NextResponse.json({ error: "Nothing to narrate" }, { status: 400 });
  }

  // Fetch sequentially to be polite to Google's endpoint (parallel
  // bursts get rate-limited fast). Most stories produce 4-7 chunks
  // so total wall time is ~4-7 s.
  const parts: Uint8Array[] = [];
  for (const chunk of chunks) {
    try {
      parts.push(await fetchChunk(chunk));
    } catch (e) {
      const detail = e instanceof Error ? e.message : "fetch failed";
      return NextResponse.json(
        { error: "خدمة القراءة غير متاحة الآن", detail },
        { status: 502 },
      );
    }
  }

  // Concatenate MP3 frames. Each chunk is a self-contained MPEG audio
  // stream encoded with the same params (24 kHz mono layer 3) so naive
  // byte concatenation plays correctly in browsers and ffmpeg without
  // re-muxing. There's a tiny click between chunks but for kids' story
  // narration it's perceptually invisible.
  let total = 0;
  for (const p of parts) total += p.byteLength;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.byteLength;
  }

  return new NextResponse(out, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
