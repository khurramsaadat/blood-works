"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "bw.install.dismissed";
const DISMISS_DAYS = 30;

/**
 * A quiet install nudge shown once a report has been read. It only appears when
 * the browser has offered a real install prompt, never as a dead button, and a
 * dismissal is remembered for 30 days.
 */
export default function InstallPrompt({ show }: { show: boolean }) {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (at && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000) setDismissed(true);
    } catch {
      /* storage blocked */
    }
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    setAllowed(true);

    const onPrompt = (e: Event) => {
      // Keep the event so our own prompt can trigger it later.
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage blocked */
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "dismissed") dismiss();
    else setInstalled(true);
  };

  if (!show || !allowed || dismissed || installed || !deferred) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border-c bg-card p-4 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-accent-deep">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="2" width="16" height="20" rx="3" />
          <path d="M12 7v7M9 11l3 3 3-3" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          Install BloodWorks for offline access to your saved reports
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted">
          Adds an icon to your home screen. Your reports stay on this device.
        </p>
      </div>
      <button
        type="button"
        onClick={install}
        className="shrink-0 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-deep"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt for 30 days"
        className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-soft hover:text-foreground"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
