import { EdgeTTS } from "@andresaya/edge-tts";

const ALLOWED_VOICES = [
  "en-US-AshleyNeural",
  "en-US-AriaNeural",
  "en-US-JennyNeural",
  "en-US-SaraNeural",
  "en-US-EmmaNeural",
  "en-US-AvaNeural",
  "en-US-MichelleNeural",
  "en-US-MonicaNeural",
  "en-US-NancyNeural",
  "en-US-AmberNeural",
];

export async function POST(request: Request) {
  let body: { text?: string; voice?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "No text provided." }, { status: 400 });
  }
  if (text.length > 3000) {
    return Response.json({ error: "Text too long." }, { status: 400 });
  }
  const voice = ALLOWED_VOICES.includes(body.voice ?? "") ? (body.voice as string) : "en-US-AriaNeural";

  try {
    const tts = new EdgeTTS();
    await tts.synthesize(text, voice);
    const buffer = tts.toBuffer();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return Response.json(
      { error: `TTS failed: ${e instanceof Error ? e.message : "unknown error"}` },
      { status: 502 }
    );
  }
}