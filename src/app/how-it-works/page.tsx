import type { Metadata } from "next";
import Link from "next/link";
import ContentPage from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The engine behind BloodWorks: on-device OCR, fuzzy biomarker matching, reference-range grading, per-system scoring and the AI assistant that grounds every answer in your report.",
};

export default function HowItWorks() {
  return (
    <>
      <ContentPage
        title="How BloodWorks works"
        intro="No black box. This is exactly what happens between the moment you drop a photo and the moment you read your care plan."
        blocks={[
          { h: "1. Your image, sharpened in your browser" },
          {
            p: "The photo is preprocessed before any text is read: small images are upscaled to at most 2x, then passed through a grayscale and contrast pass (contrast 1.35, brightness 1.05). The goal is to make dense, low-resolution lab print readable. None of this leaves your device.",
          },
          { h: "2. OCR with Tesseract.js" },
          {
            p: "Tesseract runs entirely client-side. As it works you see a real progress bar, and when it finishes you get the raw text in an editable field. If a number was misread, you fix it and the whole analysis recomputes live – the transcript you approve is the source of truth.",
          },
          { h: "3. Matching values to tests" },
          {
            p: "The engine knows 60+ biomarker names and the way labs spell them, including abbreviations. It uses fuzzy alias matching with a bounded window around each alias, rejects numbers that belong to reference ranges (the “low – high” bounds), and applies a plausibility filter so stray digits never become results.",
          },
          {
            list: [
              "Each value is graded against the range printed on your report, falling back to built-in reference ranges when none is present.",
              "Out-of-range values are ranked by severity, not just by how far they sit outside the range.",
              "The highest-priority finding becomes the “primary” result that Sai references first.",
            ],
          },
          { h: "4. Scoring the systems" },
          {
            p: "Biomarkers are grouped into body systems – cardiovascular, endocrine, hepatic, renal, immune, hematologic, metabolic, inflammatory and nutritional. Each system gets a percentage score derived from the values it covers. A system with no data on your report is marked as not evaluated rather than guessed.",
          },
          { h: "5. Care plan and Sai" },
          {
            p: "Care actions are issued in three tiers: L1 do it now, L2 this week, L3 next test cycle. The supplement plan is tied to the specific gaps your panel shows, with dose and timing. Sai is then grounded on your exact values: every answer it gives is constrained to what is actually on your report, and when a biomarker is missing it says so instead of filling the gap.",
          },
          { h: "6. Your records, your device" },
          {
            p: "Every analysis you run is saved as a session in your browser’s local storage – the image, the approved transcript, the analysis and your Sai conversation. Reopen any of them from the “Your reports” list, delete one, or clear everything after a confirmed prompt. Nothing is sent to a server; the only network call the app makes is your optional chat with Sai.",
          },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl bg-brand-deep p-8 text-center">
          <p className="font-sans text-2xl font-extrabold text-white">Put it to work on your own report</p>
          <Link
            href="/analyze"
            className="mt-5 inline-block rounded-full bg-white px-7 py-3 font-sans text-sm font-bold text-brand-deep transition-colors hover:bg-white/90"
          >
            Analyze my report
          </Link>
        </div>
      </div>
    </>
  );
}
