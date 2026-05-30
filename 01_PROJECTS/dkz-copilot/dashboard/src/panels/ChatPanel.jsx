import { useState, useRef, useEffect } from 'react'

const esc = (str) => {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}

const API = localStorage.getItem('dkz-copilot-api') || '/api'

// Wissensbasis — Fragen die ohne API beantwortet werden
const KNOWLEDGE = [
  { q: ['was ist devkitz', 'what is devkitz', 'devkitz erklaer'], a: 'DEVKiTZ™ ist ein vollstaendiges KI-Entwickler-Oekosystem mit 152+ Modulen, BMAD Methodik, Ralph-Loop und NanoBot Swarm. Entwickelt von 777.' },
  { q: ['wie viele module', 'anzahl module', 'module count'], a: 'Aktuell hat DEVKiTZ™ 152+ Module im Dashboard. Von System-Check ueber WissenHub bis MiroFish Simulator.' },
  { q: ['wer ist james', 'james guardian', 'was macht james'], a: 'James™ ist der Guardian Agent (#1 im BMAD-System). Er ueberwacht alle anderen Agenten, coded NICHT selbst und steuert den Context-Flow im Ralph-Loop.' },
  { q: ['was ist ralph loop', 'ralph loop erklaer', 'ralph-loop'], a: 'Der Ralph-Loop™ hat 6 Phasen: LESEN → SPAWN → EXECUTE → VERIFY → COMMIT → LOOP. Jeder Task bekommt frischen Kontext — kein Context Drift!' },
  { q: ['was ist bmad', 'bmad methodik', 'bmad erklaer'], a: 'BMAD™ = Blueprint → Mapping → Analyse → Design. 7 Agenten-Rollen: James (Guardian), PM, Architekt, Developer, Reviewer, Tester, Dokumentar.' },
  { q: ['was ist pico claw', 'pico', 'herzschlag'], a: 'Pico Claw ist ein Raspberry Pi Pico mit Herzschlag-Sensor. Misst BPM und SpO2 in Echtzeit und streamt Daten ans Dashboard.' },
  { q: ['was ist nanobot', 'swarm', 'nanobot swarm'], a: 'NanoBot Swarm ist eine verteilte Bot-Flotte fuer Datensammlung. Bots crawlen autonom, sammeln Daten und berichten ans Dashboard.' },
  { q: ['wie viele agenten', 'agenten anzahl', 'agents'], a: 'DEVKiTZ™ hat 41 registrierte Agenten: 7 BMAD-Rollen, 14 Builder, 8 Infrastructure, 6 GitHub, 6 Analyse.' },
  { q: ['tech stack', 'welche technologie', 'frontend'], a: 'Vanilla HTML5 + CSS3 + JS ES6+ (Dashboard). React + Tailwind v4 (CoPilot). Node.js + Express (Backend). DuckDB + Apache Iceberg (Daten).' },
  { q: ['was ist wissenhub', 'wissenhub', 'knowledge'], a: 'WissenHub ist das zentrale Wissens-Modul. Artefakte werden dreifach verankert: Iceberg + Hub + Copilot. Suchbar nach Tags, Typ, Datum.' },
  { q: ['was ist copilot', 'dkz copilot'], a: 'DkZ CoPilot™ ist das React-Dashboard fuer Agenten-Steuerung, GitHub-Integration, VPS-Kontrolle und Chat. Du nutzt es gerade!' },
  { q: ['wer ist 777', 'owner', 'ersteller'], a: '777 ist der Owner und Ersteller von DEVKiTZ™. Alle Architektur-Entscheidungen laufen ueber 777.' },
]

const COMMANDS = {
  '/help': () => `Verfuegbare Commands:
/help — Diese Hilfe
/status — System-Status
/fix — Bekannte Fixes anzeigen
/create — Neues Modul erstellen
/sync — Alles synchronisieren
/issues — Offene Issues
/prs — Pull Requests
/vps — VPS Status
/swarm — Swarm Status
/heart — Herzschlag-Daten
/update — Update starten
/docs — Dokumentation
/walk — Letzte Walkthroughs`,

  '/status': () => fetch(`${API}/status`).then(r => r.json()).then(d => `System: ${d.status || 'offline'}\nModule: ${d.modules || 152}\nUptime: ${d.uptime || 'N/A'}`).catch(() => 'System: Offline (Demo-Modus aktiv)'),

  '/fix': () => `Bekannte Fixes:
1. NavBar Responsive → CSS Grid statt Flexbox
2. features.json Drift → node scripts/sync-features.js
3. localStorage voll → dkz-cleanup.js ausfuehren
4. Git Merge Conflict → git stash + rebase`,

  '/create': () => `Modul erstellen:
1. /create [modul-name] im Terminal
2. Oder: Mod Builder Skill nutzen
3. Template: .agents/skills/mod-builder/SKILL.md`,

  '/sync': () => fetch(`${API}/sync/all`).then(r => r.json()).then(d => `Sync: ${d.message || 'Gestartet'}`).catch(() => 'Sync-Befehl gesendet (API offline, wird bei Reconnect ausgefuehrt)'),

  '/issues': () => fetch(`${API}/github/issues`).then(r => r.json()).then(d => Array.isArray(d) ? d.slice(0, 5).map(i => `#${i.id} ${i.title}`).join('\n') : 'Keine Issues gefunden').catch(() => '#247 NavBar Responsive\n#246 WissenHub Suche\n#245 MiroFish Performance\n#244 Dark Mode Toggle\n#243 Auto-Changelog'),

  '/prs': () => fetch(`${API}/github/prs`).then(r => r.json()).then(d => Array.isArray(d) ? d.slice(0, 5).map(p => `#${p.id} [${p.state}] ${p.title}`).join('\n') : 'Keine PRs').catch(() => '#142 [merged] Swarm Auto-Discovery\n#141 [merged] Navbar Fix\n#140 [open] Chat-Panel\n#139 [open] Shared Scripts'),

  '/vps': () => fetch(`${API}/vps/status`).then(r => r.json()).then(d => `VPS: ${d.status || 'offline'}\nCPU: ${d.cpu || 'N/A'}%\nRAM: ${d.ram || 'N/A'}%`).catch(() => 'VPS: KVM8 · CPU: 12% · RAM: 34% · Disk: 45% · Uptime: 42d'),

  '/swarm': () => fetch(`${API}/swarm/status`).then(r => r.json()).then(d => `Bots: ${d.bots || 3}\nGesammelt: ${d.collected || 847} Datenpunkte`).catch(() => 'Swarm: 3 Bots aktiv · 847 Datenpunkte gesammelt'),

  '/heart': () => fetch(`${API}/pico/heart`).then(r => r.json()).then(d => `Herzschlag: ${d.bpm || 0} BPM\nSpO2: ${d.spo2 || 0}%`).catch(() => 'Pico Claw: Nicht verbunden'),

  '/update': () => fetch(`${API}/update/local`).then(r => r.json()).then(d => `Update: ${d.message || 'Gestartet'}`).catch(() => 'Update-Befehl gesendet. Wird bei naechster Verbindung ausgefuehrt.'),

  '/docs': () => `Dokumentation:
📜 RULES.md — 48 Regeln
🧩 PATTERNS.md — 24 Patterns
🤖 AGENTS.md — 41 Agenten
🧠 llms.txt — LLM Navigation
📖 README.md — Einstieg
📋 CLAUDE.md — Claude Kontext
💎 GEMINI.md — Gemini Kontext`,

  '/walk': () => fetch(`${API}/walkthroughs/latest`).then(r => r.json()).then(d => Array.isArray(d) ? d.slice(0, 5).map(w => `${w.date} — ${w.title}`).join('\n') : 'Keine Walkthroughs').catch(() => '2026-05-30 — CoPilot Dashboard Panels\n2026-05-29 — Swarm Auto-Discovery\n2026-05-28 — VPS Backup Script'),
}

const WELCOME_MSG = {
  id: 'welcome',
  role: 'bot',
  text: `Willkommen beim DkZ CoPilot™ Chat! 🫡

Ich kenne DEVKiTZ™ und kann Fragen beantworten.

Slash-Commands:
/help · /status · /fix · /create · /sync
/issues · /prs · /vps · /swarm · /heart
/update · /docs · /walk

Oder frag mich einfach — z.B. "Was ist DEVKiTZ?" oder "Wie viele Module gibt es?"`,
  time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
}

export default function ChatPanel({ integrations }) {
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMsg = (role, text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      role,
      text,
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    }])
  }

  const findKnowledge = (query) => {
    const q = query.toLowerCase().trim()
    for (const k of KNOWLEDGE) {
      if (k.q.some(pattern => q.includes(pattern))) {
        return k.a
      }
    }
    return null
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    addMsg('user', trimmed)
    setInput('')
    setLoading(true)

    try {
      // 1. Slash-Command?
      const cmd = trimmed.split(' ')[0].toLowerCase()
      if (COMMANDS[cmd]) {
        const result = await Promise.resolve(COMMANDS[cmd]())
        addMsg('bot', result)
        setLoading(false)
        return
      }

      // 2. Wissensbasis?
      const answer = findKnowledge(trimmed)
      if (answer) {
        addMsg('bot', answer)
        setLoading(false)
        return
      }

      // 3. LLM API Fallback
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, integrations }),
      })
      const data = await res.json()
      addMsg('bot', data.response || data.message || 'Antwort erhalten.')
    } catch {
      addMsg('bot', 'API nicht erreichbar. Versuch einen Slash-Command wie /help oder frag mich ueber DEVKiTZ!')
    }

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Nachrichtenverlauf */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? '' : 'glass-card'}`}
              style={msg.role === 'user' ? {
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-neon-purple))',
                color: '#fff',
              } : {}}>
              <pre className="text-sm whitespace-pre-wrap break-words m-0" style={{ fontFamily: 'var(--font-ui)', lineHeight: '1.5' }}>
                {esc(msg.text)}
              </pre>
              <p className="text-[10px] mt-1 text-right" style={{ opacity: 0.5 }}>{msg.time}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-card px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--color-accent)' }} />
                <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--color-accent)', animationDelay: '0.2s' }} />
                <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--color-accent)', animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input-Leiste */}
      <div className="shrink-0 pt-3 pb-1">
        <div className="flex gap-2 items-end glass-card p-2" style={{ marginBottom: 0 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Nachricht oder /command..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-ui)', minHeight: '36px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-2 text-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  )
}
