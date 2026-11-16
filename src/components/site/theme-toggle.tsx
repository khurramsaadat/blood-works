"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className={`inline-block h-9 w-9 ${className}`} />;

  const dark = resolvedTheme === "dark";
  const next = dark ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      title={dark ? "Switch to day theme" : "Switch to dark theme"}
      aria-label={dark ? "Switch to day theme" : "Switch to dark theme"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-c text-foreground transition-colors hover:bg-soft ${className}`}
    >
      {dark ? (
        /* Day: colored sun */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.4" fill="#f5a524" />
          <g stroke="#f5a524" strokeWidth="1.9" strokeLinecap="round">
            <path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
          </g>
        </svg>
      ) : (
        /* Dark: black-outlined moon */
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.4 14.2A8.6 8.6 0 0 1 9.8 3.6a8.6 8.6 0 1 0 10.6 10.6Z" />
        </svg>
      )}
    </button>
  );
}
