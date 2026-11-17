import Link from "next/link";
import Image from "next/image";
import HeroPreview from "@/components/site/hero-preview";

const STATS = [
  { value: "60+", label: "biomarkers decoded" },
  { value: "8", label: "body systems scored" },
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
    body: "Heart, Inflammation, Metabolic, Thyroid, Hormonal, Nutritional, Liver and Kidney – each scored, each backed by the numbers behind it, plus L1/L2/L3 care actions and a supplement plan.",
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
  ["Per-system % scores", "Eight body systems, each scored from the biomarkers it covers"],
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
            </div>
            <p className="mt-3 text-xs text-muted">
              Free to try · No sign-up · Your image never leaves this device
            </p>
          </div>
          <HeroPreview />
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

      {/* ============ EDITORIAL BREAK ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-c bg-soft">
              <Image
                src="/images/report-desk.jpg"
                alt="A printed blood report, laptop and notebook on a wooden desk in morning light"
                fill
                sizes="(max-width: 1024px) 100vw, 610px"
                className="object-cover"
              />
            </div>
            <div className="mt-5 grid grid-cols-[132px_1fr] items-center gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border-c bg-soft">
                <Image
                  src="/images/blood-draw.jpg"
                  alt="A blood sample being drawn into labelled collection tubes"
                  fill
                  sizes="132px"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <p className="text-[13px] leading-relaxed text-muted">
                Drawn once. Read properly. The image never leaves your browser, so the report stays
                where it belongs – with you.
              </p>
            </div>
          </div>

          <div>
            <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
              The page in your hand
            </p>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              A dense sheet of numbers, read the way a clinician would
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Every lab prints its own layout, its own units, its own reference ranges. BloodWorks
              matches each value to the range printed beside it, then explains what the pattern
              means in plain English – not a printed disclaimer.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border-c pt-7">
              {[
                ["Any lab, any layout", "Fuzzy matching across 60+ biomarkers and hundreds of label variants."],
                ["Your ranges respected", "Lab-supplied bounds win over generic charts, every time."],
                ["Nothing uploaded", "OCR and scoring run in the tab you already have open."],
                ["Reopen any report", "History sits in this browser, ready when you need it."],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt className="font-sans text-sm font-bold text-foreground">{t}</dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-muted">{d}</dd>
                </div>
              ))}
            </dl>
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
