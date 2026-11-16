import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions people actually ask: privacy, accuracy, missing values, and how the analysis is produced.",
};

const FAQS = [
  {
    g: "Basics",
    items: [
      {
        q: "What is BloodWorks Health?",
        a: "A web app that reads a photo of your blood report, matches every value to its reference range, scores each body system, and produces a care plan you can download or share. Sai, the built-in assistant, answers questions about your specific numbers.",
      },
      {
        q: "Is it free?",
        a: "Yes. There is no account, no credit card and no time limit on the analysis. Chat with Sai uses our assistant service, which is free to use within normal limits.",
      },
      {
        q: "Which reports can it read?",
        a: "Any complete blood count, metabolic panel, lipid profile, thyroid panel, liver or kidney function panel – anything that prints test names, values and ranges. Screenshots and camera photos both work; camera photos are pre-sharpened to improve legibility.",
      },
    ],
  },
  {
    g: "Privacy",
    items: [
      {
        q: "Where is my report stored?",
        a: "In your browser’s local storage, on your device. The “Your reports” list in the sidebar is that storage, rendered. It never goes to a server. Clearing it is one confirmed tap.",
      },
      {
        q: "Does anyone see my results?",
        a: "Only you, and – if you choose to chat – the assistant service receives the report text as context for your question. No one at BloodWorks can open your reports; we do not run a database of them.",
      },
    ],
  },
  {
    g: "Accuracy",
    items: [
      {
        q: "What if a value is misread?",
        a: "The extracted text is editable. Fix any misread and the entire analysis – grading, system scores, care actions – recomputes instantly. Treat the transcript as the source of truth and check it against your original.",
      },
      {
        q: "Why did it say a test was not found?",
        a: "Either the test is not on your report, or it was printed in a form the matcher could not link to a value. Adding it to the transcript in the format “TEST NAME value unit” will get it picked up on re-analysis.",
      },
      {
        q: "How are system scores calculated?",
        a: "Each system covers a defined set of biomarkers. The score reflects how many of those values are in range, how far out-of-range values sit, and the severity weighting of the tests involved. Systems with no data on your report are marked “not evaluated”, never guessed.",
      },
    ],
  },
  {
    g: "Using it",
    items: [
      {
        q: "Can I talk to Sai by voice?",
        a: "Yes. The microphone button in the chat input uses your browser’s speech recognition to dictate questions. It works on secure connections and localhost.",
      },
      {
        q: "Can I share the result?",
        a: "Yes. The full analysis can be downloaded or shared, and every individual Sai reply can be copied, downloaded or shared separately – handy when one answer needs to travel on its own.",
      },
      {
        q: "Does it work on my phone?",
        a: "Yes. The layout is mobile-first: the Sai assistant opens from a floating button, and the report list stays in the menu. OCR quality on phone photos is one of the reasons the pipeline includes the sharpening step.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="flex-1">
      <header className="border-b border-border-c bg-soft/50 dark:bg-[#0e1a16]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase text-accent">
            FAQ
          </p>
          <h1 className="mt-3 font-sans text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Questions, answered honestly
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            If yours is not here, write to hello@bloodworks.health – a person replies, not a
            template.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-12">
          {FAQS.map((g) => (
            <section key={g.g}>
              <h2 className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-accent">
                {g.g}
              </h2>
              <div className="mt-4 space-y-3">
                {g.items.map((f) => (
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
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-brand-deep p-8 text-center">
          <p className="font-sans text-2xl font-extrabold text-white">
            Ready when your report is
          </p>
          <Link
            href="/analyze"
            className="mt-5 inline-block rounded-full bg-white px-7 py-3 font-sans text-sm font-bold text-brand-deep transition-colors hover:bg-white/90"
          >
            Analyze my report
          </Link>
        </div>
      </div>
    </div>
  );
}
