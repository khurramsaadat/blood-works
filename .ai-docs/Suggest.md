# Suggest

3 to 5 immediately implementable UI or UX suggestions based on the most recently completed work (homepage, site chrome, PWA, sessions, always-visible Sai). Approve one with a checkmark (✓) and it will be implemented; this list refreshes after each major milestone.

1. **Live demo card on the homepage.** The hero mock currently shows static bars. Let it cycle through three sample panels (WBC / thyroid / lipids) every few seconds with a dot pagination control, and let each card link into `/analyze` with that sample pre-filled. Visitors from paid traffic convert on proof, not promises.

2. **Sticky report summary while scrolling.** On `/analyze`, the Sai panel is always visible but the report table is long. Pin a compact summary bar under the navbar (overall score + out-of-range count + primary finding) that stays while the main column scrolls, so users never lose the headline while reading section six.

3. **Install prompt for the PWA.** The manifest and service worker are in place, but nothing invites installation. After a completed analysis, show a single quiet inline prompt ("Install BloodWorks for offline access to your saved reports") using `beforeinstallprompt`, dismissible for 30 days via localStorage.

4. **Keyboard-first upload.** On `/analyze`, add a paste-anywhere handler: Ctrl/Cmd+V with an image on the clipboard drops it straight into the OCR flow. Screenshot-first users currently have to save the file before uploading.

5. **Careers page application flow.** The page lists roles and an email address. Add a 3-field inline form (name, portfolio URL, one-line note) that opens a pre-addressed mailto with the role in the subject, keeping friction at the AGENTS 3-field limit while removing the "open your mail app" step.
