import type { Metadata } from "next";
import ContentPage from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What BloodWorks Health stores, where it lives, and what never leaves your device. Short, plain, no legalese.",
};

export default function Privacy() {
  return (
    <ContentPage
      title="Privacy policy"
      intro="The short version: your medical images live in your browser. We do not run a database of your reports."
      updated="November 2026"
      blocks={[
        { h: "What stays on your device" },
        {
          list: [
            "The image of each report you analyze, stored as a data URL in your browser’s local storage under a “Your reports” list.",
            "The extracted and edited OCR text, the computed analysis, and your full conversation with Sai.",
            "Your theme preference (day or dark).",
          ],
        },
        {
          p: "Local storage belongs to your browser, on your device, for this origin. Clearing your browser data – or using the “Clear saved reports” button after confirmation – removes it completely. We have no server-side copy.",
        },
        { h: "What we send over the network" },
        {
          list: [
            "Nothing, unless you talk to Sai. Each question you send goes to our assistant service together with the transcript of your report as context, and only for that request.",
            "Page assets (fonts and the OCR engine) are fetched from their original publishers when your browser requests them.",
          ],
        },
        { h: "What we never do" },
        {
          list: [
            "We never upload your report image to a server.",
            "We never sell or share your data with third parties.",
            "We never require an account to use the service.",
          ],
        },
        { h: "Your rights" },
        {
          p: "Because the data is yours, on your device, the rights are simple: you can read it (the reports list), you can export it (download or share buttons), and you can delete it (per report or all at once). If you want anything else, write to hello@bloodworks.health.",
        },
      ]}
    />
  );
}
