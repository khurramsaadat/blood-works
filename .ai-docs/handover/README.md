# Developer Handover

Everything a new developer needs to run, understand, test, and extend BloodWorks Health (symptom-app). Start here, then read in order.

| File | What it covers |
|---|---|
| [01-architecture.md](./01-architecture.md) | Stack, file map, routes, data flow, key design decisions |
| [02-ocr-pipeline.md](./02-ocr-pipeline.md) | Image preprocessing, tesseract.js, fuzzy matching, plausibility filter, range guards |
| [03-ai-assistant.md](./03-ai-assistant.md) | IFM API route, Sai persona, multi-turn reasoning_content rule, input and exports, TTS, mic fallback, streaming |
| [04-known-issues.md](./04-known-issues.md) | Open accuracy items, gotchas, cleanup tasks, environment specifics |

## Run it in 60 seconds
1. `cd symptom-app`
2. `pnpm install`
3. Copy the env vars into `.env.local` (see [04-known-issues.md](./04-known-issues.md); `IFM_API_KEY` is required for Sai, optional for the rest of the app).
4. `pnpm dev` → http://localhost:3004 (the script clears the port first).

## Where things live
- Repo: https://github.com/khurramsaadat/blood-works.git (branch `main`). The repo root is `symptom-app`, not `test-qwen`.
- `.ai-docs/` holds PRD.md, Plan.md, Suggest.md, input.md plus this folder. Keep them updated. It is a rule.
- Marketing routes and app routes are siblings: `/` is the homepage, `/analyze` and `/symptoms` render the analyzer.
- Helper artifacts outside the repo (in `test-qwen/`): `sample-report.png`, `make-sample.ps1` (fixture generators).
- `scripts/make-icons.ps1` regenerates the PWA icons and `/og.png` with System.Drawing; keep it for brand-asset regeneration.

## Conventions
- Commits: one short sentence, prefixed (`feat:`, `fix:`, `ui:`).
- No push to GitHub without the owner's explicit permission, re-asked for each push.
- Punctuation: spaced en-dash ( – ) for sentence pauses; hyphens only inside compound words.
- No emoji, no sparkles, no purple gradients, no fake testimonials anywhere in the UI.
- Fonts: Urbanist for display, Figtree for body. Do not introduce a third family.
