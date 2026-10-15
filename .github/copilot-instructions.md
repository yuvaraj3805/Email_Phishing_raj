# PhishGuard workspace guidance

- Keep the app privacy-conscious: email content stays in-browser; do not add remote logging, telemetry, or external AI calls without explicit review.
- Treat the analyzer as an educational rule-based baseline. Do not describe its output as a definitive classification or a replacement for security controls.
- Keep risk explanations specific, actionable, and cautious. A low score must never imply that a message is guaranteed safe.
- Preserve the React + TypeScript + Vite stack and responsive interface.

## Project setup progress

- [x] Requirements clarified: React + TypeScript web app, local email analysis, explainer, tests.
- [x] Vite project scaffolded.
- [x] PhishGuard analysis, overview, and learning views implemented.
- [x] README and phishing-detection workflow documented.
- [x] No additional VS Code extensions required.
- [x] Installed dependencies; production build, lint, and analyzer tests pass.
- [x] No custom VS Code task needed; use package scripts.
- [x] Started the development server after the user requested the app be run.
