# 📖 Kids Story Builder

A bilingual storytelling game for kids ages 5–8. A friendly pink moon
asks what story you want tonight — tap a suggestion or type your own
idea — and an AI weaves you a custom **Arabic** bedtime story,
complete with a hand-drawn-style cover illustration and a warm
narrator voice reading it aloud.

The whole thing happens under a deep-teal night sky filled with
twinkling stars, a glowing pink moon, drifting clouds, and the
occasional shooting star.

---

## ✨ How it works

1. **The moon asks** — "ما القصة التي تريد سماعها الليلة؟" / "What story
   shall I tell you tonight?" Tap a suggestion chip or type your own.
2. **The AI thinks** — a converse endpoint reads what you said and
   decides if there's enough to write a great story or if it should
   ask **one** smart follow-up. Never more than two questions total.
3. **The story is written** — Gemini 2.5 Pro writes a 5-paragraph
   Arabic bedtime tale in the cadence of a traditional storybook,
   threading your idea into the moral.
4. **Cover art appears** — Gemini Flash Image generates a soft
   cartoon illustration to match.
5. **🔊 Listen** — tap the button and Munsit's Arwa voice (fusha /
   Modern Standard Arabic) reads the story to you.

---

## 🚀 Run it locally

You'll need:
- **Node 20+**
- An **OpenRouter** account ([openrouter.ai](https://openrouter.ai))
  — pays for the story LLM and cover image
- A **Munsit** account ([munsit.com](https://munsit.com)) — pays for
  the Arabic narration

```bash
git clone https://github.com/lotsoflowers/kids-story-game.git
cd kids-story-game
npm install

# Copy the example env and fill in your two API keys
cp .env.example .env.local
# edit .env.local

npm run dev
```

Then open **http://localhost:3000**.

---

## 🔐 Environment variables

| Var | Required | What it's for |
|---|---|---|
| `OPENROUTER_API_KEY` | yes | Story LLM **and** cover image. |
| `MUNSIT_API_KEY` | yes | Arabic narration. JWT format. |
| `OPENROUTER_STORY_MODEL` | no | Defaults to `google/gemini-2.5-pro`. |
| `OPENROUTER_IMAGE_MODEL` | no | Defaults to `google/gemini-2.5-flash-image`. |
| `MUNSIT_VOICE_ID` | no | Defaults to **Arwa** (fusha / female). Browse alternatives via `GET https://api.munsit.com/api/v1/voices`. |
| `MUNSIT_MODEL_ID` | no | Defaults to `faseeh-v1-preview` (high-quality). |

`.env.local` is gitignored — secrets never reach the commit. All
keys are read **server-side only**: API routes call out to
OpenRouter/Munsit on behalf of the browser, so your keys never touch
the client bundle.

---

## 🏗️ Project layout

```
kids-story-game/
├─ app/
│  ├─ api/
│  │  ├─ converse/route.ts   ← LLM-driven conversation orchestrator
│  │  ├─ story/route.ts      ← OpenRouter chat completions (Arabic)
│  │  ├─ image/route.ts      ← OpenRouter image gen (cover)
│  │  └─ narrate/route.ts    ← Munsit text-to-speech (WAV)
│  ├─ components/
│  │  ├─ NightSky.tsx        ← Stars, moon, drifting clouds
│  │  ├─ ShootingStar.tsx    ← Provider + trigger for delight moments
│  │  ├─ StoryFriend.tsx     ← The pink-moon character + speech bubble
│  │  ├─ ChatInput.tsx       ← Suggestion chips + text input + send
│  │  ├─ LoadingScreen.tsx   ← Pulsing pink moon
│  │  └─ StoryDisplay.tsx    ← Cover + RTL Arabic + Listen button
│  ├─ globals.css            ← All the visual theme lives here
│  ├─ layout.tsx             ← Loads fonts, mounts NightSky
│  └─ page.tsx               ← Top-level flow state machine
├─ CLAUDE.md                 ← Notes for AI assistants
└─ .env.example              ← Variable names + sensible defaults
```

---

## 🎨 The palette

Six colors, locked. Add a new shade only if you really need it.

| Hex | Used for |
|---|---|
| `#5FA5BA` | Deep teal — main night sky |
| `#AADFE1` | Light teal — horizon glow |
| `#FEE1DF` | Pale pink — moon, soft text, third card variant |
| `#FEB4B3` | Coral — secondary buttons, drifting clouds, first card variant |
| `#F8D741` | Yellow — primary action buttons, twinkling stars |
| `#E8EC8C` | Soft green-yellow — second card variant |

---

## 🔧 Customizing

**Tweak the moon's voice:** edit the system prompt in
`app/api/converse/route.ts` to change how the moon talks, what
counts as "enough info," or to harden the guardrails.

**Tweak the first-question chips:** they're hardcoded in
`app/page.tsx` (`DEFAULT_FIRST_CHIPS`). Change them to seed different
story moods.

**Try a different LLM:** swap `OPENROUTER_STORY_MODEL` in
`.env.local`. Anything OpenRouter routes to that supports JSON output
will work. Bigger models = richer prose, smaller = faster. The route
budgets 4 000 tokens because Arabic is token-hungry.

**Try a different voice:** swap `MUNSIT_VOICE_ID`. Munsit has
**14 fusha (MSA) voices** plus dozens of dialect voices (Emirati,
Najdi, Egyptian, etc.) — list them with
`curl -H "x-api-key: $MUNSIT_API_KEY" https://api.munsit.com/api/v1/voices`.

**Tone down animation:** the cloud layer in `app/components/NightSky.tsx`
is the most paint-heavy effect. Cut the cloud array to `[]` if
performance suffers on lower-end devices. Stars and shooting stars
are cheap.

---

## 🙏 Credits

- **OpenRouter** — model gateway. [openrouter.ai](https://openrouter.ai)
- **Google Gemini 2.5 Pro** — Arabic prose so good it feels written
  by a real children's-book author.
- **Google Gemini 2.5 Flash Image** — gentle cartoon cover
  illustrations.
- **Munsit (CNTXT AI)** — Arabic-native voice synthesis with
  fusha + 25 dialects. [munsit.com](https://munsit.com)
- **Cairo** + **Fredoka** — Google Fonts.

---

## 📜 License

All rights reserved (private project). API providers above each
have their own usage terms — comply with theirs when shipping.
