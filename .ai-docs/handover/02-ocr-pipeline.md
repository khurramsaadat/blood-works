# OCR Pipeline

All OCR runs client-side in the browser. There is no server OCR.

## 1. Image intake and preprocessing (`symptom-checker.tsx`, `runOcr`)
When the user drops or browses a file, `newOcr(file)` first converts it to a data URL (`fileToDataUrl`) so it can be persisted, then `runOcr(file, image)` runs:
1. The image is loaded from the data URL and drawn onto a canvas.
2. Upscale: `scale = min(2, max(1, 1600 / maxDim))`. Small photos are scaled up to a 1600 px longest side, capped at 2×. Larger images are not shrunk.
3. `imageSmoothingEnabled = true`, `imageSmoothingQuality = "high"`.
4. A second draw of the same canvas applies `ctx.filter = "grayscale(1) contrast(1.35) brightness(1.05)"`, then the filter resets to `"none"`.

The preprocessed canvas is what tesseract reads. The original data URL is what the UI shows (upload card + sidebar thumbnail).

## 2. Recognition
- tesseract.js 7.0.0, default language data.
- Progress is surfaced to the UI (percentage bar).
- The result is raw text, shown in an editable textarea. The user can fix OCR mistakes by hand; every change re-runs analysis live. This editability is a deliberate accuracy feature and the escape hatch for any parser limitation.

## 3. Parsing (`src/lib/lab.ts`, pure, no React)
`parseLabReport(text)` is the single source of truth. It is called by the UI (via `analyzeAll`) and by the assistant API route, so what the user sees is exactly what Sai is grounded on.

### Test catalog
`LAB_TESTS` holds 60+ biomarkers, each with:
- `key`, `label`, `aliases[]` (lowercase, OCR-tolerant spellings), `low`, `high`, `unit`, `system`.
- Systems: blood, thyroid, liver, kidney, cardiovascular, inflammation, nutritional, hormonal.

### Value extraction (`extractValueForTest`)
Two passes per test, in alias order:
1. **Exact alias pass.** A regex built from the alias: `\b<alias>[\s:#\-.]*(?:[a-z]{2,12}[\s:#\-.]+){0,2}<number>(?![0-9.])`. It tolerates label words that often follow an abbreviation ("t4 total 4.78"). The captured number is validated by `plausibleValue` and `inRangeContext`.
2. **Fuzzy pass.** Each alias is matched against the word list with a bounded Levenshtein distance: tolerance 0 for aliases of length ≤ 2, 1 for length ≤ 5, 2 above that, capped at 24 characters. On a hit, the first valid number within the next **40** characters (down from 60) is taken.

Numbers already consumed by an earlier test are skipped (`consumed` ranges), so one printed value cannot feed two tests.

### Range guard (`inRangeContext`)
A printed "low – high" pair must never be read as a result. If the candidate number sits between two numbers joined by a dash / en-dash / "to" (e.g. `0.4 – 4.0`), it is rejected and the search continues. This was the T3 class of bug: a range bound was being captured as a T3 value.

### Plausibility filter (`plausibleValue`)
- `parseFloat` must be finite and > 0.
- Integer part longer than 5 digits → rejected (phone numbers, MRNs, DOBs).
- Absolute-count auto-scale: if `v > high * 100` but `v / 1000 <= high`, the value is divided by 1000 (labs that print WBC/platelets as 13500 instead of 13.5).

### Word tokenization
`parseLabReport` tokenizes the lowercased text with `/[a-z][a-z0-9]{1,}/g`, so "T3" becomes `t3` and "TPOAb" becomes `tpoab`. A value like "0.9" is never a word token.

### Results
- Fewer than 2 rows → `null` (not a lab report).
- Each row gets `status`: low / normal / high against `low`/`high`.
- Findings come from an `RX` table keyed by test key; each returns name, ICD-10, severity (deviation-based: ≥ 50 % → 3, ≥ 20 % → 2, else 1), explanation, and a specific prescription.
- Primary finding = highest severity. Confidence = `min(97, 60 + severity*10 + min(17, rowCount))`.
- System scores: start at 100, subtract 28/16/8 per abnormal row by severity, floor at 12, minus a small ratio penalty. Status: ≥ 80 "in", ≥ 60 "watch", else "out".
- Care actions: one per finding, L1/L2/L3 by severity, with timeframe.
- Supplements: deduped from prescription medication names (first component before "+"), capped at 8.

## 4. Verification fixtures
- Real report: `C:\Users\Khurram\Pictures\Screenshots\Screenshot 2026-11-16 125712.png` – WBC differential (neutrophils 65.3, lymphocytes 23.2, monocytes 8.6, eosinophils 2.6). **No thyroid values.** Correct output is four rows and no T3 / TSH / T4.
- Synthetic thyroid (in `make-sample.ps1` outside the repo) includes "T3 0.9 ng/dL" – that fixture legitimately parses a T3 row.
- Regression script pattern: temporary `verify-*.mjs` importing `parseLabReport`, asserting row counts and exact values, `npx --yes tsx`, then delete.

## 5. Known sharp edges (see 04-known-issues.md)
- `plausibleValue` has no unit check: a value in the right digit range but the wrong unit (e.g. µg/dL read as ng/dL) still passes.
- Single-letter-then-digit tokens like "t3" only match if tesseract printed them; if the lab printed "Tri-iodothyronine" in a form the tokenizer fragments, the exact pass misses it.
- Table OCR that jumbles columns can put a neighbour's number inside the 40-character window; the range guard catches the common case, not every layout.
