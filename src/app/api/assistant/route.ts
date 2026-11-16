import { parseLabReport } from "@/lib/lab";

type Msg = { role: "system" | "user" | "assistant"; content: string; reasoning_content?: string };

function buildContext(text: string): string {
  const lab = parseLabReport(text);
  if (!lab) return "";
  const lines: string[] = [];
  lines.push(`Parsed ${lab.rows.length} lab values.`);
  lines.push(
    `Values: ${lab.rows.map((r) => `${r.test.label}=${r.value}${r.test.unit} (${r.status})`).join(", ")}`
  );
  if (lab.primary) {
    lines.push(
      `Primary diagnosis: ${lab.primary.name} [ICD-10 ${lab.primary.icd10}, confidence ${lab.confidence}%]. ${lab.primary.explanation}`
    );
    lines.push(
      `Prescription: ${lab.primary.prescription.medication} ${lab.primary.prescription.dosage}, ${lab.primary.prescription.frequency}, for ${lab.primary.prescription.duration}.`
    );
  }
  if (lab.findings.length > 1) {
    lines.push(`Additional findings: ${lab.findings.slice(1).map((f) => `${f.name} (${f.icd10})`).join("; ")}.`);
  }
  lines.push(
    `System scores: ${lab.systems.map((s) => `${s.name} ${s.score}% ${s.status}`).join(", ")}.`
  );
  if (lab.actions.length) {
    lines.push(`Care actions: ${lab.actions.map((a) => `${a.level} ${a.title}`).join("; ")}.`);
  }
  if (lab.supplements.length) {
    lines.push(`Supplements: ${lab.supplements.map((s) => s.name).join(", ")}.`);
  }
  return lines.join("\n");
}

export async function POST(request: Request) {
  const key = process.env.IFM_API_KEY;
  const base = (process.env.IFM_BASE_URL ?? "https://api.ifm.ai/v1").replace(/\/$/, "");
  const model = process.env.IFM_MODEL ?? "IFM/K2-Horizon-375B-A23B";

  if (!key) {
    return Response.json({ error: "Assistant is not configured (IFM_API_KEY missing)." }, { status: 500 });
  }

  let body: { messages?: Msg[]; context?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incoming: Msg[] = (body.messages ?? []).filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (incoming.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  // `context` is the raw report/symptom text — re-parsed here so the lab
  // engine (single source of truth) builds the assistant's grounding.
  const ctx = buildContext(typeof body.context === "string" ? body.context : "");

  const system =
    "You are Sai, a confident, warm, and precise AI health assistant inside a medical report analyzer. " +
    "You interpret lab reports, diagnoses, prescriptions, system health scores, care actions and supplement plans. " +
    "Give direct, decisive, plain-English answers. Be concise (under ~200 words) unless the user asks for detail. " +
    "Use short paragraphs or a tight bullet list. Do NOT hedge with 'consult your doctor' or 'seek professional medical advice'. " +
    "If a specific lab value or diagnosis is referenced, anchor your answer to it. " +
    (ctx ? "\n\nCurrent report analysis (ground truth for this user):\n" + ctx : "");

  const messages: Msg[] = [
    { role: "system", content: system },
    ...incoming.map((m): Msg => {
      // IFM reasoning models require assistant turns to be replayed with
      // reasoning_content verbatim ("" is a valid value). See docs.ifm.ai multi-turn.
      if (m.role === "assistant" && typeof m.reasoning_content === "string") {
        return { role: "assistant", content: m.content, reasoning_content: m.reasoning_content };
      }
      return { role: m.role, content: m.content };
    }),
  ];

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, temperature: 0.6, top_p: 0.95, max_tokens: 700 }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return Response.json(
        { error: `Assistant error ${res.status}. ${errText.slice(0, 300)}`.trim() },
        { status: 502 }
      );
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string; reasoning_content?: string | null } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return Response.json({ error: "Assistant returned an empty response." }, { status: 502 });
    const reasoning =
      typeof data.choices?.[0]?.message?.reasoning_content === "string"
        ? data.choices[0].message.reasoning_content
        : "";
    return Response.json({ reply: content, reasoning_content: reasoning });
  } catch (e) {
    return Response.json(
      { error: `Could not reach the assistant: ${e instanceof Error ? e.message : "network error"}` },
      { status: 502 }
    );
  }
}
