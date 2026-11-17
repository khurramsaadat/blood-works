"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/site/logo";
import type { SampleId } from "@/lib/samples";

type Panel = {
  id: SampleId;
  title: string;
  meta: string;
  bars: { name: string; v: number }[];
  rows: { t: string; v: string; s: "In range" | "High" | "Low" }[];
  finding: string;
  icd10: string;
};

const PANELS: Panel[] = [
  {
    id: "wbc",
    title: "WBC differential decoded",
    meta: "10 values matched · 2 out of range",
    bars: [
      { name: "Inflammation", v: 80 },
      { name: "Heart Health", v: 100 },
      { name: "Nutritional", v: 100 },
    ],
    rows: [
      { t: "WBC", v: "11.6", s: "High" },
      { t: "Neutrophils", v: "78%", s: "High" },
      { t: "Hemoglobin", v: "14.2", s: "In range" },
    ],
    finding: "Acute Bacterial Infection",
    icd10: "B95",
  },
  {
    id: "thyroid",
    title: "Thyroid profile decoded",
    meta: "4 values matched · 3 out of range",
    bars: [
      { name: "Thyroid Health", v: 58 },
      { name: "Nutritional", v: 74 },
    ],
    rows: [
      { t: "TSH", v: "6.82", s: "High" },
      { t: "T4", v: "4.78", s: "Low" },
      { t: "Vitamin D", v: "18", s: "Low" },
    ],
    finding: "Hypothyroidism",
    icd10: "E03.9",
  },
  {
    id: "lipids",
    title: "Lipid panel decoded",
    meta: "6 values matched · 4 out of range",
    bars: [{ name: "Heart Health", v: 46 }],
    rows: [
      { t: "LDL", v: "148", s: "High" },
      { t: "HDL", v: "38", s: "Low" },
      { t: "Triglycerides", v: "186", s: "High" },
    ],
    finding: "Hypertriglyceridemia",
    icd10: "E78.1",
  },
];

const STATUS_CLASS: Record<Panel["rows"][number]["s"], string> = {
  High: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Low: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "In range": "bg-soft text-accent-deep",
};

export default function HeroPreview() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setIndex((v) => (v + 1) % PANELS.length), 6500);
    return () => clearInterval(t);
  }, [paused, reduced, index]);

  const panel = PANELS[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="absolute -top-6 -right-4 hidden rotate-2 rounded-xl border border-border-c bg-card p-3 shadow-sm sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
            S
          </span>
          <div>
            <p className="text-[11px] font-semibold text-foreground">Sai</p>
            <p className="max-w-[180px] text-[11px] leading-snug text-muted">
              {panel.finding} – that is the headline, and here is what to do next.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-c bg-card p-5 shadow-xl">
        <div key={panel.id} className="bw-fade">
          <div className="flex items-center justify-between gap-3 border-b border-border-c pb-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <LogoMark className="h-8 w-8 rounded-lg" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">{panel.title}</p>
                <p className="text-[10px] text-muted">{panel.meta}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-soft px-2.5 py-1 text-[10px] font-semibold text-accent-deep">
              sample report
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {panel.bars.map((b) => (
              <div key={b.name}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-foreground">{b.name}</span>
                  <span className="font-mono text-muted">{b.v}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                  <div
                    className="h-full rounded-full bg-accent-bright transition-[width] duration-700 ease-out"
                    style={{ width: `${b.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-border-c pt-4">
            {panel.rows.map((r) => (
              <div
                key={r.t}
                className="flex items-center justify-between rounded-lg bg-soft/60 px-3 py-2"
              >
                <span className="text-[11px] font-medium text-foreground">{r.t}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-foreground">{r.v}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${STATUS_CLASS[r.s]}`}
                  >
                    {r.s}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border-c pt-4">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-foreground">{panel.finding}</p>
              <p className="text-[10px] font-mono text-muted">ICD-10 {panel.icd10}</p>
            </div>
            <Link
              href={`/analyze?sample=${panel.id}`}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-brand-deep"
            >
              Open this sample
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${p.title}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-accent" : "w-1.5 bg-muted/50 hover:bg-accent/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
