# PhishGuard — Email Threat Analysis

A responsive educational prototype for reviewing suspicious email content. The app runs in the browser and demonstrates how phishing indicators can be explained to a user or junior analyst.

## Run locally

1. Install Node.js (20.19+ or 22.12+ recommended).
2. In this workspace, run `npm install`.
3. Run `npm run dev` and open the local address printed by Vite.

Other checks:

- `npm run build` — type-check and create the production bundle.
- `npm run lint` — run Oxlint.
- `npm test` — run analyzer unit tests.

## Use the prototype

1. Open **Analyze email**.
2. Paste the sender address, subject, and plain-text message body, or choose a sample.
3. Select **Analyze email**.
4. Review the risk score, verdict, evidence, detected links, and recommended next step.
5. Open **How it works** for the end-to-end detection workflow and production considerations.

The overview figures and initial history entries are illustrative demo data. New analysis history is held only in React memory and disappears when the page is refreshed.

## How the demo analysis works

`src/analyzer.ts` applies a small, transparent set of local pattern checks. It looks for sender/domain inconsistencies when a message claims to represent a trusted organization, urgency, requests for credentials or financial details, and suspicious link patterns. It adds weighted points for detected signals, maps the result to a verdict, and returns human-readable reasons. No email text is sent to a server, links are not opened, and no external AI service or trained machine-learning model is used.

This is a rule-based baseline for demonstrating the user experience—not a production security control. It can miss novel attacks, produce false alarms, and does not verify whether a sender, link, or organization is actually trustworthy. A low score is not proof that an email is safe.

## A responsible production AI workflow

1. **Define data boundaries.** Decide which headers and message fields are needed. Minimize or redact personal, financial, and authentication data; define retention, access controls, consent/legal basis, and audit requirements before ingesting mail.
2. **Build a reviewed dataset.** Collect representative phishing and legitimate examples from approved sources. Deduplicate, remove sensitive information where possible, label with analyst review, and split by time/campaign so near-duplicates do not leak between training and evaluation.
3. **Extract layered features.** Combine sender authentication and domain age/reputation, URL and attachment reputation, message structure, language/context, threat-intelligence matches, and user-report/analyst feedback. Do not rely on text alone.
4. **Train and calibrate.** Compare a strong rules baseline with supervised text/metadata classifiers. Calibrate probabilities and tune thresholds to the organization’s cost of false negatives versus false positives. Keep high-impact actions subject to review.
5. **Explain the result.** Return a risk estimate plus specific evidence (for example, authentication failure, sender mismatch, suspicious redirect, or credential request), uncertainty, and safe next actions—not just an opaque label.
6. **Deploy with safeguards.** Integrate first in monitor/quarantine mode, require analyst review for consequential action, provide an easy report/appeal path, and protect model endpoints and logs. Never auto-delete or block solely on an uncalibrated model score.
7. **Evaluate continuously.** Track precision, recall, false-positive rates, time-to-triage, subgroup/domain drift, and analyst overrides. Re-review labels, test new campaigns, monitor drift, and roll back model changes when needed.

## Safe handling reminder

For a real suspicious message, do not click links, open attachments, reply, or paste confidential email into an unapproved service. Use the company’s approved report-phishing workflow. Contact the purported sender using a known, independent channel.
