import { EdgeTTS } from "@andresaya/edge-tts";

export async function POST(request: Request) {
  let body: { text?: string };
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

  try {
    const tts = new EdgeTTS();
    await tts.synthesize(text, "en-US-AshleyNeural");
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