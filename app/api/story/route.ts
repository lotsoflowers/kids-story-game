import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Selections = {
  hero?: string;
  setting?: string;
  problem?: string;
  helper?: string;
  ending?: string;
};

const SYSTEM_PROMPT = `أنت كاتب قصص أطفال موهوب باللغة العربية الفصحى البسيطة.
- تكتب قصصًا قصيرة لأطفال أعمارهم بين 5 و 8 سنوات.
- استخدم جملًا قصيرة ومفردات بسيطة وأسلوبًا دافئًا ومرحًا.
- يجب أن تكون القصة من 5 فقرات بالضبط.
- اجعل القصة آمنة ولطيفة، بدون عنف أو خوف شديد.
- أعد النتيجة بصيغة JSON فقط بدون أي نص آخر.`;

function buildUserPrompt(idea: string, sel: Selections) {
  const parts = [];
  if (sel.hero) parts.push(`البطل: ${sel.hero}`);
  if (sel.setting) parts.push(`المكان: ${sel.setting}`);
  if (sel.problem) parts.push(`المشكلة: ${sel.problem}`);
  if (sel.helper) parts.push(`المساعد: ${sel.helper}`);
  if (sel.ending) parts.push(`نوع النهاية: ${sel.ending}`);
  const picked = parts.length ? `الاختيارات:\n${parts.join("\n")}\n\n` : "";
  const ideaBlock = idea?.trim() ? `فكرة الطفل: ${idea.trim()}\n\n` : "";

  return `${picked}${ideaBlock}اكتب قصة باللغة العربية الفصحى البسيطة من 5 فقرات للأطفال.

أعد النتيجة بصيغة JSON بهذا الشكل بالضبط:
{
  "title": "عنوان القصة",
  "paragraphs": ["الفقرة الأولى", "الفقرة الثانية", "الفقرة الثالثة", "الفقرة الرابعة", "الفقرة الخامسة"],
  "imagePrompt": "وصف باللغة الإنجليزية لرسمة كرتونية لطيفة تناسب القصة، بدون نص ظاهر في الصورة"
}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
  }

  const model = process.env.OPENROUTER_STORY_MODEL || "google/gemini-2.5-pro";

  let body: { idea?: string; selections?: Selections };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idea = body.idea ?? "";
  const selections = body.selections ?? {};

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
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(idea, selections) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 4000,
    }),
  });

  if (!orRes.ok) {
    const text = await orRes.text();
    return NextResponse.json(
      { error: "OpenRouter request failed", status: orRes.status, detail: text },
      { status: 502 },
    );
  }

  const data = await orRes.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  let parsed: { title?: string; paragraphs?: string[]; imagePrompt?: string };
  try {
    parsed = JSON.parse(content);
  } catch {
    // Strip ```json ... ``` fences some models add even when asked for raw JSON.
    const stripped = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    try {
      parsed = JSON.parse(stripped);
    } catch {
      // Last resort: grab the largest balanced-ish object substring.
      const match = stripped.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json(
          { error: "Model did not return JSON", raw: content.slice(0, 1500) },
          { status: 502 },
        );
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          { error: "Model returned malformed JSON", raw: content.slice(0, 1500) },
          { status: 502 },
        );
      }
    }
  }

  if (!parsed.paragraphs || !Array.isArray(parsed.paragraphs) || parsed.paragraphs.length === 0) {
    return NextResponse.json({ error: "Story missing paragraphs", parsed }, { status: 502 });
  }

  return NextResponse.json({
    title: parsed.title ?? "قصتي",
    paragraphs: parsed.paragraphs,
    imagePrompt: parsed.imagePrompt ?? "",
  });
}
