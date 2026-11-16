"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/site/logo";
import CopyrightYear from "@/components/site/copyright-year";
import ThemeToggle from "@/components/site/theme-toggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/how-it-works", label: "How it works" },
];

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative inline-flex h-5 w-6 items-center justify-center">
      <span
        className="absolute left-0 top-[3px] h-[2px] w-6 rounded-full bg-foreground transition-all duration-300 ease-out"
        style={open ? { transform: "rotate(45deg)" } : undefined}
      />
      <span
        className="absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-foreground transition-all duration-200 ease-out"
        style={open ? { opacity: 0, transform: "translateY(-50%) scale(0.4)" } : undefined}
      />
      <span
        className="absolute left-0 bottom-[3px] h-[2px] w-6 rounded-full bg-foreground transition-all duration-300 ease-out"
        style={open ? { transform: "rotate(-45deg)" } : undefined}
      />
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border-c bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="BloodWorks Health – home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {LINKS.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-soft text-foreground" : "text-muted hover:text-foreground hover:bg-soft"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/analyze"
              className="ml-3 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-deep"
            >
              Analyze my report
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-c lg:hidden"
            >
              <BurgerIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      {/* Full-page mobile menu */}
      <div
        className={`fixed inset-0 z-50 bg-background transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col px-6 pt-5 pb-8">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-c"
            >
              <BurgerIcon open />
            </button>
          </div>

          <nav className="mt-14 flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-xl px-4 py-4 font-sans text-3xl font-bold tracking-tight ${
                  pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
                    ? "text-accent"
                    : "text-foreground"
                }`}
              >
                <span
                  className={`inline-block ${open ? "bw-fade-up" : ""}`}
                  style={open ? { animationDelay: `${90 + i * 60}ms` } : undefined}
                >
                  {l.label}
                </span>
              </Link>
            ))}
            <Link
              href="/analyze"
              className="mt-6 rounded-full bg-accent px-6 py-4 text-center font-sans text-lg font-bold text-white"
            >
              <span
                className={`inline-block ${open ? "bw-fade-up" : ""}`}
                style={open ? { animationDelay: "360ms" } : undefined}
              >
                Analyze my report
              </span>
            </Link>
          </nav>

          <div className="mt-auto">
            <div className="mb-6">
              <ThemeToggle />
            </div>
            <div className="border-t border-border-c pt-4">
              <p className="text-xs text-muted">
                © <CopyrightYear /> BloodWorks Health by Khurram. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
