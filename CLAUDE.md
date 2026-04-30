# Project notes — kids-story-game

A bilingual kids' storytelling web app: kid taps through 5 picture
choices + an optional idea text box, an LLM writes a 5-paragraph
Arabic story, an image model draws a cover, and a TTS voice reads
it aloud. UI is English/picture-driven; story content is Arabic.

## Commit conventions (REQUIRED)

When the user asks for a commit / push / "update the git", every commit
message must be a real changelog entry — not a one-liner.

**Format:**

1. **First line: imperative summary, ≤ 72 chars.** Example: "Switch
   narration from ElevenLabs to Munsit (CNTXT AI)" — not "tts swap".

2. **Blank line, then a body.** Multi-paragraph. Cover:
   - What changed (user-facing behavior, in plain English).
   - Why it changed (the bug it fixes or feature it adds).
   - Notable technical details that future-me would want to know
     (model slugs, env vars, voice IDs, response shapes, perf
     trade-offs, files touched beyond the obvious).

3. **One commit per coherent feature/fix.** Multiple unrelated tweaks
   get separate paragraphs in the body, not buried.

4. **Trailing line:** always include
   `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

5. **Heredoc form** for multi-line messages:
   ```bash
   git commit -m "$(cat <<'EOF'
   Subject under 72 chars

   Paragraph explaining the change…

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```

**Don't:** "fix" / "update" / "wip" / cram unrelated changes into one
commit / skip the body.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- No Tailwind. One CSS file: `app/globals.css` with custom-property
  tokens for the palette.
- Fonts: **Fredoka** (English UI, Google Fonts) + **Cairo** (Arabic
  story body, Google Fonts). Both loaded via `<link>` in
  `app/layout.tsx`.
- Deploy: Vercel auto-deploys on push to `main` (when wired up).

## Secrets — never commit

`.env.local` is gitignored. All keys are server-side only — they're
read in API routes via `process.env`, never prefixed with
`NEXT_PUBLIC_` (that would leak them into the client bundle).

**No required env vars.** The app uses fully free, keyless services:

- Story + converse → Pollinations text (`https://text.pollinations.ai`)
- Cover image → Pollinations image (URL constructed in the browser)
- Narration → `window.speechSynthesis` (runs on the user's device)

Optional override:
- `STORY_MODEL` — Pollinations text model. Defaults to `openai`
  (GPT-class). Other supported values: `mistral`, `llama`,
  `deepseek`, `gemini`. Both story and converse routes share this
  env var.

## Local dev

- **Node:** portable install at
  `C:\Users\awrad\.node-portable\node-v22.11.0-win-x64\` because the
  system has no Node on PATH. Use `npm.cmd` from that folder for
  `npm install`.
- **Worktree-based preview:** the Claude Code preview tool runs from
  the *fruit-game worktree's* cwd, not this project's. To work
  around that, `.claude/start-dev.js` is a tiny launcher that chdirs
  into this folder before booting `next dev` on **port 3001**. The
  matching launch entry "Kids Story Dev" lives in the *fruit-game*
  worktree's `.claude/launch.json`, not in this repo.
- **Env-var changes need a server restart.** `.env.local` is read at
  process start; `next dev` doesn't pick up changes mid-run. After
  editing, stop and restart the dev server.

## API routes — quick reference

- `POST /api/story` — body `{ idea?, selections?, storyPrompt? }`,
  returns `{ title, paragraphs: string[5], imagePrompt }`. Uses
  OpenRouter chat completions with `response_format json_object` and
  a fence-stripping JSON-recovery fallback. `max_tokens: 4000` —
  Arabic burns 2-3× more tokens per character than English.
- `POST /api/converse` — body `{ history: [{role, text}] }`, returns
  `{ ready: true, story_prompt }` or `{ ready: false, question, chips }`.
  Hard cap of 2 kid turns: after that the route synthesizes a
  story_prompt regardless, so the conversation can't loop.

**No image or narration routes.** Both run client-side:

- **Cover image** (in `app/page.tsx`): build a Pollinations URL from
  the `imagePrompt` and stick it in `<img src>`. URL pattern:
  `https://image.pollinations.ai/prompt/{encoded}?width=1024&height=640&model=flux&nologo=true`.
- **Narration** (in `StoryDisplay.tsx`): `window.speechSynthesis`.
  Pick a voice with `lang.startsWith('ar')` and prefer common
  Arabic narrator names (Maged, Salma, Laila, etc.). Fallback to
  the default voice if the OS has no Arabic TTS installed.

## Theme — design guardrails

Night sky for kids, not space horror. Stick to the palette:

- `#5FA5BA` deep teal — main night sky
- `#AADFE1` light teal — horizon glow
- `#FEE1DF` pale pink — moon, soft text
- `#FEB4B3` coral — secondary buttons, drifting clouds
- `#F8D741` yellow — primary action buttons, twinkling stars
- `#E8EC8C` soft yellow-green — third card variant

Stars and clouds animate via CSS keyframes (twinkle, drift). Shooting
stars fire on user delight moments — story generation kickoff, Listen
tap, story-ready. Buttons bounce on hover/click. If perf becomes an
issue on low-end devices, the first thing to drop is the cloud layer
(it's the most expensive paint).

## Future ideas

- Per-paragraph illustrations (currently one cover only — image gen
  takes ~10 s and returns ~2 MB so doing 5× would feel slow without
  streaming or caching).
- Voice picker UI letting kids choose between Arwa/other Munsit
  fusha voices.
- "My library" — save generated stories with their images and
  narration to localStorage or a cloud DB.
- Bilingual mode toggle: also generate the English version of the
  same story so families can read together.
