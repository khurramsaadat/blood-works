import type { Metadata } from "next";
import SymptomChecker from "@/components/symptom-checker";

export const metadata: Metadata = {
  title: "Analyze a report",
  description:
    "Upload a blood report photo and get every value matched to its range, per-system scores, care actions and supplements – plus Sai, your AI assistant.",
};

export default function AnalyzePage() {
  return <SymptomChecker />;
}
