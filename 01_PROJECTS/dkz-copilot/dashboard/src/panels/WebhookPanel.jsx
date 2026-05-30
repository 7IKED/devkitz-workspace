import { useState, useRef, useEffect } from 'react'

const esc = (str) => {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}

const API = localStorage.getItem('dkz-copilot-api') || '/api'

const WEBHOOK_TYPES = [
  { value: 'issue.assigned', label: 'Issue Assigned' },
  { value: 'issue.labeled', label: 'Issue Labeled' },
  { value: 'pull_request', label: 'Pull Request' },
  { value: 'custom', label: 'Custom Event' },
]

const DEMO_PAYLOADS = {
  'issue.assigned': JSON.stringify({
    action: 'assigned',
    issue: { number: 248, title: 'Neues Feature: Dashboard Panels', assignee: '777' },
  }, null, 2),
  'issue.labeled': JSON.stringify({
    action: 'labeled',
    issue: { number: 247, title: 'NavBar Responsive Fix' },
    label: { name: 'P1', color: 'ff3b5c' },
  }, null, 2),
  'pull_request': JSON.stringify({
    action: 'opened',
    pull_request: { number: 143, title: 'feat(panels): 6 neue Dashboard Panels', head: 'feature/panels' },
  }, null, 2),
  'custom': JSON.stringify({
    event: 'custom',
    data: { message: 'Test Webhook' },
  }, null, 2),
}

const DEMO_LOG = [
  { id: 1, type: 'pull_request', source: 'github', payload: { action: 'merged', number: 142 }, timestamp: '2026-05-30T00:45:00Z' },
  { id: 2, type: 'issue.labeled', source: 'github', payload: { number: 247, label: 'P1' }, timestamp: '2026-05-30T00:30:00Z' },
  { id: 3, type: 'custom', source: 'local', payload: { message: 'Swarm Check' }, timestamp: '2026-05-30T00:15:00Z' },
  { id: 4, type: 'issue.assigned', source: 'github', payload: { number: 246, assignee: '777' }, timestamp: '2026-05-29T23:50:00Z' },
  { id: 5, type: 'pull_request', source: 'local', payload: { action: 'test', number: 0 }, timestamp: '2026-05-29T23:30:00Z' },
]

const WEBHOOK_DOMAIN = 'devkitz.eu'

export default function WebhookPanel({ log = [], onSend }) {
  const [type, setType] = useState('issue.assigned')
  const [payload, setPayload] = useState(DEMO_PAYLOADS['issue.assigned'])
  const [mode, setMode] = useState('local') // local | remote
  const [displayLog, setDisplayLog] = useState(() => log.length ? log : DEMO_LOG)
  const [sendStatus, setSendStatus] = useState(null)
  const [copied, setCopied] = useState(false)
  const payloadRef = useRef(null)

  // Sync incoming log prop
  useEffect(() => {
    if (log.length) {
      setDisplayLog(prev => {
        const merged = [...log, ...prev]
        const unique = merged.filter((item, idx) => merged.findIndex(i => i.id === item.id) === idx)
        return unique.slice(0, 20)
      })
    }
  }, [log])

  const handleTypeChange = (newType) => {
    setType(newType)
    setPayload(DEMO_PAYLOADS[newType] || '{}')
  }

  const handleSend = async () => {
    let parsed
    try {
      parsed = JSON.parse(payload)
    } catch {
      setSendStatus('Fehler: Ungueltiges JSON')
      setTimeout(() => setSendStatus(null), 3000)
      return
    }

    const event = { type, payload: parsed }

    if (mode === 'local') {
      // Lokaler Webhook
      onSend?.(event)
      const newEntry = {
        id: Date.now(),
        type,
        source: 'local',
        payload: parsed,
        timestamp: new Date().toISOString(),
      }
      setDisplayLog(prev => [newEntry, ...prev].slice(0, 20))
      setSendStatus('Lokal verarbeitet!')
    } else {
      // Remote Webhook
      try {
        await fetch(`${API}/webhook/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        })
        setSendStatus('An Server gesendet!')
      } catch {
        setSendStatus('Server nicht erreichbar — lokal verarbeitet')
        onSend?.(event)
      }
    }

    setTimeout(() => setSendStatus(null), 3000)
  }

  const copyUrl = () => {
    const url = mode === 'local' ? `http://localhost:3040/webhook` : `https://${WEBHOOK_DOMAIN}/webhook`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return ts
    }
  }

  const typeBadge = (t) => {
    if (t.startsWith('issue')) return 'badge-yellow'
    if (t === 'pull_request') return 'badge-purple'
    return 'badge-blue'
  }

  return (
    <div className="space-y-4">
      {/* Modus Toggle + Webhook URL */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>🔗</span> Webhook System
          </h3>
          {/* Lokal/Remote Toggle */}
          <div className="flex items-center gap-2 rounded-full p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setMode('local')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === 'local' ? 'text-white' : ''}`}
              style={mode === 'local' ? { background: 'var(--color-accent)' } : { color: 'var(--color-text-dim)' }}>
              Lokal
            </button>
            <button
              onClick={() => setMode('remote')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${mode === 'remote' ? 'text-white' : ''}`}
              style={mode === 'remote' ? { background: 'var(--color-neon-purple)' } : { color: 'var(--color-text-dim)' }}>
              Remote
            </button>
          </div>
        </div>

        {/* Webhook URL */}
        <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>URL:</span>
          <code className="text-xs flex-1 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-green)' }}>
            {mode === 'local' ? 'http://localhost:3040/webhook' : `https://${WEBHOOK_DOMAIN}/webhook`}
          </code>
          <button onClick={copyUrl} className="px-2 py-1 rounded-lg text-xs transition-all hover:bg-white/10"
            style={{ color: copied ? 'var(--color-neon-green)' : 'var(--color-text-dim)' }}>
            {copied ? '✓ Kopiert' : '📋 Kopieren'}
          </button>
        </div>
      </div>

      {/* Webhook Tester */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🧪</span> Webhook Tester
        </h3>

        {/* Type Select */}
        <div className="mb-3">
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-dim)' }}>Event Type</label>
          <div className="flex flex-wrap gap-2">
            {WEBHOOK_TYPES.map(wt => (
              <button key={wt.value} onClick={() => handleTypeChange(wt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border`}
                style={type === wt.value ? {
                  background: 'rgba(250,30,78,0.15)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-accent)',
                } : {
                  background: 'transparent',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-dim)',
                }}>
                {wt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payload Textarea */}
        <div className="mb-3">
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-dim)' }}>JSON Payload</label>
          <textarea
            ref={payloadRef}
            value={payload}
            onChange={e => setPayload(e.target.value)}
            rows={6}
            className="w-full rounded-lg p-3 text-xs border outline-none resize-y"
            style={{
              background: 'rgba(0,0,0,0.3)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-neon-green)',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Send */}
        <div className="flex items-center gap-3">
          <button onClick={handleSend} className="btn-primary px-6 py-2 text-sm">
            ⚡ Senden
          </button>
          {sendStatus && (
            <span className="text-xs" style={{ color: sendStatus.includes('Fehler') ? 'var(--color-neon-red)' : 'var(--color-neon-green)' }}>
              {esc(sendStatus)}
            </span>
          )}
        </div>
      </div>

      {/* Live Webhook Log */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>📡</span> Live Webhook Log
          <span className="badge badge-green text-[10px]">{displayLog.length} Events</span>
        </h3>

        {displayLog.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-2xl opacity-30">📭</span>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>Noch keine Webhooks empfangen</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {displayLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-2 py-2 px-2 rounded-lg border-b hover:bg-white/3" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-xs shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>
                  {formatTime(entry.timestamp)}
                </span>
                <span className={`badge ${typeBadge(entry.type)} shrink-0 text-[10px]`}>
                  {esc(entry.type)}
                </span>
                <span className={`badge ${entry.source === 'github' ? 'badge-purple' : 'badge-blue'} shrink-0 text-[10px]`}>
                  {esc(entry.source)}
                </span>
                <span className="text-xs flex-1 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>
                  {JSON.stringify(entry.payload).slice(0, 60)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
