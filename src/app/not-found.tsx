import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex-1">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center sm:px-6">
        <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
          404
        </p>
        <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          This page is out of range
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
          The address does not match anything on this site. Your report is safe – it lives in
          your browser, not on a server.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-accent px-7 py-3.5 font-sans text-sm font-bold text-white transition-colors hover:bg-brand-deep"
          >
            Back to home
          </Link>
          <Link
            href="/analyze"
            className="rounded-full border border-border-c px-7 py-3.5 font-sans text-sm font-bold text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Analyze my report
          </Link>
        </div>
      </div>
    </div>
  );
}
