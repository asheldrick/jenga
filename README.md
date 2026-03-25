# Jenga — Swahili Grammar Drill System

Systematic drilling of Swahili grammar frames to genuine automaticity.
Built for upcountry Kenya conversational fluency.

## Stack
- React 18 + Vite
- No external dependencies beyond React
- localStorage for progress persistence
- PWA-ready (add to home screen on iPhone/iPad)

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your GitHub repo
3. Vercel auto-detects Vite — no config needed
4. Hit Deploy

Your app will be live at `https://your-project.vercel.app`

## Cross-Device Progress Sync

Progress is stored in localStorage per device/browser. To move progress between devices:

1. **Export** — hit Export on the home screen, select all text, copy it
2. **Import** — on the new device, hit Import, paste the text, confirm

## Structure

```
src/
  data/
    frames.js       ← All card data (13 frames, 35-45 cards each)
  utils.js          ← Theme, constants, storage, Levenshtein matching
  App.jsx           ← Full drill app
  main.jsx          ← Entry point
  index.css         ← Global reset
public/
  manifest.json     ← PWA manifest
```

## Adding New Frames

Add to `src/data/frames.js` following the existing structure:

```js
{
  id: "frame14",
  title: "Frame Title",
  subtitle: "Short description",
  tier: 2,
  explanation: `Explanation text with **bold** support`,
  cards: [
    { en: "English prompt", sw: "Swahili answer" },
    ...
  ]
}
```

Frames unlock sequentially. Test stage (85%) gates each frame.
Flashcard/Multiple Choice/Written stages require 100% clean pass.
