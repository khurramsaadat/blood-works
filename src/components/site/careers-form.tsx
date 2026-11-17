"use client";

import { useState, type FormEvent } from "react";

const ROLES = ["Senior frontend engineer", "Medical content lead", "Product designer"];
const EMAIL = "hello@bloodworks.health";

type Errors = { name?: string; portfolio?: string };

export default function CareersForm() {
  const [role, setRole] = useState(ROLES[0]);
  const [name, setName] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Add the name you go by.";
    const raw = portfolio.trim();
    if (!raw) {
      next.portfolio = "Add a link to your work.";
    } else {
      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      try {
        new URL(url);
      } catch {
        next.portfolio = "That does not look like a web address.";
      }
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const link = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const subject = `Application – ${role}`;
    const body = [
      `Role: ${role}`,
      `Name: ${name.trim()}`,
      `Portfolio: ${link}`,
      note.trim() ? `Note: ${note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setSent(true);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border-c bg-card p-6 shadow-sm sm:p-8">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-widest text-muted">
          Role
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                role === r
                  ? "border-accent bg-soft text-accent-deep"
                  : "border-border-c text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="careers-name" className="text-xs font-semibold uppercase tracking-widest text-muted">
            Name
          </label>
          <input
            id="careers-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder="What should we call you?"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "careers-name-error" : undefined}
            className={`mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent ${
              errors.name ? "border-red-400" : "border-border-c"
            }`}
          />
          {errors.name && (
            <p id="careers-name-error" className="mt-1.5 text-[11px] text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="careers-portfolio" className="text-xs font-semibold uppercase tracking-widest text-muted">
            Portfolio
          </label>
          <input
            id="careers-portfolio"
            value={portfolio}
            onChange={(e) => {
              setPortfolio(e.target.value);
              if (errors.portfolio) setErrors((p) => ({ ...p, portfolio: undefined }));
            }}
            placeholder="yourwork.com"
            inputMode="url"
            autoComplete="url"
            aria-invalid={!!errors.portfolio}
            aria-describedby={errors.portfolio ? "careers-portfolio-error" : undefined}
            className={`mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent ${
              errors.portfolio ? "border-red-400" : "border-border-c"
            }`}
          />
          {errors.portfolio && (
            <p id="careers-portfolio-error" className="mt-1.5 text-[11px] text-red-600">
              {errors.portfolio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="careers-note" className="text-xs font-semibold uppercase tracking-widest text-muted">
          One line about your work
        </label>
        <input
          id="careers-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={140}
          placeholder="The project you are proudest of, in one line"
          className="mt-2 w-full rounded-lg border border-border-c bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Send application
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p className="text-[11px] leading-snug text-muted" aria-live="polite">
          {sent
            ? "Opening your mail app with the role and your details filled in."
            : "Opens in your mail app, pre-addressed. Nothing is stored on our servers."}
        </p>
      </div>
    </form>
  );
}
