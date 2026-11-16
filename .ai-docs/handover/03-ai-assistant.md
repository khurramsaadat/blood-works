# AI Assistant (Sai)

## Endpoint
- `POST /api/assistant` in `src/app/api/assistant/route.ts`. Server-side only; `IFM_API_KEY` never ships to the client.
- Request body: `{ messages: Msg[], context?: string }`. `context` is the raw report/symptom text from the client.
- Response: `{ reply: string, reasoning_content: string }`.
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
"You are Sai, a confident, warm, and precise AI health assistant… direct, decisive, plain-English answers; under ~200 words unless asked for detail; short paragraphs or a tight bullet list; do NOT hedge with 'consult your doctor' or 'seek professional medical advice'; if a specific lab value or diagnosis is referenced, anchor your answer to it."

The no-disclaimer rule is part of the persona and must stay there (and in the UI copy) per the product requirements.

## Multi-turn: the reasoning_content rule (critical)
IFM reasoning models require every replayed assistant turn to carry `reasoning_content` verbatim. An empty string `""` is a valid value. Omitting it (or sending a modified one) causes HTTP 400 on the next turn. Implementation:
- The route returns `reasoning_content` in the response.
- `assistant-chat.tsx` stores it per assistant message (`ChatMsg.reasoning`) and sends it back in `messages` on every subsequent request.
- The route copies it through verbatim when mapping incoming messages.

Do not "clean up" or truncate the stored `reasoning_content`; it must be byte-identical to what was returned.

## Client side (`assistant-chat.tsx`)
- **Always visible on desktop.** The right column renders the panel unconditionally; there is no collapse control. Mobile: FAB opens a bottom sheet.
- **Controlled messages.** Chat state lives in `symptom-checker.tsx` (`chat`, `setChat`) so it can be persisted per session in localStorage. The panel receives `messages`, `onMessagesChange`, `onClearChat`.
- **Input.** Auto-growing `<textarea>` (1 to 4 rows). Enter sends, Shift+Enter inserts a newline. A mic button uses `SpeechRecognition || webkitSpeechRecognition`, appends the transcript to the draft, and shows a listening state. Feature detection happens in `useEffect` so the first client render matches the server (no hydration mismatch).
- **Rendering.** Replies render as Markdown via `markdown.tsx` (react-markdown + remark-gfm); user bubbles stay plain text.
- **Exports.** Per-reply actions: copy, download, share. Panel header: download/share the whole conversation and clear it with a tap-again confirm (built by `buildSaiTranscript` in `src/lib/report-export.ts`).
- **Toasts.** Short absolute-positioned toast for "Reply copied", "Conversation downloaded", etc.

## Testing the route without the browser
Write the request body to a file (PowerShell mangles inline curl `-d` JSON) and run:
```
curl.exe --data-binary "@body.json" -H "Content-Type: application/json" http://localhost:3004/api/assistant
```

## Known limitations
- The assistant sees the OCR text, not the image. If the transcript is wrong, Sai is wrong; that is why the transcript is editable.
- Speech recognition depends on the browser and an internet connection; it is hidden entirely where the API is unavailable.
