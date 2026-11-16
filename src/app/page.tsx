import Link from "next/link";
import { LogoMark } from "@/components/site/logo";

const STATS = [
  { value: "60+", label: "biomarkers decoded" },
  { value: "9", label: "body systems scored" },
  { value: "< 60s", label: "from photo to plan" },
  { value: "100%", label: "on your device" },
];

const SERVICES = [
  {
    title: "Report decoding",
    body: "Drop a photo of any blood report. On-device OCR reads it, and the engine pairs every value with its reference range – no upload, no waiting room.",
    points: ["Tesseract OCR, fully in-browser", "Fuzzy matching for 60+ test names", "Editable text, live re-analysis"],
  },
  {
    title: "System scores & care plan",
    body: "Cardiovascular, endocrine, liver, kidney, immune and more – each scored, each backed by the numbers behind it, plus L1/L2/L3 care actions and a supplement plan.",
    points: ["Per-system percentage scores", "Definitive readouts, no hedging", "Download or share the full report"],
  },
  {
    title: "Sai, your AI assistant",
    body: "A calm AI that knows your exact results. Ask what a value means, what to eat this week, which supplement to start – answers in plain English, saved with your report.",
    points: ["Multi-turn, report-grounded chat", "Dictate with the mic", "Every reply exportable"],
  },
];

const STEPS = [
  {
    n: "01",
    title: "Snap or drop the report",
    body: "A screenshot or photo of your blood work – from any lab, any country. We pre-sharpen the image so small print still reads.",
  },
  {
    n: "02",
    title: "Values get matched to ranges",
    body: "Each result is paired with its reference range and graded. Fix any misread in the editable transcript and watch the analysis update live.",
  },
  {
    n: "03",
    title: "Get the plan, ask questions",
    body: "System scores, care actions, supplements, and a definitive summary. Then talk to Sai about any number on the page.",
  },
];

const CAPABILITIES = [
  ["Reference-range grading", "High, low and in-range flags with lab-supplied ranges respected"],
  ["Per-system % scores", "Nine body systems, each scored from the biomarkers it covers"],
  ["Care actions L1 / L2 / L3", "Now, this week, and to discuss – tiered and concrete"],
  ["Supplement plan", "What, dose and timing, mapped to the gaps your panel shows"],
  ["Symptom checker", "Describe how you feel and get a clear, evidence-ordered read"],
  ["Report export", "Download or share the analysis and your Sai conversation"],
  ["Session history", "Every report you analyze is saved on this device – reopen any time"],
  ["Private by design", "OCR and analysis run in your browser. Images are never uploaded"],
];

const FAQS = [
  {
    q: "Does my blood report leave my device?",
    a: "No. OCR and the full analysis run in your browser using Tesseract.js. Your image is stored in your own device storage so you can come back to it – it is never sent to a server.",
  },
  {
    q: "Will it read my lab, even if it looks different?",
    a: "The engine uses fuzzy matching across 60+ biomarker aliases and handles low-resolution photos with image sharpening. If a value is misread, you edit the extracted text and the analysis updates instantly.",
  },
  {
    q: "Is this a diagnosis?",
    a: "Yes. BloodWorks gives you a definitive, number-backed readout of your report and a concrete care plan, with an ICD-10 code attached to every finding – not a hedged guess.",
  },
  {
    q: "Do I need an account?",
    a: "No account, no credit card, no signup. Open the page, upload, get your analysis. History lives in your browser and you can clear it with one confirmed tap.",
  },
  {
    q: "What if a value is missing or unclear?",
    a: "Sai works only with what is on your report and says when a biomarker was not found. You can also paste or type the report text manually and still get the full analysis.",
  },
];

function HeroMock() {
  const bars = [
    { name: "Cardiovascular", v: 82 },
    { name: "Endocrine", v: 64 },
    { name: "Liver function", v: 91 },
    { name: "Kidney", v: 77 },
  ];
  const rows = [
    { t: "Neutrophils", v: "65.3", s: "Normal" },
    { t: "Lymphocytes", v: "23.2", s: "Normal" },
    { t: "ESR", v: "50", s: "High" },
  ];
  return (
    <div className="relative">
      <div className="absolute -top-6 -right-4 hidden rotate-2 rounded-xl border border-border-c bg-card p-3 shadow-sm sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white">
            S
          </span>
          <div>
            <p className="text-[11px] font-semibold text-foreground">Sai</p>
            <p className="max-w-[180px] text-[11px] leading-snug text-muted">
              ESR is 50, above range – that is the one thing to follow up.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border-c bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-border-c pb-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8 rounded-lg" />
            <div>
              <p className="text-xs font-bold text-foreground">Full panel decoded</p>
              <p className="text-[10px] text-muted">18 values matched · 2 out of range</p>
            </div>
          </div>
          <span className="rounded-full bg-soft px-2.5 py-1 text-[10px] font-semibold text-accent-deep">
            ✓ report loaded
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {bars.map((b) => (
            <div key={b.name}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-medium text-foreground">{b.name}</span>
                <span className="font-mono text-muted">{b.v}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-soft">
                <div
                  className="h-full rounded-full bg-accent-bright"
                  style={{ width: `${b.v}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border-c pt-4">
          {rows.map((r) => (
            <div key={r.t} className="flex items-center justify-between rounded-lg bg-soft/60 px-3 py-2">
              <span className="text-[11px] font-medium text-foreground">{r.t}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-foreground">{r.v}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                    r.s === "High"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-soft text-accent-deep"
                  }`}
                >
                  {r.s}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </span>
          <p className="text-[11px] text-muted">Download the full analysis · Share it anywhere</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex-1">
      {/* ============ HERO ============ */}
      <section className="border-b border-border-c bg-soft/50 dark:bg-[#0e1a16]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
              Lab report intelligence
            </p>
            <h1 className="mt-4 font-sans text-4xl leading-[1.08] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
              Your blood report, decoded in under a minute
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Photo of any blood test. Out comes every value matched to its range, a score for
              each body system, a concrete care plan, and an assistant that answers questions
              about your own numbers.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href="/analyze"
                className="rounded-full bg-accent px-8 py-4 font-sans text-base font-bold text-white shadow-md transition-colors hover:bg-brand-deep"
              >
                Analyze my report
              </Link>
              <Link
                href="/symptoms"
                className="font-sans text-sm font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                Check symptoms instead
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">
              Free to try · No sign-up · Your image never leaves this device
            </p>
          </div>
          <HeroMock />
        </div>

        {/* Stats strip */}
        <div className="border-t border-border-c bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border-c px-4 sm:px-6 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 py-6 text-center">
                <p className="font-sans text-2xl font-extrabold tracking-tight text-accent-deep sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] font-medium tracking-wide text-muted uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="max-w-2xl">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
            What it does
          </p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            From a photo to a plan you can act on
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Three things, done properly: read the report, score the systems, and stay with you
            when you have questions.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <article
              key={s.title}
              className="group rounded-2xl border border-border-c bg-card p-7 transition-colors hover:border-accent"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-soft font-sans text-sm font-extrabold text-accent-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-sans text-xl font-bold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
              <ul className="mt-5 space-y-2 border-t border-border-c pt-5">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[13px] text-foreground">
                    <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3cbab4]" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-y border-border-c bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
              How it works
            </p>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Three steps, no account
            </h2>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <p className="font-sans text-5xl font-extrabold tracking-tight text-soft [text-stroke:1px_#b9cfc5] dark:[text-stroke:1px_#2a443b]">
                  {s.n}
                </p>
                <h3 className="mt-4 font-sans text-lg font-bold text-foreground">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CAPABILITIES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
              Capabilities
            </p>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Everything a second opinion should do
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Built to match what premium lab dashboards show – the percentages, the tiers, the
              plan – with the privacy of an app that never uploads your data.
            </p>
            <Link
              href="/how-it-works"
              className="mt-6 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
            >
              See how the engine works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CAPABILITIES.map(([t, d]) => (
              <div key={t} className="rounded-xl border border-border-c bg-card p-5">
                <p className="font-sans text-sm font-bold text-foreground">{t}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="bg-brand-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          <div className="max-w-xl">
            <h2 className="font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Your numbers are already telling you something
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/80">
              Stop squinting at reference ranges. Upload the report and have it explained in
              plain English, with a plan attached.
            </p>
          </div>
          <Link
            href="/analyze"
            className="shrink-0 rounded-full bg-white px-8 py-4 font-sans text-base font-bold text-brand-deep shadow-md transition-colors hover:bg-white/90"
          >
            Start my analysis
          </Link>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-24">
        <div className="text-center">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
            Questions
          </p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            The honest answers
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border-c bg-card px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-sans text-[15px] font-bold text-foreground">{f.q}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="shrink-0 text-muted transition-transform group-open:rotate-45"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
