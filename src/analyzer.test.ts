import { describe, expect, it } from 'vitest'
import { analyzeEmail } from './analyzer'

describe('analyzeEmail', () => {
  it('flags a bank impersonation with urgency, credential requests, and a suspicious link', () => {
    const result = analyzeEmail({
      sender: 'Bank Security <alerts@secure-login.example>',
      subject: 'Urgent: account suspended today',
      body: 'Verify your password immediately at http://secure-verify-bank.example/login',
    })

    expect(result.verdict).toBe('Likely phishing')
    expect(result.score).toBeGreaterThanOrEqual(65)
    expect(result.signals.length).toBeGreaterThanOrEqual(3)
    expect(result.links).toHaveLength(1)
  })

  it('returns a low-risk verdict for a routine message with a familiar sender domain', () => {
    const result = analyzeEmail({
      sender: 'Internal Comms <newsletter@company.com>',
      subject: 'This week at the company',
      body: 'Here are this week’s updates. No action is required.',
    })

    expect(result.verdict).toBe('Likely safe')
    expect(result.score).toBeLessThan(35)
    expect(result.signals).toHaveLength(0)
  })

  it('treats ordinary external links cautiously without claiming they are malicious', () => {
    const result = analyzeEmail({
      sender: 'Colleague <alex@company.com>',
      subject: 'Reading for later',
      body: 'Here is an article: https://news.example/story',
    })

    expect(result.verdict).toBe('Likely safe')
    expect(result.signals[0]?.severity).toBe('low')
  })
})
