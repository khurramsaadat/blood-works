import type { LabResult } from "@/lib/lab";

/* ---------------- Plain-text report builder (shared by download + share) ---------------- */

function statusWord(status: string): string {
  return status === "normal" ? "In range" : status === "low" ? "Below range" : "Above range";
}

export function buildReportText(lab: LabResult, sourceText?: string): string {
  const lines: string[] = [];
  const now = new Date();
  lines.push("BLOODWORKS HEALTH – LAB REPORT ANALYSIS");
  lines.push(`Generated: ${now.toDateString()}`);
  lines.push("=".repeat(52));

  // System health scores
  lines.push("");
  lines.push("SYSTEM HEALTH SCORES");
  lines.push("-".repeat(52));
  for (const s of lab.systems) {
    lines.push(
      `${s.name.padEnd(26)} ${String(s.score).padStart(3)}%  [${s.status === "in" ? "IN RANGE" : s.status === "watch" ? "WATCH" : "OUT OF RANGE"}]  (${s.abnormal}/${s.total} out of range)`
    );
  }

  // Biomarkers
  lines.push("");
  lines.push("BIOMARKERS");
  lines.push("-".repeat(52));
  for (const r of lab.rows) {
    const flag = r.status === "normal" ? "" : r.status === "low" ? "  LOW" : "  HIGH";
    lines.push(
      `${r.test.label.padEnd(30)} ${String(r.value).padStart(10)} ${r.test.unit.padEnd(10)} ref ${r.test.low}-${r.test.high}${flag}`
    );
  }

  // Findings
  if (lab.findings.length) {
    lines.push("");
    lines.push("FINDINGS");
    lines.push("-".repeat(52));
    for (const f of lab.findings) {
      lines.push(`${f.name} [ICD-10 ${f.icd10}] – ${f.explanation}`);
    }
  }

  // Primary diagnosis + prescription
  if (lab.primary) {
    lines.push("");
    lines.push("DEFINITIVE DIAGNOSIS");
    lines.push("-".repeat(52));
    lines.push(`${lab.primary.name}  [ICD-10 ${lab.primary.icd10}]  Confidence ${lab.confidence}%`);
    lines.push(lab.primary.explanation);
    lines.push("");
    lines.push("PRESCRIPTION");
    lines.push(`  Medication : ${lab.primary.prescription.medication}`);
    lines.push(`  Dosage     : ${lab.primary.prescription.dosage}`);
    lines.push(`  Frequency  : ${lab.primary.prescription.frequency}`);
    lines.push(`  Duration   : ${lab.primary.prescription.duration}`);
    lines.push(`  Notes      : ${lab.primary.prescription.notes}`);
  } else {
    lines.push("");
    lines.push("DEFINITIVE DIAGNOSIS");
    lines.push("-".repeat(52));
    lines.push("All values within reference range. No treatment indicated – recheck periodically.");
  }

  // Care actions
  if (lab.actions.length) {
    lines.push("");
    lines.push("CARE ACTIONS");
    lines.push("-".repeat(52));
    for (const a of lab.actions) {
      lines.push(`[${a.level}] ${a.title} (${a.timeframe})`);
      lines.push(`      ${a.detail}`);
    }
  }

  // Supplements
  if (lab.supplements.length) {
    lines.push("");
    lines.push("SUPPLEMENT PLAN");
    lines.push("-".repeat(52));
    for (const s of lab.supplements) {
      lines.push(`${s.name} – ${s.dose}, ${s.timing} (supports ${s.improves})`);
    }
  }

  if (sourceText && sourceText.trim()) {
    lines.push("");
    lines.push("RAW REPORT TEXT (AS CAPTURED BY OCR)");
    lines.push("-".repeat(52));
    lines.push(sourceText.trim());
  }

  return lines.join("\n");
}

/* ---------------- Sai transcript builder ---------------- */

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ReportSummary = { primary: string; date: string } | null | undefined;

export function buildSaiTranscript(
  turns: ChatTurn[],
  lab?: ReportSummary
): string {
  const lines: string[] = [];
  const now = new Date();
  lines.push("Sai – AI Health Assistant · Conversation");
  lines.push(`BloodWorks Health · ${now.toDateString()}`);
  lines.push("=".repeat(52));
  if (lab) {
    lines.push(`Report context: ${lab.primary}`);
    lines.push("");
  }
  for (const t of turns) {
    lines.push(`${t.role === "user" ? "You" : "Sai"}:`);
    lines.push(t.content.trim());
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

/* ---------------- Download + share ---------------- */

export function downloadText(filename: string, text: string, mime = "text/plain"): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function shareText(text: string, title: string): Promise<"shared" | "copied" | "failed"> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch {
      // user dismissed the share sheet – fall through to copy
    }
  }
  return copyText(text);
}

export async function copyText(text: string): Promise<"copied" | "failed"> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return "copied";
    } catch {
      return "failed";
    }
  }
}

export function reportStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}
