# Architecture

## Stack
- Next.js 16.4.6 with Turbopack, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 5, pnpm 10.7.1.
- Client-side OCR: tesseract.js 7.0.0 (no server OCR).
- AI: IFM API, OpenAI-compatible chat completions, model `IFM/K2-Horizon-375B-A23B`, called server-side only.
- TTS: `@andresaya/edge-tts` (Microsoft Edge neural voices), called server-side via `/api/tts` (free, no key). Default voice `en-US-JennyNeural`.
- Theming: `next-themes` (class strategy, `suppressHydrationWarning` on `<html>`), `@custom-variant dark` in `globals.css`.
- Fonts: `next/font/google` – Urbanist (`--font-urbanist`, display) + Figtree (`--font-figtree`, body).
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, Turbopack CSS rule for Tailwind. Because of `cacheComponents`, server components must not read the clock: the dynamic year lives in the client `site/copyright-year.tsx` and renders after mount.

## Routes
```
/                     Marketing homepage (server component + static sections)
/analyze              SymptomChecker (client)
/symptoms             SymptomChecker, opened via the nav entry
/how-it-works         Pipeline explainer
/faq                  Grouped FAQ
/careers              Remote roles + application form
/privacy, /terms      Policies
/sitemap              HTML sitemap          /sitemap.xml, /robots.txt (metadata routes)
/api/assistant        POST – Sai proxy (server, key never ships)
/api/tts              POST – Edge TTS proxy (server, free, no key; returns MP3)
/manifest.json, /sw.js, /icon-180.png, /icon-512.png, /og.png   PWA + social assets
```

## File map
```
symptom-app/
├── AGENTS.md                      # Owner's UI/UX protocol (read before UI work)
├── .ai-docs/                      # PRD, Plan, Suggest, input + handover (this folder)
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker (registered in production only)
│   └── icon-180.png, icon-512.png, og.png
│   └── images/                    # report-desk.jpg, blood-draw.jpg (Unsplash)
├── src/
│   ├── app/
│   │   ├── page.tsx               # Homepage (hero-preview cycling demo cards)
│   │   ├── layout.tsx             # Fonts, metadata, Providers, Navbar, Footer, BackToTop
│   │   ├── providers.tsx          # next-themes ThemeProvider
│   │   ├── globals.css            # Theme tokens, dark variant, scrollbar, keyframes
│   │   ├── analyze/page.tsx       # Analyzer
│   │   ├── symptoms/page.tsx      # Analyzer (symptom entry)
│   │   ├── how-it-works/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── careers/page.tsx       # Content page + CareersForm
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── sitemap/page.tsx
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts, robots.ts  # Metadata routes
│   │   └── api/assistant/route.ts # IFM server route (POST, streaming SSE)
│   │   └── api/tts/route.ts       # Edge TTS proxy (POST, returns MP3)
│   ├── components/
│   │   ├── site/
│   │   │   ├── logo.tsx           # Inline SVG mark + wordmark
│   │   │   ├── navbar.tsx         # Sticky nav, full-page mobile menu, burger animation
│   │   │   ├── footer.tsx         # Five columns + brand column + socials
│   │   │   ├── theme-toggle.tsx   # Colored sun / outlined moon
│   │   │   ├── copyright-year.tsx # Mounted-only dynamic year
│   │   │   ├── back-to-top.tsx    # Progress ring after 600 px
│   │   │   ├── content-page.tsx   # Shared shell for text pages (accepts children)
│   │   │   ├── pwa-registrar.tsx  # Registers /sw.js in production
│   │   │   ├── hero-preview.tsx   # Cycling homepage demo cards (WBC/thyroid/lipids)
│   │   │   ├── install-prompt.tsx # PWA install prompt (30-day dismissal)
│   │   │   └── careers-form.tsx   # 3-field application form → mailto
│   │   ├── symptom-checker.tsx    # Main client component: layout, OCR UI, sessions, report, sticky summary, paste upload
│   │   ├── assistant-chat.tsx     # Sai panel: Markdown, mic (Web Speech + on-device Whisper), multiline input, exports, TTS read-aloud, auto-read toggle
│   │   └── markdown.tsx           # react-markdown + remark-gfm wrapper
│   └── lib/
│       ├── lab.ts                 # Pure lab engine: tests, ranges, findings, systems, actions
│       ├── samples.ts             # Three demo transcripts (wbc/thyroid/lipids)
│       ├── sessions.ts            # localStorage session store (quota-aware)
│       ├── report-export.ts       # Report + Sai transcript builders, download/share/copy
│       ├── pdf-report.ts          # Colorful multi-page PDF (jsPDF + autotable)
│       └── transcribe.ts         # On-device speech-to-text (MediaRecorder + Whisper)
└── .env.local                     # IFM_API_KEY, IFM_BASE_URL, IFM_MODEL (gitignored)
```

## Data flow
1. The visitor lands on `/`, reads the homepage, and taps the single primary CTA to `/analyze`. Hero demo cards cycle through three sample reports and link to `/analyze?sample=<id>`.
2. User drops a screenshot → `symptom-checker.tsx` reads it as a data URL (for persistence) and draws it to a canvas with preprocessing (see 02).
3. tesseract.js runs client-side → raw OCR text shown in an editable textarea. Ctrl/Cmd+V with an image on the clipboard drops it straight into the OCR flow (Sai panel excluded via `data-sai-panel`).
4. Every keystroke in the textarea re-runs `analyzeAll(text)`, which calls `parseLabReport` from `lab.ts`.
5. `parseLabReport` returns rows (test + value + status), a primary finding with ICD-10 and confidence, additional findings, per-system scores, care actions (L1/L2/L3), and a supplement plan.
6. The UI renders three columns: sidebar with overall-health ring and "Your reports", main report with six anchored sections, Sai panel (always visible on desktop; FAB + bottom sheet on mobile). A sticky summary bar pins under the navbar while the report scrolls.
7. Sessions: every state change is upserted into localStorage through `sessions.ts`. The most recent session is restored on mount; `/analyze` and `/symptoms` force their tab.
8. Sai: the chat panel POSTs the message history plus `context` (the OCR text, or symptom input) to `/api/assistant`. The route re-parses the context with the same `parseLabReport`, builds a ground-truth block, and injects it into the system prompt. Replies stream back as SSE.
9. Read-aloud: the panel POSTs reply text to `/api/tts`, which synthesizes speech via Edge TTS (Microsoft neural voice `en-US-JennyNeural`) and returns MP3. Web Speech is the fallback. An opt-in "Auto-read" toggle plays each reply automatically.
10. Mic: Web Speech API first; on `network` / `language-not-supported` errors, falls back to MediaRecorder + in-browser Whisper (`@huggingface/transformers`).

## Key design decisions
- **Lab engine is pure.** `src/lib/lab.ts` has no `"use client"` and no React imports. It runs in the browser, in the API route, and in Node test scripts alike.
- **Single source of truth.** Both the UI and the assistant route call the same `parseLabReport`. What the user sees is exactly what Sai is grounded on.
- **No `export const runtime` in `route.ts`.** Incompatible with `nextConfig.cacheComponents`; it breaks the build. Do not re-add it.
- **Editable OCR text.** The transcript is the user's to correct; analysis re-runs live, which makes OCR errors fixable by hand.
- **Data URLs, not blob URLs.** `URL.createObjectURL` images die on refresh. The upload is converted with `FileReader.readAsDataURL` so the sidebar thumbnail and the upload card survive reloads. Sessions trim images first if localStorage overflows.
- **Themes never hide functionality.** Dark mode is a class on `<html>`; tokens live in `globals.css` as CSS variables consumed by the Tailwind theme. No component hard-codes a background that only works in light mode. `--brand-deep` stays `#0f6e60` in both themes so CTA surfaces and logo marks keep white-text contrast; `--accent-deep` flips to bright teal in dark mode and is for text/accent use, not small white-text surfaces.
- **Theming + hydration.** `next-themes` requires `suppressHydrationWarning` on `<html>`. Feature detection that differs between server and client (speech recognition, `mounted`) is gated in `useEffect`.
- **Exports.** `report-export.ts` builds deterministic text; `pdf-report.ts` builds a colorful multi-page PDF (jsPDF + jspdf-autotable) with per-system score rings, biomarker table, diagnosis, prescription, care actions, supplement plan, and optional raw OCR text. Evaluated systems only; unevaluated systems are omitted with an editorial note.
- **PWA is production-only.** The service worker caches navigations network-first and assets cache-first, and is skipped in dev to avoid stale Turbopack chunks. An install prompt appears after a completed analysis, dismissible for 30 days.
- **Punctuation.** Spaced en-dash ( – ) for pauses; hyphens only for compound words. No emoji, sparkles, purple gradients, or fake testimonials.

## Testing pattern
- Type check: `npx tsc --noEmit` (must be clean).
- Parser tests: temporary `.mjs` in `symptom-app/`, import from `./src/lib/lab.ts`, run `npx --yes tsx .\test-xxx.mjs`, delete afterwards. `lab.ts` is pure, so this works in Node.
- Visual checks: in-app browser at desktop and 375 px; verify CTA above the fold, no horizontal scroll, theme toggle, mobile menu body lock, back-to-top ring after 600 px.