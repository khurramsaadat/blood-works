import type { Metadata } from "next";
import ContentPage from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The rules for using BloodWorks Health, including how the analysis is produced and how your data is handled.",
};

export default function Terms() {
  return (
    <ContentPage
      title="Terms of service"
      intro="The rules for using BloodWorks Health, in plain language. How the analysis is produced, and how your data is handled, come first."
      updated="November 2026"
      blocks={[
        { h: "What BloodWorks provides" },
        {
          p: "BloodWorks Health reads the numbers on your lab report, matches each one to its reference range, and produces a scored analysis with a care plan. The output is generated from the text you confirm on screen by our lab engine and by Sai, the built-in assistant. It reflects the values in that text, with an ICD-10 code attached to each finding.",
        },
        { h: "Accuracy" },
        {
          p: "The analysis depends on the image quality of your report and on the extracted text, which you can review and correct before acting on anything. If a value was misread or a test is missing from your report, the results it produces will be incomplete. You are responsible for checking the transcript against your original document.",
        },
        { h: "Your data" },
        {
          p: "By using BloodWorks Health you confirm that the report you analyze is yours or that you may process it. Data handling follows our privacy policy: images and sessions are stored in your browser’s local storage and only your chat questions are sent to our assistant service.",
        },
        { h: "Use of the service" },
        {
          list: [
            "Use the service for personal, non-commercial purposes unless we agree otherwise.",
            "Do not attempt to disrupt, reverse-engineer or load the service beyond normal use.",
            "We may update the service; the versions you use are governed by the terms in place at that time.",
          ],
        },
        { h: "Limitation of liability" },
        {
          p: "BloodWorks Health is provided as-is. To the maximum extent permitted by law, we are not liable for losses arising from decisions made on the basis of the analysis. Nothing in these terms limits rights you cannot waive by contract.",
        },
        { h: "Contact" },
        {
          p: "Questions about these terms: hello@bloodworks.health.",
        },
      ]}
    />
  );
}
