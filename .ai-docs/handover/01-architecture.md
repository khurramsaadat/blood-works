# Architecture

## Stack
- Next.js 16.4.6 with Turbopack, React 19.3.0, Tailwind CSS 4.3.3, TypeScript 5, pnpm 10.7.1.
- Client-side OCR: tesseract.js 7.0.0 (no server OCR).
- AI: IFM API, OpenAI-compatible chat completions, model `IFM/K2-Horizon-375B-A23B`, called server-side only.
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
/careers              Remote roles
/privacy, /terms      Policies
/sitemap              HTML sitemap          /sitemap.xml, /robots.txt (metadata routes)
/api/assistant        POST – Sai proxy (server, key never ships)
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
├── src/
│   ├── app/
│   │   ├── page.tsx               # Homepage
│   │   ├── layout.tsx             # Fonts, metadata, Providers, Navbar, Footer, BackToTop
│   │   ├── providers.tsx          # next-themes ThemeProvider
│   │   ├── globals.css            # Theme tokens, dark variant, scrollbar, keyframes
│   │   ├── analyze/page.tsx       # Analyzer
│   │   ├── symptoms/page.tsx      # Analyzer (symptom entry)
│   │   ├── how-it-works/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── careers/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── sitemap/page.tsx
│   │   ├── not-found.tsx
│   │   ├── sitemap.ts, robots.ts  # Metadata routes
│   │   └── api/assistant/route.ts # IFM server route (POST)
│   ├── components/
│   │   ├── site/
│   │   │   ├── logo.tsx           # Inline SVG mark + wordmark
│   │   │   ├── navbar.tsx         # Sticky nav, full-page mobile menu, burger animation
│   │   │   ├── footer.tsx         # Five columns + brand column + socials
│   │   │   ├── theme-toggle.tsx   # Colored sun / outlined moon
│   │   │   ├── copyright-year.tsx # Mounted-only dynamic year
│   │   │   ├── back-to-top.tsx    # Progress ring after 600 px
│   │   │   ├── content-page.tsx   # Shared shell for text pages
│   │   │   └── pwa-registrar.tsx  # Registers /sw.js in production
│   │   ├── symptom-checker.tsx    # Main client component: layout, OCR UI, sessions, report
│   │   ├── assistant-chat.tsx     # Sai panel: Markdown, mic, multiline input, exports
│   │   └── markdown.tsx           # react-markdown + remark-gfm wrapper
│   └── lib/
│       ├── lab.ts                 # Pure lab engine: tests, ranges, findings, systems, actions
│       ├── sessions.ts            # localStorage session store (quota-aware)
│       └── report-export.ts       # Report + Sai transcript builders, download/share/copy
└── .env.local                     # IFM_API_KEY, IFM_BASE_URL, IFM_MODEL (gitignored)
```

## Data flow
1. The visitor lands on `/`, reads the homepage, and taps the single primary CTA to `/analyze`.
2. User drops a screenshot → `symptom-checker.tsx` reads it as a data URL (for persistence) and draws it to a canvas with preprocessing (see 02).
3. tesseract.js runs client-side → raw OCR text shown in an editable textarea.
4. Every keystroke in the textarea re-runs `analyzeAll(text)`, which calls `parseLabReport` from `lab.ts`.
5. `parseLabReport` returns rows (test + value + status), a primary finding with ICD-10 and confidence, additional findings, per-system scores, care actions (L1/L2/L3), and a supplement plan.
6. The UI renders three columns: sidebar with overall-health ring and "Your reports", main report with six anchored sections, Sai panel (always visible on desktop; FAB + bottom sheet on mobile).
7. Sessions: every state change is upserted into localStorage through `sessions.ts`. The most recent session is restored on mount.
8. Sai: the chat panel POSTs the message history plus `context` (the OCR text, or symptom input) to `/api/assistant`. The route re-parses the context with the same `parseLabReport`, builds a ground-truth block, and injects it into the system prompt.

## Key design decisions
- **Lab engine is pure.** `src/lib/lab.ts` has no `"use client"` and no React imports. It runs in the browser, in the API route, and in Node test scripts alike.
- **Single source of truth.** Both the UI and the assistant route call the same `parseLabReport`. What the user sees is exactly what Sai is grounded on.
- **No `export const runtime` in `route.ts`.** Incompatible with `nextConfig.cacheComponents`; it breaks the build. Do not re-add it.
- **Editable OCR text.** The transcript is the user's to correct; analysis re-runs live, which makes OCR errors fixable by hand.
- **Data URLs, not blob URLs.** `URL.createObjectURL` images die on refresh. The upload is converted with `FileReader.readAsDataURL` so the sidebar thumbnail and the upload card survive reloads. Sessions trim images first if localStorage overflows.
- **Themes never hide functionality.** Dark mode is a class on `<html>`; tokens live in `globals.css` as CSS variables consumed by the Tailwind theme. No component hard-codes a background that only works in light mode. `--brand-deep` stays `#0f6e60` in both themes so CTA surfaces and logo marks keep white-text contrast; `--accent-deep` flips to bright teal in dark mode and is for text/accent use, not small white-text surfaces.
- **Theming + hydration.** `next-themes` requires `suppressHydrationWarning` on `<html>`. Feature detection that differs between server and client (speech recognition, `mounted`) is gated in `useEffect`.
- **Exports are plain text.** `report-export.ts` builds deterministic text. No PDF dependency.
- **PWA is production-only.** The service worker caches navigations network-first and assets cache-first, and is skipped in dev to avoid stale Turbopack chunks.

## Testing pattern
- Type check: `npx tsc --noEmit` (must be clean).
- Parser tests: temporary `.mjs` in `symptom-app/`, import from `./src/lib/lab.ts`, run `npx --yes tsx .\test-xxx.mjs`, delete afterwards. `lab.ts` is pure, so this works in Node.
- Visual checks: in-app browser at desktop and 375 px; verify CTA above the fold, no horizontal scroll, theme toggle, mobile menu body lock, back-to-top ring after 600 px.
