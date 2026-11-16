"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "@/components/markdown";
import { buildSaiTranscript, copyText, downloadText, reportStamp, shareText } from "@/lib/report-export";

type ChatMsg = { role: "user" | "assistant"; content: string; reasoning?: string };

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
      className="h-6 w-6 rounded-md text-gray-400 hover:text-[#1677ff] hover:bg-blue-50 flex items-center justify-center"
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
};

export default function AssistantChat({
  context,
  labSummary,
  onCollapse,
}: {
  context: string;
  labSummary?: { primary: string; date: string } | null;
  onCollapse?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef(context);
  ctxRef.current = context;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: t }]);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Assistant turns carry reasoning_content verbatim — required by IFM
          // reasoning models on every multi-turn request.
          messages: [
            ...messages.map((m) =>
              m.role === "assistant"
                ? { role: "assistant", content: m.content, reasoning_content: m.reasoning ?? "" }
                : { role: "user", content: m.content }
            ),
            { role: "user", content: t },
          ],
          context: ctxRef.current,
        }),
      });
      const data = (await res.json()) as { reply?: string; reasoning_content?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Assistant request failed.");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply ?? "", reasoning: data.reasoning_content ?? "" },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setMessages((m) => m.filter((x, i) => !(i === m.length - 1 && x.role === "user" && x.content === t)));
    } finally {
      setBusy(false);
    }
  };

  const transcript = () => buildSaiTranscript(messages, labSummary);

  const exportConversation = async (mode: "download" | "share") => {
    if (messages.length === 0) return;
    if (mode === "download") {
      downloadText(`sai-conversation_${reportStamp()}.txt`, transcript());
      setToast("Conversation downloaded");
    } else {
      const r = await shareText(transcript(), "Sai conversation — BloodWorks Health");
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
      const r = await shareText(label, "Sai reply — BloodWorks Health");
      setToast(r === "shared" ? "Reply shared" : "Reply copied to clipboard");
    }
  };

  return (
    <section className="relative flex h-full w-full flex-col bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="shrink-0 px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gradient-to-r from-teal-50 to-white">
        <span className="h-8 w-8 rounded-full bg-[#3cbab4] flex items-center justify-center text-white text-sm font-bold shadow-sm">
          S
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Sai</p>
          <p className="text-[11px] text-gray-400 leading-tight">
            {context ? "AI assistant · aware of your report" : "Your AI health assistant"}
          </p>
        </div>
        {context && (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
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
          </div>
        )}
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
            aria-label="Hide assistant panel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !busy && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#f4fbfa] border border-teal-100 p-4">
              <p className="text-sm font-medium text-gray-800">Your results, explained.</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Ask anything about your report — diagnosis, prescription, system scores, care
                actions or supplements. Sai answers in plain English, no hedging. You can
                download or share any reply.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-2">
                Quick questions
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs border border-gray-200 hover:border-[#1677ff] hover:text-[#1677ff] rounded-xl px-3.5 py-2.5 text-gray-600 transition-colors"
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
                  ? "ml-auto bg-[#1677ff] text-white rounded-br-sm"
                  : "bg-gray-50 border border-gray-200 text-gray-700 rounded-tl-sm"
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
                <span className="text-[10px] text-gray-400 mr-1">Reply:</span>
                <ActionIcon label="Copy reply" onClick={() => exportReply(m, "copy")}>{ICON.copy}</ActionIcon>
                <ActionIcon label="Download reply" onClick={() => exportReply(m, "download")}>{ICON.download}</ActionIcon>
                <ActionIcon label="Share reply" onClick={() => exportReply(m, "share")}>{ICON.share}</ActionIcon>
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse [animation-delay:300ms]" />
            </span>
            Thinking…
          </div>
        )}
      </div>

      {error && <p className="shrink-0 px-4 pb-2 text-xs text-red-600">{error}</p>}

      {toast && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-full px-3.5 py-1.5 shadow-lg">
          {toast}
        </div>
      )}

      <div className="shrink-0 border-t border-gray-100 p-3.5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask Sai about your results…"
          className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff]"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="shrink-0 bg-[#1677ff] hover:bg-[#1677ff]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 text-sm"
        >
          Send
        </button>
      </div>
    </section>
  );
}
