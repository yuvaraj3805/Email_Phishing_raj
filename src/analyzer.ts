export type EmailInput = {
  sender: string
  subject: string
  body: string
}

export type Signal = {
  title: string
  detail: string
  severity: 'high' | 'medium' | 'low'
}

export type AnalysisResult = {
  score: number
  verdict: 'Likely phishing' | 'Needs review' | 'Likely safe'
  summary: string
  signals: Signal[]
  links: string[]
}

const urgencyPattern = /\b(urgent|immediately|within 24 hours|act now|final warning|account suspended|expires today|avoid closure)\b/i
const credentialPattern = /\b(password|verify your identity|sign in|login|credentials|one[- ]time code|bank details|payment details)\b/i
const brandPattern = /\b(bank|payroll|human resources|\bHR\b|microsoft|office 365|google workspace|cloud provider|IT support)\b/i
const suspiciousDomainPattern = /(?:secure|verify|login|update|account|support|billing|password|banking)[-_.]/i

export function analyzeEmail(email: EmailInput): AnalysisResult {
  const text = `${email.subject}\n${email.body}`
  const signals: Signal[] = []
  const urls = [...new Set(email.body.match(/https?:\/\/[^\s<>()"']+/gi) ?? [])]
  const senderDomain = email.sender.match(/@([\w.-]+)/)?.[1]?.toLowerCase() ?? ''
  const claimsTrustedBrand = brandPattern.test(`${email.sender} ${text}`)

  if (claimsTrustedBrand && senderDomain && !/(bank\.com|microsoft\.com|google\.com|company\.com|service\.gov)$/i.test(senderDomain)) {
    signals.push({
      title: 'Sender may not match the claimed organization',
      detail: `The message references a trusted service, but the sender domain is “${senderDomain}”. Verify it using a known contact or bookmark.`,
      severity: 'high',
    })
  }

  if (urgencyPattern.test(text)) {
    signals.push({
      title: 'High-pressure or urgent wording',
      detail: 'The message creates a deadline or threatens account consequences to rush a decision.',
      severity: 'medium',
    })
  }

  if (credentialPattern.test(text)) {
    signals.push({
      title: 'Requests sign-in or sensitive information',
      detail: 'Legitimate teams should not ask you to disclose passwords or one-time codes by email.',
      severity: 'high',
    })
  }

  const suspiciousLinks = urls.filter((url) => {
    try {
      const parsed = new URL(url)
      return parsed.protocol !== 'https:' || suspiciousDomainPattern.test(parsed.hostname) || /\d{1,3}(?:\.\d{1,3}){3}/.test(parsed.hostname) || /bit\.ly|tinyurl|t\.co/i.test(parsed.hostname)
    } catch {
      return true
    }
  })

  if (suspiciousLinks.length > 0) {
    signals.push({
      title: 'Link destination deserves extra scrutiny',
      detail: 'A link uses an unusual, shortened, non-HTTPS, or action-oriented destination. Do not open it; navigate to the service directly instead.',
      severity: 'high',
    })
  } else if (urls.length > 0) {
    signals.push({
      title: 'Contains an external link',
      detail: 'The destination was not confirmed as safe. Inspect the real domain before visiting it.',
      severity: 'low',
    })
  }

  const score = Math.min(98, Math.max(4, 8 + signals.reduce((total, signal) => total + (signal.severity === 'high' ? 29 : signal.severity === 'medium' ? 19 : 7), 0)))
  const verdict = score >= 65 ? 'Likely phishing' : score >= 35 ? 'Needs review' : 'Likely safe'
  const summary = verdict === 'Likely phishing'
    ? 'Multiple high-risk patterns were found. Treat this email as suspicious and report it through your organization’s approved channel.'
    : verdict === 'Needs review'
      ? 'Some patterns deserve a closer look. Verify the sender and destination through a separate, trusted channel.'
      : 'Few known warning signs were detected. This is not proof that the message is safe; verify unexpected requests.'

  return { score, verdict, summary, signals, links: urls }
}
