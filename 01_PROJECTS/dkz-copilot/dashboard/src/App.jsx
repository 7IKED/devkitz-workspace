import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import TabBar from './components/TabBar'
import DashboardPanel from './panels/DashboardPanel'
import GitHubPanel from './panels/GitHubPanel'
import IntegrationsPanel from './panels/IntegrationsPanel'
import ChatPanel from './panels/ChatPanel'
import VPSPanel from './panels/VPSPanel'
import WebhookPanel from './panels/WebhookPanel'

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'Home' },
  { id: 'github', icon: '📋', label: 'GitHub' },
  { id: 'integrations', icon: '🔌', label: 'Module' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'vps', icon: '🖥', label: 'VPS' },
  { id: 'webhooks', icon: '🔗', label: 'Hooks' },
]

const API = localStorage.getItem('dkz-copilot-api') || '/api'

// === IMPLEMENTATION PLAN ===
const IMPL_PLAN = {
  title: 'DkZ CoPilot™ — Self-Hosted Coding Agent',
  subtitle: 'Qwen 3.5 7B · Python · Java · 0 Premium Requests · 0 Kosten · Volle Kontrolle',
  components: [
    { name: 'Webhook Receiver', file: 'webhook_server.py', status: 'done', desc: 'FastAPI :3050, GitHub HMAC, Event-Filter' },
    { name: 'Agent Orchestrator', file: 'agent.py', status: 'done', desc: 'Issue → LLM → Code → PR Pipeline' },
    { name: 'Git Worker', file: 'git_worker.py', status: 'done', desc: 'Clone, Branch, Commit, Push, PR' },
    { name: 'File Analyzer', file: 'file_analyzer.py', status: 'done', desc: 'Modul-Scanner, XSS Check, Kontext' },
    { name: 'CLOUDIA²', file: 'cloudia.py', status: 'done', desc: 'Drive Sync, VPS Control, Domains' },
    { name: 'Local Webhooks', file: 'webhook_local.py', status: 'done', desc: 'Event Emitter, Simulator, Router' },
    { name: 'Server Connector', file: 'server.py', status: 'done', desc: 'Zentraler API Hub — 15+ Routes' },
    { name: 'Java Scanner', file: 'ModuleScanner.java', status: 'pending', desc: 'Parallel 152 Module scannen (braucht JDK)' },
    { name: 'Java BatchFixer', file: 'BatchFixer.java', status: 'pending', desc: 'Regex-basierte Auto-Fixes' },
    { name: 'VPS Gateway', file: 'gateway.py', status: 'new', desc: 'Nachrichten-Router mit Mini-LLM Log' },
    { name: 'Docker Setup', file: 'docker-compose.yml', status: 'done', desc: '6 Container, vLLM, n8n, nginx' },
    { name: 'React Dashboard', file: 'dashboard/', status: 'done', desc: '6 Panels, Tailwind v4, Vite 6' },
    { name: 'Landing Page', file: 'landing.html', status: 'done', desc: 'Hamburger Menue, Plan, History' },
  ],
  comparison: [
    { feature: 'Kosten', copilot: '$10-39/Monat', dkz: '0€ (VPS laeuft eh)' },
    { feature: 'LLM', copilot: 'GPT-4o / Claude', dkz: 'Qwen 3.5 7B (lokal)' },
    { feature: 'Requests', copilot: '1200/Monat', dkz: 'Unlimitiert' },
    { feature: 'Offline', copilot: '❌', dkz: '✅ (VPS)' },
    { feature: 'Batch', copilot: '1 Issue = 1 PR', dkz: 'Java Parallel Scanner' },
    { feature: 'Custom Rules', copilot: 'copilot-instructions', dkz: 'Gleich + REGELWERK + BMAD' },
  ]
}

// === WALKTHROUGH TEMPLATES v2 ===
const WALK_TEMPLATES = {
  'session-start': { title: 'Session Start (v2)', icon: '🚦', steps: [
    { title: 'Bootstrap', desc: 'LLM_BOOTSTRAP.md laden', cmd: '/startup' },
    { title: 'Regeln', desc: 'REGELWERK + GEMINI.md', cmd: null },
    { title: 'Git Status', desc: 'git log -5', cmd: '/status' },
    { title: 'Health Check', desc: 'Alle Systeme pruefen', cmd: '/health' },
    { title: 'Offene Tickets', desc: 'Pending Tickets', cmd: '/tickets' },
    { title: 'Begruessungsprotokoll', desc: 'Hallo Europa!', cmd: null }
  ]},
  'fix-module': { title: 'Modul Fix', icon: '🔧', steps: [
    { title: 'XSS Scan', desc: 'innerHTML ohne esc()', cmd: '/fix xss' },
    { title: 'CSS Variables', desc: 'Hardcoded → var()', cmd: '/fix css' },
    { title: 'Shared Scripts', desc: 'dkz-debug/guide/navbar', cmd: '/fix shared' },
    { title: 'Meta Tags', desc: 'dkz-version pruefen', cmd: '/fix meta' },
    { title: 'PR erstellen', desc: 'Branch + Commit + PR', cmd: '/create-pr' }
  ]},
  'vps-deploy': { title: 'VPS Deploy', icon: '🚀', steps: [
    { title: 'Build', desc: 'vite build', cmd: null },
    { title: 'rsync', desc: 'Dashboard → VPS', cmd: '/vps deploy' },
    { title: 'nginx reload', desc: 'Webserver', cmd: '/vps reload' },
    { title: 'Health Check', desc: 'Endpoints testen', cmd: '/vps health' }
  ]},
  'drive-sync': { title: 'Drive Sync', icon: '☁️', steps: [
    { title: 'rclone Check', desc: 'Verbindung testen', cmd: '/drive test' },
    { title: 'Copilot Sync', desc: 'dkz-copilot → Drive', cmd: '/sync drive' },
    { title: 'Brain Backup', desc: 'Brain → Drive', cmd: '/sync brain' },
    { title: 'Verifizieren', desc: 'Drive pruefen', cmd: '/drive verify' }
  ]},
  'security-audit': { title: 'Security Audit', icon: '🛡', steps: [
    { title: 'XSS Scan', desc: 'Alle innerHTML', cmd: '/fix xss' },
    { title: 'Secrets', desc: 'API Keys im Code', cmd: '/fix secrets' },
    { title: 'SSL', desc: 'Zertifikate', cmd: '/vps ssl' },
    { title: 'Report', desc: 'Issue erstellen', cmd: '/create-issue' }
  ]},
}

// === PATTERNS (2-Buchstaben-Codes fuer dkz-XX-NNN IDs) ===
const PATTERNS = {
  'anfrage':  { icon: '📝', color: '#00ff88', label: 'Anfrage',     code: 'AN' },
  'feedback': { icon: '💬', color: '#ffb800', label: 'Feedback',    code: 'FB' },
  'bug':      { icon: '🐛', color: '#ff3b5c', label: 'Bug Report',  code: 'BG' },
  'idee':     { icon: '💡', color: '#7c3aed', label: 'Feature Idee',code: 'ID' },
  'prio':     { icon: '🔥', color: '#fa1e4e', label: 'Prioritaet',  code: 'PR' },
  'ok':       { icon: '✅', color: '#00ff88', label: 'Genehmigt',   code: 'OK' },
  'nein':     { icon: '❌', color: '#ff3b5c', label: 'Abgelehnt',   code: 'NO' },
  'james':    { icon: '🎯', color: '#e040fb', label: 'James™ GPT',  code: 'JM' },
}

// === JAMES™ GPT — Ticket Counter ===
let _ticketCounter = parseInt(localStorage.getItem('dkz-ticket-counter') || '0')
const nextTicketId = (patternKey) => {
  _ticketCounter++
  localStorage.setItem('dkz-ticket-counter', String(_ticketCounter))
  const code = PATTERNS[patternKey]?.code || 'XX'
  return `dkz-${code}-${String(_ticketCounter).padStart(3, '0')}`
}

// === DOCS ===
const DOCS = [
  { name: 'RULES.md', url: 'https://github.com/D-VKITZ/KERN/blob/main/RULES.md', icon: '📜' },
  { name: 'PATTERNS.md', url: 'https://github.com/D-VKITZ/KERN/blob/main/PATTERNS.md', icon: '🧩' },
  { name: 'AGENTS.md', url: 'https://github.com/D-VKITZ/KERN/blob/main/AGENTS.md', icon: '🤖' },
  { name: 'llms.txt', url: 'https://github.com/7IKED/devkitz-workspace/blob/main/llms.txt', icon: '🧠' },
  { name: 'README', url: 'https://github.com/7IKED/devkitz-workspace', icon: '📖' },
]

// === HISTORY ===
const HISTORY = [
  { date: '2026-05-30', title: 'React Dashboard + CLOUDIA² + Landing Page', commits: 3, files: 28 },
  { date: '2026-05-29', title: 'PWA CoPilot App + 16 Python Backend Files', commits: 8, files: 22 },
  { date: '2026-05-28', title: 'DkZ Copilot Architektur + Implementation Plan', commits: 5, files: 15 },
  { date: '2026-05-27', title: 'Module Builder + features.json Sync', commits: 12, files: 45 },
  { date: '2026-05-26', title: 'Wiki Modul + Kanban + GitHub Hub', commits: 9, files: 31 },
]


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [status, setStatus] = useState('idle')
  const [showMenu, setShowMenu] = useState(false)
  const [menuSection, setMenuSection] = useState(null)
  const [activeWalk, setActiveWalk] = useState(null)
  const [walkProgress, setWalkProgress] = useState({})
  const [showCtx, setShowCtx] = useState(false)
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 })
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketInput, setTicketInput] = useState('')
  const [ticketPattern, setTicketPattern] = useState('anfrage')

  const [integrations, setIntegrations] = useState(() => {
    const s = localStorage.getItem('dkz-integrations')
    return s ? JSON.parse(s) : {
      'computer-use': true, 'playwright': true, 'openhands': true,
      'openhumans': false, 'browser-use': false, 'open-manus': false,
      'pico-claw': false, 'pico-auto': false, 'swarm': true,
      'swarm-auto': true, 'mirofish': true, 'gitnexus': true,
      'second-brain': true, 'brain-auto': true, 'cloudia2': true,
      'aiaikirk': true, 'pr-agent': true, 'auto-update': true
    }
  })
  const [webhookLog, setWebhookLog] = useState([])
  const [tickets, setTickets] = useState(() => {
    const s = localStorage.getItem('dkz-tickets')
    return s ? JSON.parse(s) : []
  })

  const toggleInteg = useCallback((name, state) => {
    setIntegrations(prev => {
      const next = { ...prev, [name]: state }
      localStorage.setItem('dkz-integrations', JSON.stringify(next))
      fetch(`${API}/integrations/toggle`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, enabled: state }) }).catch(() => {})
      return next
    })
  }, [])

  const handleLocalWebhook = useCallback((event) => {
    setWebhookLog(prev => [{ id: Date.now(), type: event.type || 'custom', payload: event.payload || {}, source: 'local', timestamp: new Date().toISOString() }, ...prev].slice(0, 100))
  }, [])

  const saveTicket = (text, pattern) => {
    const id = nextTicketId(pattern)
    const t = {
      id, text, pattern,
      status: 'pending',
      created: new Date().toISOString(),
      response: null,
      assignee: 'james-gpt',
      source: 'dashboard',
      eventLogId: null
    }
    const updated = [t, ...tickets]
    setTickets(updated)
    localStorage.setItem('dkz-tickets', JSON.stringify(updated))
    // An API + EventLog senden
    fetch(`${API}/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }).catch(() => {})
    // James™ GPT EventLog Bridge — loggt in dkz-eventlog.js Format
    if (window.DkzEventLog) {
      window.DkzEventLog.log({ type: 'action', source: 'ticket-system', action: `ticket-created: ${id}`, metadata: { ticketId: id, pattern, text: text.slice(0, 200) }, tags: ['ticket', pattern] })
    }
    setTicketInput(''); setShowTicketForm(false)
  }

  const toggleWalkStep = (wId, i) => setWalkProgress(p => ({ ...p, [`${wId}-${i}`]: !p[`${wId}-${i}`] }))

  // Status Polling
  useEffect(() => {
    if (integrations['auto-update']) fetch(`${API}/update/check`).catch(() => {})
    const iv = setInterval(() => {
      fetch(`${API}/status`).then(r => r.json()).then(d => setStatus(d.status || 'idle')).catch(() => setStatus('offline'))
    }, 30000)
    return () => clearInterval(iv)
  }, [])

  // Rechtsklick
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setShowCtx(true); setCtxPos({ x: Math.min(e.pageX, innerWidth - 300), y: Math.min(e.pageY, innerHeight - 400) }) }
    const hide = () => setShowCtx(false)
    document.addEventListener('contextmenu', h)
    document.addEventListener('click', hide)
    return () => { document.removeEventListener('contextmenu', h); document.removeEventListener('click', hide) }
  }, [])

  const pendingTickets = tickets.filter(t => t.status === 'pending').length
  const statusBadge = { online: 'badge-green', idle: 'badge-green', working: 'badge-yellow', offline: 'badge-red', error: 'badge-red' }

  return (
    <div className="min-h-screen">
      {/* === HAMBURGER HEADER === */}
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between" style={{background:'rgba(6,6,8,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--color-border)'}}>
        <button onClick={() => { setShowMenu(true); setMenuSection(null) }} className="text-2xl hover:scale-110 transition-transform">☰</button>
        <h1 className="text-base font-bold bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-neon-purple)] bg-clip-text text-transparent">DkZ CoPilot™</h1>
        <div className="flex items-center gap-2">
          <span className={`badge ${statusBadge[status] || 'badge-red'}`}>{status}</span>
          <button onClick={() => fetch(`${API}/status`).catch(() => {})} className="text-lg hover:rotate-180 transition-transform">🔄</button>
        </div>
      </header>

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <main className="p-4 pb-24 max-w-4xl mx-auto animate-fade-in" key={activeTab}>
        {activeTab === 'dashboard' && <DashboardPanel status={status} integrations={integrations} />}
        {activeTab === 'github' && <GitHubPanel />}
        {activeTab === 'integrations' && <IntegrationsPanel integrations={integrations} onToggle={toggleInteg} />}
        {activeTab === 'chat' && <ChatPanel integrations={integrations} />}
        {activeTab === 'vps' && <VPSPanel />}
        {activeTab === 'webhooks' && <WebhookPanel log={webhookLog} onSend={handleLocalWebhook} />}
      </main>

      {/* === HAMBURGER MENUE (LANDING PAGE) === */}
      {showMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute inset-0" style={{background:'rgba(0,0,0,0.6)'}} />
          <div className="absolute left-0 top-0 bottom-0 w-80 overflow-y-auto animate-slide-in" style={{background:'var(--color-bg)', borderRight:'1px solid var(--color-border)'}} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="p-5 border-b" style={{borderColor:'var(--color-border)', background:'linear-gradient(180deg, rgba(250,30,78,0.08), transparent)'}}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">DkZ CoPilot™</h2>
                <button onClick={() => setShowMenu(false)} className="text-xl">✕</button>
              </div>
              <p className="text-xs" style={{color:'var(--color-text-dim)'}}>Self-Hosted KI Coding Agent</p>
              <div className="flex gap-2 mt-3">
                <span className={`badge ${statusBadge[status]}`}>{status}</span>
                {pendingTickets > 0 && <span className="badge badge-yellow">{pendingTickets} Tickets</span>}
              </div>
            </div>

            {!menuSection && (<>
              {/* Navigation */}
              <div className="p-3">
                <div className="menu-group">Navigation</div>
                {TABS.map(t => (
                  <button key={t.id} onClick={() => { setActiveTab(t.id); setShowMenu(false) }} className="ctx-btn">{t.icon} {t.label}</button>
                ))}
              </div>

              <hr className="border-white/5" />

              {/* Walkthroughs */}
              <div className="p-3">
                <div className="menu-group">🚶 Walkthroughs</div>
                {Object.entries(WALK_TEMPLATES).map(([k, w]) => (
                  <button key={k} onClick={() => { setActiveWalk(k); setShowMenu(false) }} className="ctx-btn">{w.icon} {w.title}</button>
                ))}
              </div>

              <hr className="border-white/5" />

              {/* Tickets + Patterns */}
              <div className="p-3">
                <div className="menu-group">📝 Kommunikation</div>
                <button onClick={() => { setShowTicketForm(true); setShowMenu(false) }} className="ctx-btn">📝 Neues Ticket</button>
                <button onClick={() => setMenuSection('tickets')} className="ctx-btn">📋 Tickets ({pendingTickets} offen)</button>
                <button onClick={() => setMenuSection('patterns')} className="ctx-btn">🧩 Patterns</button>
              </div>

              <hr className="border-white/5" />

              {/* Implementation Plan */}
              <div className="p-3">
                <div className="menu-group">📐 Projekt</div>
                <button onClick={() => setMenuSection('plan')} className="ctx-btn">📐 Implementation Plan</button>
                <button onClick={() => setMenuSection('history')} className="ctx-btn">📜 History</button>
                <button onClick={() => setMenuSection('comparison')} className="ctx-btn">⚔️ Copilot vs DkZ</button>
              </div>

              <hr className="border-white/5" />

              {/* Docs */}
              <div className="p-3">
                <div className="menu-group">📖 Dokumentation</div>
                {DOCS.map(d => (
                  <button key={d.name} onClick={() => window.open(d.url)} className="ctx-btn">{d.icon} {d.name}</button>
                ))}
              </div>

              <hr className="border-white/5" />

              {/* Aktionen */}
              <div className="p-3">
                <div className="menu-group">⚡ Aktionen</div>
                <button onClick={() => { fetch(`${API}/sync/all`, {method:'POST'}); setShowMenu(false) }} className="ctx-btn">☁️ Alles sync</button>
                <button onClick={() => { fetch(`${API}/vps/deploy`, {method:'POST'}); setShowMenu(false) }} className="ctx-btn">🚀 VPS Deploy</button>
                <button onClick={() => { fetch(`${API}/health`); setShowMenu(false) }} className="ctx-btn">🏥 Health Check</button>
                <button onClick={() => { fetch(`${API}/vps/ssl`, {method:'POST'}); setShowMenu(false) }} className="ctx-btn">🔒 SSL Renew</button>
              </div>
            </>)}

            {/* === SUB: Implementation Plan === */}
            {menuSection === 'plan' && (
              <div className="p-3">
                <button onClick={() => setMenuSection(null)} className="ctx-btn mb-2">← Zurueck</button>
                <h3 className="text-sm font-bold mb-1">{IMPL_PLAN.title}</h3>
                <p className="text-[10px] mb-3" style={{color:'var(--color-text-dim)'}}>{IMPL_PLAN.subtitle}</p>
                {IMPL_PLAN.components.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b text-xs" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'done' ? 'bg-[var(--color-neon-green)]' : c.status === 'new' ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-neon-yellow)]'}`} />
                    <div className="flex-1">
                      <div className="font-semibold">{c.name}</div>
                      <div style={{color:'var(--color-text-dim)'}}>{c.file} — {c.desc}</div>
                    </div>
                    <span className={`badge ${c.status === 'done' ? 'badge-green' : c.status === 'new' ? 'badge-red' : 'badge-yellow'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* === SUB: History === */}
            {menuSection === 'history' && (
              <div className="p-3">
                <button onClick={() => setMenuSection(null)} className="ctx-btn mb-2">← Zurueck</button>
                <div className="menu-group">📜 Projekt-History</div>
                {HISTORY.map((h, i) => (
                  <div key={i} className="py-2 border-b text-xs" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{h.date}</span>
                      <div className="flex gap-2"><span className="badge badge-blue">{h.commits} Commits</span><span className="badge badge-green">{h.files} Files</span></div>
                    </div>
                    <div className="mt-1" style={{color:'var(--color-text-dim)'}}>{h.title}</div>
                  </div>
                ))}
                <button onClick={() => window.open('https://github.com/7IKED/devkitz-workspace/commits/main')} className="ctx-btn mt-2">🔗 GitHub Commits</button>
              </div>
            )}

            {/* === SUB: Comparison === */}
            {menuSection === 'comparison' && (
              <div className="p-3">
                <button onClick={() => setMenuSection(null)} className="ctx-btn mb-2">← Zurueck</button>
                <div className="menu-group">⚔️ GitHub Copilot Pro vs DkZ CoPilot™</div>
                <div className="text-xs">
                  {IMPL_PLAN.comparison.map((c, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 py-2 border-b" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                      <span className="font-semibold">{c.feature}</span>
                      <span style={{color:'var(--color-text-dim)'}}>{c.copilot}</span>
                      <span style={{color:'var(--color-neon-green)'}}>{c.dkz}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* === SUB: Tickets === */}
            {menuSection === 'tickets' && (
              <div className="p-3">
                <button onClick={() => setMenuSection(null)} className="ctx-btn mb-2">← Zurueck</button>
                <div className="menu-group">📋 Tickets ({tickets.length})</div>
                {tickets.length === 0 && <div className="text-xs py-2" style={{color:'var(--color-text-dim)'}}>Keine Tickets</div>}
                {tickets.slice(0, 15).map(t => (
                  <div key={t.id} className="py-2 border-b text-xs" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                    <div className="flex items-center gap-2">
                      <span>{PATTERNS[t.pattern]?.icon || '📝'}</span>
                      <span className="font-semibold" style={{color: PATTERNS[t.pattern]?.color}}>{PATTERNS[t.pattern]?.label}</span>
                      <span className={`ml-auto badge ${t.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{t.status}</span>
                    </div>
                    <div className="mt-1" style={{color:'var(--color-text-dim)'}}>{t.text.slice(0, 120)}</div>
                    {t.response && <div className="mt-1 p-1.5 rounded text-[10px]" style={{background:'rgba(0,255,136,0.05)', color:'var(--color-neon-green)'}}>{t.response}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* === SUB: Patterns === */}
            {menuSection === 'patterns' && (
              <div className="p-3">
                <button onClick={() => setMenuSection(null)} className="ctx-btn mb-2">← Zurueck</button>
                <div className="menu-group">🧩 Patterns</div>
                {Object.entries(PATTERNS).map(([k, p]) => (
                  <div key={k} className="flex items-center gap-3 py-2 border-b text-xs" style={{borderColor:'rgba(255,255,255,0.05)'}}>
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-semibold" style={{color: p.color}}>{p.label}</span>
                  </div>
                ))}
                <div className="text-[10px] mt-2" style={{color:'var(--color-text-dim)'}}>Nutze Patterns als Ticket-Typ</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === WALKTHROUGH OVERLAY === */}
      {activeWalk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)'}} onClick={() => setActiveWalk(null)}>
          <div className="glass-card w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{WALK_TEMPLATES[activeWalk]?.icon} {WALK_TEMPLATES[activeWalk]?.title}</h2>
              <button onClick={() => setActiveWalk(null)} className="text-xl hover:text-[var(--color-accent)]">✕</button>
            </div>
            <div className="space-y-2">
              {WALK_TEMPLATES[activeWalk]?.steps.map((s, i) => {
                const done = walkProgress[`${activeWalk}-${i}`]
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${done ? 'border-[var(--color-neon-green)] bg-[rgba(0,255,136,0.05)]' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}
                    onClick={() => toggleWalkStep(activeWalk, i)}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${done ? 'bg-[var(--color-neon-green)] text-black' : 'bg-[var(--color-card)] text-[var(--color-text-dim)]'}`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${done ? 'line-through opacity-50' : ''}`}>{s.title}</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--color-text-dim)'}}>{s.desc}</div>
                    </div>
                    {s.cmd && <code className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{background:'rgba(0,0,0,0.3)', color:'var(--color-neon-green)', fontFamily:'var(--font-mono)'}}>{s.cmd}</code>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* === TICKET FORM === */}
      {showTicketForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,0.7)'}} onClick={() => setShowTicketForm(false)}>
          <div className="glass-card w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-3">📝 Neues Ticket</h2>
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(PATTERNS).map(([k, p]) => (
                <button key={k} onClick={() => setTicketPattern(k)} className={`px-2 py-1 rounded-lg text-xs font-medium border ${ticketPattern === k ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}
                  style={{ background: ticketPattern === k ? `${p.color}20` : 'var(--color-card)', color: ticketPattern === k ? p.color : 'var(--color-text-dim)' }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            <textarea value={ticketInput} onChange={e => setTicketInput(e.target.value)} placeholder="Was soll der Agent tun?"
              className="w-full h-24 px-3 py-2 rounded-lg border-none text-sm resize-none outline-none mb-3"
              style={{background:'rgba(0,0,0,0.3)', color:'var(--color-text)'}} />
            <div className="flex gap-2">
              <button onClick={() => saveTicket(ticketInput, ticketPattern)} className="btn-primary flex-1 text-sm">⚡ Erstellen</button>
              <button onClick={() => setShowTicketForm(false)} className="px-4 py-2 rounded-xl text-sm border" style={{borderColor:'var(--color-border)', color:'var(--color-text-dim)'}}>X</button>
            </div>
          </div>
        </div>
      )}

      {/* === RECHTSKLICK CONTEXT MENUE === */}
      {showCtx && (
        <div className="fixed z-[60] glass-card p-1.5 min-w-56 animate-fade-in" style={{left: ctxPos.x, top: ctxPos.y, background:'rgba(6,6,8,0.97)', maxHeight:'70vh', overflowY:'auto'}} onClick={e => e.stopPropagation()}>
          <div className="menu-group">⚡ Quick</div>
          <button onClick={() => { fetch(`${API}/sync/all`, {method:'POST'}); setShowCtx(false) }} className="ctx-btn">☁️ Sync All</button>
          <button onClick={() => { fetch(`${API}/health`); setShowCtx(false) }} className="ctx-btn">🏥 Health</button>
          <hr className="border-white/10 my-1" />
          <div className="menu-group">🚶 Walks</div>
          {Object.entries(WALK_TEMPLATES).map(([k, w]) => (
            <button key={k} onClick={() => { setActiveWalk(k); setShowCtx(false) }} className="ctx-btn">{w.icon} {w.title}</button>
          ))}
          <hr className="border-white/10 my-1" />
          <button onClick={() => { setShowTicketForm(true); setShowCtx(false) }} className="ctx-btn">📝 Ticket</button>
          <button onClick={() => { setShowMenu(true); setMenuSection('plan'); setShowCtx(false) }} className="ctx-btn">📐 Plan</button>
          <button onClick={() => { setShowMenu(true); setMenuSection('history'); setShowCtx(false) }} className="ctx-btn">📜 History</button>
          <hr className="border-white/10 my-1" />
          <button onClick={() => { fetch(`${API}/vps/deploy`, {method:'POST'}); setShowCtx(false) }} className="ctx-btn">🚀 Deploy</button>
          <button onClick={() => { fetch(`${API}/vps/ssl`, {method:'POST'}); setShowCtx(false) }} className="ctx-btn">🔒 SSL</button>
        </div>
      )}

      {/* FAB Button */}
      <button className="fixed bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-lg z-40 transition-all hover:scale-110 active:scale-95"
        style={{background:'linear-gradient(135deg, #fa1e4e, #7c3aed)', boxShadow:'0 4px 20px rgba(250,30,78,0.4)'}}
        onClick={() => setShowTicketForm(true)}>📝</button>

      {pendingTickets > 0 && <span className="fixed bottom-14 right-4 badge badge-yellow text-[10px] z-40">{pendingTickets}</span>}
    </div>
  )
}
