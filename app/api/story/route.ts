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
  // Pollinations text — completely free, no API key, no signup. Routes
  // to a GPT-class model under the hood. We pass jsonMode=true so the
  // response body is parseable JSON without needing a recovery
  // fallback.
  const model = process.env.STORY_MODEL || "openai";

  let body: { idea?: string; selections?: Selections; storyPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idea = body.idea ?? "";
  const selections = body.selections ?? {};
  const storyPrompt = body.storyPrompt ?? "";

  const userMessage = storyPrompt
    ? `${storyPrompt}\n\nاكتب القصة باللغة العربية الفصحى البسيطة من 5 فقرات.\n\nأعد النتيجة بصيغة JSON بهذا الشكل بالضبط:\n{\n  "title": "عنوان القصة",\n  "paragraphs": ["الفقرة الأولى", "الفقرة الثانية", "الفقرة الثالثة", "الفقرة الرابعة", "الفقرة الخامسة"],\n  "imagePrompt": "وصف باللغة الإنجليزية لرسمة كرتونية لطيفة تناسب القصة، بدون نص ظاهر في الصورة"\n}`
    : buildUserPrompt(idea, selections);

  const polRes = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      model,
      jsonMode: true,
    }),
  });

  if (!polRes.ok) {
    const detail = await polRes.text();
    return NextResponse.json(
      { error: "خدمة القصص غير متاحة الآن", status: polRes.status, detail },
      { status: 502 },
    );
  }

  const raw = await polRes.text();
  let parsed: { title?: string; paragraphs?: string[]; imagePrompt?: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Fence-stripping fallback for the rare case the model wraps JSON.
    const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    try {
      parsed = JSON.parse(stripped);
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json(
          { error: "النموذج لم يُعِد JSON صالحًا", raw: raw.slice(0, 1500) },
          { status: 502 },
        );
      }
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return NextResponse.json(
          { error: "النموذج أعاد JSON معطوبًا", raw: raw.slice(0, 1500) },
          { status: 502 },
        );
      }
    }
  }

  if (!parsed.paragraphs || !Array.isArray(parsed.paragraphs) || parsed.paragraphs.length === 0) {
    return NextResponse.json({ error: "القصة لا تحتوي على فقرات", parsed }, { status: 502 });
  }

  return NextResponse.json({
    title: parsed.title ?? "قصتي",
    paragraphs: parsed.paragraphs,
    imagePrompt: parsed.imagePrompt ?? "",
  });
}
