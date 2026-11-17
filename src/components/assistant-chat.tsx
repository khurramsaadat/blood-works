"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "@/components/markdown";
import { transcribeBlob } from "@/lib/transcribe";
import { buildSaiTranscript, copyText, downloadText, reportStamp, shareText } from "@/lib/report-export";
import type { ChatMsg } from "@/lib/sessions";

const SUGGESTIONS = [
  "What do these results mean overall?",
  "Explain my highest priority finding in simple terms.",
  "Which supplement should I take first?",
  "What should I eat this week?",
];

function ActionIcon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="h-6 w-6 rounded-md text-muted hover:text-accent-deep hover:bg-soft flex items-center justify-center"
    >
      {children}
    </button>
  );
}

const ICON = {
  copy: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  download: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  ),
  share: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  ),
  mic: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 11a7 7 0 0 1-14 0 M12 18v4" />
    </svg>
  ),
  micOff: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M9 9v2a3 3 0 0 0 5.1 2.1 M15 11V5a3 3 0 0 0-5.9-.8" />
      <path d="M19 11a7 7 0 0 1-14 0 M12 18v4" />
    </svg>
  ),
};

/* ---------------- Speech recognition (optional, feature-detected) ---------------- */

type RecResult = { isFinal: boolean; length: number; [index: number]: { transcript: string } };
type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: (e: { resultIndex: number; results: ArrayLike<RecResult> }) => void;
  onend: () => void;
  onerror: (e: { error?: string }) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognition(): Rec | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  // A full BCP-47 tag is required; bare "en" is rejected by some engines.
  const nav = typeof navigator !== "undefined" ? navigator.language : "";
  rec.lang = nav && /^en(-|$)/i.test(nav) ? nav : "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  return rec;
}

export default function AssistantChat({
  context,
  labSummary,
  messages,
  onMessagesChange,
  onClearChat,
}: {
  context: string;
  labSummary?: { primary: string; date: string } | null;
  messages: ChatMsg[];
  onMessagesChange: (updater: (prev: ChatMsg[]) => ChatMsg[]) => void;
  onClearChat: () => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [localStage, setLocalStage] = useState<"idle" | "recording" | "working">("idle");
  const [localHint, setLocalHint] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<Rec | null>(null);
  const micBaseRef = useRef("");
  // On-device fallback (MediaRecorder + Whisper in the browser).
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const speechFailed = useRef(false);
  const micModeRef = useRef<"speech" | "local">("speech");
  const ctxRef = useRef(context);
  ctxRef.current = context;

  // Feature-detect on mount only, so the server and first client render match
  // (avoids a hydration mismatch for the mic button). The mic is available if
  // either Web Speech or in-browser recording works.
  useEffect(() => {
    const speech = !!getRecognition();
    const recorder =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    setMicSupported(speech || recorder);
    try {
      if (localStorage.getItem("bw.mic.local") === "1") {
        speechFailed.current = true;
        micModeRef.current = "local";
      }
    } catch {
      /* storage blocked */
    }
    return () => {
      try { recRef.current?.abort(); } catch { /* noop */ }
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
      try { mediaRef.current?.stop(); } catch { /* noop */ }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(t);
  }, [confirmClear]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    const el = inputRef.current;
    if (el) el.style.height = "auto";
    setError(null);
    setBusy(true);
    onMessagesChange((m) => [...m, { role: "user", content: t }]);
    const history = [
      ...messages.map((m) =>
        m.role === "assistant"
          ? { role: "assistant", content: m.content, reasoning_content: m.reasoning ?? "" }
          : { role: "user", content: m.content }
      ),
      { role: "user", content: t },
    ];
    fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Assistant turns carry reasoning_content verbatim – required by IFM
        // reasoning models on every multi-turn request.
        messages: history,
        context: ctxRef.current,
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { reply?: string; reasoning_content?: string; error?: string };
        if (!res.ok || data.error) throw new Error(data.error ?? "Assistant request failed.");
        onMessagesChange((m) => [
          ...m,
          { role: "assistant", content: data.reply ?? "", reasoning: data.reasoning_content ?? "" },
        ]);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        onMessagesChange((m) => m.filter((x) => x.role !== "user" || x.content !== t));
      })
      .finally(() => setBusy(false));
  };

  const stopLocalTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
  };

  const finishLocal = async () => {
    stopLocalTracks();
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    chunksRef.current = [];
    setLocalStage("working");
    setLocalHint("Preparing on-device speech…");
    try {
      const text = await transcribeBlob(blob, setLocalHint);
      if (text) {
        const base = micBaseRef.current;
        setInput(base ? `${base} ${text}` : text);
        setError(null);
      } else {
        setToast("No speech detected – try again");
      }
    } catch {
      setError(
        "On-device transcription could not start. The first run downloads a small speech model, so check your connection and try once more."
      );
    } finally {
      setLocalStage("idle");
      setLocalHint("");
      inputRef.current?.focus();
    }
  };

  const startLocal = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record audio. Type your question instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => void finishLocal();
      micBaseRef.current = input.trim();
      rec.start();
      mediaRef.current = rec;
      setLocalStage("recording");
      // Bound the clip so transcription stays quick on a laptop or phone.
      stopTimerRef.current = window.setTimeout(() => {
        try { rec.stop(); } catch { /* already stopped */ }
      }, 30000);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Microphone access is blocked. Allow the microphone in your browser, then try again."
          : "No microphone was found on this device."
      );
    }
  };

  const stopLocal = () => {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    try { mediaRef.current?.stop(); } catch { /* already stopped */ }
  };

  const toggleMic = () => {
    if (localStage === "recording") {
      stopLocal();
      return;
    }
    if (localStage === "working") return;
    if (listening) {
      try { recRef.current?.stop(); } catch { /* already stopped */ }
      setListening(false);
      return;
    }
    const rec = getRecognition();
    if (micModeRef.current === "local") {
      void startLocal();
      return;
    }
    if (!rec || speechFailed.current) {
      void startLocal();
      return;
    }
    setError(null);
    micBaseRef.current = input.trim();
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          const clean = text.replace(/\s+/g, " ").trim();
          if (clean) micBaseRef.current = micBaseRef.current ? `${micBaseRef.current} ${clean}` : clean;
        } else {
          interim += text;
        }
      }
      const preview = [micBaseRef.current, interim.replace(/\s+/g, " ").trim()]
        .filter(Boolean)
        .join(" ");
      setInput(preview);
    };
    rec.onend = () => {
      setListening(false);
      // Keep focus in the input so the user can review and send immediately.
      inputRef.current?.focus();
    };
    rec.onerror = (e) => {
      setListening(false);
      const code = e.error ?? "";
      if (code === "network" || code === "language-not-supported") {
        // The browser's speech service is unreachable (common on Chromium
        // builds and some networks). Record and transcribe on the device
        // instead; remember the choice so the next tap skips the dead path.
        speechFailed.current = true;
        micModeRef.current = "local";
        try { localStorage.setItem("bw.mic.local", "1"); } catch { /* storage blocked */ }
        void startLocal();
      } else if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone access is blocked. Allow the microphone in your browser, then try again.");
      } else if (code === "audio-capture") {
        setError("No microphone was found on this device.");
      } else if (code === "no-speech") {
        setToast("No speech detected – try again");
      } else if (code !== "aborted") {
        setError("Voice input stopped unexpectedly. Please try again.");
      }
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Could not start the microphone. Check your browser settings.");
    }
  };

  const transcript = () => buildSaiTranscript(messages, labSummary);

  const exportConversation = async (mode: "download" | "share") => {
    if (messages.length === 0) return;
    if (mode === "download") {
      downloadText(`sai-conversation_${reportStamp()}.txt`, transcript());
      setToast("Conversation downloaded");
    } else {
      const r = await shareText(transcript(), "Sai conversation – BloodWorks Health");
      setToast(r === "shared" ? "Conversation shared" : "Conversation copied to clipboard");
    }
  };

  const exportReply = async (m: ChatMsg, mode: "copy" | "download" | "share") => {
    const label = "Sai: " + m.content;
    if (mode === "copy") {
      const r = await copyText(label);
      setToast(r === "copied" ? "Reply copied" : "Copy failed");
    } else if (mode === "download") {
      downloadText(`sai-reply_${reportStamp()}.txt`, label);
      setToast("Reply downloaded");
    } else {
      const r = await shareText(label, "Sai reply – BloodWorks Health");
      setToast(r === "shared" ? "Reply shared" : "Reply copied to clipboard");
    }
  };

  return (
    <section
      data-sai-panel
      className="relative flex h-full w-full flex-col bg-card border border-border-c rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="shrink-0 px-5 py-3.5 border-b border-border-c flex items-center gap-2.5 bg-gradient-to-r from-soft to-card">
        <span className="h-8 w-8 rounded-full bg-brand-deep flex items-center justify-center text-white text-sm font-bold shadow-sm">
          S
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">Sai</p>
          <p className="text-[11px] text-muted leading-tight">
            {context ? "AI assistant · aware of your report" : "Your AI health assistant"}
          </p>
        </div>
        {context && (
          <span className="text-[10px] font-medium text-accent-deep bg-soft border border-accent/30 rounded-full px-2 py-0.5">
            ✓ report loaded
          </span>
        )}
        {messages.length > 0 && (
          <div className="flex items-center gap-0.5">
            <ActionIcon label="Download conversation" onClick={() => exportConversation("download")}>
              {ICON.download}
            </ActionIcon>
            <ActionIcon label="Share conversation" onClick={() => exportConversation("share")}>
              {ICON.share}
            </ActionIcon>
            <ActionIcon
              label="Clear conversation"
              onClick={() => {
                if (!confirmClear) {
                  setConfirmClear(true);
                  return;
                }
                onClearChat();
                setConfirmClear(false);
                setToast("Conversation cleared");
              }}
            >
              {confirmClear ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              )}
            </ActionIcon>
          </div>
        )}
        {confirmClear && (
          <span className="text-[10px] font-medium text-red-500">Tap again to confirm</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !busy && (
          <div className="space-y-4">
            <div className="rounded-xl bg-soft/60 border border-border-c p-4">
              <p className="text-sm font-medium text-foreground">Your results, explained.</p>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Ask anything about your report – diagnosis, prescription, system scores, care
                actions or supplements. Sai answers in plain English, no hedging. You can
                download or share any reply. Your conversation is saved on this device.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted mb-2">
                Quick questions
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs border border-border-c hover:border-accent hover:text-accent-deep rounded-xl px-3.5 py-2.5 text-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="group">
            <div
              className={`max-w-[92%] rounded-xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-accent text-white rounded-br-sm"
                  : "bg-soft border border-border-c text-foreground rounded-tl-sm"
              }`}
            >
              {m.role === "assistant" ? (
                <Markdown text={m.content} />
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              )}
            </div>
            {m.role === "assistant" && (
              <div className="mt-1 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted mr-1">Reply:</span>
                <ActionIcon label="Copy reply" onClick={() => exportReply(m, "copy")}>{ICON.copy}</ActionIcon>
                <ActionIcon label="Download reply" onClick={() => exportReply(m, "download")}>{ICON.download}</ActionIcon>
                <ActionIcon label="Share reply" onClick={() => exportReply(m, "share")}>{ICON.share}</ActionIcon>
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="inline-flex items-center gap-2 bg-soft border border-border-c rounded-xl px-4 py-2.5 text-sm text-muted">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted/40 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted/40 animate-pulse [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted/40 animate-pulse [animation-delay:300ms]" />
            </span>
            Thinking…
          </div>
        )}
      </div>

      {error && <p className="shrink-0 px-4 pb-2 text-xs text-red-600">{error}</p>}

      {toast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs rounded-full px-3.5 py-1.5 shadow-lg">
          {toast}
        </div>
      )}

      {/* Input: multiline + mic */}
      <div className="shrink-0 border-t border-border-c p-3.5">
        <div className="flex items-end gap-2 bg-soft border border-border-c rounded-xl px-2.5 py-2 focus-within:border-accent transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = inputRef.current;
              if (el) {
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 128) + "px";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask Sai about your results…"
            rows={1}
            className="flex-1 min-w-0 bg-transparent text-sm placeholder:text-muted/70 focus:outline-none resize-none leading-snug max-h-32 overflow-y-auto"
          />
          {micSupported && (
            <button
              onClick={toggleMic}
              disabled={localStage === "working"}
              title={
                localStage === "recording"
                  ? "Stop and transcribe"
                  : localStage === "working"
                    ? "Transcribing on this device"
                    : listening
                      ? "Stop listening"
                      : "Dictate your question"
              }
              aria-label={
                localStage === "recording"
                  ? "Stop recording and transcribe"
                  : localStage === "working"
                    ? "Transcribing on this device"
                    : listening
                      ? "Stop listening"
                      : "Dictate your question"
              }
              aria-pressed={listening || localStage === "recording"}
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors disabled:cursor-wait ${
                listening || localStage === "recording"
                  ? "bg-red-500 text-white animate-pulse"
                  : localStage === "working"
                    ? "bg-soft text-accent-deep"
                    : "text-muted hover:text-accent-deep hover:bg-soft"
              }`}
            >
              {ICON.mic}
            </button>
          )}
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="shrink-0 bg-accent hover:bg-brand-deep disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-3.5 py-2 text-sm transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-muted mt-1.5 px-1">
          {localStage === "recording"
            ? "Recording on this device – speak, then tap the mic to stop"
            : localStage === "working"
              ? localHint || "Transcribing on this device…"
              : listening
                ? "Listening… speak now, your words appear above"
                : "Enter to send · Shift + Enter for a new line"}
        </p>
      </div>
    </section>
  );
}
