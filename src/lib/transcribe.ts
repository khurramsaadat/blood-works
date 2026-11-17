/**
 * On-device speech-to-text.
 *
 * Chrome's Web Speech API depends on a remote service and fails with a
 * `network` error on many networks and Chromium builds. When that happens the
 * assistant falls back to this module: the clip is recorded with
 * MediaRecorder, resampled here, and transcribed by Whisper running in the
 * browser through transformers.js. The audio never leaves the device.
 */

type Progress = { status?: string; file?: string; progress?: number };
type Transcriber = (
  audio: Float32Array,
  options?: Record<string, unknown>
) => Promise<{ text?: string } | { text?: string }[]>;

let pipelinePromise: Promise<Transcriber> | null = null;

export async function loadTranscriber(onProgress?: (message: string) => void): Promise<Transcriber> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      const model = await pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en", {
        dtype: "q8",
        progress_callback: (p: Progress) => {
          if (p?.status === "progress" && typeof p.progress === "number") {
            onProgress?.(`Downloading speech model ${Math.round(p.progress)}%`);
          } else if (p?.status === "ready") {
            onProgress?.("Speech model ready");
          }
        },
      });
      return model as unknown as Transcriber;
    })().catch((err) => {
      pipelinePromise = null;
      throw err;
    });
  }
  return pipelinePromise;
}

/** Decode any recorded blob and resample it to the 16 kHz mono Whisper wants. */
export async function blobToMono16k(blob: Blob): Promise<Float32Array> {
  const bytes = await blob.arrayBuffer();
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const decodeCtx = new Ctx();
  const decoded = await decodeCtx.decodeAudioData(bytes.slice(0));
  const targetRate = 16000;
  const length = Math.max(1, Math.ceil(decoded.duration * targetRate));
  const offline = new OfflineAudioContext(1, length, targetRate);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  await decodeCtx.close();
  return rendered.getChannelData(0);
}

export async function transcribeBlob(blob: Blob, onProgress?: (message: string) => void): Promise<string> {
  const transcriber = await loadTranscriber(onProgress);
  onProgress?.("Transcribing on this device");
  const audio = await blobToMono16k(blob);
  const result = await transcriber(audio, {
    language: "en",
    task: "transcribe",
    chunk_length_s: 30,
  });
  const text = Array.isArray(result) ? result[0]?.text ?? "" : result.text ?? "";
  return text.replace(/\s+/g, " ").trim();
}
