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

You'll need **Node 20+**. That's it.

This app uses fully free, keyless services:

- **Story + conversation** → [Pollinations text](https://text.pollinations.ai)
  (no key, no signup, GPT-class quality, JSON output supported).
- **Cover image** → [Pollinations image](https://image.pollinations.ai)
  (no key, fetched directly from the browser).
- **Narration** → browser's built-in `speechSynthesis` API, runs on
  the user's device. No TTS service, no key, no network call for audio.
  *Note:* voice quality depends on the user's OS. Windows 11, iOS,
  macOS, and modern Android ship with at least one Arabic voice
  (Naayf, Maged, etc.). Older systems may fall back to a non-Arabic
  voice that mispronounces.

```bash
git clone https://github.com/lotsoflowers/kids-story-game.git
cd kids-story-game
npm install
npm run dev
```

Then open **http://localhost:3000** — it just works.

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
| `STORY_MODEL` | no | Pollinations text model. Defaults to `openai`. Other options: `mistral`, `llama`, `deepseek`, `gemini`. |

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
│  │  └─ story/route.ts      ← OpenRouter chat completions (Arabic)
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

- **[Pollinations.ai](https://pollinations.ai)** — free, open,
  keyless text and image generation. The whole app runs on it.
- **Web Speech API (`speechSynthesis`)** — built into every modern
  browser; runs locally on the user's device.
- **Cairo** — Google Fonts (Arabic display + body).

---

## 📜 License

All rights reserved (private project). API providers above each
have their own usage terms — comply with theirs when shipping.
