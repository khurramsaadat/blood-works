"use client";

import { useEffect, useRef, useState } from "react";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What do these results mean overall?",
  "Explain my highest priority finding in simple terms.",
  "Which supplement should I take first?",
];

export default function AssistantChat({ context }: { context: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef(context);
  ctxRef.current = context;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

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
          messages: [...messages, { role: "user", content: t }],
          context: ctxRef.current,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Assistant request failed.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setMessages((m) => m.filter((x, i) => !(i === m.length - 1 && x.role === "user" && x.content === t)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-teal-50 to-white">
        <span className="h-7 w-7 rounded-full bg-[#3cbab4] flex items-center justify-center text-white text-xs font-bold">
          S
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">Sai</p>
          <p className="text-[11px] text-gray-400 leading-tight">
            {context ? "Your AI assistant · aware of your report" : "Your AI assistant"}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="h-72 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !busy && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Your results. Let&rsquo;s talk about them. Ask anything about your report, diagnosis,
              prescription, scores or supplements.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs border border-gray-200 hover:border-[#1677ff] hover:text-[#1677ff] rounded-full px-3 py-1.5 text-gray-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
              m.role === "user"
                ? "ml-auto bg-[#1677ff] text-white"
                : "bg-gray-50 border border-gray-200 text-gray-700"
            }`}
          >
            {m.content}
          </div>
        ))}

        {busy && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-400">
            Thinking…
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}

      <div className="border-t border-gray-100 p-3.5 flex gap-2">
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
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff]"
        />
        <button
          onClick={() => send(input)}
          disabled={busy || !input.trim()}
          className="bg-[#1677ff] hover:bg-[#1677ff]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 text-sm"
        >
          Send
        </button>
      </div>
    </section>
  );
}
