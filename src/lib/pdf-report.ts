import type { LabResult } from "@/lib/lab";
import { reportStamp } from "./report-export";
import jsPDF from "jspdf";
import "jspdf-autotable";

/* ---------------- Theme (matches the website) ---------------- */

const DEEP = "#0f6e60";      // --brand-deep
const ACCENT = "#3cbab4";    // --accent
const MINT = "#f0f8f4";      // --bg
const INK = "#0e1612";       // --foreground
const MUTED = "#6b7a70";     // --muted
const LINE = "#cdd9d2";      // --border-c

const STATUS_COLOR = {
  normal: "#1b7a46",
  watch: "#b7791f",
  out: "#b3261e",
} as const;

type Status = "normal" | "watch" | "out";

function labStatusToPdf(status: string): Status {
  return status === "normal" ? "normal" : status === "low" || status === "high" ? "out" : "watch";
}

/* ---------------- Ring chart (SVG → data URL) ---------------- */

function ringSvg(pct: number, color: string): string {
  const size = 64;
  const stroke = 8;
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - stroke / 2 - 2;
  const dash = (pct / 100) * 2 * Math.PI * r;
  const gap = 2 * Math.PI * r - dash;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${LINE}" stroke-width="${stroke}" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy + 5}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${INK}" text-anchor="middle">${Math.round(pct)}%</text>
    </svg>`)}`;
}

/* ---------------- Page builders ---------------- */

function headerPage(doc: jsPDF, title: string, subtitle: string): number {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(DEEP);
  doc.rect(0, 0, w, 42, "F");
  doc.setFillColor(ACCENT);
  doc.rect(0, 42, w, 4, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BLOODWORKS HEALTH", 16, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Lab report intelligence · " + title, 16, 34);
  doc.setTextColor(ACCENT);
  doc.setFontSize(10);
  doc.text(subtitle, w - 16, 22, { align: "right" });
  return 56;
}

function sectionHeading(doc: jsPDF, y: number, text: string): number {
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DEEP);
  doc.text(text, 16, y);
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(0.7);
  doc.line(16, y + 3, 16 + 52, y + 3);
  return y + 14;
}

function buildSystemsPage(doc: jsPDF, lab: LabResult): number {
  let y = headerPage(doc, "System Health Scores", reportStamp()) + 10;
  y = sectionHeading(doc, y, "SYSTEM HEALTH SCORES");

  const colW = (doc.internal.pageSize.getWidth() - 32) / 3;
  for (let i = 0; i < lab.systems.length; i++) {
    const s = lab.systems[i];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 16 + col * colW + 10;
    const baseY = y + row * 56;

    const status: Status = s.status === "in" ? "normal" : s.status === "watch" ? "watch" : "out";
    const color = STATUS_COLOR[status];
    const img = ringSvg(s.score, color);

    doc.addImage(img, "PNG", x, baseY, 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(INK);
    doc.setFont("helvetica", "bold");
    doc.text(s.name, x + 46, baseY + 10, { maxWidth: colW - 56 });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(`${s.abnormal} of ${s.total} out of range  ·  ${status.toUpperCase()}`, x + 46, baseY + 22);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(color);
    doc.text(`${s.score}%`, x + 46, baseY + 36);
  }

  y += Math.ceil(lab.systems.length / 3) * 56 + 16;
  return y;
}

function buildBiomarkersPage(doc: jsPDF, lab: LabResult): void {
  const header = [["Test", "Value", "Unit", "Reference", "Status"]];
  const rows = lab.rows.map((r) => [
    r.test.label,
    String(r.value),
    r.test.unit,
    `${r.test.low}–${r.test.high}`,
    r.status === "normal" ? "In range" : r.status === "low" ? "Below range" : "Above range",
  ]);

  (doc as any).autoTable({
    head: header,
    body: rows,
    startY: 20,
    theme: "grid",
    headStyles: { fillColor: DEEP, textColor: "#ffffff", fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 9.5, textColor: INK },
    alternateRowStyles: { fillColor: MINT },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 28, halign: "center" },
      3: { cellWidth: 44, halign: "center" },
      4: { cellWidth: 44, halign: "center" },
    },
    didDrawCell: (data: any) => {
      if (data.section === "body" && data.column.index === 4) {
        const status = lab.rows[data.row.index].status;
        const color = STATUS_COLOR[labStatusToPdf(status)];
        doc.setTextColor(color);
        doc.setFont("helvetica", "bold");
      }
    },
  });
}

export function downloadPdfReport(lab: LabResult, ocrText?: string): void {
  const doc = new jsPDF({ unit: "px", format: "a4" });
  const w = doc.internal.pageSize.getWidth();

  // ---------- Page 1 ----------
  buildSystemsPage(doc, lab);
  const y1 = 20 + Math.ceil(lab.systems.length / 3) * 56 + 30;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(DEEP);
  doc.text("BIOMARKERS", 16, y1);
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(0.7);
  doc.line(16, y1 + 3, 68, y1 + 3);
  buildBiomarkersPage(doc, lab);

  // ---------- Page 2 ----------
  doc.addPage();
  let y = headerPage(doc, "Diagnosis · Care Plan · Supplements", reportStamp()) + 10;

  if (lab.primary) {
    y = sectionHeading(doc, y, "DEFINITIVE DIAGNOSIS");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(INK);
    doc.text(lab.primary.name, 16, y);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(`ICD-10: ${lab.primary.icd10}   ·   Confidence: ${lab.confidence}%`, 16, y + 12);
    y += 24;
    const explanation = doc.splitTextToSize(lab.primary.explanation, w - 32);
    doc.setFontSize(10);
    doc.setTextColor(INK);
    doc.text(explanation, 16, y);
    y += explanation.length * 6 + 14;
  }

  y = sectionHeading(doc, y, "PRESCRIPTION");
  if (lab.primary) {
    const p = lab.primary.prescription;
    const lines = [
      `Medication : ${p.medication}`,
      `Dosage     : ${p.dosage}`,
      `Frequency  : ${p.frequency}`,
      `Duration   : ${p.duration}`,
    ];
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(INK);
    lines.forEach((l, i) => {
      doc.text(l, 16, y + i * 8);
    });
    if (p.notes) {
      doc.setFontSize(9);
      doc.setTextColor(MUTED);
      doc.text(`Notes: ${p.notes}`, 16, y + lines.length * 8 + 6);
      y += lines.length * 8 + 16;
    } else {
      y += lines.length * 8 + 12;
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("All values within reference range. No treatment indicated – recheck periodically.", 16, y);
    y += 16;
  }

  y = sectionHeading(doc, y, "CARE ACTIONS");
  if (lab.actions.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    lab.actions.forEach((a) => {
      const levelColor = { L1: ACCENT, L2: "#b7791f", L3: "#b3261e" }[a.level];
      doc.setTextColor(levelColor);
      doc.setFont("helvetica", "bold");
      doc.text(`[${a.level}] ${a.title}`, 16, y);
      doc.setTextColor(INK);
      doc.setFont("helvetica", "normal");
      const detail = doc.splitTextToSize(a.detail, w - 32 - 16);
      doc.text(detail, 30, y + 8);
      doc.setTextColor(MUTED);
      doc.setFontSize(8.5);
      doc.text(a.timeframe, 30, y + 8 + detail.length * 6 + 2);
      y += 8 + detail.length * 6 + 16;
      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("No care actions required.", 16, y);
    y += 14;
  }

  y = sectionHeading(doc, y, "SUPPLEMENT PLAN");
  if (lab.supplements.length) {
    doc.setFontSize(9);
    lab.supplements.forEach((s) => {
      doc.setTextColor(INK);
      doc.setFont("helvetica", "bold");
      doc.text(s.name, 16, y);
      doc.setTextColor(MUTED);
      doc.setFont("helvetica", "normal");
      doc.text(`${s.dose}, ${s.timing} · supports ${s.improves}`, 16, y + 7);
      y += 15;
      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        y = 20;
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("No supplements recommended.", 16, y);
    y += 14;
  }

  if (ocrText && ocrText.trim()) {
    y += 6;
    if (y > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      y = 20;
    }
    y = sectionHeading(doc, y, "RAW REPORT TEXT (AS CAPTURED BY OCR)");
    const raw = doc.splitTextToSize(ocrText.trim(), w - 32);
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(raw, 16, y);
  }

  doc.save(`bloodworks-analysis_${reportStamp()}.pdf`);
}
