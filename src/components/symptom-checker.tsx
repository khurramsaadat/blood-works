"use client";

import { useCallback, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import AssistantChat from "@/components/assistant-chat";
import { parseLabReport, type LabResult } from "@/lib/lab";

/* ---------------- Symptom knowledge base ---------------- */

type Prescription = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
};

type Diagnosis = {
  id: string;
  name: string;
  icd10: string;
  symptoms: string[];
  prescription: Prescription;
};

const KNOWLEDGE_BASE: Diagnosis[] = [
  {
    id: "cold",
    name: "Common Cold (Acute Nasopharyngitis)",
    icd10: "J00",
    symptoms: ["runny nose", "sneezing", "sore throat", "mild headache", "fatigue", "congestion", "cough"],
    prescription: {
      medication: "Paracetamol + Phenylephrine + Chlorpheniramine",
      dosage: "1 tablet (500mg / 10mg / 2mg)",
      frequency: "Every 8 hours",
      duration: "5 days",
      notes: "Adequate hydration and rest. Cough syrup (dextromethorphan 10mg) at night if productive cough persists.",
    },
  },
  {
    id: "headache",
    name: "Tension-Type Headache",
    icd10: "G44.2",
    symptoms: ["headache", "pressure around head", "neck pain", "stress", "temples", "mild nausea", "visual strain"],
    prescription: {
      medication: "Ibuprofen",
      dosage: "400mg",
      frequency: "Every 6–8 hours with food, max 3 times daily",
      duration: "Up to 5 days",
      notes: "Hydration, screen breaks, and heat packs on the neck. Avoid caffeine excess.",
    },
  },
  {
    id: "gastritis",
    name: "Gastritis / Acid Reflux (GERD)",
    icd10: "K29.0 / K21.9",
    symptoms: ["heartburn", "stomach pain", "acidity", "bloating", "nausea", "indigestion", "burning chest", "belching"],
    prescription: {
      medication: "Omeprazole + Antacid (aluminum magnesium hydroxide)",
      dosage: "20mg capsule + 10ml syrup",
      frequency: "Omeprazole once daily, 30 min before breakfast; antacid after meals as needed",
      duration: "14 days",
      notes: "Avoid spicy/fatty food, late meals, and alcohol. Elevate head of bed 15cm.",
    },
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (Uncomplicated)",
    icd10: "N39.0",
    symptoms: ["burning urination", "frequent urination", "urinary urgency", "lower abdominal pain", "cloudy urine", "blood in urine", "fever"],
    prescription: {
      medication: "Nitrofurantoin Monohydrate",
      dosage: "100mg",
      frequency: "Twice daily after meals",
      duration: "5 days",
      notes: "Minimum 2 liters of water daily. Complete full antibiotic course even if symptoms resolve early.",
    },
  },
  {
    id: "allergy",
    name: "Allergic Rhinitis / Urticaria",
    icd10: "J30.0 / L50",
    symptoms: ["itching", "hives", "sneezing", "runny nose", "watery eyes", "skin rash", "swelling", "itchy eyes"],
    prescription: {
      medication: "Cetirizine + Hydrocortisone cream 1%",
      dosage: "10mg tablet + 1 thin layer to affected skin",
      frequency: "Cetirizine once daily at night; cream twice daily",
      duration: "10 days",
      notes: "Identify and avoid the trigger. Cold compresses for acute swelling episodes.",
    },
  },
  {
    id: "pharyngitis",
    name: "Acute Pharyngitis",
    icd10: "J02.9",
    symptoms: ["sore throat", "difficulty swallowing", "swollen glands", "fever", "red throat", "pain swallowing", "hoarse voice"],
    prescription: {
      medication: "Amoxicillin 500mg + Diclofenac + Chlorhexidine gargle",
      dosage: "500mg capsule + 50mg tablet + 10ml gargle",
      frequency: "Amoxicillin every 8 hours; diclofenac with meals; gargle twice daily",
      duration: "7 days",
      notes: "Warm salt-water gargles, soft diet, voice rest, full fluids.",
    },
  },
  {
    id: "bronchitis",
    name: "Acute Bronchitis",
    icd10: "J20",
    symptoms: ["cough", "chest discomfort", "phlegm", "mucus", "wheezing", "fatigue", "low grade fever", "shortness of breath"],
    prescription: {
      medication: "Ambroxol 30mg + Levocetirizine + Mucolytic syrup",
      dosage: "30mg + 5mg",
      frequency: "Ambroxol twice daily before meals; levocetirizine at night",
      duration: "7 days",
      notes: "Steam inhalation twice daily, humidified room, avoid smoke exposure.",
    },
  },
  {
    id: "conjunctivitis",
    name: "Viral Conjunctivitis",
    icd10: "H13.2",
    symptoms: ["red eyes", "watery eyes", "eye discharge", "itchy eyes", "eye irritation", "sensitive to light", "swollen eyes"],
    prescription: {
      medication: "Carboxymethylcellulose lubricant + Chloramphenicol eye drops",
      dosage: "1 drop each",
      frequency: "Lubricant every 4 hours; antibiotic drop 3 drops in each eye, 4 times daily",
      duration: "7 days",
      notes: "Strict hand hygiene — replace towels daily. No contact lenses until course completes.",
    },
  },
  {
    id: "dermatitis",
    name: "Atopic Dermatitis Flare",
    icd10: "L20",
    symptoms: ["dry skin", "skin rash", "itching", "red patches", "eczema", "skin cracking", "burning skin"],
    prescription: {
      medication: "Mometasone furoate cream 0.1% + Emollient ointment + Levocetirizine",
      dosage: "Thin layer + 10mg",
      frequency: "Steroid once nightly; emollient 3× daily; tablet at night",
      duration: "14 days",
      notes: "Lukewarm short baths, fragrance-free moisturizer, cotton clothing only, nails short.",
    },
  },
  {
    id: "migraine",
    name: "Migraine",
    icd10: "G43.909",
    symptoms: ["severe headache", "nausea", "visual aura", "sensitive to light", "sensitive to sound", "one sided headache", "throbbing headache"],
    prescription: {
      medication: "Sumatriptan 50mg + Metoclopramide + Ibuprofen",
      dosage: "50mg + 10mg + 400mg",
      frequency: "Single dose at onset, may repeat once after 2h if needed",
      duration: "Up to 2 tablets per 24h, max 8 per month",
      notes: "Dark quiet room, cold compress on forehead, small caffeine-free fluids. Acute-treatment only.",
    },
  },
];

type SymptomResult =
  | { kind: "match"; diagnosis: Diagnosis; matched: string[]; score: number }
  | { kind: "inconclusive" };

function analyzeSymptoms(input: string): SymptomResult {
  const text = input.toLowerCase();
  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);

  let best: { diagnosis: Diagnosis; matched: string[] } | null = null;
  for (const d of KNOWLEDGE_BASE) {
    const matched = d.symptoms.filter((s) => {
      if (text.includes(s.toLowerCase())) return true;
      const parts = s.toLowerCase().split(" ");
      return parts.every((p) => tokens.includes(p)) && parts.length > 1;
    });
    if (matched.length > 0 && (!best || matched.length > best.matched.length)) {
      best = { diagnosis: d, matched };
    }
  }
  if (!best) return { kind: "inconclusive" };
  return {
    kind: "match",
    diagnosis: best.diagnosis,
    matched: best.matched,
    score: Math.min(100, best.matched.length * 20),
  };
}

/* ---------------- Combined analysis ---------------- */

type Analysis = {
  lab: LabResult | null;
  symptom: SymptomResult | null;
};

export function analyzeAll(text: string): Analysis {
  return { lab: parseLabReport(text), symptom: analyzeSymptoms(text) };
}

/* ---------------- View helpers (Siphox palette) ---------------- */

const statusStyle: Record<string, string> = {
  normal: "text-emerald-600",
  low: "text-amber-600",
  high: "text-red-600",
};

const statusLabel: Record<string, string> = {
  in: "In range",
  watch: "Watch",
  out: "Out of range",
};

const systemBadge: Record<string, { bg: string; text: string }> = {
  in: { bg: "bg-emerald-50", text: "text-emerald-700" },
  watch: { bg: "bg-amber-50", text: "text-amber-700" },
  out: { bg: "bg-red-50", text: "text-red-600" },
};

const levelBadge: Record<string, string> = {
  L1: "bg-red-50 text-red-600 border-red-200",
  L2: "bg-amber-50 text-amber-700 border-amber-200",
  L3: "bg-blue-50 text-blue-600 border-blue-200",
};

function ScoreRing({ score }: { score: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
      />
    </svg>
  );
}

function Card({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-500">
          {title}
        </span>
        {meta ? <span className="text-xs text-gray-400">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Component ---------------- */

type OcrState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "progress"; pct: number }
  | { status: "done"; text: string; image: string }
  | { status: "error"; message: string };

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [ocr, setOcr] = useState<OcrState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<"report" | "symptom">("report");
  const [saiOpen, setSaiOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const runOcr = useCallback(async (file: File) => {
    const image = URL.createObjectURL(file);
    setOcr({ status: "loading" });
    try {
      // Preprocess: upscale small photos, grayscale + boost contrast so OCR
      // can read low-resolution report photos.
      let ocrInput: File | HTMLCanvasElement = file;
      const loaded = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not decode the image."));
        img.src = image;
      });
      const canvas = document.createElement("canvas");
      const scale = Math.min(2, Math.max(1, 1600 / Math.max(loaded.naturalWidth, loaded.naturalHeight)));
      canvas.width = Math.round(loaded.naturalWidth * scale);
      canvas.height = Math.round(loaded.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(loaded, 0, 0, canvas.width, canvas.height);
        ctx.filter = "grayscale(1) contrast(1.35) brightness(1.05)";
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = "none";
        ocrInput = canvas;
      }
      const { data } = await Tesseract.recognize(ocrInput, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcr({ status: "progress", pct: Math.round(m.progress * 100) });
          }
        },
      });
      setOcr({ status: "done", text: data.text.trim(), image });
      setAnalysis(analyzeAll(data.text));
    } catch (e) {
      setOcr({ status: "error", message: e instanceof Error ? e.message : "Could not read this image." });
    }
  }, []);

  const onFile = (file: File | undefined | null) => {
    if (file && file.type.startsWith("image/")) runOcr(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFile(e.dataTransfer.files?.[0]);
  };

  const lab = analysis?.lab ?? null;
  const symptom = analysis?.symptom ?? null;
  const showingLab = !!lab;
  const assistantContext = lab ? (ocr.status === "done" ? ocr.text : "") : input;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 font-sans">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-[#3cbab4] flex items-center justify-center text-white font-bold text-lg">
            B
          </span>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">BloodWorks Health</h1>
            <p className="text-[11px] text-gray-400">Lab report intelligence · diagnoses · care plan</p>
          </div>
        </div>
        <button
          onClick={() => setSaiOpen(true)}
          className="flex items-center gap-2 bg-[#1677ff] hover:bg-[#1677ff]/90 text-white text-sm font-medium rounded-full pl-3 pr-4 py-2 shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-white" />
          Ask Sai
        </button>
      </header>

      <div className="w-full max-w-5xl space-y-5">
        {/* Tabs */}
        <div className="inline-flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setTab("report")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "report"
                ? "bg-[#1677ff] text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Analyze a Report
          </button>
          <button
            onClick={() => setTab("symptom")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "symptom"
                ? "bg-[#1677ff] text-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Check Symptoms
          </button>
        </div>

        {/* ============ REPORT UPLOAD ============ */}
        {tab === "report" && (
          <div
            className="w-full bg-white border rounded-2xl shadow-sm p-6 space-y-4"
            style={{ borderColor: dragging ? "#1677ff" : "#e5e7eb" }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">
              Upload a blood / medical report
            </h2>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />

            <button
              onClick={() => fileInput.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-[#1677ff] rounded-xl py-9 text-sm text-gray-500 hover:text-[#1677ff] transition-colors"
            >
              Drop a screenshot here, or click to browse
              <span className="block mt-1 text-xs text-gray-400">
                PNG / JPG — OCR runs entirely in your browser
              </span>
            </button>

            {ocr.status === "loading" && (
              <p className="text-sm text-gray-500">Loading OCR engine…</p>
            )}

            {ocr.status === "progress" && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1677ff]" style={{ width: `${ocr.pct}%` }} />
                </div>
                <p className="text-sm text-gray-500">Reading report… {ocr.pct}%</p>
              </div>
            )}

            {ocr.status === "error" && (
              <p className="text-sm text-red-600">{ocr.message}</p>
            )}

            {ocr.status === "done" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={ocr.image}
                    alt="Uploaded medical report"
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Extracted text — fix any misreads, analysis updates live
                    </p>
                    <textarea
                      value={ocr.text}
                      onChange={(e) => {
                        const text = e.target.value;
                        setOcr({ ...ocr, text });
                        setAnalysis(analyzeAll(text));
                      }}
                      rows={5}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff] resize-y"
                      placeholder="No text detected — type the report contents here"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOcr({ status: "idle" });
                    setAnalysis(null);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Remove report
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============ SYMPTOM ENTRY ============ */}
        {tab === "symptom" && (
          <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-gray-500">
              Describe symptoms
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setAnalysis(analyzeAll(input));
                }
              }}
              rows={3}
              placeholder="e.g. I have a sore throat, fever, and difficulty swallowing for 2 days"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#1677ff] resize-none"
            />
            <button
              onClick={() => setAnalysis(analyzeAll(input))}
              className="w-full bg-[#1677ff] hover:bg-[#1677ff]/90 text-white font-semibold rounded-xl py-3 text-sm"
            >
              Check Symptoms
            </button>
          </div>
        )}

        {/* ============ HEALTH CATEGORY OVERVIEW ============ */}
        {lab && (
          <section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-medium text-[#3cbab4] mb-4">
              Health Category Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lab.systems.map((s) => {
                const b = systemBadge[s.status];
                return (
                  <div
                    key={s.id}
                    className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${b.bg} ${b.text}`}
                        >
                          {statusLabel[s.status]}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {s.abnormal}/{s.total || 0} out of range
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <ScoreRing score={s.score} />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                        {s.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ BIOMARKERS ============ */}
        {lab && (
          <section>
            <h2 className="text-2xl font-medium text-[#3cbab4] px-1 mb-3">Biomarkers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lab.rows.map((row) => {
                const labBadge =
                  row.status === "normal"
                    ? { txt: "In range", cls: "border-gray-300 text-gray-500" }
                    : row.status === "low"
                      ? { txt: "Below range", cls: "border-amber-300 text-amber-700" }
                      : { txt: "Above range", cls: "border-red-300 text-red-600" };
                return (
                  <div
                    key={row.test.key}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{row.test.label}</p>
                        <p className="text-[11px] italic text-gray-400 truncate mt-0.5">
                          {row.test.system} health indicator
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-xl font-semibold ${statusStyle[row.status]}`}>
                          {row.value}
                        </p>
                        <p className="text-[11px] text-gray-400">{row.test.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${labBadge.cls}`}
                      >
                        Lab: {labBadge.txt}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full text-white ${
                          row.status === "normal" ? "bg-[#1677ff]" : row.status === "low" ? "bg-amber-500" : "bg-red-500"
                        }`}
                      >
                        {row.status === "normal"
                          ? "Good"
                          : row.status === "low"
                            ? "Pay attention"
                            : "Pay attention"}
                      </span>
                      <span className="ml-auto text-[11px] font-mono text-gray-400">
                        {row.test.low}–{row.test.high}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ INSIGHTS ============ */}
        {lab && lab.findings.length > 0 && (
          <section>
            <h2 className="text-2xl font-medium text-[#3cbab4] px-1 mb-3">Insights</h2>
            <div className="space-y-3">
              {lab.findings.map((f) => (
                <div key={f.name} className="bg-[#f4fbfa] border border-teal-100 rounded-2xl p-5">
                  <span className="inline-block text-[11px] font-semibold text-white bg-[#1677ff] rounded-full px-3 py-1">
                    {f.name}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-3">
                    {f.name}{" "}
                    <span className="text-[11px] font-mono text-gray-400 ml-1">
                      {f.icd10} · {f.severity === 3 ? "severe" : f.severity === 2 ? "moderate" : "mild"}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{f.explanation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ DEFINITIVE DIAGNOSIS + PRESCRIPTION ============ */}
        {lab?.primary && (
          <Card
            title="Definitive Diagnosis"
            meta={`ICD-10: ${lab.primary.icd10} · Confidence ${lab.confidence}%`}
          >
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{lab.primary.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{lab.primary.explanation}</p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3">
                <h3 className="text-[#1677ff] text-xs font-semibold tracking-widest uppercase">
                  Prescription
                </h3>
                <dl className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Medication</dt>
                    <dd className="font-medium text-gray-900 mt-0.5">
                      {lab.primary.prescription.medication}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Dosage</dt>
                    <dd className="text-gray-700 mt-0.5">{lab.primary.prescription.dosage}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Frequency</dt>
                    <dd className="text-gray-700 mt-0.5">{lab.primary.prescription.frequency}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Duration</dt>
                    <dd className="text-gray-700 mt-0.5">{lab.primary.prescription.duration}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Instructions</dt>
                    <dd className="text-gray-600 mt-0.5">{lab.primary.prescription.notes}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card>
        )}

        {/* ============ CARE ACTIONS ============ */}
        {lab && lab.actions.length > 0 && (
          <section>
            <h2 className="text-2xl font-medium text-[#3cbab4] px-1 mb-3">Care Actions</h2>
            <div className="space-y-2">
              {lab.actions.map((a, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelBadge[a.level]}`}
                    >
                      {a.level}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                        <span className="text-[11px] text-gray-400">{a.timeframe}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{a.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ SUPPLEMENT PLAN ============ */}
        {lab && lab.supplements.length > 0 && (
          <Card title="Morning Stack · Supplement Plan" meta={`${lab.supplements.length} items`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-6 py-2.5 font-medium">Supplement</th>
                  <th className="px-4 py-2.5 font-medium">Dose</th>
                  <th className="px-4 py-2.5 font-medium">Timing</th>
                  <th className="px-6 py-2.5 font-medium">Supports</th>
                </tr>
              </thead>
              <tbody>
                {lab.supplements.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="px-6 py-2.5 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-500">{s.dose}</td>
                    <td className="px-4 py-2.5 text-gray-500">{s.timing}</td>
                    <td className="px-6 py-2.5 text-gray-500 capitalize">{s.improves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {lab && !lab.primary && (
          <section className="w-full bg-white border border-emerald-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                ✓
              </span>
              <div>
                <p className="text-sm text-emerald-700 font-semibold">
                  All values within reference range.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  No abnormal findings detected across the {lab.rows.length} parsed values. No
                  treatment indicated — keep up the routine and recheck periodically.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ============ SYMPTOM-ONLY RESULT ============ */}
        {showingLab === false && symptom?.kind === "match" && (
          <Card
            title="Definitive Diagnosis"
            meta={`ICD-10: ${symptom.diagnosis.icd10} · Confidence ${symptom.score}%`}
          >
            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{symptom.diagnosis.name}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Matched symptoms: {symptom.matched.join(", ")}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3">
                <h3 className="text-[#1677ff] text-xs font-semibold tracking-widest uppercase">
                  Prescription
                </h3>
                <dl className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Medication</dt>
                    <dd className="font-medium text-gray-900 mt-0.5">
                      {symptom.diagnosis.prescription.medication}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Dosage</dt>
                    <dd className="text-gray-700 mt-0.5">{symptom.diagnosis.prescription.dosage}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Frequency</dt>
                    <dd className="text-gray-700 mt-0.5">{symptom.diagnosis.prescription.frequency}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Duration</dt>
                    <dd className="text-gray-700 mt-0.5">{symptom.diagnosis.prescription.duration}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-400 text-xs uppercase tracking-wide">Instructions</dt>
                    <dd className="text-gray-600 mt-0.5">
                      {symptom.diagnosis.prescription.notes}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card>
        )}

        {analysis && !lab && symptom?.kind === "inconclusive" && (
          <section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-600">
              No lab values or conditions in the knowledge base match that input. For reports,
              ensure test names and numeric values are legible (e.g. "Hemoglobin 11.2 g/dL").
            </p>
          </section>
        )}

        {!analysis && (
          <section className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
            <p className="text-sm text-gray-400">
              Upload a report or check symptoms to see your health category overview, diagnoses,
              care actions and supplement plan here.
            </p>
          </section>
        )}
      </div>

      {/* ============ SAI ASSISTANT (floating) ============ */}
      <button
        onClick={() => setSaiOpen((v) => !v)}
        className="fixed bottom-5 right-5 h-12 w-12 rounded-full bg-[#1677ff] hover:bg-[#1677ff]/90 text-white shadow-lg flex items-center justify-center"
        aria-label="Toggle Sai AI assistant"
      >
        {saiOpen ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <span className="text-lg leading-none">✦</span>
        )}
      </button>

      {saiOpen && (
        <div className="fixed bottom-24 right-5 w-[380px] max-w-[calc(100vw-2.5rem)]">
          <AssistantChat context={assistantContext} />
        </div>
      )}
    </main>
  );
}
