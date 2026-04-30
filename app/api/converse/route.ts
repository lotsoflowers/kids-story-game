import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Turn = { role: "friend" | "kid"; text: string };

const SYSTEM_PROMPT = `أنت "صديق القصص" — قمر لطيف يساعد الأطفال (5-8 سنوات) على
ابتكار قصص قبل النوم. تتحدث مع الطفل بطريقة دافئة ومرحة وقصيرة.

مهمتك:
- اقرأ ما قاله الطفل حتى الآن.
- قرر: هل لديك ما يكفي لكتابة قصة جميلة؟ القصة الجيدة تحتاج فكرة عن
  بطل أو موضوع. ليس عليك أن تطلب كل شيء — كن متساهلًا ومبدعًا.
- إذا كانت لديك فكرة كافية: أجب بـ ready=true وأنشئ "story_prompt" —
  وصف غني باللغة الإنجليزية لما يجب أن تتضمنه القصة (شخصيات، أماكن،
  أحداث، نوع النهاية). يقرأه نموذج آخر لكتابة القصة العربية.
- إذا كنت تحتاج إلى المزيد: أجب بـ ready=false وأرسل سؤالًا قصيرًا
  ودافئًا للطفل، وأربعة اقتراحات سريعة (chips) يمكنه النقر عليها.

قواعد:
- اطرح سؤالًا واحدًا فقط في المرة، أبدًا لا تطرح سلسلة من الأسئلة.
- الاقتراحات قصيرة جدًا (3-5 كلمات) ومتنوعة، تشمل إيموجي.
- لا تطرح أكثر من سؤالين متتاليين أبدًا. بعد سؤالين، اعتبر أن لديك
  ما يكفي وارفع ready=true.
- إذا قال الطفل "فاجئني" أو "لا أدري" أو "اختر أنت"، فاجعل ready=true
  وابتكر القصة.

أعد JSON فقط:
{
  "ready": true,
  "story_prompt": "وصف بالإنجليزية للقصة المراد كتابتها"
}
أو
{
  "ready": false,
  "question": "السؤال للطفل بالعربية",
  "chips": ["اقتراح ١ 🐉", "اقتراح ٢ 🌳", "اقتراح ٣ 🏰", "اقتراح ٤ ✨"]
}`;

const FALLBACK_FIRST_QUESTION = {
  ready: false as const,
  question: "ما القصة التي تريد سماعها الليلة؟ 🌙",
  chips: [
    "تنين شجاع 🐉",
    "أميرة في الفضاء 🚀",
    "صديقان في الغابة 🌳",
    "فاجئني! ✨",
  ],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
  }

  const model = process.env.OPENROUTER_STORY_MODEL || "google/gemini-2.5-pro";

  let body: { history?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const history = body.history ?? [];

  // First-turn shortcut: if the kid hasn't said anything yet, return a
  // canned warm-welcome question without burning an LLM call.
  if (history.length === 0 || !history.some((t) => t.role === "kid")) {
    return NextResponse.json(FALLBACK_FIRST_QUESTION);
  }

  const transcript = history
    .map((t) => `${t.role === "friend" ? "صديق القصص" : "الطفل"}: ${t.text}`)
    .join("\n");

  const turnsByKid = history.filter((t) => t.role === "kid").length;

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
        {
          role: "user",
          content: `حتى الآن في المحادثة:\n${transcript}\n\nالطفل تكلم ${turnsByKid} مرة. ${
            turnsByKid >= 2 ? "تذكّر: لا تطرح المزيد من الأسئلة، اجعل ready=true." : ""
          }\n\nأعد JSON فقط.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800,
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

  let parsed: {
    ready?: boolean;
    story_prompt?: string;
    question?: string;
    chips?: string[];
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    const stripped = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    try {
      parsed = JSON.parse(stripped);
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (!match) {
        return NextResponse.json(
          { error: "Model did not return JSON", raw: content.slice(0, 1000) },
          { status: 502 },
        );
      }
      parsed = JSON.parse(match[0]);
    }
  }

  // Hard cap: after 2 kid turns we don't want any more questions, even
  // if the model tried. Synthesize a story_prompt from whatever they said.
  if (turnsByKid >= 2 && !parsed.ready) {
    return NextResponse.json({
      ready: true,
      story_prompt:
        "Create a warm bedtime story for ages 5-8 based on the child's wishes: " +
        history
          .filter((t) => t.role === "kid")
          .map((t) => t.text)
          .join("; "),
    });
  }

  return NextResponse.json(parsed);
}
