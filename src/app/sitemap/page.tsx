import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Every page on BloodWorks Health.",
  robots: { index: true },
};

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze a report" },
  { href: "/symptoms", label: "Symptom checker" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

export default function SitemapPage() {
  return (
    <div className="flex-1">
      <header className="border-b border-border-c bg-soft/50 dark:bg-[#0e1a16]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
            Sitemap
          </p>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Every page, in one place
          </h1>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <ul className="grid gap-2 sm:grid-cols-2">
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="flex items-center justify-between rounded-xl border border-border-c bg-card px-5 py-4 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {p.label}
                <span className="text-xs font-normal text-muted">{p.href === "/" ? "/" : p.href}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-muted">
          For search engines, a machine-readable version lives at /sitemap.xml.
        </p>
      </div>
    </div>
  );
}
