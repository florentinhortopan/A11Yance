# The Translator — an accessibility reader

> Paste a URL. We'll grade its accessibility, then re-publish it for the human you choose.

A Vercel-ready Next.js 15 app that:

1. **Audits** any URL with `axe-core` running in JSDOM on the server, returns a 0–100 score graded A+…F.
2. **Re-publishes** the page as semantic, profile-aware blocks (no `<div>` soup) using `gpt-4o-mini` in JSON mode.
3. **Reads it out loud** with a short, friendly voiceover summary streamed from OpenAI TTS.
4. **Adapts the reading experience** to one of six disability profiles — Low vision, Dyslexia, Cognitive / plain language, Motor, Screen-reader, plus three color-vision simulations (deuteranopia, protanopia, tritanopia).

It looks like a small newspaper, not a chat bubble.

## Quick start

```bash
cp .env.example .env.local
# edit .env.local and add your OPENAI_API_KEY

npm install
npm run dev
```

Open <http://localhost:3000>, paste a URL (or click the *Demo: bad page* chip), then press **Translate**.

## Deploy to Vercel

```bash
vercel
```

Set `OPENAI_API_KEY` in the project's *Environment Variables*. Everything else is configured in code (`maxDuration = 60`, Node runtime where needed). No database, no Redis, no extra infra.

## Architecture

```
URL
 │
 ▼
/api/analyze (Node)  fetch → JSDOM → axe-core → score → @mozilla/readability
 │
 ▼
/result  ─►  ScoreRing, ViolationsList, ResultExperience
                                          │
                                          ▼
                              /api/rewrite (Node, OpenAI JSON mode)
                                          │
                                          ▼
                              AccessibleRenderer (semantic blocks)
                                          │
                                          ▼
                              /api/voiceover (Node, OpenAI TTS)
```

| Endpoint          | Runtime | Notes                                                        |
| ----------------- | ------- | ------------------------------------------------------------ |
| `/api/analyze`    | nodejs  | Needs JSDOM. 10s fetch timeout, 2 MB HTML cap.               |
| `/api/rewrite`    | nodejs  | `gpt-4o-mini`, `response_format: json_object`, temp 0.85.    |
| `/api/voiceover`  | nodejs  | `tts-1`, voice defaults to `fable`. Streams `audio/mpeg`.    |

## Profiles

Defined in [`lib/a11y/profiles.ts`](lib/a11y/profiles.ts). Each profile flips a `data-profile` attribute on `<html>`, which switches a set of CSS variables defined in [`app/globals.css`](app/globals.css):

- `default` — editorial baseline (Fraunces serif + Geist sans)
- `lowVision` — 22 px base, 1.75 line-height, thick focus rings, near-black ink
- `dyslexia` — OpenDyslexic / Atkinson, generous spacing, narrower measure
- `cognitive` — A2 plain language, no motion, reading ruler
- `motor` — 48 px hit targets, no hover-only affordances
- `screenReader` — keeps editorial visuals but pumps semantics + skip-links

The profile also feeds the GPT prompt (CEFR level, simplification flag, decorative-content handling).

## Color-vision simulation

SVG `feColorMatrix` filters in [`components/color-blind-filters.tsx`](components/color-blind-filters.tsx) are applied to the re-rendered article only (so the chrome remains usable). Switch via the **Color-vision simulation** select in the profile panel.

## Scoring

Impact-weighted penalty per violation node:

| Impact   | Weight |
| -------- | ------ |
| critical |    10  |
| serious  |     5  |
| moderate |     2  |
| minor    |     1  |

`score = clamp(0, 100 - round(sum(weights × nodes) × 1.2))` → letter grade A+ / A / B / C / D / F.

## Known limits

- **Static audit only.** JSDOM doesn't run page scripts, so dynamic ARIA, live regions, focus order, and post-hydration state are invisible to the analyzer. Surfaced as a `Beta · Static audit` stamp in the UI.
- **No iframing.** We never iframe the original page; we re-render the extracted content. That avoids CSP and X-Frame-Options headaches but does mean we can only show what `@mozilla/readability` could pull out.
- **English-first prompts.** The rewriter handles other languages but its tone is tuned for English.

## File map

```
app/
  layout.tsx              Root layout, fonts, skip-link, SVG filter defs
  page.tsx                Editorial landing
  result/page.tsx         Server-loaded result view
  api/
    analyze/route.ts      Audit + extract
    rewrite/route.ts      OpenAI JSON-mode rewrite
    voiceover/route.ts    OpenAI TTS proxy
  demo/bad/route.ts       Deliberately-broken demo HTML
components/
  accessible-renderer.tsx Renders RewriteOutput.blocks as semantic HTML
  color-blind-filters.tsx SVG <filter>s referenced by CSS
  profile-switcher.tsx    Segmented profile + CB-mode controls
  result-experience.tsx   Orchestrates rewrite + cache per profile
  score-ring.tsx          Big typographic score (not a circle)
  site-header.tsx         Masthead
  ui/                     Local Button / Input / Badge (no shadcn dep)
  url-input.tsx           Landing input + example chips
  violations-list.tsx     Collapsible axe violations grouped by impact
  voiceover-player.tsx    Custom audio transport + read-along highlight
lib/
  a11y/
    axe.ts                axe-core inside JSDOM
    extract.ts            @mozilla/readability
    profiles.ts           Disability profile registry
    score.ts              Penalty math + grade
  openai.ts               Lazy singleton OpenAI client
  prompts/rewrite.ts      System + user prompt builders
  utils.ts                cn, isValidHttpUrl, normalizeUrl
```

## Why it doesn't look "AI"

- Editorial typography (Fraunces serif headlines, Geist sans body).
- Paper-cream background, ink-black text, single stamp-red accent. No gradients, no purple, no sparkle iconography (one `Sparkles` icon, used ironically on the CTA).
- Asymmetric 12-col grid, generous margins, subtle paper-grain SVG noise overlay.
- Score is a giant typographic mark, à la Pitchfork, not a circular progress.
- Loading state is a typewriter caret on an editorial line — no chatbot bubble.

## License

MIT. Built for the A11Y hackathon, May 2026.
