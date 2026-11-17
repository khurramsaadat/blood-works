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
- Edge TTS is an unofficial endpoint (Microsoft's Read Aloud service) and may be rate-limited; the Web Speech fallback covers that.