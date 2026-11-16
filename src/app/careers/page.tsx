import type { Metadata } from "next";
import ContentPage from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "BloodWorks Health is hiring remote-first across engineering, clinical content and design. See the open roles and how we work.",
};

export default function Careers() {
  return (
    <>
      <ContentPage
        title="Careers at BloodWorks Health"
        intro="We build medical intelligence tools from a small, distributed team. Every role is remote-first – no office, no commute. You choose the time zone; we choose async by default."
        updated="November 2026"
        blocks={[
          { h: "How we work" },
          {
            list: [
              "Remote-first, always. Interviews, planning and demos happen over video and written docs.",
              "Async by default. Decisions are made in writing; meetings are the exception, not the routine.",
              "Small team, shipped products. You will own features end to end, from spec to production.",
              "Healthcare gravity. Everyone here, from engineering to design, works on products people read about their own bodies.",
            ],
          },
          { h: "Open roles" },
          {
            list: [
              "Senior frontend engineer – TypeScript, Next.js, data-viz. Own the analysis engine UI and the on-device OCR pipeline.",
              "Medical content lead – translate lab science into definitive, plain-English explanations. MD or lab-science background.",
              "Product designer – system scores, care plans and mobile flows. Portfolio over credentials.",
            ],
          },
          { h: "How to apply" },
          {
            p: "Email hello@bloodworks.health with the role in the subject line and a link to your work. No cover letters longer than a paragraph, no CVs longer than two pages. We reply to every application within five working days.",
          },
          { h: "If nothing above fits" },
          {
            p: "The roadmap includes multi-language reports, PDF export, and a physician review layer. If one of those is your specialty, write to us anyway.",
          },
        ]}
      />
    </>
  );
}
