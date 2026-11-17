# Input Log

Chronological record of every owner input and prompt that shaped this project. Newest entries at the bottom of each phase.

## Phase 1: Core app
- Build a local web app that analyzes medical report screenshots (OCR) and outputs definitive diagnoses plus specific prescriptions.
- No animation on the initial static page.
- Symptom checker must output definitive diagnoses and specific prescriptions (no hedging).
- No disclaimers anywhere about consulting a doctor or seeking professional medical advice (UI copy and AI system prompt).
- Upload a medical (blood) report screenshot and have it analyzed.

## Phase 2: Siphox parity
- Match or exceed Siphox Health: 60+ biomarkers, per-system percentage scores (in/watch/out), Care Actions L1/L2/L3, supplement plan, plus a "Sai" AI assistant.
- Look and feel close to Siphox: light theme, Siphox palette, card and ring layout.
- Three-column layout: left sidebar nav, main report, right Sai panel.
- Sai replies rendered as Markdown.
- Download/share the analyzed report and Sai replies.

## Phase 3: Delivery
- Push all code to https://github.com/khurramsaadat/blood-works.git.

## Phase 4: Accuracy QA
- Reported and parsed values, and Sai's statements, must match the original report exactly. No values that are not actually in the source.
- Specific finding: Sai cites TSH/T4/T3, but T3 is not visible in the original report (Al Rehman Diagnostic screenshot, 12:56 PM).
- Create markdown files for developer handover and keep them updated. This is a rule. Ask clarifying questions.
  - Clarifications answered: full `.ai-docs` set (PRD, Plan, Suggest, input) plus a handover folder; cover the whole app including the active T3 investigation as a known issue; include environment specifics (env vars, ports, PowerShell quirks); docs live inside the `symptom-app` repo.
- Stop working on the TSH + T4 case; a different report will be supplied for accuracy work. Carry on with everything else.
- Real report confirmed: screenshot `Screenshot 2026-11-16 125712.png` is a WBC differential (neutrophils 65.3, lymphocytes 23.2, monocytes 8.6, eosinophils 2.6) with **no thyroid values at all**. The earlier "TSH 6.82 / T4 4.78" reference came from a different report and is retired as ground truth.

## Phase 5: Persistent uploads, sessions, Sai updates
- Keep the uploaded file/image visible on the site so the owner can see what was uploaded, for their records, persisting across refresh.
- Save sessions in localStorage; offer to clear them with a confirmation prompt.
- The Sai panel must be always visible (no close or expand controls).
- The AI question input needs a microphone (speech) and multiline support.
- Keep the `.ai-docs` markdown files updated.

## Phase 6: Homepage first (current)
- Before users can upload a report, they must land on a homepage. Build a simple homepage based on https://medipro.framer.website, with fonts and content adjusted to fit this website.
- Follow `AGENTS.md` (in the `symptom-app` root): premium intentional UI, PWA, Urbanist/Figtree-style font pairing, anti-template rules (no sparkles, emojis, purple gradients, fake testimonials), footer with five columns plus logo and socials, back-to-top progress ring, dark/day theme toggle, legal pages (Careers, Privacy, Sitemap, Terms) wired in the footer, SEO (sitemap.xml, robots.txt, OG tags).

## Phase 7: QA polish, push, and analyzer enhancements
- Approved pushing the current site to https://github.com/khurramsaadat/blood-works.git. Push the current site first, then build the next features and ask again before the following push.
- Asked whether OCR is still needed when an AI can read a report image. Decision: hybrid. Keep local OCR and the deterministic parser as the default; add an explicit opt-in AI vision fallback for images OCR cannot read, with a validated JSON transcript. Never send the image automatically.
- Sticky report summary on `/analyze`: overall score, out-of-range count and primary finding pinned under the navbar while the main column scrolls.
- PWA install prompt after a completed analysis, dismissible for 30 days via localStorage.
- Keyboard-first upload: Ctrl/Cmd+V with an image anywhere on `/analyze` starts the OCR flow. Exclude the Sai panel.
- Careers application form: three fields (name, portfolio URL, one-line note), one form with role buttons, pre-addressed mailto with the role in the subject.
- Scroll spy: as the report scrolls, the left panel highlights the section in view. Keep two active rows: the tool mode (Analyze a Report) and the current report section. Hide sidebar links whose section is not rendered.
- Download report should match the website: colorful multi-page PDF with charts/graphs (per-system score rings, biomarker table), definitive diagnosis, prescription, care actions L1–L3, supplement plan, optional raw OCR text.
- Full app bug review: review the entire app for bugs, broken interactions and inconsistent behavior across all pages. Fix anything that is not working as expected and list what was found and fixed. Then push all code to the GitHub repo (permission granted for this push only).
- When I click on the report that I have uploaded, let me see it.
- Mic does not work in Sai AI assistant, please make sure it works and show text after mic recording.
- Please use free images from the internet relevant to this site and use them in the home page to make it look less AI vibe coded.
- On `/analyze`, the default tab must be "Analyze a Report".
- Remove the "Check symptoms instead" button from the hero section.
- Download report button does not work (screenshot of the upload card with Download report and Share controls).


## Standing rules (from AGENTS.md)
- Git commits: one short sentence, prefixed (feat:, fix:, ui:).
- Never push to GitHub without explicit permission; re-seek approval for each push.
- No em-dashes for sentence pauses; use the spaced en-dash ( – ). Hyphens only for compound words.
- Keep the `.ai-docs` folder (PRD.md, Plan.md, Suggest.md, input.md) updated from start to finish.

## Phase 8: Sai read-aloud voice
- Read-aloud should use a real human voice (American female), not a computerized one; research and implement.
- Mic and volume icons should be stacked (mic up, volume down) in one column.
- Volume/mute icon added next to the mic; show visually when audio is playing even if muted.
- The "Reply:" action row under Sai replies should always be visible, not only on hover.
- "Ask Sai" input field should be bigger / auto-grow.
- When Sai provides a response, it should be read aloud (opt-in toggle preferred over always-on).
- Selecting a voice should play it (preview); remove the voice selector and use a single voice (Ashley) by default.
- Move the "Auto-read off" toggle above the Send button; change label to "Auto-read off"/"Auto-read on".
- Remove the read-aloud button from next to Share/Download; keep only the composer read-aloud button.
- Edge TTS (`en-US-JennyNeural`) chosen as the free, no-login real voice; Ashley is Azure-only.
