# Kids Story Builder

A friendly little web game for kids ages 5–8 (and grown-ups who help them
read). Pick a hero, a place, a problem, a helper, and an ending — get a
silly, brave, or happy story stitched together just for you.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- No external UI deps — just one stylesheet (`app/globals.css`)
- Big emoji as art for v1, so there's no asset pipeline to worry about

## Where things live

- `lib/choices.ts` — the data: heroes, settings, problems, helpers, endings.
  Add a new entry and it shows up in the picker automatically.
- `lib/storyTemplate.ts` — the sentence stitcher. Each problem gets a
  matching middle-of-story sentence; each ending gets its own paragraph.
- `app/page.tsx` — the 5-step flow + final story view.
- `app/components/` — `ChoiceCard`, `StepPicker`, `StoryDisplay`.

## Notes for future-me

- Local Node lives at
  `C:\Users\awrad\.node-portable\node-v22.11.0-win-x64\` (no system Node
  on PATH on this machine).
- Deploy: same Vercel auto-deploy pattern as the other Next.js projects
  on this account once a GitHub repo is connected.
