import { useState } from 'react';
import { analyzeEmail, type AnalysisResult, type EmailInput } from './analyzer';
import './App.css';

const sampleEmails: Array<EmailInput & { label: string; kind: 'danger' | 'safe' }> = [
  {
    label: 'Bank account alert',
    kind: 'danger',
    sender: 'Bank Security <alerts@secure-login.example>',
    subject: 'Urgent: Your account will be suspended today',
    body: 'We detected unusual activity. Verify your identity and password immediately to avoid account closure: http://secure-verify-bank.example/login',
  },
  {
    label: 'HR document request',
    kind: 'danger',
    sender: 'People Operations <hr@payroll-update.example>',
    subject: 'Final warning: review your payroll details',
    body: 'Please sign in and confirm your bank details within 24 hours: https://payroll-update.example/account',
  },
  {
    label: 'Team newsletter',
    kind: 'safe',
    sender: 'Internal Comms <newsletter@company.com>',
    subject: 'This week at the company',
    body: 'Here are this week’s internal updates. No action is required. The article is available at https://company.com/news.',
  },
]

const navItems = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'analyze', label: 'Analyze email', icon: '⌕' },
  { id: 'learn', label: 'How it works', icon: '⌘' },
] as const

function App() {
  const [activePage, setActivePage] = useState<(typeof navItems)[number]['id']>('analyze')
  const [email, setEmail] = useState<EmailInput>({ sender: '', subject: '', body: '' })
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<Array<{ subject: string; verdict: AnalysisResult['verdict']; score: number }>>([
    { subject: 'Updated payment information required', verdict: 'Likely phishing', score: 92 },
    { subject: 'Monthly security digest', verdict: 'Likely safe', score: 12 },
    { subject: 'Shared file: Q3 forecast', verdict: 'Needs review', score: 47 },
  ])

  function runAnalysis(value = email) {
    if (!value.sender.trim() && !value.subject.trim() && !value.body.trim()) return
    const analysis = analyzeEmail(value)
    setEmail(value)
    setResult(analysis)
    setHistory((items) => [{ subject: value.subject || 'Untitled message', verdict: analysis.verdict, score: analysis.score }, ...items].slice(0, 5))
  }

  function loadSample(sample: (typeof sampleEmails)[number]) {
    const { sender, subject, body } = sample
    runAnalysis({ sender, subject, body })
    setActivePage('analyze')
  }

  const isHighRisk = result?.verdict === 'Likely phishing'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setActivePage('overview') }}>
          <span className="brand-mark">p</span>
          <span>phish<span className="brand-light">guard</span><small>SECURITY WORKSPACE</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button className={activePage === item.id ? 'nav-item active' : 'nav-item'} key={item.id} onClick={() => setActivePage(item.id)}>
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
              {item.id === 'analyze' && <span className="nav-badge">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-spark">✳</span><strong>Stay one step ahead</strong><p>Think before you click. When in doubt, report it.</p></div>
          <div className="user-profile"><div className="avatar">SA</div><div><strong>Sai Analyst</strong><span>Junior security analyst</span></div><span className="more">···</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Security <span>/</span> <strong>{navItems.find((item) => item.id === activePage)?.label}</strong></div>
          <div className="top-actions"><span className="environment"><i /> Demo environment</span><button className="help-button" aria-label="Help">?</button></div>
        </header>

        {activePage === 'analyze' && (
          <div className="page-content">
            <div className="page-heading">
              <div><div className="eyebrow">THREAT ANALYSIS <span>•</span> EMAIL SECURITY</div><h1>Is this email safe?</h1><p>Analyze suspicious messages and understand the signals behind the verdict.</p></div>
              <div className="privacy-pill"><span>⌑</span> Private by design <i>ⓘ</i></div>
            </div>

            <div className="stats-row">
              <div className="stat-card"><span className="stat-icon indigo">✳</span><div><span>Analyzed today</span><strong>128</strong></div><small className="trend">↗ 12%</small></div>
              <div className="stat-card"><span className="stat-icon coral">⌁</span><div><span>Threats caught</span><strong>23</strong></div><small className="trend">↗ 8%</small></div>
              <div className="stat-card"><span className="stat-icon mint">◷</span><div><span>Avg. scan time</span><strong>0.4 <em>sec</em></strong></div><small className="stat-note">FAST</small></div>
            </div>

            <section className="analysis-grid">
              <div className="panel email-panel">
                <div className="panel-heading"><div><h2>Analyze a message</h2><p>Paste the email details below to get started.</p></div><span className="step-chip"><i /> READY TO SCAN</span></div>
                <div className="sample-block"><span className="sample-caption">TRY A SAMPLE</span><div className="sample-list">{sampleEmails.map((sample) => <button key={sample.label} className={`sample-chip ${sample.kind}`} onClick={() => loadSample(sample)}><span>{sample.kind === 'danger' ? '⚑' : '✓'}</span>{sample.label}</button>)}</div></div>
                <label className="field-label" htmlFor="sender">SENDER ADDRESS <span>Required for best results</span></label>
                <input id="sender" className="text-field" placeholder="e.g. alerts@company.com" value={email.sender} onChange={(event) => setEmail({ ...email, sender: event.target.value })} />
                <label className="field-label" htmlFor="subject">SUBJECT LINE</label>
                <input id="subject" className="text-field" placeholder="Paste the email subject" value={email.subject} onChange={(event) => setEmail({ ...email, subject: event.target.value })} />
                <label className="field-label" htmlFor="body">EMAIL CONTENT <span>Text only — links are not opened</span></label>
                <textarea id="body" className="text-field email-textarea" placeholder="Paste the email body here. We’ll look for suspicious language, requests, and link patterns." value={email.body} onChange={(event) => setEmail({ ...email, body: event.target.value })} />
                <div className="form-footer"><span><span className="lock-icon">⌑</span> Analysis runs locally in this demo.</span><button className="analyze-button" onClick={() => runAnalysis()} disabled={!email.sender && !email.subject && !email.body}>Analyze email <span>→</span></button></div>
              </div>

              <div className={`panel results-panel ${result ? 'has-result' : ''}`} aria-live="polite">
                {!result ? <div className="empty-result"><div className="scan-art"><span>✳</span><i /><i /><i /></div><span className="result-kicker">YOUR SCAN RESULTS</span><h2>Ready when you are</h2><p>Run an analysis to see a risk score, clear evidence, and practical next steps.</p><div className="result-placeholder"><span>◌</span><span>Waiting for email content</span><span className="placeholder-line" /></div></div> : <>
                  <div className="result-topline"><span className="result-kicker">ANALYSIS COMPLETE</span><span className="local-tag">DEMO MODEL</span></div>
                  <div className="verdict-row"><div className={`score-ring ${isHighRisk ? 'danger' : result.verdict === 'Needs review' ? 'review' : 'safe'}`} style={{ background: `conic-gradient(${isHighRisk ? '#e36d5a' : result.verdict === 'Needs review' ? '#e9a43c' : '#37ae87'} ${result.score}%, ${isHighRisk ? '#fff0ed' : result.verdict === 'Needs review' ? '#fff6e8' : '#e7f7f1'} 0)` }}><div><strong>{result.score}</strong><small>/ 100</small></div></div><div className="verdict-copy"><span className={`verdict-label ${isHighRisk ? 'danger-text' : result.verdict === 'Needs review' ? 'review-text' : 'safe-text'}`}>{isHighRisk ? '●' : result.verdict === 'Needs review' ? '◉' : '●'} {result.verdict}</span><h2>{isHighRisk ? 'Pause before you act.' : result.verdict === 'Needs review' ? 'Take a closer look.' : 'No strong signals found.'}</h2></div></div>
                  <p className="result-summary">{result.summary}</p>
                  <div className="confidence-label"><span>RISK INDICATORS</span><span>{result.signals.length} found</span></div>
                  <div className="signal-list">{result.signals.length ? result.signals.map((signal) => <div className="signal-item" key={signal.title}><span className={`signal-dot ${signal.severity}`} /> <div><strong>{signal.title}</strong><p>{signal.detail}</p></div><span className={`severity ${signal.severity}`}>{signal.severity}</span></div>) : <div className="no-signals">No common warning patterns found in the provided text.</div>}</div>
                  {result.links.length > 0 && <div className="detected-links"><span>LINKS IN MESSAGE</span>{result.links.map((link) => <div key={link}><span>↗</span><code>{link}</code></div>)}</div>}
                  <div className="report-callout"><span className="callout-icon">!</span><p><strong>Never use email links to sign in.</strong> Open your organization’s trusted app or contact the sender through a known channel.</p></div>
                </>}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="panel recent-panel"><div className="section-title"><div><h2>Recent analyses</h2><p>Latest messages reviewed in this workspace</p></div><button onClick={() => setActivePage('overview')}>View all <span>→</span></button></div><div className="recent-list">{history.slice(0, 3).map((item, index) => <button className="recent-item" key={`${item.subject}-${index}`} onClick={() => { setEmail({ sender: '', subject: item.subject, body: '' }); setResult(null) }}><span className={`history-icon ${item.verdict === 'Likely phishing' ? 'danger' : item.verdict === 'Needs review' ? 'review' : 'safe'}`}>{item.verdict === 'Likely phishing' ? '!' : item.verdict === 'Needs review' ? '◉' : '✓'}</span><span className="recent-subject">{item.subject}<small>{index === 0 ? 'Just now' : `${index * 7} minutes ago`}</small></span><span className={`history-verdict ${item.verdict === 'Likely phishing' ? 'danger-text' : item.verdict === 'Needs review' ? 'review-text' : 'safe-text'}`}>{item.verdict}</span><span className="history-score">{item.score}<small>/100</small></span></button>)}</div></div>
              <div className="panel tip-panel"><span className="tip-symbol">✳</span><div className="tip-label">SECURITY TIP <span>01 / 05</span></div><h2>Check the sender, not just the display name.</h2><p>Hovering over a name can reveal the actual email address. Small spelling changes in a domain are a common trick.</p><button onClick={() => setActivePage('learn')}>Learn more <span>→</span></button></div>
            </section>
            <footer className="disclaimer"><span>ⓘ</span> Demo-only heuristic analysis. This tool is an educational prototype, not a security control or guarantee of safety.</footer>
          </div>
        )}

        {activePage === 'overview' && <div className="page-content alternate-page"><div className="eyebrow">SECURITY OVERVIEW</div><h1>Good morning, Sai</h1><p className="alt-lead">Here’s a snapshot of email activity in your demo workspace.</p><div className="overview-cards"><div className="panel overview-card"><span>MESSAGES ANALYZED</span><strong>1,284</strong><small>Across your workspace</small></div><div className="panel overview-card"><span>LIKELY THREATS</span><strong className="danger-text">76</strong><small>Flagged for review</small></div><div className="panel overview-card"><span>UNDER REVIEW</span><strong className="review-text">19</strong><small>Needs analyst attention</small></div></div><div className="panel recent-panel overview-table"><div className="section-title"><div><h2>Recent analyses</h2><p>Sample workspace activity</p></div><button onClick={() => setActivePage('analyze')}>Analyze an email <span>→</span></button></div>{history.map((item, index) => <div className="recent-item" key={`${item.subject}-${index}`}><span className={`history-icon ${item.verdict === 'Likely phishing' ? 'danger' : item.verdict === 'Needs review' ? 'review' : 'safe'}`}>{item.verdict === 'Likely phishing' ? '!' : item.verdict === 'Needs review' ? '◉' : '✓'}</span><span className="recent-subject">{item.subject}<small>{index === 0 ? 'Just now' : `${index * 7} minutes ago`}</small></span><span className={`history-verdict ${item.verdict === 'Likely phishing' ? 'danger-text' : item.verdict === 'Needs review' ? 'review-text' : 'safe-text'}`}>{item.verdict}</span><span className="history-score">{item.score}<small>/100</small></span></div>)}</div><div className="disclaimer"><span>ⓘ</span> Dashboard figures are illustrative demo data and are not connected to a live mail system.</div></div>}

        {activePage === 'learn' && <div className="page-content alternate-page learn-page"><div className="eyebrow">BEHIND THE VERDICT</div><h1>How phishing detection works</h1><p className="alt-lead">A layered approach combines machine learning with security signals and human judgment.</p><div className="workflow">{[{ n: '01', title: 'Collect safely', text: 'Extract message headers, sender details, text, and link destinations. Minimize sensitive data and avoid opening links or attachments.', icon: '⌑' }, { n: '02', title: 'Inspect signals', text: 'Check sender-domain alignment, language patterns, urgency, credential requests, URL reputation, and known threat intelligence.', icon: '⌕' }, { n: '03', title: 'Score with AI', text: 'A model trained on reviewed phishing and legitimate examples estimates risk. Combine it with explainable rules; do not trust a model score alone.', icon: '✳' }, { n: '04', title: 'Explain & respond', text: 'Show evidence and uncertainty. Route high-risk messages to analysts, let users report false positives, and feed reviewed outcomes into evaluation.', icon: '↗' }].map((step) => <div className="workflow-step" key={step.n}><span className="workflow-number">{step.n}</span><span className="workflow-icon">{step.icon}</span><div><h2>{step.title}</h2><p>{step.text}</p></div><span className="workflow-arrow">→</span></div>)}</div><div className="panel prototype-note"><span className="note-icon">!</span><p><strong>What this prototype does:</strong> It uses transparent, local rules for urgent language, credential requests, sender/domain hints, and suspicious links. It does not call or train a machine-learning model. A production system needs a properly labeled dataset, validation, privacy review, analyst feedback, and monitoring for false positives and new attack patterns.</p></div><div className="safety-note"><strong>For real incidents:</strong> Don’t click, reply, or forward suspicious mail outside approved channels. Use your company’s report-phishing process or contact security through a known route.</div><button className="analyze-button learn-cta" onClick={() => setActivePage('analyze')}>Try the email analyzer <span>→</span></button></div>}
      </main>
    </div>
  )
}

export default App
