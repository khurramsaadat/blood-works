import type { Metadata } from "next";
import SymptomChecker from "@/components/symptom-checker";

export const metadata: Metadata = {
  title: "Symptom checker",
  description:
    "Describe how you feel and get a clear, evidence-ordered read with next steps. Free, private, in your browser.",
};

export default function SymptomsPage() {
  return <SymptomChecker />;
}
