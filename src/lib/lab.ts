/* =====================================================================
   Lab knowledge: tests, reference ranges, findings, system scores,
   actions and supplement plan. Pure logic – no React.
   ===================================================================== */

export type Prescription = {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
};

export type LabTest = {
  key: string;
  label: string;
  aliases: string[];
  low: number;
  high: number;
  unit: string;
  system: string;
};

export type LabRow = {
  test: LabTest;
  value: number;
  status: "normal" | "low" | "high";
};

export type LabFinding = {
  name: string;
  icd10: string;
  severity: 1 | 2 | 3;
  explanation: string;
  system: string;
  prescription: Prescription;
};

export type LabSystem = {
  id: string;
  name: string;
  score: number; // 0–100
  status: "in" | "watch" | "out";
  abnormal: number;
  total: number;
};

export type CareAction = {
  title: string;
  detail: string;
  timeframe: string;
  level: "L1" | "L2" | "L3";
  improves: string;
};

export type Supplement = {
  name: string;
  dose: string;
  timing: string;
  improves: string;
};

export type LabResult = {
  rows: LabRow[];
  findings: LabFinding[];
  primary: LabFinding | null;
  confidence: number;
  systems: LabSystem[];
  actions: CareAction[];
  supplements: Supplement[];
};

/* ---------------- Test catalogue (60+ biomarkers) ---------------- */

export const LAB_TESTS: LabTest[] = [
  // CBC
  { key: "hb", label: "Hemoglobin", aliases: ["hemoglobin", "hb", "hgb"], low: 13.0, high: 17.0, unit: "g/dL", system: "nutritional" },
  { key: "wbc", label: "WBC (Leukocytes)", aliases: ["total leucocyte count", "leucocyte count", "white blood cells", "wbc", "leucocytes", "leukocytes"], low: 4.0, high: 11.0, unit: "×10³/µL", system: "inflammation" },
  { key: "rbc", label: "RBC", aliases: ["red blood cells", "rbc"], low: 4.5, high: 5.9, unit: "×10⁶/µL", system: "nutritional" },
  { key: "plt", label: "Platelets", aliases: ["platelets", "plt"], low: 150, high: 450, unit: "×10³/µL", system: "cardiovascular" },
  { key: "hct", label: "Hematocrit", aliases: ["hematocrit", "hct", "packed cell volume", "pcv"], low: 40, high: 52, unit: "%", system: "nutritional" },
  { key: "mcv", label: "MCV", aliases: ["mcv"], low: 80, high: 100, unit: "fL", system: "nutritional" },
  { key: "mch", label: "MCH", aliases: ["mch"], low: 27, high: 32, unit: "pg", system: "nutritional" },
  { key: "mchc", label: "MCHC", aliases: ["mchc"], low: 32, high: 36, unit: "g/dL", system: "nutritional" },
  { key: "neut", label: "Neutrophils", aliases: ["neutrophils", "neut"], low: 40, high: 70, unit: "%", system: "inflammation" },
  { key: "lym", label: "Lymphocytes", aliases: ["lymphocytes"], low: 20, high: 40, unit: "%", system: "inflammation" },
  { key: "mono", label: "Monocytes", aliases: ["monocytes"], low: 2, high: 10, unit: "%", system: "inflammation" },
  { key: "eos", label: "Eosinophils", aliases: ["eosinophils"], low: 1, high: 6, unit: "%", system: "inflammation" },
  { key: "baso", label: "Basophils", aliases: ["basophils"], low: 0, high: 1, unit: "%", system: "inflammation" },
  { key: "pdw", label: "PDW", aliases: ["pdw"], low: 9, high: 17, unit: "fL", system: "nutritional" },
  // Metabolic
  { key: "glu", label: "Blood Glucose (Fasting)", aliases: ["fasting glucose", "blood glucose", "blood sugar", "fasting sugar", "glucose", "fbs"], low: 70, high: 100, unit: "mg/dL", system: "metabolic" },
  { key: "hba1c", label: "HbA1c", aliases: ["glycated hemoglobin", "hba1c", "a1c", "% hemoglobin a1c"], low: 4.0, high: 5.7, unit: "%", system: "metabolic" },
  { key: "cp", label: "C-Peptide", aliases: ["c-peptide", "cpeptide"], low: 1.1, high: 4.4, unit: "ng/mL", system: "metabolic" },
  { key: "ua", label: "Uric Acid", aliases: ["uric acid"], low: 3.5, high: 7.0, unit: "mg/dL", system: "metabolic" },
  // Thyroid
  { key: "tsh", label: "TSH", aliases: ["thyrotropin", "tsh", "thyroid stimulating hormone"], low: 0.4, high: 4.0, unit: "µIU/mL", system: "thyroid" },
  { key: "ft4", label: "Free T4", aliases: ["free t4", "ft4", "free thyroxine"], low: 0.9, high: 1.8, unit: "ng/dL", system: "thyroid" },
  { key: "ft3", label: "Free T3", aliases: ["free t3", "ft3", "free triiodothyronine"], low: 2.0, high: 4.4, unit: "pg/mL", system: "thyroid" },
  { key: "t4", label: "T4 (Total)", aliases: ["thyroxine", "total t4", "t4"], low: 5.1, high: 12.5, unit: "µg/dL", system: "thyroid" },
  { key: "t3", label: "T3 (Total)", aliases: ["triiodothyronine", "total t3", "t3"], low: 0.8, high: 2.0, unit: "ng/mL", system: "thyroid" },
  { key: "tpoab", label: "TPO Antibody", aliases: ["tpo antibody", "tpoab", "anti tpo"], low: 0, high: 35, unit: "IU/mL", system: "thyroid" },
  // Liver
  { key: "alt", label: "ALT (SGPT)", aliases: ["sgpt", "alt", "alanine aminotransferase"], low: 7, high: 56, unit: "U/L", system: "liver" },
  { key: "ast", label: "AST (SGOT)", aliases: ["sgot", "ast", "aspartate aminotransferase"], low: 10, high: 40, unit: "U/L", system: "liver" },
  { key: "alp", label: "Alkaline Phosphatase", aliases: ["alkaline phosphatase", "alp"], low: 44, high: 147, unit: "U/L", system: "liver" },
  { key: "ggt", label: "GGT", aliases: ["ggt", "gamma glutamyl transferase"], low: 9, high: 56, unit: "U/L", system: "liver" },
  { key: "tbil", label: "Total Bilirubin", aliases: ["total bilirubin", "bilirubin", "tbil"], low: 0.3, high: 1.2, unit: "mg/dL", system: "liver" },
  { key: "dbil", label: "Direct Bilirubin", aliases: ["direct bilirubin", "conjugated bilirubin", "dbil"], low: 0, high: 0.3, unit: "mg/dL", system: "liver" },
  { key: "alb", label: "Albumin", aliases: ["albumin"], low: 3.5, high: 5.2, unit: "g/dL", system: "liver" },
  { key: "tp", label: "Total Protein", aliases: ["total protein"], low: 6.4, high: 8.3, unit: "g/dL", system: "liver" },
  // Kidney
  { key: "cr", label: "Creatinine", aliases: ["creatinine"], low: 0.7, high: 1.3, unit: "mg/dL", system: "kidney" },
  { key: "bun", label: "BUN / Urea", aliases: ["urea", "bun", "blood urea nitrogen"], low: 7, high: 20, unit: "mg/dL", system: "kidney" },
  { key: "egfr", label: "eGFR", aliases: ["egfr"], low: 60, high: 130, unit: "mL/min/1.73m²", system: "kidney" },
  { key: "csf", label: "Cystatin C", aliases: ["cystatin c", "csf"], low: 0.7, high: 1.3, unit: "mg/L", system: "kidney" },
  // Lipids
  { key: "chol", label: "Total Cholesterol", aliases: ["total cholesterol", "cholesterol"], low: 125, high: 200, unit: "mg/dL", system: "cardiovascular" },
  { key: "tg", label: "Triglycerides", aliases: ["triglycerides"], low: 30, high: 150, unit: "mg/dL", system: "cardiovascular" },
  { key: "hdl", label: "HDL", aliases: ["hdl"], low: 40, high: 90, unit: "mg/dL", system: "cardiovascular" },
  { key: "ldl", label: "LDL", aliases: ["ldl"], low: 0, high: 100, unit: "mg/dL", system: "cardiovascular" },
  { key: "vldl", label: "VLDL", aliases: ["vldl"], low: 5, high: 40, unit: "mg/dL", system: "cardiovascular" },
  { key: "apob", label: "Apolipoprotein B", aliases: ["apolipoprotein b", "apob"], low: 60, high: 125, unit: "mg/dL", system: "cardiovascular" },
  { key: "apoai", label: "Apolipoprotein A1", aliases: ["apolipoprotein a1", "apo ai", "apoai", "apo a1"], low: 100, high: 175, unit: "mg/dL", system: "cardiovascular" },
  { key: "lpa", label: "Lipoprotein (a)", aliases: ["lipoprotein a", "lpa", "lpa"], low: 0, high: 30, unit: "mg/dL", system: "cardiovascular" },
  // Inflammation
  { key: "esr", label: "ESR", aliases: ["esr"], low: 0, high: 20, unit: "mm/hr", system: "inflammation" },
  { key: "crp", label: "CRP (hs-CRP)", aliases: ["hs crp", "crp", "c reactive protein"], low: 0, high: 3, unit: "mg/L", system: "inflammation" },
  // Nutritional
  { key: "vid", label: "Vitamin D (25-OH)", aliases: ["vitamin d", "25 oh vitamin d", "25 oh d", "cholecalciferol", "vit d", "d 25"], low: 30, high: 60, unit: "ng/mL", system: "nutritional" },
  { key: "b12", label: "Vitamin B12", aliases: ["vitamin b12", "b12", "cyanocobalamin", "vitamin b 12"], low: 180, high: 900, unit: "pg/mL", system: "nutritional" },
  { key: "fol", label: "Folate", aliases: ["folate", "folic acid", "fol"], low: 3, high: 17, unit: "ng/mL", system: "nutritional" },
  { key: "iron", label: "Serum Iron", aliases: ["serum iron", "iron"], low: 60, high: 170, unit: "µg/dL", system: "nutritional" },
  { key: "tIBC", label: "TIBC", aliases: ["tIBC", "total iron binding capacity"], low: 250, high: 370, unit: "µg/dL", system: "nutritional" },
  { key: "isat", label: "Iron Saturation", aliases: ["iron saturation", "transferrin saturation", "transferrin sat"], low: 20, high: 50, unit: "%", system: "nutritional" },
  { key: "fer", label: "Ferritin", aliases: ["ferritin"], low: 30, high: 300, unit: "ng/mL", system: "nutritional" },
  // Hormones
  { key: "testo", label: "Testosterone, Total", aliases: ["testosterone"], low: 300, high: 1000, unit: "ng/dL", system: "hormonal" },
  { key: "estr", label: "Estradiol", aliases: ["estradiol", "e2", "estradiol sensitive"], low: 15, high: 350, unit: "pg/mL", system: "hormonal" },
  { key: "fsh", label: "FSH", aliases: ["fsh", "follicle stimulating hormone"], low: 1.5, high: 12.4, unit: "mIU/mL", system: "hormonal" },
  { key: "lh", label: "LH", aliases: ["lh", "luteinizing hormone"], low: 1.7, high: 8.6, unit: "mIU/mL", system: "hormonal" },
  { key: "dh", label: "DHEA-S", aliases: ["dhea s", "dheas", "dhea"], low: 20, high: 600, unit: "µg/dL", system: "hormonal" },
  { key: "prol", label: "Prolactin", aliases: ["prolactin", "prl"], low: 2, high: 18, unit: "ng/mL", system: "hormonal" },
  { key: "shbg", label: "SHBG", aliases: ["shbg"], low: 18.3, high: 54.9, unit: "nmol/L", system: "hormonal" },
  { key: "cort", label: "Cortisol (AM)", aliases: ["cortisol"], low: 5, high: 25, unit: "µg/dL", system: "hormonal" },
  // Other
  { key: "hcy", label: "Homocysteine", aliases: ["homocysteine", "hcy"], low: 5, high: 15, unit: "µmol/L", system: "cardiovascular" },
  { key: "psa", label: "PSA, Total", aliases: ["psa", "prostate specific antigen"], low: 0, high: 4, unit: "ng/mL", system: "cardiovascular" },
  { key: "igf1", label: "IGF-1", aliases: ["igf 1", "igf1", "insulin like growth factor"], low: 100, high: 330, unit: "ng/mL", system: "cardiovascular" },
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Value sanity: reject phone numbers, MRNs, DOBs; auto-scale absolute counts */
function plausibleValue(raw: string, test: LabTest): number | null {
  const v = parseFloat(raw);
  if (!Number.isFinite(v) || v <= 0) return null;
  const intPart = raw.split(".")[0];
  if (intPart.length > 5) return null;
  // Labs that report WBC/platelets as absolute counts (e.g. 13500)
  if (v > test.high * 100 && v / 1000 <= test.high) return v / 1000;
  return v;
}

function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

interface WordHit {
  w: string;
  i: number;
}

function aliasWordIndex(words: WordHit[], alias: string): WordHit | null {
  const limit = alias.length <= 2 ? 0 : alias.length <= 5 ? 1 : 2;
  for (const hit of words) {
    if (hit.w === alias) return hit;
    if (limit >= 1 && hit.w.length >= 3 && levenshtein(hit.w, alias, limit) <= limit) return hit;
  }
  return null;
}

/**
 * Extract the numeric value for a test from OCR text.
 * Pass 1: alias (+ optional trailing words) followed by a number.
 * Pass 2: fuzzy alias match (tolerates OCR misspells), then a number in a
 * nearby window – handles column-jumbled table text.
 */
/*
 * Range detector: true if the number at [numStart, numEnd) is part of a
 * "low - high" reference range (a dash / en-dash / em-dash and another number
 * within a few characters on either side). Such numbers are reference bounds,
 * not the patient's result, and must never be attributed to a test.
 */
function inRangeContext(lower: string, numStart: number, numEnd: number): boolean {
  const before = lower.slice(Math.max(0, numStart - 12), numStart);
  const after = lower.slice(numEnd, Math.min(lower.length, numEnd + 12));
  if (/[0-9]\s*[-–—]\s*$/.test(before)) return true;
  if (/^\s*[-–—]\s*[0-9]/.test(after)) return true;
  return false;
}

function extractValueForTest(
  lower: string,
  words: WordHit[],
  test: LabTest,
  consumed: { from: number; to: number }[]
): number | null {
  // Pass 1: alias (+ up to two trailing label words) immediately followed by a
  // number. The number must sit close to the alias and must not be a range bound.
  for (const alias of test.aliases) {
    const re = new RegExp(
      `\\b${esc(alias)}[\\s:#\\-.]*(?:[a-z]{2,12}[\\s:#\\-.]+){0,2}([0-9]+(?:\\.[0-9]+)?)(?![0-9.])`
    );
    const m = lower.match(re);
    if (m) {
      const aliasEnd = m.index! + alias.length;
      const numStart = m.index! + m[0].length - m[1].length;
      const numEnd = numStart + m[1].length;
      // A number 30+ chars past the alias is a reference value from another
      // column (e.g. "t3" landing inside "0.27 - 4.20"). A number that is part
      // of a "low - high" range is a bound, not a result. Reject both.
      if (numStart - aliasEnd <= 30 && !inRangeContext(lower, numStart, numEnd)) {
        const v = plausibleValue(m[1], test);
        if (v !== null) {
          consumed.push({ from: numStart, to: numEnd });
          return v;
        }
      }
    }
  }
  // Pass 2: fuzzy alias token (tolerates OCR misspells) then the first number in
  // a tight window that is not already consumed and not a range bound.
  for (const alias of test.aliases) {
    const hit = aliasWordIndex(words, alias);
    if (!hit) continue;
    const end = Math.min(lower.length, hit.i + hit.w.length + 40);
    const tail = lower.slice(hit.i + hit.w.length, end);
    const num = tail.match(/([0-9]+(?:\.[0-9]+)?)(?![0-9.])/);
    if (num) {
      const numStart = hit.i + hit.w.length + num.index!;
      const numEnd = numStart + num[1].length;
      if (numStart - (hit.i + hit.w.length) > 24) continue;
      if (consumed.some((c) => numStart >= c.from && numStart < c.to)) continue;
      if (inRangeContext(lower, numStart, numEnd)) continue;
      const v = plausibleValue(num[1], test);
      if (v !== null) {
        consumed.push({ from: numStart, to: numEnd });
        return v;
      }
    }
  }
  return null;
}

/* ---------------- Finding generation ---------------- */

const deviation = (row: LabRow): number =>
  row.status === "low"
    ? row.test.low > 0
      ? (row.test.low - row.value) / row.test.low
      : 1
    : (row.value - row.test.high) / row.test.high;

const severityOf = (row: LabRow): 1 | 2 | 3 => {
  const d = deviation(row);
  return d >= 0.5 ? 3 : d >= 0.2 ? 2 : 1;
};

const RX: Record<string, (row: LabRow) => LabFinding> = {
  hb: (r) =>
    r.status === "low"
      ? {
          name: "Iron Deficiency Anemia",
          icd10: "D50.9",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Hemoglobin ${r.value} g/dL is below the 13–17 reference range. Consistent with iron deficiency anemia.`,
          prescription: {
            medication: "Ferrous Ascorbylate + Folic Acid",
            dosage: "200mg iron + 5mg",
            frequency: "Once daily, 1 hour before breakfast with vitamin C",
            duration: "90 days, then repeat hemoglobin",
            notes: "Add iron-rich foods (dark leafy greens, red meat, jaggery). Avoid tea/coffee within 2h of the tablet.",
          },
        }
      : {
          name: "Polycythemia",
          icd10: "D45",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Hemoglobin ${r.value} g/dL is above the 13–17 reference range.`,
          prescription: {
            medication: "Aspirin + therapeutic phlebotomy protocol",
            dosage: "75mg daily",
            frequency: "Once daily",
            duration: "Ongoing, with 450ml phlebotomy weekly until Hb < 14",
            notes: "Aggressive hydration (3L water daily). Rule out secondary causes.",
          },
        },
  wbc: (r) =>
    r.status === "high"
      ? {
          name: "Acute Bacterial Infection",
          icd10: "B95",
          severity: severityOf(r),
          system: "inflammation",
          explanation: `WBC ${r.value} ×10³/µL is above the 4–11 reference range. Indicates an active bacterial infection.`,
          prescription: {
            medication: "Ciprofloxacin + Paracetamol",
            dosage: "500mg + 650mg",
            frequency: "Twice daily after meals",
            duration: "7 days",
            notes: "Complete the full antibiotic course. Hydration and rest. Repeat CBC after treatment.",
          },
        }
      : {
          name: "Leukopenia",
          icd10: "D70",
          severity: severityOf(r),
          system: "inflammation",
          explanation: `WBC ${r.value} ×10³/µL is below the 4–11 reference range.`,
          prescription: {
            medication: "Levocetirizine + Multivitamin with zinc",
            dosage: "5mg + 1 capsule",
            frequency: "Once daily at night",
            duration: "30 days, then repeat CBC",
            notes: "Protective measures: mask in crowds, strict hand hygiene, avoid sick contacts.",
          },
        },
  rbc: (r) =>
    r.status === "low"
      ? {
          name: "Anemia",
          icd10: "D64.9",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `RBC ${r.value} ×10⁶/µL is below the 4.5–5.9 reference range.`,
          prescription: {
            medication: "Ferrous Ascorbylate + Folic Acid + B12 injection",
            dosage: "200mg + 5mg + 1000mcg",
            frequency: "Oral daily; injection weekly × 4",
            duration: "90 days",
            notes: "Iron-rich diet, vitamin C with meals.",
          },
        }
      : {
          name: "Erythrocytosis",
          icd10: "D45",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `RBC ${r.value} ×10⁶/µL is above the 4.5–5.9 reference range.`,
          prescription: {
            medication: "Aspirin 75mg + hydration protocol",
            dosage: "75mg",
            frequency: "Once daily",
            duration: "Ongoing",
            notes: "3L water daily, monitor for polycythemia vera.",
          },
        },
  plt: (r) =>
    r.status === "low"
      ? {
          name: "Thrombocytopenia",
          icd10: "D69.6",
          severity: severityOf(r),
          system: "cardiovascular",
          explanation: `Platelets ${r.value} ×10³/µL are below the 150–450 reference range.`,
          prescription: {
            medication: "Folic Acid + Vitamin B12 + Vitamin C",
            dosage: "5mg + 1000mcg + 500mg",
            frequency: "Once daily",
            duration: "30 days, then repeat CBC",
            notes: "Avoid aspirin/NSAIDs until platelet count recovers.",
          },
        }
      : {
          name: "Reactive Thrombocytosis",
          icd10: "D75.1",
          severity: severityOf(r),
          system: "cardiovascular",
          explanation: `Platelets ${r.value} ×10³/µL are above the 150–450 reference range, typically a reactive response to inflammation or infection.`,
          prescription: {
            medication: "Ibuprofen (anti-inflammatory)",
            dosage: "400mg",
            frequency: "Twice daily with food",
            duration: "5 days, then repeat platelet count",
            notes: "Treat the underlying inflammatory trigger.",
          },
        },
  mcv: (r) =>
    r.status === "low"
      ? {
          name: "Microcytic Anemia (Iron Deficiency)",
          icd10: "D50.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `MCV ${r.value} fL is below the 80–100 reference range.`,
          prescription: {
            medication: "Ferrous Ascorbylate",
            dosage: "200mg",
            frequency: "Once daily before breakfast",
            duration: "90 days",
            notes: "Repeat MCV and ferritin after 30 days.",
          },
        }
      : {
          name: "Megaloblastic Anemia",
          icd10: "D51.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `MCV ${r.value} fL is above the 80–100 reference range. Consistent with B12/folate deficiency.`,
          prescription: {
            medication: "Cyanocobalamin injection + Folic Acid",
            dosage: "1000mcg + 5mg",
            frequency: "Injection weekly × 4, then monthly; folic acid daily",
            duration: "90 days",
            notes: "Add animal protein and eggs to diet.",
          },
        },
  neut: (r) =>
    r.status === "high"
      ? {
          name: "Bacterial Infection (Neutrophilia)",
          icd10: "B95",
          severity: severityOf(r),
          system: "inflammation",
          explanation: `Neutrophils ${r.value}% are above the 40–70 reference range.`,
          prescription: {
            medication: "Ciprofloxacin 500mg",
            dosage: "500mg",
            frequency: "Twice daily after meals",
            duration: "7 days",
            notes: "Identify infection site; repeat differential count post-treatment.",
          },
        }
      : {
          name: "Neutropenia",
          icd10: "D70.1",
          severity: severityOf(r),
          system: "inflammation",
          explanation: `Neutrophils ${r.value}% are below the 40–70 reference range.`,
          prescription: {
            medication: "Multivitamin + Zinc + Vitamin C",
            dosage: "1 capsule + 20mg + 500mg",
            frequency: "Once daily",
            duration: "30 days, then repeat CBC",
            notes: "Strict infection precautions.",
          },
        },
  lym: (r) =>
    r.status === "high"
      ? {
          name: "Viral Infection (Lymphocytosis)",
          icd10: "B34.9",
          severity: severityOf(r),
          system: "inflammation",
          explanation: `Lymphocytes ${r.value}% are above the 20–40 reference range. Consistent with an acute viral illness.`,
          prescription: {
            medication: "Paracetamol + Levocetirizine + Zinc",
            dosage: "650mg + 5mg + 20mg",
            frequency: "Paracetamol TDS; others at night",
            duration: "5 days (self-limiting)",
            notes: "Aggressive hydration, rest, soft diet.",
          },
        }
      : {
          name: "Lymphopenia",
          icd10: "D72.810",
          severity: severityOf(r),
          system: "inflammation",
          explanation: `Lymphocytes ${r.value}% are below the 20–40 reference range.`,
          prescription: {
            medication: "Multivitamin + Zinc",
            dosage: "1 capsule + 20mg",
            frequency: "Once daily",
            duration: "30 days, then repeat CBC",
            notes: "Immunonutrition: adequate protein intake.",
          },
        },
  eos: () => {
    return {
      name: "Parasitic Infection with Allergic Component",
      icd10: "B59",
      severity: 2,
      system: "inflammation",
      explanation: `Eosinophils are above the 1–6 reference range. Consistent with parasitic infection or allergic disease.`,
      prescription: {
        medication: "Albendazole + Cetirizine",
        dosage: "400mg single dose + 10mg",
        frequency: "Albendazole as single dose; cetirizine at night",
        duration: "Albendazole repeat in 2 weeks; cetirizine 10 days",
        notes: "Boil drinking water; cook all food thoroughly.",
      },
    };
  },
  mono: (r) => ({
    name: "Post-Viral Monocytosis",
    icd10: "B34.9",
    severity: 1,
    system: "inflammation",
    explanation: `Monocytes ${r.value}% are outside the 2–10 reference range. Typical recovery-phase pattern after a viral infection.`,
    prescription: {
      medication: "Paracetamol PRN + hydration protocol",
      dosage: "650mg",
      frequency: "As needed for fever, max 3 daily",
      duration: "7 days",
      notes: "Repeat CBC in 2 weeks.",
    },
  }),
  esr: (r) => ({
    name: "Systemic Inflammatory Response",
    icd10: "R79.89",
    severity: severityOf(r),
    system: "inflammation",
    explanation: `ESR ${r.value} mm/hr is above the 0–20 reference range. Indicates active systemic inflammation.`,
    prescription: {
      medication: "Diclofenac + Vitamin D3",
      dosage: "50mg + 60000IU",
      frequency: "Diclofenac twice daily with food; D3 weekly",
      duration: "10 days (diclofenac); 8 weeks (D3)",
      notes: "CRP and repeat ESR in 2 weeks.",
    },
  }),
  crp: (r) => ({
    name:
      r.value >= 10
        ? "Marked Systemic Inflammation"
        : r.value >= 3
          ? "Elevated Inflammatory / Cardiovascular Risk"
          : "Mild Inflammatory Response",
    icd10: "R79.89",
    severity: severityOf(r),
    system: "inflammation",
    explanation: `CRP ${r.value} mg/L is above the 0–3 reference range. Elevated CRP tracks cardiovascular and inflammatory risk.`,
    prescription: {
      medication: "Omega-3 (EPA/DHA) + Curcumin",
      dosage: "1000mg + 500mg",
      frequency: "Omega-3 daily with food; curcumin twice daily",
      duration: "90 days, then recheck CRP",
      notes: "Anti-inflammatory diet: reduce refined sugar and processed food; 30 min daily walking.",
    },
  }),
  glu: (r) =>
    r.status === "high"
      ? {
          name:
            r.value >= 126
              ? "Type 2 Diabetes Mellitus"
              : "Prediabetes (Impaired Fasting Glucose)",
          icd10: r.value >= 126 ? "E11.9" : "R73.03",
          severity: severityOf(r),
          system: "metabolic",
          explanation: `Fasting glucose ${r.value} mg/dL is above the 70–100 reference range. Fasting ≥126 is diagnostic of diabetes.`,
          prescription: {
            medication: "Metformin + Berberine",
            dosage: "500mg + 500mg",
            frequency: "Both twice daily after meals",
            duration: "Metformin: titrate to 1000mg BID over 2 weeks; continue",
            notes: "Carb-counted diet, 30 min brisk walk daily, HbA1c in 3 months.",
          },
        }
      : {
          name: "Hypoglycemia",
          icd10: "E16.1",
          severity: severityOf(r),
          system: "metabolic",
          explanation: `Fasting glucose ${r.value} mg/dL is below the 70–100 reference range.`,
          prescription: {
            medication: "Glucose tablets (emergency) + frequent meals",
            dosage: "15g per episode",
            frequency: "On symptoms; 4–6 meals daily",
            duration: "Ongoing dietary management",
            notes: "Rule out sulfonylurea use; monitor random sugars.",
          },
        },
  hba1c: (r) =>
    r.status === "high"
      ? {
          name:
            r.value >= 6.5 ? "Diabetes Mellitus" : "Diabetes (Impaired Glucose Regulation)",
          icd10: "E11.9",
          severity: severityOf(r),
          system: "metabolic",
          explanation: `HbA1c ${r.value}% is above the 4.0–5.7 reference range. ≥6.5 is diagnostic of diabetes.`,
          prescription: {
            medication: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily after meals",
            duration: "Ongoing, titrate to 1000mg BID",
            notes: "Diet control + exercise; repeat HbA1c in 3 months.",
          },
        }
      : {
          name: "Hypoglycemia (Chronic)",
          icd10: "E16.1",
          severity: severityOf(r),
          system: "metabolic",
          explanation: `HbA1c ${r.value}% is below the 4.0–5.7 reference range.`,
          prescription: {
            medication: "Frequent-meal diet + glucose emergency pack",
            dosage: "15g per episode",
            frequency: "As needed",
            duration: "Ongoing",
            notes: "Avoid prolonged fasting; review any hypoglycemic agents.",
          },
        },
  tsh: (r) =>
    r.status === "high"
      ? {
          name: "Hypothyroidism",
          icd10: "E03.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `TSH ${r.value} µIU/mL is above the 0.4–4.0 reference range.`,
          prescription: {
            medication: "Thyroxine (Levothyroxine)",
            dosage: "25mcg",
            frequency: "Once daily, empty stomach, 30 min before breakfast",
            duration: "Ongoing; titrate every 6 weeks by TSH",
            notes: "Keep separation from calcium/iron supplements by 4 hours.",
          },
        }
      : {
          name: "Hyperthyroidism",
          icd10: "E05.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `TSH ${r.value} µIU/mL is below the 0.4–4.0 reference range.`,
          prescription: {
            medication: "Carbimazole + Propranolol",
            dosage: "5mg + 40mg",
            frequency: "Carbimazole once daily; propranolol twice daily",
            duration: "6 weeks, then recheck TFTs",
            notes: "Avoid high-iodine foods (seafood, kelp).",
          },
        },
  t3: (r) =>
    r.status === "high"
      ? {
          name: "Hyperthyroidism",
          icd10: "E05.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `${r.test.label} ${r.value} ${r.test.unit} is above the reference range.`,
          prescription: {
            medication: "Carbimazole + Propranolol",
            dosage: "5mg + 40mg",
            frequency: "Carbimazole once daily; propranolol twice daily",
            duration: "6 weeks, then recheck TFTs",
            notes: "Avoid high-iodine foods.",
          },
        }
      : {
          name: "Hypothyroidism",
          icd10: "E03.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `${r.test.label} ${r.value} ${r.test.unit} is below the reference range.`,
          prescription: {
            medication: "Thyroxine (Levothyroxine)",
            dosage: "25mcg",
            frequency: "Once daily, empty stomach",
            duration: "Ongoing; titrate by TSH",
            notes: "Separate from iron/calcium by 4 hours.",
          },
        },
  t4: (r) =>
    r.status === "high"
      ? {
          name: "Hyperthyroidism",
          icd10: "E05.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `${r.test.label} ${r.value} ${r.test.unit} is above the reference range.`,
          prescription: {
            medication: "Carbimazole + Propranolol",
            dosage: "5mg + 40mg",
            frequency: "Carbimazole once daily; propranolol twice daily",
            duration: "6 weeks, then recheck TFTs",
            notes: "Avoid high-iodine foods.",
          },
        }
      : {
          name: "Hypothyroidism",
          icd10: "E03.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `${r.test.label} ${r.value} ${r.test.unit} is below the reference range.`,
          prescription: {
            medication: "Thyroxine (Levothyroxine)",
            dosage: "25mcg",
            frequency: "Once daily, empty stomach",
            duration: "Ongoing; titrate by TSH",
            notes: "Separate from iron/calcium by 4 hours.",
          },
        },
  ft3: (r) =>
    r.status === "high"
      ? {
          name: "Hyperthyroidism (High Free T3)",
          icd10: "E05.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `Free T3 ${r.value} pg/mL is above the 2.0–4.4 reference range.`,
          prescription: {
            medication: "Carbimazole + Propranolol",
            dosage: "5mg + 40mg",
            frequency: "Carbimazole once daily; propranolol twice daily",
            duration: "6 weeks, then recheck TFTs",
            notes: "Avoid high-iodine foods.",
          },
        }
      : {
          name: "Hypothyroidism (Low Free T3)",
          icd10: "E03.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `Free T3 ${r.value} pg/mL is below the 2.0–4.4 reference range.`,
          prescription: {
            medication: "Thyroxine (Levothyroxine)",
            dosage: "25mcg",
            frequency: "Once daily, empty stomach",
            duration: "Ongoing; titrate by TSH",
            notes: "Separate from iron/calcium by 4 hours.",
          },
        },
  ft4: (r) =>
    r.status === "high"
      ? {
          name: "Hyperthyroidism (High Free T4)",
          icd10: "E05.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `Free T4 ${r.value} ng/dL is above the 0.9–1.8 reference range.`,
          prescription: {
            medication: "Carbimazole + Propranolol",
            dosage: "5mg + 40mg",
            frequency: "Carbimazole once daily; propranolol twice daily",
            duration: "6 weeks, then recheck TFTs",
            notes: "Avoid high-iodine foods.",
          },
        }
      : {
          name: "Hypothyroidism (Low Free T4)",
          icd10: "E03.9",
          severity: severityOf(r),
          system: "thyroid",
          explanation: `Free T4 ${r.value} ng/dL is below the 0.9–1.8 reference range.`,
          prescription: {
            medication: "Thyroxine (Levothyroxine)",
            dosage: "25mcg",
            frequency: "Once daily, empty stomach",
            duration: "Ongoing; titrate by TSH",
            notes: "Separate from iron/calcium by 4 hours.",
          },
        },
  tpoab: (r) => ({
    name: "Hashimoto's Thyroiditis (Thyroid Autoimmunity)",
    icd10: "E03.5",
    severity: severityOf(r),
    system: "thyroid",
    explanation: `TPO antibody ${r.value} IU/mL is above the 0–35 reference range, indicating thyroid autoimmunity (Hashimoto's).`,
    prescription: {
      medication: "Selenium + Thyroxine if TSH elevated",
      dosage: "200mcg selenium daily",
      frequency: "Once daily",
      duration: "Ongoing; TSH every 6 weeks",
      notes: "Moderate iodine intake; repeat TPOAb in 6 months.",
    },
  }),
  cr: (r) => ({
    name: "Renal Insufficiency",
    icd10: "N18.4",
    severity: severityOf(r),
    system: "kidney",
    explanation: `Creatinine ${r.value} mg/dL is above the 0.7–1.3 reference range.`,
    prescription: {
      medication: "Benazepril + hydration protocol",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "28 days, then recheck creatinine",
      notes: "2.5L water daily; strictly avoid NSAIDs and contrast dyes.",
    },
  }),
  bun: (r) => ({
    name: "Elevated BUN (Renal Strain)",
    icd10: "N18.4",
    severity: severityOf(r),
    system: "kidney",
    explanation: `BUN ${r.value} mg/dL is above the 7–20 reference range.`,
    prescription: {
      medication: "Hydration protocol + protein moderation",
      dosage: "2.5L water daily",
      frequency: "Spread through the day",
      duration: "28 days, then recheck",
      notes: "Avoid NSAIDs and high-protein supplements until normalized.",
    },
  }),
  egfr: (r) => ({
    name: "Reduced Kidney Filtration",
    icd10: "N18.4",
    severity: severityOf(r),
    system: "kidney",
    explanation: `eGFR ${r.value} mL/min/1.73m² is below the 60+ normal range.`,
    prescription: {
      medication: "Benazepril + hydration protocol",
      dosage: "10mg",
      frequency: "Once daily",
      duration: "Ongoing, monitor quarterly",
      notes: "2.5L water daily; strictly avoid NSAIDs.",
    },
  }),
  csf: (r) => ({
    name: "Reduced Kidney Filtration (Cystatin C)",
    icd10: "N18.4",
    severity: severityOf(r),
    system: "kidney",
    explanation: `Cystatin C ${r.value} mg/L is outside the 0.7–1.3 reference range.`,
    prescription: {
      medication: "Hydration protocol + renal-protective diet",
      dosage: "2.5L water daily",
      frequency: "Daily",
      duration: "28 days, then recheck",
      notes: "Strictly avoid NSAIDs and contrast dyes.",
    },
  }),
  ua: (r) => ({
    name: "Gouty Arthritis (Hyperuricemia)",
    icd10: "M10.9",
    severity: severityOf(r),
    system: "metabolic",
    explanation: `Uric acid ${r.value} mg/dL is above the 3.5–7.0 reference range.`,
    prescription: {
      medication: "Allopurinol + Colchicine",
      dosage: "100mg + 0.5mg",
      frequency: "Allopurinol once daily; colchicine TDS for 2 days",
      duration: "Allopurinol 8 weeks, titrate by uric acid",
      notes: "Avoid red meat, organ meats, alcohol; 2.5L water daily.",
    },
  }),
  alt: (r) => ({
    name: "Hepatic Steatosis (Fatty Liver)",
    icd10: "K76.0",
    severity: severityOf(r),
    system: "liver",
    explanation: `ALT ${r.value} U/L is above the reference range. Transaminase elevation consistent with fatty liver disease.`,
    prescription: {
      medication: "Silymarin + Vitamin E",
      dosage: "140mg + 400IU",
      frequency: "Silymarin twice daily with meals; vitamin E once daily",
      duration: "90 days, then recheck LFTs",
      notes: "No alcohol, weight reduction if overweight, 30 min daily walking.",
    },
  }),
  ast: (r) => ({
    name: "Hepatic Steatosis (Fatty Liver)",
    icd10: "K76.0",
    severity: severityOf(r),
    system: "liver",
    explanation: `AST ${r.value} U/L is above the reference range. Transaminase elevation consistent with fatty liver disease.`,
    prescription: {
      medication: "Silymarin + Vitamin E",
      dosage: "140mg + 400IU",
      frequency: "Silymarin twice daily with meals; vitamin E once daily",
      duration: "90 days, then recheck LFTs",
      notes: "No alcohol, weight reduction if overweight, 30 min daily walking.",
    },
  }),
  alp: (r) => ({
    name: "Cholestatic Liver Process",
    icd10: "K76.6",
    severity: severityOf(r),
    system: "liver",
    explanation: `Alkaline phosphatase ${r.value} U/L is outside the 44–147 reference range.`,
    prescription: {
      medication: "Silymarin + UDCA",
      dosage: "140mg + 250mg",
      frequency: "Both twice daily with meals",
      duration: "60 days, then recheck LFTs",
      notes: "No alcohol; abdominal ultrasound recommended.",
    },
  }),
  ggt: (r) => ({
    name: "Alcohol-Related Liver Stress",
    icd10: "K70.9",
    severity: severityOf(r),
    system: "liver",
    explanation: `GGT ${r.value} U/L is above the reference range, commonly from alcohol intake or medication load.`,
    prescription: {
      medication: "Silymarin + N-Acetylcysteine",
      dosage: "140mg + 600mg",
      frequency: "Twice daily with meals",
      duration: "60 days, then recheck",
      notes: "Eliminate alcohol for 8 weeks.",
    },
  }),
  tbil: (r) => ({
    name: "Mild Hyperbilirubinemia",
    icd10: "R18.0",
    severity: severityOf(r),
    system: "liver",
    explanation: `Total bilirubin ${r.value} mg/dL is above the 0.3–1.2 reference range.`,
    prescription: {
      medication: "Hydration + liver-protective diet",
      dosage: "2.5L water daily",
      frequency: "Daily",
      duration: "30 days, then recheck",
      notes: "No alcohol; repeat LFT panel in 4 weeks.",
    },
  }),
  dbil: (r) => ({
    name: "Conjugated Hyperbilirubinemia",
    icd10: "R18.0",
    severity: severityOf(r),
    system: "liver",
    explanation: `Direct bilirubin ${r.value} mg/dL is above the 0–0.3 reference range.`,
    prescription: {
      medication: "UDCA + Silymarin",
      dosage: "250mg + 140mg",
      frequency: "Twice daily with meals",
      duration: "60 days, then recheck",
      notes: "Abdominal ultrasound recommended.",
    },
  }),
  alb: (r) => ({
    name: "Protein-Energy Malnutrition",
    icd10: "E44",
    severity: severityOf(r),
    system: "liver",
    explanation: `Albumin ${r.value} g/dL is below the 3.5–5.2 reference range.`,
    prescription: {
      medication: "Oral Nutritional Supplement + Multivitamin",
      dosage: "230ml sachet + 1 capsule",
      frequency: "Sachet twice daily; capsule once daily",
      duration: "60 days, then recheck",
      notes: "Protein-rich diet: eggs, dairy, pulses, nuts at every meal.",
    },
  }),
  tp: (r) => ({
    name: "Protein-Energy Malnutrition",
    icd10: "E44",
    severity: severityOf(r),
    system: "liver",
    explanation: `Total protein ${r.value} g/dL is outside the 6.4–8.3 reference range.`,
    prescription: {
      medication: "Oral Nutritional Supplement + Multivitamin",
      dosage: "230ml sachet + 1 capsule",
      frequency: "Sachet twice daily; capsule once daily",
      duration: "60 days, then recheck",
      notes: "Protein-rich diet: eggs, dairy, pulses, nuts at every meal.",
    },
  }),
  chol: (r) => ({
    name: "Hyperlipidemia",
    icd10: "E78.5",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `Total cholesterol ${r.value} mg/dL is above the 125–200 reference range.`,
    prescription: {
      medication: "Atorvastatin",
      dosage: "10mg",
      frequency: "Once daily at bedtime",
      duration: "Ongoing; recheck lipid profile in 8 weeks",
      notes: "Low-saturated-fat diet, 30 min daily walking.",
    },
  }),
  tg: (r) => ({
    name: "Hypertriglyceridemia",
    icd10: "E78.1",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `Triglycerides ${r.value} mg/dL are above the 30–150 reference range.`,
    prescription: {
      medication: "Fenofibrate + Vitamin E",
      dosage: "145mg + 400IU",
      frequency: "Once daily with dinner",
      duration: "8 weeks, then recheck",
      notes: "Strictly limit sugar, sweets, and refined carbs; no alcohol.",
    },
  }),
  hdl: (r) => ({
    name: "Low HDL Dyslipidemia",
    icd10: "E78.4",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `HDL ${r.value} mg/dL is below the 40–90 reference range.`,
    prescription: {
      medication: "Atorvastatin + Vitamin E",
      dosage: "10mg + 400IU",
      frequency: "Atorvastatin at bedtime; vitamin E daily",
      duration: "8 weeks, then recheck lipids",
      notes: "Aerobic exercise 30 min daily is the primary HDL-raising intervention.",
    },
  }),
  ldl: (r) => ({
    name: "Hyperlipidemia (High LDL)",
    icd10: "E78.0",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `LDL ${r.value} mg/dL is above the 0–100 optimal range.`,
    prescription: {
      medication: "Atorvastatin",
      dosage: "10mg",
      frequency: "Once daily at bedtime",
      duration: "Ongoing; recheck lipids in 8 weeks",
      notes: "Low-saturated-fat diet, 30 min daily walking.",
    },
  }),
  vldl: (r) => ({
    name: "Hypertriglyceridemia (High VLDL)",
    icd10: "E78.1",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `VLDL ${r.value} mg/dL is outside the 5–40 reference range.`,
    prescription: {
      medication: "Fenofibrate",
      dosage: "145mg",
      frequency: "Once daily with dinner",
      duration: "8 weeks, then recheck",
      notes: "Strictly limit sugar and refined carbs; no alcohol.",
    },
  }),
  apob: (r) => ({
    name: "Elevated ApoB (Atherogenic Particle Load)",
    icd10: "E78.8",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `Apolipoprotein B ${r.value} mg/dL is above the 60–125 reference range – elevated atherogenic particle count and cardiovascular risk.`,
    prescription: {
      medication: "Atorvastatin + Berberine",
      dosage: "10mg + 500mg",
      frequency: "Atorvastatin at bedtime; berberine twice daily with meals",
      duration: "8 weeks, then recheck ApoB and lipids",
      notes: "Reduce refined carbs and saturated fat; 30 min daily walking.",
    },
  }),
  apoai: (r) => ({
    name: r.status === "low" ? "Low ApoA1" : "Elevated ApoA1",
    icd10: "E78.8",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `Apolipoprotein A1 ${r.value} mg/dL is outside the 100–175 reference range.`,
    prescription: {
      medication: "Omega-3 + aerobic exercise protocol",
      dosage: "1000mg EPA/DHA",
      frequency: "Once daily with food; 30 min brisk walk daily",
      duration: "8 weeks, then recheck",
      notes: "Exercise is the primary ApoA1-raising intervention.",
    },
  }),
  lpa: (r) => ({
    name: "Elevated Lipoprotein(a)",
    icd10: "E78.8",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `Lipoprotein(a) ${r.value} mg/dL is above the <30 optimal range – a genetic, independent cardiovascular risk factor.`,
    prescription: {
      medication: "Pelacarsen (if ≥50) / Omega-3 + PCSK9 inhibitor review",
      dosage: "1000mg Omega-3 daily",
      frequency: "Daily",
      duration: "Ongoing",
      notes: "Keep other lipids strictly in range; cardiovascular screening yearly.",
    },
  }),
  vid: (r) =>
    r.status === "low"
      ? {
          name: "Vitamin D Deficiency",
          icd10: "E55.9",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Vitamin D ${r.value} ng/mL is below the 30–60 reference range.`,
          prescription: {
            medication: "Cholecalciferol (Vitamin D3)",
            dosage: "5000 IU",
            frequency: "Once daily with a meal containing fat",
            duration: "8 weeks, then recheck 25-OH D",
            notes: "Add 15–20 min midday sun exposure daily.",
          },
        }
      : {
          name: "Vitamin D Excess (High 25-OH D)",
          icd10: "E55.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Vitamin D ${r.value} ng/mL is above the 30–60 reference range.`,
          prescription: {
            medication: "Stop D3 supplementation",
            dosage: "0 IU",
            frequency: "–",
            duration: "Recheck 25-OH D in 6 weeks",
            notes: "Maintain normal diet; calcium check recommended.",
          },
        },
  b12: (r) =>
    r.status === "low"
      ? {
          name: "Vitamin B12 Deficiency",
          icd10: "D51.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Vitamin B12 ${r.value} pg/mL is below the 180–900 reference range.`,
          prescription: {
            medication: "Cyanocobalamin injection + oral B12",
            dosage: "1000mcg injection + 1000mcg oral",
            frequency: "Injection weekly × 4, then monthly; oral daily",
            duration: "90 days, then recheck",
            notes: "Add eggs, dairy, and meat to diet.",
          },
        }
      : {
          name: "Elevated B12",
          icd10: "D51.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Vitamin B12 ${r.value} pg/mL is above the 180–900 reference range.`,
          prescription: {
            medication: "Discontinue B12 supplements",
            dosage: "–",
            frequency: "–",
            duration: "Recheck in 8 weeks",
            notes: "Check liver and hematologic status if persistently high.",
          },
        },
  fol: (r) =>
    r.status === "low"
      ? {
          name: "Folate Deficiency",
          icd10: "D52.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Folate ${r.value} ng/mL is below the 3–17 reference range.`,
          prescription: {
            medication: "Folic Acid + Multivitamin",
            dosage: "5mg + 1 capsule",
            frequency: "Once daily",
            duration: "60 days, then recheck",
            notes: "Leafy greens, legumes, and citrus daily.",
          },
        }
      : {
          name: "Elevated Folate",
          icd10: "D52.0",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Folate ${r.value} ng/mL is above the 3–17 reference range.`,
          prescription: {
            medication: "Discontinue folate supplementation",
            dosage: "–",
            frequency: "–",
            duration: "Recheck in 8 weeks",
            notes: "Dietary folate is sufficient for most people.",
          },
        },
  iron: (r) =>
    r.status === "low"
      ? {
          name: "Iron Deficiency",
          icd10: "D50.9",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Serum iron ${r.value} µg/dL is below the 60–170 reference range.`,
          prescription: {
            medication: "Ferrous Ascorbylate",
            dosage: "200mg",
            frequency: "Once daily before breakfast",
            duration: "90 days, then recheck iron studies",
            notes: "Iron-rich foods; vitamin C with meals; avoid tea/coffee near doses.",
          },
        }
      : {
          name: "Elevated Serum Iron",
          icd10: "E88.1",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Serum iron ${r.value} µg/dL is above the 60–170 reference range.`,
          prescription: {
            medication: "Discontinue iron supplements",
            dosage: "–",
            frequency: "–",
            duration: "Recheck iron + ferritin in 8 weeks",
            notes: "Check ferritin to rule out hemochromatosis if persistently high.",
          },
        },
  tIBC: (r) => ({
    name:
      r.status === "low"
        ? "Elevated Iron Availability (Low TIBC)"
        : "Iron Deficiency (High TIBC)",
    icd10: "D50.9",
    severity: severityOf(r),
    system: "nutritional",
    explanation: `TIBC ${r.value} µg/dL is outside the 250–370 reference range.`,
    prescription: {
      medication:
        r.status === "low"
          ? "Discontinue iron supplements"
          : "Ferrous Ascorbylate 200mg",
      dosage: r.status === "low" ? "–" : "200mg once daily",
      frequency: r.status === "low" ? "–" : "Once daily before breakfast",
      duration: r.status === "low" ? "Recheck in 8 weeks" : "90 days, then recheck",
      notes: "Pair with ferritin for full picture.",
    },
  }),
  isat: (r) =>
    r.status === "low"
      ? {
          name: "Low Iron Saturation",
          icd10: "D50.9",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Iron saturation ${r.value}% is below the 20–50 reference range.`,
          prescription: {
            medication: "Ferrous Ascorbylate",
            dosage: "200mg",
            frequency: "Once daily before breakfast",
            duration: "90 days, then recheck iron studies",
            notes: "Vitamin C with meals improves absorption.",
          },
        }
      : {
          name: "High Iron Saturation",
          icd10: "E88.1",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Iron saturation ${r.value}% is above the 20–50 reference range.`,
          prescription: {
            medication: "Discontinue iron supplements",
            dosage: "–",
            frequency: "–",
            duration: "Recheck ferritin + saturation in 8 weeks",
            notes: "Rule out hemochromatosis if persistently elevated.",
          },
        },
  fer: (r) =>
    r.status === "low"
      ? {
          name: "Iron Store Depletion (Low Ferritin)",
          icd10: "D50.9",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Ferritin ${r.value} ng/mL is below the 30–300 reference range – iron stores are depleted.`,
          prescription: {
            medication: "Ferrous Ascorbylate",
            dosage: "200mg",
            frequency: "Once daily before breakfast",
            duration: "90 days, target ferritin > 50",
            notes: "Recheck ferritin at 6 weeks; iron-rich diet.",
          },
        }
      : {
          name: "Elevated Ferritin",
          icd10: "E88.1",
          severity: severityOf(r),
          system: "nutritional",
          explanation: `Ferritin ${r.value} ng/mL is above the 30–300 reference range – can indicate iron overload or inflammation.`,
          prescription: {
            medication: "Discontinue iron + Omega-3 (anti-inflammatory)",
            dosage: "1000mg Omega-3",
            frequency: "Once daily",
            duration: "8 weeks, then recheck ferritin + CRP",
            notes: "Reduce alcohol; consider HFE testing if persistently high.",
          },
        },
  testo: (r) =>
    r.status === "low"
      ? {
          name: "Hypogonadism (Low Testosterone)",
          icd10: "E89.0",
          severity: severityOf(r),
          system: "hormonal",
          explanation: `Testosterone ${r.value} ng/dL is below the 300–1000 reference range.`,
          prescription: {
            medication: "Vitamin D3 + Zinc + strength training protocol",
            dosage: "3000IU + 30mg",
            frequency: "Vitamin D daily; zinc with dinner; 3× resistance sessions weekly",
            duration: "12 weeks, then recheck testosterone",
            notes: "Sleep 7–9h; sleep apnea screening if snoring.",
          },
        }
      : {
          name: "Elevated Testosterone",
          icd10: "E28.0",
          severity: severityOf(r),
          system: "hormonal",
          explanation: `Testosterone ${r.value} ng/dL is above the 300–1000 reference range.`,
          prescription: {
            medication: "Review exogenous androgens / anabolic supplements",
            dosage: "–",
            frequency: "–",
            duration: "Recheck in 4 weeks",
            notes: "If supplements: stop and recheck. If none: endocrinology review.",
          },
        },
  estr: (r) => ({
    name:
      r.status === "low" ? "Low Estradiol" : "Elevated Estradiol",
    icd10: "E89.8",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `Estradiol ${r.value} pg/mL is outside the reference range.`,
    prescription: {
      medication: "Review exogenous estrogen / endocrinology consult",
      dosage: "–",
      frequency: "–",
      duration: "Recheck in 6 weeks",
      notes: "Interpret with FSH/LH context.",
    },
  }),
  fsh: (r) => ({
    name:
      r.status === "high"
        ? "Hypergonadotropic State (Primary GONAD Failure)"
        : "Hypogonadotropic State",
    icd10: "E89.0",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `FSH ${r.value} mIU/mL is outside the 1.5–12.4 reference range.`,
    prescription: {
      medication: "Endocrinology review + targeted hormone therapy",
      dosage: "Per specialist",
      frequency: "Per specialist",
      duration: "6-week review cycle",
      notes: "Interpret alongside LH and sex steroids.",
    },
  }),
  lh: (r) => ({
    name:
      r.status === "high" ? "Elevated LH" : "Low LH",
    icd10: "E89.0",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `LH ${r.value} mIU/mL is outside the 1.7–8.6 reference range.`,
    prescription: {
      medication: "Endocrinology review + targeted therapy",
      dosage: "Per specialist",
      frequency: "Per specialist",
      duration: "6-week review cycle",
      notes: "Interpret alongside FSH and sex steroids.",
    },
  }),
  dh: (r) => ({
    name: r.status === "low" ? "Low DHEA-S" : "Elevated DHEA-S",
    icd10: "E89.8",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `DHEA-S ${r.value} µg/dL is outside the 20–600 reference range.`,
    prescription: {
      medication: "Review PCOS / adrenal workup",
      dosage: "Per findings",
      frequency: "–",
      duration: "8-week review",
      notes: "Interpret with cortisol and androgen panel.",
    },
  }),
  prol: (r) => ({
    name: "Hyperprolactinemia",
    icd10: "E22.1",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `Prolactin ${r.value} ng/mL is above the 2–18 reference range.`,
    prescription: {
      medication: "Cabergoline + B6",
      dosage: "0.25mg + 50mg",
      frequency: "Cabergoline twice weekly; B6 daily",
      duration: "8 weeks, then recheck prolactin",
      notes: "Exclude hypothyroidism and medication causes first.",
    },
  }),
  shbg: (r) => ({
    name:
      r.status === "low" ? "Low SHBG" : "High SHBG",
    icd10: "E89.8",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `SHBG ${r.value} nmol/L is outside the 18.3–54.9 reference range.`,
    prescription: {
      medication: "Address metabolic drivers (insulin, thyroid, liver)",
      dosage: "Per findings",
      frequency: "–",
      duration: "12-week review",
      notes: "SHBG follows insulin, thyroid, and liver status.",
    },
  }),
  cort: (r) => ({
    name:
      r.status === "low" ? "Low Morning Cortisol" : "Elevated Morning Cortisol",
    icd10: "E27.4",
    severity: severityOf(r),
    system: "hormonal",
    explanation: `Cortisol ${r.value} µg/dL is outside the 5–25 reference range.`,
    prescription: {
      medication: "Adrenal workup: ACTH stimulation test",
      dosage: "Per protocol",
      frequency: "–",
      duration: "4-week workup",
      notes: "Avoid extreme stress the day before the recheck.",
    },
  }),
  hcy: (r) => ({
    name: "Hyperhomocysteinemia",
    icd10: "E88.4",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `Homocysteine ${r.value} µmol/L is above the 5–15 reference range – an independent cardiovascular risk factor.`,
    prescription: {
      medication: "Folic Acid + B12 + B6",
      dosage: "5mg + 1000mcg + 50mg",
      frequency: "Once daily",
      duration: "12 weeks, then recheck",
      notes: "Reduce alcohol; check MTHFR status if persistently high.",
    },
  }),
  psa: (r) => ({
    name: "Elevated PSA",
    icd10: "R97.208",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `PSA ${r.value} ng/mL is above the 0–4 reference range.`,
    prescription: {
      medication: "Urology consult + free/total PSA ratio",
      dosage: "Per protocol",
      frequency: "–",
      duration: "4-week workup",
      notes: "PSA can be transiently elevated by UTI or ejaculation.",
    },
  }),
  igf1: (r) => ({
    name:
      r.status === "low" ? "Low IGF-1" : "Elevated IGF-1",
    icd10: "E34.8",
    severity: severityOf(r),
    system: "cardiovascular",
    explanation: `IGF-1 ${r.value} ng/mL is outside the age-adjusted range.`,
    prescription: {
      medication: "Growth hormone axis review",
      dosage: "Per specialist",
      frequency: "–",
      duration: "8-week review",
      notes: "Interpret with age and liver function.",
    },
  }),
  cp: (r) => ({
    name:
      r.status === "high"
        ? "Insulin Resistance (Elevated C-Peptide)"
        : "Low C-Peptide",
    icd10: "E11.65",
    severity: severityOf(r),
    system: "metabolic",
    explanation: `C-Peptide ${r.value} ng/mL is outside the 1.1–4.4 reference range.`,
    prescription: {
      medication: "Metformin + Berberine",
      dosage: "500mg + 500mg",
      frequency: "Twice daily with meals",
      duration: "12 weeks, then recheck",
      notes: "Carb-counted diet; 30 min daily walking.",
    },
  }),
  pdw: (r) => ({
    name: "Red Cell Size Variability (Anisocytosis)",
    icd10: "D64.9",
    severity: 1,
    system: "nutritional",
    explanation: `PDW ${r.value} fL is outside the 9–17 reference range – variable red cell sizes suggest mixed or early nutritional deficiency.`,
    prescription: {
      medication: "Multivitamin with iron + B12 + folate",
      dosage: "1 capsule",
      frequency: "Once daily",
      duration: "30 days, then recheck CBC",
      notes: "Pair with ferritin and B12 levels.",
    },
  }),
};

/* ---------------- System definitions ---------------- */

const SYSTEM_DEFS: { id: string; name: string }[] = [
  { id: "cardiovascular", name: "Heart Health" },
  { id: "inflammation", name: "Inflammation" },
  { id: "metabolic", name: "Metabolic Health" },
  { id: "thyroid", name: "Thyroid Health" },
  { id: "hormonal", name: "Hormonal Health" },
  { id: "nutritional", name: "Nutritional" },
  { id: "liver", name: "Liver Health" },
  { id: "kidney", name: "Kidney Health" },
];

/* ---------------- Main entry point ---------------- */

export function parseLabReport(text: string): LabResult | null {
  const lower = text.toLowerCase();
  const words: WordHit[] = [];
  const wordRe = /[a-z][a-z0-9]{1,}/g;
  let wm: RegExpExecArray | null;
  while ((wm = wordRe.exec(lower))) words.push({ w: wm[0], i: wm.index });

  const rows: LabRow[] = [];
  const consumed: { from: number; to: number }[] = [];
  for (const test of LAB_TESTS) {
    const value = extractValueForTest(lower, words, test, consumed);
    if (value !== null) {
      const status: LabRow["status"] =
        value < test.low ? "low" : value > test.high ? "high" : "normal";
      rows.push({ test, value, status });
    }
  }

  if (rows.length < 2) return null;

  /* Findings */
  const findings: LabFinding[] = [];
  const byName = new Map<string, LabFinding>();
  const addFinding = (f: LabFinding) => {
    const existing = byName.get(f.name);
    if (!existing || existing.severity < f.severity) byName.set(f.name, f);
  };
  for (const row of rows) {
    if (row.status === "normal") continue;
    const gen = RX[row.test.key];
    if (gen) addFinding(gen(row));
  }
  findings.push(...byName.values());
  findings.sort((a, b) => b.severity - a.severity);
  const primary = findings[0] ?? null;
  const confidence = primary
    ? Math.min(97, 60 + primary.severity * 10 + Math.min(17, rows.length))
    : 50;

  /* System scores */
  const systems: LabSystem[] = SYSTEM_DEFS.map((def) => {
    const sysRows = rows.filter((r) => r.test.system === def.id);
    const abnormal = sysRows.filter((r) => r.status !== "normal").length;
    let score = 100;
    for (const r of sysRows) {
      if (r.status === "normal") continue;
      const sev = severityOf(r);
      score -= sev === 3 ? 28 : sev === 2 ? 16 : 8;
    }
    score = Math.max(12, score - Math.floor((abnormal / Math.max(1, sysRows.length)) * 10));
    const status = score >= 80 ? "in" : score >= 60 ? "watch" : "out";
    return {
      id: def.id,
      name: def.name,
      score: Math.round(score),
      status,
      abnormal,
      total: sysRows.length,
    };
  });

  /* Care actions – one per finding, ranked by severity */
  const actions: CareAction[] = findings
    .map((f) => ({
      title: f.name,
      detail: `${f.explanation} ${f.prescription.notes}`,
      timeframe: f.severity === 3 ? "This week" : f.severity === 2 ? "This month" : "Next test cycle",
      level: (f.severity === 3 ? "L1" : f.severity === 2 ? "L2" : "L3") as CareAction["level"],
      improves: f.system,
    }));

  /* Supplement plan – deduped from prescriptions */
  const supMap = new Map<string, Supplement>();
  const supplementFrom = (f: LabFinding) => {
    const p = f.prescription;
    const primary = p.medication.split("+")[0].trim();
    if (supMap.has(primary)) return;
    supMap.set(primary, {
      name: primary,
      dose: p.dosage.split("+")[0].trim(),
      timing: p.frequency.split(";")[0].trim(),
      improves: f.system,
    });
  };
  for (const f of findings) supplementFrom(f);
  const supplements = [...supMap.values()].slice(0, 8);

  return { rows, findings, primary, confidence, systems, actions, supplements };
}
