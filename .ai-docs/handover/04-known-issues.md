# Known Issues, Gotchas and Cleanup

## Open accuracy items
- **Owner will supply a new report.** The TSH/T4 case was retired. When the new fixture arrives, run the regression: temporary `verify-*.mjs`, assert the exact rows and values, then delete the script. The current guards (range rejection, 40-character window, 24-character edit cap, decimal lookahead) are verified against the WBC fixture and synthetic thyroid data.
- **Unit awareness.** `plausibleValue` does not compare units. A number in a plausible digit range but with the wrong unit will pass. Low risk for common panels, worth fixing if a misread shows up in real reports.
- **Jumbled tables.** When OCR reshuffles columns, a neighbouring value can land next to the wrong alias. The range guard catches "low – high" bounds; it does not validate every layout.

## Environment specifics
- Dev port is **3004** (`pnpm dev` runs `npx kill-port 3004 && next dev -p 3004`). The owner's other app holds 3000. Do not start on 3000.
- `.env.local` (gitignored) must contain `IFM_API_KEY`; `IFM_BASE_URL` and `IFM_MODEL` are optional with sane defaults.
- PowerShell: chain with `;` not `&&`. Inline `curl -d` JSON gets mangled; write the JSON to a file and use `--data-binary "@file.json"`.
- PowerShell `Set-Content -Encoding UTF8` writes a **BOM**, and the Tailwind Turbopack loader rejects `package.json` containing one. Edit JSON files with the editor tools, or write UTF-8 without BOM explicitly. If it happens, strip bytes `EF BB BF` and restart the dev server (Turbopack caches the parse error).
- `cacheComponents: true` forbids reading the clock in server components. The dynamic year is isolated in the client `site/copyright-year.tsx`, which resolves the year after mount; the navbar and footer both use it. Any new server component that needs `new Date()` must be a client component or wrapped appropriately.
- Do not add `export const runtime` to `src/app/api/assistant/route.ts`; it conflicts with `cacheComponents`.

## Theming gotchas
- `next-themes` uses the class strategy; `globals.css` declares `@custom-variant dark (&:where(.dark, .dark *))`. Without it, Tailwind 4's `dark:` follows the OS, not the toggle.
- Hydration: anything that reads `window` (speech recognition, `resolvedTheme`, scroll position) must be gated in `useEffect` or a `mounted` flag. The theme toggle renders a same-size placeholder until mounted.
- The emitted HTML must carry `suppressHydrationWarning` on `<html>`; without it Next warns on theme class injection.

## PWA notes
- The service worker is registered **only in production** (`process.env.NODE_ENV !== "production"` returns early). Testing install prompts requires `pnpm build && pnpm start`.
- `public/sw.js` is network-first for navigations and cache-first for assets; it skips `/api/` entirely so Sai is never served from cache.
- Bump `CACHE = "bloodworks-v1"` when shipping changes that must invalidate old cached shells.

## Cleanup queue
- No leftover `ocr-*.mjs`, `ocr-*.txt`, `verify-*.mjs` or `eng.traineddata` in `symptom-app/`. Removed during the homepage QA pass.
- `scripts/make-icons.ps1` is the deliberate regeneration tool for the PWA icons and `/og.png`; keep it.
- `sample-report.png` and `make-sample.ps1` live outside the repo in `test-qwen/`; they are fixture generators, not app code.

## Verification checklist before a commit
- `npx tsc --noEmit` is clean.
- `/` returns 200 and the hero CTA is above the fold at 375 px.
- `/analyze` OCR runs, an analysis renders, the image survives a refresh, the sidebar lists the session, delete and clear-all both ask for confirmation.
- Sai replies stream in as Markdown; Enter sends, Shift+Enter breaks the line; the mic button appears only where supported.
- Theme toggle survives a reload (no flash), navbar logo returns home, mobile menu locks the body and shows the copyright.
- Dark-mode CTA bands and logo marks stay deep green (`--brand-deep`), not bright teal, so white text remains legible.
- `/sitemap.xml`, `/robots.txt` and `/manifest.json` resolve.
