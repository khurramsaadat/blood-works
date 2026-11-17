# Plan

Stagewise plan for BloodWorks Health (symptom-app). Status legend: done / active / pending.

## Stage 0: Scaffold – done
- `pnpm create next-app@latest` with Turbopack, Tailwind 4, TypeScript.
- Next 16.4.6, React 19.3.0, pnpm 10.7.1.
- `next.config.ts` uses `cacheComponents: true` and `partialPrefetching: true`.

## Stage 1: Static page and symptom checker – done
- Static tic-tac-toe page on :8000 via `python -m http.server` (initial deliverable, outside the app).
- Symptom checker with 10-condition knowledge base, definitive diagnosis plus prescription, inconclusive fallback.

## Stage 2: OCR upload flow – done
- Drag-drop and browse upload with progress, thumbnail, editable text, live re-analysis, remove.
- tesseract.js 7.0.0 client-side with canvas preprocessing.

## Stage 3: Siphox reskin – done
- Light theme, Siphox palette, card and ring layout.
- Three-column layout with sidebar nav, main report, right Sai panel; mobile FAB plus bottom sheet.

## Stage 4: AI assistant (Sai) – done
- `.env.local` with `IFM_API_KEY`, `IFM_BASE_URL`, `IFM_MODEL` (gitignored).
- `/api/assistant` server route; persona prompt; Markdown rendering in `assistant-chat.tsx`.
- Multi-turn fix: IFM reasoning models require `reasoning_content` replayed verbatim on every assistant turn (empty string is valid).

## Stage 5: Exports and sharing – done
- `src/lib/report-export.ts`: report text, Sai transcript, download/share/copy helpers.
- Per-reply and whole-conversation export in the Sai panel header.

## Stage 6: Accuracy QA – parser fix done
- Owner retired the TSH/T4 case and supplied the real fixture: `Screenshot 2026-11-16 125712.png` (WBC differential, no thyroid values).
- Root cause fixed in `lab.ts`:
  1. `inRangeContext()` rejects numbers that sit between a "low – high" range pair.
  2. Alias-adjacent numbers more than 30 characters past the alias are rejected.
  3. Fuzzy matching window tightened from 60 to 40 characters with a 24-character maximum edit distance.
  4. Number regex gained a `(?![0-9.])` lookahead so partial decimals cannot match.
- Verified with a temporary `verify-t3.mjs`: 18/18 checks pass (real WBC report has no T3, synthetic thyroid still parses correctly, range bounds are rejected).
- Remaining: when the owner supplies the new report, run the same verification against it.

## Stage 7: Persistence, sessions, Sai panel, mic – done
- `src/lib/sessions.ts`: load / persist / upsert / remove / clearAll with quota-overflow slimming.
- Uploaded image converted to a data URL (`fileToDataUrl`) so it survives refresh; image rendered in the upload card and in session thumbnails.
- Sidebar "Your reports": date + thumbnail, active highlight, per-session delete, "Clear saved reports" with a tap-again confirm.
- Sai panel always visible on desktop (collapse state and "Open Sai" button removed); mobile FAB and bottom sheet kept.
- `assistant-chat.tsx`: textarea with Enter to send / Shift+Enter newline, auto-growth to 4 rows, Web Speech API mic with listening indicator, hydration-safe feature detection.

## Stage 8: Homepage, site chrome, PWA – done
- New homepage at `/` based on the Medipro structure: hero (outcome headline, product mock, stats strip), three service cards, three-step how-it-works, capability grid, green CTA band, FAQ accordion.
- Fonts switched to the Medipro pair: Urbanist (display) + Figtree (body) via `next/font`.
- Palette: mint background `#f0f8f4`, deep green `#3c8a68` / `#0f6e60`, accent teal `#3cbab4`, ink `#0e1612`; dark theme variant via `next-themes` + `.dark` class.
- Routes split: analyzer moved from `/` to `/analyze` and `/symptoms`.
- Site chrome: `site/navbar.tsx` (full-page mobile menu, burger-to-cross animation, body lock), `site/footer.tsx` (five columns: brand spanning two + three link columns, socials, dynamic year), `site/back-to-top.tsx` (scroll progress ring after 600 px), `site/theme-toggle.tsx`.
- Dynamic year is rendered by the client `site/copyright-year.tsx` after mount because `cacheComponents` forbids clock reads during render.
- Content pages with real copy: `/how-it-works`, `/faq`, `/careers`, `/privacy`, `/terms`, `/sitemap`, plus `not-found.tsx`.
- PWA: `public/manifest.json`, generated PNG icons (180 / 512, apple icon) and `/og.png` via `scripts/make-icons.ps1` (System.Drawing), `public/sw.js` registered only in production by `site/pwa-registrar.tsx`.
- SEO: metadata templates, OG/Twitter, `src/app/sitemap.ts`, `src/app/robots.ts`, canonical base `https://bloodworks.health`.
- Dev script: `npx kill-port 3004 && next dev -p 3004` (port 3004 because the owner's other app holds 3000).
- 4 px muted taupe scrollbar, `::selection` in brand teal, reduced-motion guards for the mobile menu animation.

## Stage 9: Handover documentation – active
- `.ai-docs` set and `.ai-docs/handover/` kept current.
- `handover/04-known-issues.md` written in this milestone.
- Keep all docs updated after every change. This is a rule.

## Stage 10: Visual QA and theme alignment – done
- Analyzer, Sai panel, Markdown and score rings recolored from legacy blue/gray to theme tokens (`bg-accent`, `text-accent-deep`, `bg-soft`, `bg-card`, `border-border-c`, `text-foreground`, `text-muted`).
- Netlify deploy fix: `netlify.toml` whitelists `IFM_API_KEY` (and the two optional IFM vars) via `SECRETS_SCAN_OMIT_KEYS`, since the key is intentionally inlined into the server bundle by Next.
- Added a fixed deep token `--brand-deep` so CTA bands, logo marks and avatar chips keep white-text contrast in dark mode instead of switching to the bright accent.
- Removed the duplicate brand card from the analyzer sidebar; mobile hides the sidebar entirely when there are no saved reports.
- Sticky offsets account for the 64 px navbar (`top-20`, Sai `h-[calc(100vh-6rem)]`).
- Footer reduced to five columns (brand spans two + Product, Company, Resources); email fallback replaces the old medical disclaimer.
- Terms copy no longer carries a medical disclaimer; FAQ, how-it-works and homepage copy cleaned of doctor/discussion phrasing.
- All user-facing em dashes converted to spaced en dashes; parser range regex intentionally untouched.
- Mobile menu stagger delays moved onto the animated span; FAB becomes a top-right close control while the mobile Sai sheet is open; Sai sparkle icon replaced with a message bubble.
- Verification: all routes 200, `tsc` clean, 375 px homepage CTA at 428 px with no horizontal overflow, dark mode, upload/refresh/clear-all/Sai chat all verified.

## Stage 11: Analyzer and careers enhancements – pending
- Sticky report summary under the navbar (score, out-of-range count, primary finding) plus scroll spy with two active sidebar rows.
- Hide sidebar links for sections that are not rendered.
- PWA install prompt after a completed analysis, 30-day dismissal.
- Ctrl/Cmd+V image upload on `/analyze`, excluding the Sai panel.
- Colorful multi-page PDF report download on `/analyze` (jsPDF + jspdf-autotable): deep-green header band, per-system score rings, biomarker table with in-range/out-of-range status, definitive diagnosis + prescription, care actions L1–L3, supplement plan, and optional raw OCR text. Replaces the plain-text download. **Done in Stage 12.**
- Careers application form with three fields and a pre-addressed mailto.
- Hybrid AI vision fallback for unreadable images, opt-in only.

## Stage 12: Full app bug review – done
- **PDF ring charts were blank.** jsPDF 4.2.1 has no SVG/image-svg rasterizer (verified: no `image/svg`/`rasterize` in the build; `doc.circle` is a full-ellipse shortcut with no arc angles). Rings now rendered via an offscreen 2x canvas → PNG data URL.
- **PDF overflow.** Systems page had no page breaks (8 systems overflowed one A4 page); biomarker table `startY` was a hardcoded `20`; raw OCR text could run off the page. All sections now use an `ensureSpace()` page-break helper and the autotable's `lastAutoTable.finalY` cursor.
- **Unevaluated systems showed a fake 100% green ring.** `lab.ts` now returns `status: "none"`, score 0, total 0 for systems with no values; UI shows a "Not evaluated" badge and a dashed ring; overall score averages only evaluated systems.
- **Tab/section mismatch.** Lab result sections were rendered regardless of the active tab, so "Check Symptoms" with a loaded report showed the stale report and hid the symptom result. All lab sections gated to the report tab, symptom result to the symptom tab, plus tab-aware empty states.
- **Wrong tab after navigating.** `/analyze` could open on the symptom tab (and vice versa) when arriving from navbar/footer while the other tab was active; now a `usePathname` effect syncs the tab and scrolls to top.
- **Concurrent OCR interleaving.** Two quick uploads let a slower stale run overwrite the newer state; an `ocrRun` counter ref now guards every OCR state write.
- **Mobile session delete invisible.** Button relied on `group-hover` opacity (no hover on touch); now always visible on mobile, hover-reveal on desktop.
- **Empty symptom submit** produced a misleading "no values found" state; empty input now clears to the empty state.
- **Service worker in dev** could cache Turbopack assets; registration stays production-only (already gated, comment added).
- **Copy drift vs engine.** Engine scores 8 systems (Heart, Inflammation, Metabolic, Thyroid, Hormonal, Nutritional, Liver, Kidney); homepage stats ("9 body systems"), services copy, hero mock bars and how-it-works copy said 9 / endocrine / immune / hepatic / renal / hematologic. All aligned.
- Dead code: unused `downloadText` import removed from `symptom-checker.tsx`.
- Verified: `tsc --noEmit` clean, `pnpm build` 15/15 routes.

## Stage 13: Parser truth, PDF encoding, report preview, mic, homepage imagery – done
- **WBC read as 79.** The "DIFFERENTIAL LEUCOCYTE COUNT" header matched pass 1 and grabbed the next row's value (NEUTROPHILS 79). Pass 1 is now same-line only; cross-line tables still resolve through pass 2. Verified against the real OCR fixture: WBC 5.1, in range.
- **Thousands separators.** `5,100` was truncated to `5`; the number regexes now accept comma groups and `plausibleValue()` strips them before parsing.
- **Extra WBC aliases** (`total leukocyte count`, `leukocyte count`, `leukocyte`) so both spellings match.
- **Duplicate supplement.** "Ciprofloxacin" and "Ciprofloxacin 500mg" both appeared; supplement keys are now normalised (dose digits and punctuation stripped) before dedupe.
- **Garbled units in the PDF.** jsPDF's Helvetica is WinAnsi-only; the superscript ⁶ in `×10⁶/µL` forced a UTF-16 stream that rendered as `× 1 0 v /`. Every string now passes through `pdfText()` (`⁶ → ^6`, other superscripts/subscripts mapped, accents decomposed, unmappable glyphs dropped) via `sanitizeDocText()` on `doc.text` and `doc.splitTextToSize`.
- **Uploaded report can be opened.** The upload thumbnail, a new "View report" link and every "Your reports" thumbnail open a full-screen lightbox (Esc, click-outside, body scroll lock).
- **Sai mic was dead.** Results were read at the wrong level (`results[i].transcript` instead of `results[i][0].transcript`), `lang: "en"` was rejected by some engines, and every error was swallowed. Now: full BCP-47 tag, interim results preview typed live into the composer, `maxAlternatives`, explicit messages for blocked mic / no mic / no network / no speech, abort on unmount, always-visible mic icon.
- **`/analyze` opened on the symptom tab.** Session hydration overwrote the route's tab; the route now wins (`/analyze` → report, `/symptoms` → symptom).
- **Download could fail silently.** `exportReport` is wrapped in try/catch with a toast for both the "not ready" and "build failed" cases.
- **Homepage photography.** Two Unsplash-licensed photos downloaded into `public/images/` (`report-desk.jpg`, `blood-draw.jpg`) and used in a new editorial section between the stats strip and the services grid, via `next/image` with `sizes`, lazy loading and descriptive alt text. The hero's secondary "Check symptoms instead" link was removed so the primary CTA stands alone.
- Verified: `tsc --noEmit` clean, `pnpm build` 15/15 routes, PDF download produced a 3-page file, homepage renders both photos at 1440 px.

## Cleanup queue
- No leftover `ocr-*.mjs`, `ocr-*.txt`, `verify-*.mjs` or `eng.traineddata` in the repo. Removed in Stage 10.
- `scripts/make-icons.ps1` is the documented icon regeneration tool; keep it.
- `sample-report.png` and `make-sample.ps1` live outside the repo in `test-qwen/`; they are fixture generators, not app code.
