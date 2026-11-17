# Suggest

3 to 5 immediately implementable UI or UX suggestions based on the most recently completed work (parser truth, PDF encoding, report preview, Sai mic, homepage photography). Approve one with a checkmark (✓) and it will be implemented; this list refreshes after each major milestone.

1. **Zoom and rotate in the report preview.** Phone photos of a lab sheet are often sideways and the print is small. Add zoom in / out / reset and a 90° rotate control to the lightbox, with pinch-zoom on touch and `+` / `-` / `0` keyboard shortcuts on desktop.

2. **A "Building your PDF" state on the download button.** Generation takes a moment on large panels. Swap the label for a quiet progress state and disable the button while it runs, so a second tap cannot queue a duplicate download and the user never wonders whether the click registered.

3. **A sample report on the homepage.** Add a small "See a finished example" link under the hero CTA that opens `/analyze` with a bundled sample transcript already analyzed – no upload, no OCR wait. It gives first-time visitors the payoff before asking for their own data.

4. **Live microphone level in Sai.** While dictation is active, replace the pulsing red circle with a thin ring that reacts to input volume via `AudioContext` + `AnalyserNode`. It confirms the browser is actually hearing the user, which is the most common reason people stop trusting voice input.
