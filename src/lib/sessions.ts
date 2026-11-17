/*
 * Session storage for Blood Works.
 *
 * Everything the user does with a report (the uploaded image, the editable
 * OCR text, the parsed analysis, and the Sai chat) is saved to
 * localStorage so it survives refreshes and can be browsed/cleared later.
 *
 * This module is pure browser code (localStorage) and only runs client-side;
 * it is imported from client components.
 */

import type { LabResult } from "./lab";

export type ChatMsg = { role: "user" | "assistant"; content: string; reasoning?: string };

export type SavedSession = {
  id: string;
  createdAt: string; // ISO, first save of this session
  updatedAt: string; // ISO, last save
  kind: "lab" | "symptom";
  image: string; // dataURL of the first uploaded report (" " for symptom sessions) — kept for backward compat
  images: string[]; // dataURLs of all uploaded report pages
  ocrText: string; // editable extracted text (" " for symptom sessions)
  symptomInput: string; // symptom-checker text (" " for lab sessions)
  lab: LabResult | null;
  chat: ChatMsg[];
};

const KEY = "bw.sessions.v1";

function looksLikeLab(x: unknown): x is LabResult {
  return !!x && typeof x === "object" && Array.isArray((x as LabResult).rows);
}

function sanitize(raw: unknown): SavedSession | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== "string" || typeof s.createdAt !== "string") return null;
  const chat = Array.isArray(s.chat)
    ? (s.chat as unknown[])
        .filter(
          (m) =>
            !!m &&
            typeof m === "object" &&
            ((m as ChatMsg).role === "user" || (m as ChatMsg).role === "assistant")
        )
        .map((m) => {
          const cm = m as ChatMsg;
          return { role: cm.role, content: String(cm.content ?? ""), reasoning: cm.reasoning ?? "" };
        })
    : [];
  return {
    id: s.id,
    createdAt: s.createdAt,
    updatedAt: typeof s.updatedAt === "string" ? s.updatedAt : s.createdAt,
    kind: s.kind === "symptom" ? "symptom" : "lab",
    image: typeof s.image === "string" ? s.image : "",
    images: Array.isArray(s.images)
      ? (s.images as unknown[]).filter((x): x is string => typeof x === "string")
      : typeof s.image === "string" && s.image
        ? [s.image]
        : [],
    ocrText: typeof s.ocrText === "string" ? s.ocrText : "",
    symptomInput: typeof s.symptomInput === "string" ? s.symptomInput : "",
    lab: looksLikeLab(s.lab) ? s.lab : null,
    chat,
  };
}

export function loadSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map(sanitize)
      .filter((s): s is SavedSession => s !== null)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function persistSessions(list: SavedSession[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Quota exceeded (very large dataURLs): drop the oldest images, keep
    // the text + chat, and retry once.
    try {
      const slimmed = list.map((s) => ({ ...s, image: "", images: [] }));
      window.localStorage.setItem(KEY, JSON.stringify(slimmed));
    } catch {
      /* give up quietly – storage is a convenience, not the source of truth */
    }
  }
}

/** Insert or update a session; keeps the earliest createdAt per id. */
export function upsertSession(next: SavedSession): SavedSession[] {
  const list = loadSessions();
  const i = list.findIndex((s) => s.id === next.id);
  const merged: SavedSession =
    i >= 0
      ? { ...next, createdAt: list[i].createdAt }
      : { ...next, createdAt: next.createdAt };
  if (i >= 0) list[i] = merged;
  else list.unshift(merged);
  persistSessions(list);
  return list;
}

export function removeSession(id: string): SavedSession[] {
  const list = loadSessions().filter((s) => s.id !== id);
  persistSessions(list);
  return list;
}

export function clearAllSessions(): SavedSession[] {
  persistSessions([]);
  return [];
}
