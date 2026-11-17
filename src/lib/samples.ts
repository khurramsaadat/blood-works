export type SampleId = "wbc" | "thyroid" | "lipids";

export type Sample = {
  id: SampleId;
  label: string;
  note: string;
  ocrText: string;
};

/**
 * Three fully parseable transcripts used by the homepage demo cards. They are
 * cached here (not in the URL) so the visitor only carries ?sample=<id>.
 */
export const SAMPLES: Record<SampleId, Sample> = {
  wbc: {
    id: "wbc",
    label: "WBC differential",
    note: "A raised white-cell count with neutrophilia – the classic bacterial pattern.",
    ocrText: `HAEMATOLOGY
COMPLETE BLOOD COUNT (CBC)
TEST VALUE UNIT REFERENCE
HEMOGLOBIN 14.2 g/dl 13 - 17
TOTAL LEUKOCYTE COUNT 11,600 cumm 4,000 - 11,000
NEUTROPHILS 78 % 40 - 70
LYMPHOCYTES 22 % 20 - 40
EOSINOPHILS 2 % 1 - 6
MONOCYTES 4 % 2 - 10
BASOPHILS 0 % 0 - 1
PLATELET COUNT 265 lakhs/cumm 150 - 410
TOTAL RBC COUNT 5.1 million/cumm 4.5 - 5.9
HEMATOCRIT VALUE, HCT 41 % 40 - 50
MEAN CORPUSCULAR VOLUME, MCV 86 fL 80 - 100`,
  },
  thyroid: {
    id: "thyroid",
    label: "Thyroid profile",
    note: "TSH above range with a low T4 – primary hypothyroidism, not a borderline call.",
    ocrText: `BIOCHEMISTRY
THYROID PROFILE
TEST VALUE UNIT REFERENCE
TSH 6.82 uIU/mL 0.4 - 4.0
T3 1.1 ng/mL 0.8 - 2.0
T4 4.78 ug/dL 5.0 - 12.0
VITAMIN D 18 ng/mL 30 - 100`,
  },
  lipids: {
    id: "lipids",
    label: "Lipid panel",
    note: "LDL and triglycerides up, HDL down – an atherogenic pattern worth acting on.",
    ocrText: `BIOCHEMISTRY
LIPID PROFILE
TEST VALUE UNIT REFERENCE
TOTAL CHOLESTEROL 232 mg/dL 125 - 200
TRIGLYCERIDES 186 mg/dL 50 - 150
HDL CHOLESTEROL 38 mg/dL 40 - 60
LDL CHOLESTEROL 148 mg/dL 0 - 100
VLDL CHOLESTEROL 37 mg/dL 5 - 40
APOLIPOPROTEIN B 118 mg/dL 60 - 125`,
  },
};

export function isSampleId(value: string | null | undefined): value is SampleId {
  return value === "wbc" || value === "thyroid" || value === "lipids";
}
