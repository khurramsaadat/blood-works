# PRD: BloodWorks Health (symptom-app)

Local-first web app that reads a medical (blood) report screenshot, extracts lab values with OCR, and produces a Siphox-style analysis: definitive diagnosis, specific prescription, per-system health scores, care actions, a supplement plan, and a conversational "Sai" assistant. A marketing homepage fronts the app.

## Goal
A visitor lands on the homepage, understands the product in one screen, opens the analyzer, uploads a blood report, and gets – in seconds – a complete analysis whose numbers are traceable to the source document. The product must feel like a shipped, premium clinical tool, not a demo.

## Users
- Primary: a patient with a blood test screenshot who wants a definitive read and concrete next steps.
- Secondary: a developer taking over the codebase (see `.ai-docs/handover/`).

## Site structure (shipped)
| Route | Purpose |
|---|---|
| `/` | Marketing homepage (Medipro-informed structure, Urbanist + Figtree, light mint / deep green palette, dark theme variant) |
| `/analyze` | The analyzer: OCR upload, report, Sai assistant |
| `/symptoms` | The same analyzer, opened on the symptom-checker tab |
| `/how-it-works` | Pipeline explanation (six sections) |
| `/faq` | Grouped FAQ, objection-handling copy |
| `/careers` | Remote-first roles with real content |
| `/privacy`, `/terms` | Real policy copy, no placeholders |
| `/sitemap` | HTML sitemap; machine sitemap at `/sitemap.xml` |
| `/api/assistant` | Server route for Sai (POST) |

## Core features (shipped)
1. **Homepage** – hero with outcome headline, product mock, stats strip (60+ / 9 / < 60s / 100%), three service cards, three-step how-it-works, capability grid, deep-green CTA band, FAQ accordion. One primary CTA: "Analyze my report". Risk-reversal microcopy under the hero CTA.
2. **Site chrome** – sticky navbar with logo → home, full-page mobile menu (staggered fade-in, body scroll lock, burger-to-cross animation, copyright at the bottom), theme toggle (colored sun / black-outline moon, next-themes, `suppressHydrationWarning`), five-column footer with brand column and socials, back-to-top ring that appears after 600 px and tracks scroll depth.
3. **PWA** – `manifest.json`, 180/512 icons, standalone display, theme color, service worker (production only) with network-first navigations and cache-first assets.
4. **Symptom checker** – 10-condition knowledge base produces a definitive diagnosis and specific prescription, with an inconclusive fallback. No disclaimers.
5. **Report upload** – drag-drop or browse, progress, thumbnail, editable extracted text with live re-analysis, replace/remove. The uploaded image persists across refresh (stored as a data URL).
6. **Sessions** – every upload or symptom check is saved to localStorage (`Your reports` in the sidebar): image, OCR text, analysis, Sai chat, timestamps. Reopen, delete one, or clear all after a confirm prompt (tap-again pattern, no `window.confirm`). Quota-overflow slimming drops images before dropping sessions.
7. **OCR pipeline** (client-side, tesseract.js): canvas preprocessing (upscale to 2× max, grayscale, contrast 1.35, brightness 1.05), fuzzy alias matching with bounded Levenshtein, plausibility filter, range-bound rejection.
8. **Lab engine** – 60+ biomarkers, per-system 0–100 % scores with in/watch/out status, primary diagnosis with ICD-10 and confidence, additional findings, L1/L2/L3 care actions, supplement plan.
9. **Sai assistant** – IFM API (OpenAI-compatible), server-side route so the key never ships to the client. Decisive persona, no hedging, Markdown replies. Multi-turn with `reasoning_content` replayed verbatim. Input is a multiline textarea (Enter sends, Shift+Enter newline) with a Web Speech API mic button.
10. **Layout** – three columns on desktop (sidebar with health ring and report history, main report, Sai panel always visible), mobile FAB plus bottom sheet. No collapse control on the Sai panel.
11. **Exports** – full report download/share; per-reply copy/download/share for Sai; whole-conversation download/share.
12. **SEO** – metadata templates, OG/Twitter cards with `/og.png`, `robots.txt`, `sitemap.xml`, HTML sitemap.

## Next phase (approved, not yet shipped)
- **Sticky report summary and scroll spy.** Pin a compact bar under the navbar on `/analyze` with the overall score, out-of-range count and primary finding. As the report scrolls, highlight the section in view in the sidebar. Keep two active rows: the tool mode and the current section. Hide sidebar links for sections that did not render.
- **PWA install prompt.** After a completed analysis, show one quiet inline prompt driven by `beforeinstallprompt`, dismissible for 30 days via localStorage. Hidden where the browser does not support installation.
- **Keyboard-first upload.** Ctrl/Cmd+V with an image anywhere on `/analyze` starts the OCR flow. The Sai panel is excluded so a screenshot pasted into chat does not replace the report flow.
- **Careers application form.** Three fields (name, portfolio URL, one-line note), one form with role buttons, pre-addressed mailto with the role in the subject.
- **Hybrid report reading.** Local OCR stays the default. Add an explicit opt-in AI vision fallback for unreadable images: the image is sent only after consent, the model returns strict JSON, and the local parser validates and displays an editable transcript before scoring.

## Non-goals
- No server-side OCR by default. OCR runs client-side; an opt-in AI vision fallback may process an image transiently on the server after explicit consent.
- No accounts. Persistence is localStorage only.
- No claims about regulatory or clinical validation.

## Acceptance criteria (accuracy, current phase)
- Every value the engine reports or Sai cites must exist in the uploaded source report. No fabricated tests or numbers.
- Known-good fixture: `Screenshot 2026-11-16 125712.png` (WBC differential; neutrophils 65.3, lymphocytes 23.2, monocytes 8.6, eosinophils 2.6; no thyroid values). Parsing it must not invent T3/TSH/T4 rows.
- Range bounds must never be parsed as results (e.g. a printed "0.4 – 4.0" must not yield a value).

## Quality bar
- `npx tsc --noEmit` clean.
- All routes serve 200 on the dev port (`/`, `/analyze`, `/symptoms`, `/how-it-works`, `/faq`, `/careers`, `/privacy`, `/terms`, `/sitemap`, `/sitemap.xml`, `/robots.txt`, `/manifest.json`).
- 375 px mobile: no horizontal scroll; primary CTA above the fold on the homepage.
- OCR re-run on the real report matches the visible source values.
