import type { LabResult } from "@/lib/lab";
import { reportStamp } from "./report-export";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

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

/* ---------------- WinAnsi-safe text ---------------- */

/**
 * jsPDF's built-in Helvetica only encodes WinAnsi. Any character outside that
 * map (for example the superscript ⁶ in "×10⁶/µL") makes jsPDF fall back to a
 * raw UTF-16 stream, which renders as garbage in the PDF. Map superscripts and
 * subscripts to ^n / _n and decompose anything else to a safe ASCII form.
 */
const SUPERSCRIPT: Record<string, string> = {
  "\u2070": "^0", "\u00B9": "^1", "\u00B2": "^2", "\u00B3": "^3", "\u2074": "^4",
  "\u2075": "^5", "\u2076": "^6", "\u2077": "^7", "\u2078": "^8", "\u2079": "^9",
};
const SUBSCRIPT: Record<string, string> = {
  "\u2080": "_0", "\u2081": "_1", "\u2082": "_2", "\u2083": "_3", "\u2084": "_4",
  "\u2085": "_5", "\u2086": "_6", "\u2087": "_7", "\u2088": "_8", "\u2089": "_9",
};
const WINANSI_EXTRA = new Set([
  "\u20AC", "\u201A", "\u0192", "\u201E", "\u2026", "\u2020", "\u2021", "\u02C6", "\u2030",
  "\u0160", "\u2039", "\u0152", "\u017D", "\u2018", "\u2019", "\u201C", "\u201D", "\u2022",
  "\u2013", "\u2014", "\u02DC", "\u2122", "\u0161", "\u203A", "\u0153", "\u017E", "\u0178",
]);

function pdfText(input: string): string {
  let out = "";
  for (const ch of input) {
    const sup = SUPERSCRIPT[ch];
    if (sup) { out += sup; continue; }
    const sub = SUBSCRIPT[ch];
    if (sub) { out += sub; continue; }
    const code = ch.codePointAt(0) ?? 0;
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) { out += ch; continue; }
    if (WINANSI_EXTRA.has(ch)) { out += ch; continue; }
    // Decompose accented / exotic characters (é → e), drop anything left over.
    const plain = ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    for (const c of plain) {
      const cc = c.codePointAt(0) ?? 0;
      if ((cc >= 0x20 && cc <= 0x7e) || (cc >= 0xa0 && cc <= 0xff)) out += c;
    }
  }
  return out;
}

/** Route every string through pdfText() so no unmappable glyph reaches the PDF. */
function sanitizeDocText(doc: jsPDF): void {
  const originalText = doc.text.bind(doc);
  (doc as unknown as { text: typeof doc.text }).text = ((text: string | string[], x: number, y: number, options?: unknown) => {
    const safe = Array.isArray(text) ? text.map(pdfText) : pdfText(text);
    return originalText(safe, x, y, options as never);
  }) as typeof doc.text;
  const originalSplit = doc.splitTextToSize.bind(doc);
  (doc as unknown as { splitTextToSize: typeof doc.splitTextToSize }).splitTextToSize = ((text: string, size: number, options?: unknown) =>
    originalSplit(pdfText(text), size, options as never)) as typeof doc.splitTextToSize;
}

/* ---------------- Ring chart (canvas → PNG data URL, jsPDF-safe) ---------------- */

function ringPng(pct: number, color: string): string {
  const size = 128; // 2x the 64px placement size for crispness
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  ctx.lineCap = "round";
  ctx.lineWidth = 18;
  // Track
  ctx.strokeStyle = LINE;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Value arc: 12 o'clock, clockwise
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.min(100, Math.max(0, pct)) / 100) * Math.PI * 2, false);
  ctx.stroke();
  // Center label
  ctx.fillStyle = INK;
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(pct)}%`, cx, cy + 1);
  return canvas.toDataURL("image/png");
}

/** Page break helper: return the y position, starting a new page if needed. */
function ensureSpace(doc: jsPDF, y: number, need: number): number {
  if (y + need > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    return 20;
  }
  return y;
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

  // Only systems that actually had values on this report are scored. Systems
  // with no matching biomarker are omitted rather than printed as "not
  // evaluated", so the page reads as a result, not a form.
  const evaluated = lab.systems.filter((s) => s.total > 0);
  const colW = (doc.internal.pageSize.getWidth() - 32) / 3;
  const cellH = 58;
  const rowsCount = Math.ceil(evaluated.length / 3);
  for (let r = 0; r < rowsCount; r++) {
    y = ensureSpace(doc, y, cellH);
    const baseY = y;
    for (let c = 0; c < 3; c++) {
      const i = r * 3 + c;
      if (i >= evaluated.length) break;
      const s = evaluated[i];
      const x = 16 + c * colW + 10;
      const status: Status = s.status === "in" ? "normal" : s.status === "watch" ? "watch" : "out";
      const color = STATUS_COLOR[status];

      const img = ringPng(s.score, color);
      if (img) doc.addImage(img, "PNG", x, baseY, 40, 40);
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
    y = baseY + cellH + 8;
  }
  if (evaluated.length < lab.systems.length) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(MUTED);
    doc.text(
      "Systems without values on this report are omitted.",
      16,
      y
    );
    y += 10;
  }
  return y;
}

function buildBiomarkersPage(doc: jsPDF, lab: LabResult, startY: number): number {
  const header = [["Test", "Value", "Unit", "Reference", "Status"]];
  const rows = lab.rows.map((r) => [
    r.test.label,
    String(r.value),
    r.test.unit,
    `${r.test.low}\u2013${r.test.high}`,
    r.status === "normal" ? "In range" : r.status === "low" ? "Below range" : "Above range",
  ]);

  autoTable(doc as any, {
    head: header,
    body: rows,
    startY,
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
  const finalY = (doc as any).lastAutoTable?.finalY ?? doc.internal.pageSize.getHeight();
  return finalY + 14;
}

export function downloadPdfReport(lab: LabResult, ocrText?: string): void {
  const doc = new jsPDF({ unit: "px", format: "a4" });
  sanitizeDocText(doc);
  const w = doc.internal.pageSize.getWidth();

  // ---------- Page 1 ----------
  const yAfterSystems = buildSystemsPage(doc, lab);
  let y = yAfterSystems;
  if (lab.rows.length) {
    y = ensureSpace(doc, y, 40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DEEP);
    doc.text("BIOMARKERS", 16, y);
    doc.setDrawColor(ACCENT);
    doc.setLineWidth(0.7);
    doc.line(16, y + 3, 68, y + 3);
    y = buildBiomarkersPage(doc, lab, y + 12);
  }

  // ---------- Page 2 ----------
  doc.addPage();
  y = headerPage(doc, "Diagnosis · Care Plan · Supplements", reportStamp()) + 10;

  if (lab.primary) {
    y = ensureSpace(doc, y, 80);
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
    if (y + explanation.length * 6 > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(10);
    doc.setTextColor(INK);
    doc.text(explanation, 16, y);
    y += explanation.length * 6 + 14;
  }

  y = ensureSpace(doc, y, 70);
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
      y += lines.length * 8 + 4;
      const notes = doc.splitTextToSize(`Notes: ${p.notes}`, w - 32);
      if (y + notes.length * 6 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(9);
      doc.setTextColor(MUTED);
      doc.text(notes, 16, y);
      y += notes.length * 6 + 10;
    } else {
      y += lines.length * 8 + 12;
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("All values within reference range. No treatment indicated \u2013 recheck periodically.", 16, y);
    y += 16;
  }

  y = ensureSpace(doc, y, 50);
  y = sectionHeading(doc, y, "CARE ACTIONS");
  if (lab.actions.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    lab.actions.forEach((a) => {
      const levelColor = { L1: ACCENT, L2: "#b7791f", L3: "#b3261e" }[a.level];
      const detail = doc.splitTextToSize(a.detail, w - 32 - 16);
      const needed = 8 + detail.length * 6 + 18;
      if (y + needed > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(levelColor);
      doc.setFont("helvetica", "bold");
      doc.text(`[${a.level}] ${a.title}`, 16, y);
      doc.setTextColor(INK);
      doc.setFont("helvetica", "normal");
      doc.text(detail, 30, y + 8);
      doc.setTextColor(MUTED);
      doc.setFontSize(8.5);
      doc.text(a.timeframe, 30, y + 8 + detail.length * 6 + 2);
      y += needed;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("No care actions required.", 16, y);
    y += 14;
  }

  y = ensureSpace(doc, y, 50);
  y = sectionHeading(doc, y, "SUPPLEMENT PLAN");
  if (lab.supplements.length) {
    doc.setFontSize(9);
    lab.supplements.forEach((s) => {
      if (y + 20 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(INK);
      doc.setFont("helvetica", "bold");
      doc.text(s.name, 16, y);
      doc.setTextColor(MUTED);
      doc.setFont("helvetica", "normal");
      doc.text(`${s.dose}, ${s.timing} · supports ${s.improves}`, 16, y + 7);
      y += 15;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("No supplements recommended.", 16, y);
    y += 14;
  }

  if (ocrText && ocrText.trim()) {
    const raw = doc.splitTextToSize(ocrText.trim(), w - 32);
    const needed = 14 + raw.length * 6;
    if (y + Math.min(needed, 100) > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
    y += 6;
    y = sectionHeading(doc, y, "RAW REPORT TEXT (AS CAPTURED BY OCR)");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    const pageH = doc.internal.pageSize.getHeight();
    let offset = 0;
    let cur = y;
    while (offset < raw.length) {
      const batch = Math.max(1, Math.floor((pageH - 30 - cur) / 6));
      doc.text(raw.slice(offset, offset + batch), 16, cur);
      offset += batch;
      if (offset < raw.length) {
        doc.addPage();
        cur = 20;
      }
    }
  }

  doc.save(`bloodworks-analysis_${reportStamp()}.pdf`);
}
