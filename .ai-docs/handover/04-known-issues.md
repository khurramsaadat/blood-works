# AI Assistant (Sai)

## Endpoints
- `POST /api/assistant` in `src/app/api/assistant/route.ts`. Server-side only; `IFM_API_KEY` never ships to the client. Supports streaming via `stream: true` (SSE); non-streaming JSON fallback.
- `POST /api/tts` in `src/app/api/tts/route.ts`. Server-side Edge TTS proxy (free, no key). Returns MP3 audio. Body: `{ text }`. Uses `@andresaya/edge-tts` with voice `en-US-JennyNeural`.
- Request body (assistant): `{ messages: Msg[], context?: string, stream?: boolean }`. `context` is the raw report/symptom text from the client.
- Response (non-streaming): `{ reply: string, reasoning_content: string }`. Streaming: SSE frames `data: { content, reasoning }` then `data: [DONE]`.
- Errors: 400 (no messages / bad JSON), 500 (key missing), 502 (upstream failure or empty reply, with the first 300 chars of the upstream error text).

## Provider
- IFM API, OpenAI-compatible: `POST {IFM_BASE_URL}/chat/completions`, `Authorization: Bearer {IFM_API_KEY}`.
- Env vars in `symptom-app/.env.local` (gitignored): `IFM_API_KEY` (required), `IFM_BASE_URL` (default `https://api.ifm.ai/v1`), `IFM_MODEL` (default `IFM/K2-Horizon-375B-A23B`).
- Sampling: `temperature 0.6`, `top_p 0.95`, `max_tokens 700`.

## Grounding (how Sai learns the report)
The route re-parses `context` with the same `parseLabReport` from `src/lib/lab.ts` and builds a "Current report analysis (ground truth for this user)" block appended to the system prompt:
- Parsed value count and the full value list (`Label=value+unit (status)`).
- Primary diagnosis with ICD-10, confidence, explanation, and the prescription line.
- Additional findings (names + ICD-10), system scores, care action titles, supplement names.

If `parseLabReport` returns null (fewer than 2 rows), the block is omitted and Sai answers from the conversation alone.

## Persona (system prompt)
"You are Sai, a confident, warm, and precise AI health assistant…" direct, decisive, plain-English answers; under ~200 words unless asked for detail; short paragraphs or a tight bullet list; do NOT hedge with 'consult your doctor' or 'seek professional medical advice'; if a specific lab value or diagnosis is referenced, anchor your answer to it.

The no-disclaimer rule is part of the persona and must stay there (and in the UI copy) per the product requirements.

## Multi-turn: the reasoning_content rule (critical)
IFM reasoning models require every replayed assistant turn to carry `reasoning_content` verbatim. An empty string `""` is a valid value. Omitting it (or sending a modified one) causes HTTP 400 on the next turn. Implementation:
- The route returns `reasoning_content` in the response.
- `assistant-chat.tsx` stores it per assistant message (`ChatMsg.reasoning`) and sends it back in `messages` on every subsequent request.
- The route copies it through verbatim when mapping incoming messages.

Do not "clean up" or truncate the stored `reasoning_content`; it must be byte-identical to what was returned.

## Client side (`assistant-chat.tsx`)
- **Always visible on desktop.** The right column renders the panel unconditionally; there is no collapse control. Mobile: FAB opens a bottom sheet.
- **Controlled messages.** Chat state lives in `symptom-checker.tsx` (`chat`, `setChat`) so it can be persisted per session in localStorage. The panel receives `messages`, `onMessagesChange`, `onClearChat`, and `labRows` (for citation chips).
- **Input.** Auto-growing `<textarea>` (1 to 5 rows, capped at 8 rows via max-h). Enter sends, Shift+Enter inserts a newline. A mic button uses `SpeechRecognition || webkitSpeechRecognition`, appends the transcript to the draft, and shows a listening state. Feature detection happens in `useEffect` so the first client render matches the server (no hydration mismatch).
- **Mic fallback.** Web Speech API first; on `network` / `language-not-supported` errors, persists `bw.mic.local=1` and switches to MediaRecorder + in-browser Whisper (`@huggingface/transformers`, `onnx-community/whisper-tiny.en`, dtype `q8`), 30s cap, progress hints.
- **Streaming.** Replies stream in token-by-token via SSE from `/api/assistant`. Falls back to JSON if the upstream isn't streaming.
- **Rendering.** Replies render as Markdown via `markdown.tsx` (react-markdown + remark-gfm); user bubbles stay plain text.
- **Follow-ups.** After each reply, 2–3 context-aware follow-up chips are derived from the reply text and rendered under the message; clicking sends them.
- **Read-aloud.** A volume button in the composer reads the latest assistant reply aloud via `/api/tts` (Edge TTS, `en-US-JennyNeural`); falls back to Web Speech. A pulsing dot shows while audio plays. An opt-in "Auto-read" toggle (AR) plays each reply automatically; persisted in `localStorage` (`bw.tts.autoread`).
- **Citations.** Per-value citation chips render under each assistant reply for lab values whose numbers appear in the answer.
- **Auto-scroll.** The message list only auto-scrolls when the user is near the bottom (within ~80px), so reading history is preserved.
- **Exports.** Per-reply actions: copy, download, share. Panel header: download/share the whole conversation and clear it with a tap-again confirm (built by `buildSaiTranscript` in `src/lib/report-export.ts`).
- **Toasts.** Short absolute-positioned toast for "Reply copied", "Conversation downloaded", etc.

## Testing the route without the browser
Write the request body to a file (PowerShell mangles inline curl `-d` JSON) and run:
```
curl.exe --data-binary "@body.json" -H "Content-Type: application/json" http://localhost:3004/api/assistant
```
TTS:
```
curl.exe -X POST -H "Content-Type: application/json" -d "{\"text\":\"Hello\"}" http://localhost:3004/api/tts --output test.mp3
```

## Known limitations
- The assistant sees the OCR text, not the image. If the transcript is wrong, Sai is wrong; that is why the transcript is editable.
- Speech recognition depends on the browser and an internet connection; the on-device Whisper fallback works offline after the model downloads once.
- Edge TTS is an unofficial endpoint (Microsoft's Read Aloud service) and may be rate-limited; the Web Speech fallback covers that.<|end|><|start|>write to=assistant<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="content">
# Known Issues, Gotchas and Cleanup

## Open accuracy items
- **Owner will supply a new report.** The TSH/T4 case was retired. When the new fixture arrives, run the regression: temporary `verify-*.mjs`, assert the exact rows and values, then delete the script. The current guards (range rejection, 40-character window, 24-character edit cap, decimal lookahead) are verified against the WBC fixture and synthetic thyroid data.
- **Unit awareness.** `plausibleValue` does not compare units. A number in a plausible digit range but with the wrong unit will pass. Low risk for common panels, worth fixing if a misread shows up in real reports.
- **Jumbled tables.** When OCR reshuffles columns, a neighbouring value can land next to the wrong alias. The range guard catches "low – high" bounds; it does not validate every layout.

## Environment specifics
- Dev port is **3004** (`pnpm dev` runs `npx kill-port 3004 && next dev -p 3004`). The owner's other app holds 3000. Do not start on 3000.
- `.env.local` (gitignored) must contain `IFM_API_KEY`; `IFM_BASE_URL` and `IFM_MODEL` are optional with sane defaults. `IFM_API_KEY` is required for Sai; optional for the rest of the app. No key needed for TTS (Edge TTS is free).
- Netlify secrets scanning blocks the build when `IFM_API_KEY` is set as a build environment variable, because Next inlines server env vars into `.next/server/chunks`. `netlify.toml` whitelists the three IFM keys via `SECRETS_SCAN_OMIT_KEYS`. The value is never sent to the client – it stays in the server bundle, which is the intended exposure.
- PowerShell: chain with `;` not `&&`. Inline `curl -d` JSON gets mangled; write the JSON to a file and use `--data-binary "@file.json"`.
- PowerShell `Set-Content -Encoding UTF8` writes a **BOM**, and the Tailwind Turbopack loader rejects `package.json` containing one. Edit JSON files with the editor tools, or write UTF-8 without BOM explicitly. If it happens, strip bytes `EF BB BF` and restart the dev server (Turbopack caches the parse error).
- `cacheComponents: true` forbids reading the clock in server components. The dynamic year is isolated in the client `site/copyright-year.tsx`, which resolves the year after mount; the navbar and footer both use it. Any new server component that needs `new Date()` must be a client component or wrapped appropriately.
- Do not add `export const runtime` to `src/app/api/assistant/route.ts` or `src/app/api/tts/route.ts`; it conflicts with `cacheComponents`.

## Theming gotchas
- `next-themes` uses the class strategy; `globals.css` declares `@custom-variant dark (&:where(.dark, .dark *))`. Without it, Tailwind 4's `dark:` follows the OS, not the toggle.
- Hydration: anything that reads `window` (speech recognition, `resolvedTheme`, scroll position) must be gated in `useEffect` or a `mounted` flag. The theme toggle renders a same-size placeholder until mounted.
- The emitted HTML must carry `suppressHydrationWarning` on `<html>`; without it Next warns on theme class injection.

## PWA notes
- The service worker is registered **only in production** (`process.env.NODE_ENV !== "production"` returns early). Testing install prompts requires `pnpm build && pnpm start`.
- `public/sw.js` is network-first for navigations and cache-first for assets; it skips `/api/` entirely so Sai is never served from cache.
- Bump `CACHE = "bloodworks-v1"` when shipping changes that must invalidate old cached shells.
- Install prompt appears after a completed analysis, dismissible for 30 days via localStorage.

## Sharp edges (TTS)
- Edge TTS is an unofficial endpoint (Microsoft's Read Aloud service) and may return 429 (rate limit) or reject unsupported voices. The route uses `en-US-JennyNeural` (verified working). Web Speech remains the fallback in the client.
- Puter.js was evaluated and removed in favour of Edge TTS to avoid sign-in prompts.

## Sharp edges (mic)
- Web Speech API depends on a remote service and fails with `network` on many networks/Chromium builds. The fallback records via MediaRecorder and transcribes with Whisper (`@huggingface/transformers`, `onnx-community/whisper-tiny.en`, dtype `q8`). First use downloads the model (~75 MB). The choice is persisted in `localStorage` (`bw.mic.local`).
- `getUserMedia` requires a secure context (HTTPS or localhost) and a user gesture; headless/automated browsers may auto-deny.

## Sharp edges (OCR / parser)
- `plausibleValue` has no unit check: a value in the right digit range but the wrong unit (e.g. µg/dL read as ng/dL) still passes.
- Single-letter-then-digit tokens like "t3" only match if tesseract printed them; if the lab printed "Tri-iodothyronine" in a form the tokenizer fragments, the exact pass misses it.
- Table OCR that jumbles columns can put a neighbour's number inside the 40-character window; the range guard catches the common case, not every layout.

## Cleanup queue
- No leftover `ocr-*.mjs`, `ocr-*.txt`, `verify-*.mjs` or `eng.traineddata` in `symptom-app/`. Removed during the homepage QA pass.
- `scripts/make-icons.ps1` is the deliberate regeneration tool for the PWA icons and `/og.png`; keep it.
- `sample-report.png` and `make-sample.ps1` live outside the repo in `test-qwen/`; they are fixture generators, not app code.

## Verification checklist before a commit
- `npx tsc --noEmit` is clean.
- `/` returns 200 and the hero CTA is above the fold at 375 px.
- `/analyze` OCR runs, an analysis renders, the image survives a refresh, the sidebar lists the session, delete and clear-all both ask for confirmation.
- Sai replies stream in as Markdown; Enter sends, Shift+Enter breaks the line; the mic button appears only where supported; read-aloud plays via Edge TTS with the visual playing indicator.
- Theme toggle survives a reload (no flash), navbar logo returns home, mobile menu locks the body and shows the copyright.
- Dark-mode CTA bands and logo marks stay deep green (`--brand-deep`), not bright teal, so white text remains legible.
- `/sitemap.xml`, `/robots.txt` and `/manifest.json` resolve. The PWA install prompt appears after a completed analysis.