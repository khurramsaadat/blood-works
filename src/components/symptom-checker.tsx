"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import AssistantChat from "@/components/assistant-chat";
import { parseLabReport, type LabResult } from "@/lib/lab";
import {
  buildReportText,
  downloadText,
  reportStamp,
  shareText,
} from "@/lib/report-export";
import {
  clearAllSessions,
  loadSessions,
  removeSession,
  upsertSession,
  type ChatMsg,
  type SavedSession,
} from "@/lib/sessions";

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
      notes: "Strict hand hygiene – replace towels daily. No contact lenses until course completes.",
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the file."));
    r.readAsDataURL(file);
  });
}

function formatSessionDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ---------------- View helpers (Siphox palette) ---------------- */

const statusStyle: Record<string, string> = {
  normal: "text-accent-deep",
  low: "text-amber-600",
  high: "text-red-600",
};

const statusLabel: Record<string, string> = {
  in: "In range",
  watch: "Watch",
  out: "Out of range",
};

const systemBadge: Record<string, { bg: string; text: string }> = {
  in: { bg: "bg-soft", text: "text-accent-deep" },
  watch: { bg: "bg-amber-50", text: "text-amber-700" },
  out: { bg: "bg-red-50", text: "text-red-600" },
};

const levelBadge: Record<string, string> = {
  L1: "bg-red-50 text-red-600 border-red-200",
  L2: "bg-amber-50 text-amber-700 border-amber-200",
  L3: "bg-soft text-accent-deep border-accent/30",
};

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  const color = score >= 80 ? "var(--accent)" : score >= 60 ? "#d97706" : "#dc2626";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
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
    <section className="w-full bg-card border border-border-c rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-3.5 border-b border-border-c flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted">
          {title}
        </span>
        {meta ? <span className="text-xs text-muted">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

/* ---------------- Sidebar icons ---------------- */

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  report: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 15h6 M9 11h6",
  symptom: "M12 2a7 7 0 0 1 7 7c0 3-2 5-2 8h-10c0-3-2-5-2-7a7 7 0 0 1 7-7z M9 21h6",
  overview: "M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z",
  biomarkers: "M9 3h6 M10 3v5.4L4.8 17.5A2 2 0 0 0 6.6 21h10.8a2 2 0 0 0 1.8-3.5L14 8.4V3",
  insights: "M12 3a6 6 0 0 0-6 6c0 2.5 1.5 3.7 1.5 5.5h9c0-1.8 1.5-3 1.5-5.5a6 6 0 0 0-6-6z M9 20h6",
  diagnosis: "M22 12h-4l-3 8-4-16-3 8H2",
  care: "M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7z",
  supplements: "M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z M8 8l8 8",
  sai: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
};

type NavEntry = {
  id: string;
  label: string;
  icon: string;
  scrollId?: string;
  requiresLab?: boolean;
};

const NAV_TOOLS: NavEntry[] = [
  { id: "report", label: "Analyze a Report", icon: ICONS.report },
  { id: "symptom", label: "Check Symptoms", icon: ICONS.symptom },
];

const NAV_REPORT: NavEntry[] = [
  { id: "overview", label: "Health Overview", icon: ICONS.overview, scrollId: "sec-overview", requiresLab: true },
  { id: "biomarkers", label: "Biomarkers", icon: ICONS.biomarkers, scrollId: "sec-biomarkers", requiresLab: true },
  { id: "insights", label: "Insights", icon: ICONS.insights, scrollId: "sec-insights", requiresLab: true },
  { id: "diagnosis", label: "Diagnosis & Rx", icon: ICONS.diagnosis, scrollId: "sec-diagnosis", requiresLab: true },
  { id: "care", label: "Care Actions", icon: ICONS.care, scrollId: "sec-care", requiresLab: true },
  { id: "supplements", label: "Supplement Plan", icon: ICONS.supplements, scrollId: "sec-supplements", requiresLab: true },
];

/* ---------------- Component ---------------- */

type OcrState =
  | { status: "idle" }
  | { status: "loading"; image: string }
  | { status: "progress"; pct: number; image: string }
  | { status: "done"; text: string; image: string }
  | { status: "error"; message: string };

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [ocr, setOcr] = useState<OcrState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<"report" | "symptom">("report");
  const [activeNav, setActiveNav] = useState<string>("report");
  const [saiOpenMobile, setSaiOpenMobile] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---------------- Session persistence (localStorage) ---------------- */
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const hydrated = useRef(false);

  // Hydrate the most recent session on mount (client only).
  useEffect(() => {
    const list = loadSessions();
    setSessions(list);
    const latest = list[0];
    if (latest) {
      applySession(latest);
      setActiveId(latest.id);
      setTab(latest.kind === "symptom" ? "symptom" : "report");
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySession = (s: SavedSession) => {
    if (s.kind === "lab") {
      setOcr({ status: "done", text: s.ocrText, image: s.image });
      setAnalysis(analyzeAll(s.ocrText));
    } else {
      setOcr({ status: "idle" });
      setInput(s.symptomInput);
      setAnalysis(s.symptomInput.trim() ? analyzeAll(s.symptomInput) : null);
    }
    setActiveId(s.id);
    setChat(s.chat);
  };

  const saveCurrent = useCallback(() => {
    if (!hydrated.current || !activeId) return;
    const id = activeId;
    const now = new Date().toISOString();
    const kind: "lab" | "symptom" = ocr.status === "done" ? "lab" : "symptom";
    const next: SavedSession = {
      id,
      createdAt: now,
      updatedAt: now,
      kind,
      image: kind === "lab" && ocr.status === "done" ? ocr.image : "",
      ocrText: kind === "lab" && ocr.status === "done" ? ocr.text : "",
      symptomInput: kind === "symptom" ? input : "",
      lab: analysis?.lab ?? null,
      chat,
    };
    setSessions(upsertSession(next));
  }, [activeId, ocr, analysis, input, chat]);

  // Persist whenever the current work changes.
  useEffect(() => {
    saveCurrent();
  }, [saveCurrent, ocr, analysis, input, chat]);

  const startNewSession = () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setActiveId(id);
    setOcr({ status: "idle" });
    setAnalysis(null);
    setInput("");
    setChat([]);
    setTab("report");
  };

  const openSession = (s: SavedSession) => {
    applySession(s);
    setTab(s.kind === "symptom" ? "symptom" : "report");
    setSaiOpenMobile(false);
  };

  const deleteSession = (id: string) => {
    setSessions(removeSession(id));
    if (id === activeId) startNewSession();
  };

  const onClearAllSessions = () => {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 4000);
      return;
    }
    setConfirmClearAll(false);
    setSessions(clearAllSessions());
    startNewSession();
    setToast("All sessions cleared");
  };

  const newOcr = (file: File) => {
    fileToDataUrl(file)
      .then((image) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setActiveId(id);
        setOcr({ status: "loading", image });
        setChat([]);
        setTab("report");
        return runOcr(file, image);
      })
      .catch(() => {
        setOcr({ status: "error", message: "Could not read this image." });
      });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const exportReport = async (mode: "download" | "share") => {
    if (!lab) return;
    const text = buildReportText(lab, ocr.status === "done" ? ocr.text : undefined);
    if (mode === "download") {
      downloadText(`bloodworks-analysis_${reportStamp()}.txt`, text);
      setToast("Report downloaded");
    } else {
      const r = await shareText(text, "BloodWorks Health – report analysis");
      setToast(r === "shared" ? "Report shared" : "Report copied to clipboard");
    }
  };

  const runOcr = useCallback(async (file: File, image: string) => {
    setOcr({ status: "loading", image });
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
            setOcr({ status: "progress", pct: Math.round(m.progress * 100), image });
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
    if (file && file.type.startsWith("image/")) newOcr(file);
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

  const changeChat = useCallback((updater: (prev: ChatMsg[]) => ChatMsg[]) => {
    setChat(updater);
  }, []);
  const clearChat = useCallback(() => setChat([]), []);

  const overallScore = lab
    ? Math.round(lab.systems.reduce((sum, s) => sum + s.score, 0) / lab.systems.length)
    : null;
  const outOfRange = lab
    ? lab.rows.filter((r) => r.status !== "normal").length
    : 0;

  const navigate = (entry: NavEntry) => {
    setActiveNav(entry.id);
    setSaiOpenMobile(false);
    if (entry.scrollId) {
      document.getElementById(entry.scrollId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setTab(entry.id as "report" | "symptom");
      window.scrollTo({ top: 0 });
    }
  };

  const renderNav = (entries: NavEntry[], groupLabel: string) => {
    const visible = entries.filter((e) => !e.requiresLab || !!lab);
    if (visible.length === 0) return null;
    return (
      <div>
        <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase text-muted">
          {groupLabel}
        </p>
        <div className="space-y-0.5">
          {visible.map((e) => {
            const active = activeNav === e.id && (!e.scrollId || tab === "report");
            return (
              <button
                key={e.id}
                onClick={() => navigate(e)}
                className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-soft text-accent-deep"
                    : "text-muted hover:bg-soft hover:text-foreground"
                }`}
              >
                <Icon d={e.icon} className={active ? "text-accent-deep" : "text-muted"} />
                {e.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebar = (
    <div
      className={`w-full bg-card border border-border-c rounded-2xl shadow-sm p-4 flex-col gap-5 ${
        sessions.length ? "flex" : "hidden lg:flex"
      }`}
    >
      <nav className="hidden lg:block flex-1 space-y-4">
        {renderNav(NAV_TOOLS, "Tools")}
        {renderNav(NAV_REPORT, "Your report")}
      </nav>

      {/* ---------------- Saved sessions (localStorage) ---------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="px-3 text-[10px] font-semibold tracking-widest uppercase text-muted">
            Your reports
          </p>
          <button
            onClick={startNewSession}
            title="Start a new report"
            className="h-6 w-6 rounded-md text-muted hover:text-accent-deep hover:bg-soft flex items-center justify-center"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14 M5 12h14" />
            </svg>
          </button>
        </div>
        {sessions.length === 0 ? (
          <p className="px-3 text-[11px] text-muted leading-snug">
            Nothing saved yet. Upload a report or check symptoms and it will be kept here on this device.
          </p>
        ) : (
          <>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {sessions.map((s) => {
                const active = s.id === activeId;
                const hasLab = !!s.lab;
                return (
                  <div
                    key={s.id}
                    className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                      active ? "bg-soft" : "hover:bg-soft"
                    }`}
                    onClick={() => openSession(s)}
                  >
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="h-9 w-9 object-cover rounded-md border border-border-c shrink-0"
                      />
                    ) : (
                      <span className="h-9 w-9 rounded-md bg-soft border border-border-c flex items-center justify-center shrink-0">
                        <Icon d={ICONS.symptom} className="text-accent-deep !w-4 !h-4" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${active ? "text-accent-deep" : "text-foreground"}`}>
                        {s.kind === "symptom" ? "Symptom check" : hasLab ? (s.lab?.primary?.name ?? `Report · ${s.lab?.rows.length ?? 0} values`) : "Report"}
                      </p>
                      <p className="text-[10px] text-muted truncate">
                        {formatSessionDate(s.updatedAt)}
                        {s.chat.length > 0 ? ` · ${s.chat.length} with Sai` : ""}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(s.id);
                      }}
                      title="Delete this report"
                      className="h-6 w-6 rounded-md text-muted/60 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 flex items-center justify-center shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={onClearAllSessions}
              className={`w-full text-[11px] font-medium rounded-lg px-3 py-2 border transition-colors ${
                confirmClearAll
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "border-border-c text-muted hover:text-red-500 hover:border-red-200 hover:bg-red-50"
              }`}
            >
              {confirmClearAll ? "Tap again to clear everything" : "Clear saved reports"}
            </button>
          </>
        )}
      </div>

      {lab && overallScore !== null && (
        <div className="border border-border-c rounded-xl p-4 bg-gradient-to-b from-soft/60 to-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ScoreRing score={overallScore} size={56} />
              <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-foreground">
                {overallScore}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted">
                Overall health
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                {outOfRange === 0 ? "All in range" : `${outOfRange} value${outOfRange > 1 ? "s" : ""} to review`}
              </p>
            </div>
          </div>
          {lab.primary && (
            <p className="mt-3 text-xs text-muted border-t border-border-c pt-3 leading-snug">
              <span className="font-semibold text-foreground">{lab.primary.name}</span>
              <span className="text-muted font-mono ml-1">{lab.primary.icd10}</span>
            </p>
          )}
          <div className="mt-3 flex gap-2 border-t border-border-c pt-3">
            <button
              onClick={() => exportReport("download")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-brand-deep text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M7 10l5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Download
            </button>
            <button
              onClick={() => exportReport("share")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-border-c hover:border-accent hover:text-accent-deep text-muted text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              Share
            </button>
          </div>
        </div>
      )}

      <p className="px-1 text-[11px] text-muted leading-relaxed">
        OCR and analysis run entirely in your browser. Saved reports stay on this device.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-5 lg:grid lg:grid-cols-[248px_minmax(0,1fr)_360px] lg:gap-5 lg:items-start">
        {/* ============ LEFT SIDEBAR (desktop) ============ */}
        <aside className="hidden lg:block sticky top-20">{sidebar}</aside>

        {/* ============ MAIN ============ */}
        <main className="min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden mb-5">{sidebar}</div>

          {/* Tabs (all screens) */}
          <div className="inline-flex gap-1 bg-card border border-border-c rounded-xl p-1 shadow-sm mb-5">
            <button
              onClick={() => navigate(NAV_TOOLS[0])}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "report" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              Analyze a Report
            </button>
            <button
              onClick={() => navigate(NAV_TOOLS[1])}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "symptom" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              Check Symptoms
            </button>
          </div>

          <div className="space-y-5">
            {/* ============ REPORT UPLOAD ============ */}
            {tab === "report" && (
              <div
                className="w-full bg-card border rounded-2xl shadow-sm p-6 space-y-4"
                style={{ borderColor: dragging ? "var(--accent)" : "var(--border)" }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-xs font-semibold tracking-widest uppercase text-muted">
                    Upload a blood / medical report
                  </h2>
                  {ocr.status === "done" && lab && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportReport("download")}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-deep border border-accent/30 hover:bg-soft rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M7 10l5 5 5-5" />
                          <path d="M12 15V3" />
                        </svg>
                        Download report
                      </button>
                      <button
                        onClick={() => exportReport("share")}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted border border-border-c hover:text-accent-deep hover:border-accent rounded-lg px-3 py-1.5 transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3" />
                          <circle cx="6" cy="12" r="3" />
                          <circle cx="18" cy="19" r="3" />
                          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                        </svg>
                        Share
                      </button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    onFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />

                {ocr.status === "done" ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={ocr.image}
                        alt="Uploaded medical report"
                        title="Your uploaded report – kept on this device"
                        className="h-24 w-24 object-cover rounded-lg border border-border-c shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted uppercase tracking-wide mb-1">
                          Extracted text – fix any misreads, analysis updates live
                        </p>
                        <textarea
                          value={ocr.text}
                          onChange={(e) => {
                            const text = e.target.value;
                            setOcr({ ...ocr, text });
                            setAnalysis(analyzeAll(text));
                          }}
                          rows={5}
                          className="w-full bg-soft border border-border-c rounded-lg p-3 text-xs font-mono placeholder:text-muted/70 focus:outline-none focus:border-accent resize-y"
                          placeholder="No text detected – type the report contents here"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => fileInput.current?.click()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium border border-border-c hover:border-accent hover:text-accent-deep text-muted rounded-lg px-3 py-2 transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-2.6-6.3 M21 3v6h-6" />
                        </svg>
                        Replace report
                      </button>
                      <button
                        onClick={() => {
                          startNewSession();
                          setActiveNav("report");
                        }}
                        className="text-xs text-muted hover:text-foreground underline"
                      >
                        Remove report
                      </button>
                      <span className="ml-auto text-[11px] text-muted">
                        Saved to this device · shown in “Your reports”
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => fileInput.current?.click()}
                      className="w-full border-2 border-dashed border-border-c hover:border-accent rounded-xl py-9 text-sm text-muted hover:text-accent-deep transition-colors"
                    >
                      Drop a screenshot here, or click to browse
                      <span className="block mt-1 text-xs text-muted">
                        PNG / JPG – OCR runs entirely in your browser
                      </span>
                    </button>

                    {ocr.status === "loading" && (
                      <p className="text-sm text-muted">Loading OCR engine…</p>
                    )}

                    {ocr.status === "progress" && (
                      <div className="space-y-2">
                        <div className="h-2 bg-soft rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${ocr.pct}%` }} />
                        </div>
                        <p className="text-sm text-muted">Reading report… {ocr.pct}%</p>
                      </div>
                    )}

                    {ocr.status === "error" && (
                      <p className="text-sm text-red-600">{ocr.message}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ============ SYMPTOM ENTRY ============ */}
            {tab === "symptom" && (
              <div className="w-full bg-card border border-border-c rounded-2xl shadow-sm p-6 space-y-4">
                <h2 className="text-xs font-semibold tracking-widest uppercase text-muted">
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
                  className="w-full bg-soft border border-border-c rounded-xl p-4 text-sm placeholder:text-muted/70 focus:outline-none focus:border-accent resize-none"
                />
                <button
                  onClick={() => setAnalysis(analyzeAll(input))}
                  className="w-full bg-accent hover:bg-brand-deep text-white font-semibold rounded-xl py-3 text-sm"
                >
                  Check Symptoms
                </button>
              </div>
            )}

            {/* ============ HEALTH CATEGORY OVERVIEW ============ */}
            {lab && (
              <section id="sec-overview" className="scroll-mt-5 w-full bg-card border border-border-c rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <h2 className="text-2xl font-medium text-foreground">
                    Health Category Overview
                  </h2>
                  {overallScore !== null && (
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        overallScore >= 80
                          ? "bg-soft text-accent-deep"
                          : overallScore >= 60
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      Overall {overallScore}%
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lab.systems.map((s) => {
                    const b = systemBadge[s.status];
                    return (
                      <div
                        key={s.id}
                        className="border border-border-c rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{s.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${b.bg} ${b.text}`}
                            >
                              {statusLabel[s.status]}
                            </span>
                            <span className="text-[11px] text-muted">
                              {s.abnormal}/{s.total || 0} out of range
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <ScoreRing score={s.score} />
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
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
              <section id="sec-biomarkers" className="scroll-mt-5">
                <h2 className="text-2xl font-medium text-foreground px-1 mb-3">Biomarkers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lab.rows.map((row) => {
                    const labBadge =
                      row.status === "normal"
                        ? { txt: "In range", cls: "border-border-c text-muted" }
                        : row.status === "low"
                          ? { txt: "Below range", cls: "border-amber-300 text-amber-700" }
                          : { txt: "Above range", cls: "border-red-300 text-red-600" };
                    return (
                      <div
                        key={row.test.key}
                        className="bg-card border border-border-c rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{row.test.label}</p>
                            <p className="text-[11px] italic text-muted truncate mt-0.5">
                              {row.test.system} health indicator
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xl font-semibold ${statusStyle[row.status]}`}>
                              {row.value}
                            </p>
                            <p className="text-[11px] text-muted">{row.test.unit}</p>
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
                              row.status === "normal" ? "bg-accent" : row.status === "low" ? "bg-amber-500" : "bg-red-500"
                            }`}
                          >
                            {row.status === "normal"
                              ? "Good"
                              : row.status === "low"
                                ? "Pay attention"
                                : "Pay attention"}
                          </span>
                          <span className="ml-auto text-[11px] font-mono text-muted">
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
              <section id="sec-insights" className="scroll-mt-5">
                <h2 className="text-2xl font-medium text-foreground px-1 mb-3">Insights</h2>
                <div className="space-y-3">
                  {lab.findings.map((f) => (
                    <div key={f.name} className="bg-soft/60 border border-border-c rounded-2xl p-5">
                      <h3 className="font-semibold text-foreground">
                        {f.name}{" "}
                        <span className="text-[11px] font-mono text-muted ml-1">
                          {f.icd10} · {f.severity === 3 ? "severe" : f.severity === 2 ? "moderate" : "mild"}
                        </span>
                      </h3>
                      <p className="text-sm text-muted mt-2 leading-relaxed">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ============ DEFINITIVE DIAGNOSIS + PRESCRIPTION (lab) ============ */}
            {lab?.primary && (
              <div id="sec-diagnosis" className="scroll-mt-5">
                <Card
                  title="Definitive Diagnosis"
                  meta={`ICD-10: ${lab.primary.icd10} · Confidence ${lab.confidence}%`}
                >
                  <div className="p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{lab.primary.name}</h2>
                      <p className="text-muted text-sm mt-1">{lab.primary.explanation}</p>
                    </div>
                    <div className="bg-soft border border-border-c rounded-xl p-5 space-y-3">
                      <h3 className="text-accent-deep text-xs font-semibold tracking-widest uppercase">
                        Prescription
                      </h3>
                      <dl className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="sm:col-span-2">
                          <dt className="text-muted text-xs uppercase tracking-wide">Medication</dt>
                          <dd className="font-medium text-foreground mt-0.5">
                            {lab.primary.prescription.medication}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted text-xs uppercase tracking-wide">Dosage</dt>
                          <dd className="text-foreground mt-0.5">{lab.primary.prescription.dosage}</dd>
                        </div>
                        <div>
                          <dt className="text-muted text-xs uppercase tracking-wide">Frequency</dt>
                          <dd className="text-foreground mt-0.5">{lab.primary.prescription.frequency}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-muted text-xs uppercase tracking-wide">Duration</dt>
                          <dd className="text-foreground mt-0.5">{lab.primary.prescription.duration}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-muted text-xs uppercase tracking-wide">Instructions</dt>
                          <dd className="text-muted mt-0.5">{lab.primary.prescription.notes}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ============ CARE ACTIONS ============ */}
            {lab && lab.actions.length > 0 && (
              <section id="sec-care" className="scroll-mt-5">
                <h2 className="text-2xl font-medium text-foreground px-1 mb-3">Care Actions</h2>
                <div className="space-y-2">
                  {lab.actions.map((a, i) => (
                    <div key={i} className="bg-card border border-border-c rounded-xl px-5 py-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelBadge[a.level]}`}
                        >
                          {a.level}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                            <span className="text-[11px] text-muted">{a.timeframe}</span>
                          </div>
                          <p className="text-muted text-xs mt-1.5 leading-relaxed">{a.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ============ SUPPLEMENT PLAN ============ */}
            {lab && lab.supplements.length > 0 && (
              <div id="sec-supplements" className="scroll-mt-5">
                <Card title="Morning Stack · Supplement Plan" meta={`${lab.supplements.length} items`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-border-c">
                        <th className="px-6 py-2.5 font-medium">Supplement</th>
                        <th className="px-4 py-2.5 font-medium">Dose</th>
                        <th className="px-4 py-2.5 font-medium">Timing</th>
                        <th className="px-6 py-2.5 font-medium">Supports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lab.supplements.map((s, i) => (
                        <tr key={i} className="border-b border-border-c last:border-0">
                          <td className="px-6 py-2.5 font-medium text-foreground">{s.name}</td>
                          <td className="px-4 py-2.5 font-mono text-muted">{s.dose}</td>
                          <td className="px-4 py-2.5 text-muted">{s.timing}</td>
                          <td className="px-6 py-2.5 text-muted capitalize">{s.improves}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {lab && !lab.primary && (
              <section className="w-full bg-card border border-accent/30 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-soft flex items-center justify-center text-accent-deep font-bold">
                    ✓
                  </span>
                  <div>
                    <p className="text-sm text-accent-deep font-semibold">
                      All values within reference range.
                    </p>
                    <p className="text-sm text-muted mt-1">
                      No abnormal findings detected across the {lab.rows.length} parsed values. No
                      treatment indicated – keep up the routine and recheck periodically.
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
                    <h2 className="text-xl font-bold text-foreground">{symptom.diagnosis.name}</h2>
                    <p className="text-muted text-sm mt-1">
                      Matched symptoms: {symptom.matched.join(", ")}
                    </p>
                  </div>
                  <div className="bg-soft border border-border-c rounded-xl p-5 space-y-3">
                    <h3 className="text-accent-deep text-xs font-semibold tracking-widest uppercase">
                      Prescription
                    </h3>
                    <dl className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <div className="sm:col-span-2">
                        <dt className="text-muted text-xs uppercase tracking-wide">Medication</dt>
                        <dd className="font-medium text-foreground mt-0.5">
                          {symptom.diagnosis.prescription.medication}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted text-xs uppercase tracking-wide">Dosage</dt>
                        <dd className="text-foreground mt-0.5">{symptom.diagnosis.prescription.dosage}</dd>
                      </div>
                      <div>
                        <dt className="text-muted text-xs uppercase tracking-wide">Frequency</dt>
                        <dd className="text-foreground mt-0.5">{symptom.diagnosis.prescription.frequency}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted text-xs uppercase tracking-wide">Duration</dt>
                        <dd className="text-foreground mt-0.5">{symptom.diagnosis.prescription.duration}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted text-xs uppercase tracking-wide">Instructions</dt>
                        <dd className="text-muted mt-0.5">
                          {symptom.diagnosis.prescription.notes}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Card>
            )}

            {analysis && !lab && symptom?.kind === "inconclusive" && (
              <section className="w-full bg-card border border-border-c rounded-2xl shadow-sm p-6">
                <p className="text-sm text-muted">
                  No lab values or conditions in the knowledge base match that input. For reports,
                  ensure test names and numeric values are legible (e.g. "Hemoglobin 11.2 g/dL").
                </p>
              </section>
            )}

            {!analysis && (
              <section className="w-full bg-card border border-border-c rounded-2xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="h-12 w-12 rounded-2xl bg-soft text-accent-deep flex items-center justify-center">
                    <Icon d={ICONS.report} className="!w-6 !h-6" />
                  </span>
                  <p className="text-sm text-muted max-w-sm leading-relaxed">
                    Upload a report screenshot or check symptoms to see your health category
                    overview, definitive diagnosis, care actions and supplement plan here.
                  </p>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* ============ SAI RIGHT PANEL (desktop, always visible) ============ */}
        <aside className="hidden lg:block sticky top-20 h-[calc(100vh-6rem)]">
          <AssistantChat
            context={assistantContext}
            labSummary={
              lab
                ? {
                    primary: lab.primary
                      ? `${lab.primary.name} (${lab.primary.icd10})`
                      : "all values in range",
                    date: new Date().toDateString(),
                  }
                : null
            }
            messages={chat}
            onMessagesChange={changeChat}
            onClearChat={clearChat}
          />
        </aside>
      </div>

      {/* ============ SAI FAB + MOBILE PANEL ============ */}
      <button
        onClick={() => setSaiOpenMobile((v) => !v)}
        className={`fixed lg:hidden h-[52px] w-[52px] rounded-full bg-accent hover:bg-brand-deep text-white shadow-lg flex items-center justify-center ${
          saiOpenMobile ? "top-4 right-4 z-[60]" : "bottom-5 right-5 z-40"
        }`}
        aria-label="Toggle Sai AI assistant"
      >
        {saiOpenMobile ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <Icon d={ICONS.sai} className="!w-6 !h-6" />
        )}
      </button>

      {saiOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSaiOpenMobile(false)} />
          <div className="absolute bottom-4 right-4 left-4 top-auto h-[min(75vh,640px)] max-w-[420px] mx-auto sm:mx-0">
            <AssistantChat
              context={assistantContext}
              labSummary={
                lab
                  ? {
                      primary: lab.primary
                        ? `${lab.primary.name} (${lab.primary.icd10})`
                        : "all values in range",
                      date: new Date().toDateString(),
                    }
                  : null
              }
              messages={chat}
              onMessagesChange={changeChat}
              onClearChat={clearChat}
            />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs rounded-full px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
