import type { Metadata } from "next";

type Block =
  | { h: string }
  | { p: string }
  | { list: string[] };

export function contentMetadata(title: string, description: string): Metadata {
  return { title, description };
}

export default function ContentPage({
  title,
  intro,
  blocks,
  updated,
}: {
  title: string;
  intro: string;
  blocks: Block[];
  updated?: string;
}) {
  return (
    <div className="flex-1">
      <header className="border-b border-border-c bg-soft/50 dark:bg-[#0e1a16]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
            BloodWorks Health
          </p>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{intro}</p>
          {updated && <p className="mt-4 text-xs text-muted">Last updated: {updated}</p>}
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-10">
          {blocks.map((b, i) =>
            "h" in b ? (
              <h2
                key={i}
                className="font-sans text-2xl font-bold tracking-tight text-foreground"
              >
                {b.h}
              </h2>
            ) : "p" in b ? (
              <p key={i} className="text-base leading-relaxed text-muted">
                {b.p}
              </p>
            ) : (
              <ul key={i} className="space-y-3">
                {b.list.map((li) => (
                  <li key={li} className="flex items-start gap-3 text-base leading-relaxed text-muted">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3cbab4]" />
                    {li}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
