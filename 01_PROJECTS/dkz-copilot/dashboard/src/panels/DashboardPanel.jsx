import { useState, useEffect, useRef } from 'react'

const esc = (str) => { const el = document.createElement('span'); el.textContent = str; return el.innerHTML }
const API = localStorage.getItem('dkz-copilot-api') || '/api'

// 4 Hauptquellen mit Farben
const SOURCES = [
  { id:'playbook', label:'Playbook', icon:'\ud83d\udcd6', color:'#fa1e4e', nodes:295, edges:412, desc:'DkZ Regelwerk + Architektur' },
  { id:'gitnexus', label:'GitNexus', icon:'\ud83d\udd0d', color:'#10b981', nodes:0, edges:0, desc:'Repository-Analyse + Dependencies', url:'../01_dashboard/modules/gitnexus-explorer/index.html' },
  { id:'mirofish', label:'MiroFish', icon:'\ud83d\udc1f', color:'#ec4899', nodes:0, edges:0, desc:'Simulator + Agenten-Netzwerk', url:'../01_dashboard/modules/mirofish-sim/index.html' },
  { id:'openhumans', label:'OpenHumans', icon:'\ud83e\udec0', color:'#a855f7', nodes:0, edges:0, desc:'Data Hub + API Connector', url:'../01_dashboard/modules/openhumans-hub/index.html' },
]

// Module Quick-Links
const MODULES = [
  { id:'graphify', icon:'\ud83d\udcc8', label:'Graphify', color:'#06b6d4', tab:'graphify' },
  { id:'gitnexus', icon:'\ud83d\udd0d', label:'GitNexus', color:'#10b981', url:'../01_dashboard/modules/gitnexus-explorer/index.html' },
  { id:'mirofish', icon:'\ud83d\udc1f', label:'MiroFish', color:'#ec4899', url:'../01_dashboard/modules/mirofish-sim/index.html' },
  { id:'openhumans', icon:'\ud83e\udec0', label:'OpenHumans', color:'#a855f7', url:'../01_dashboard/modules/openhumans-hub/index.html' },
  { id:'openhands', icon:'\ud83d\udd90\ufe0f', label:'OpenHands', color:'#f59e0b', url:'../01_dashboard/modules/openhands/index.html' },
  { id:'copilot', icon:'\ud83e\udd16', label:'CoPilot', color:'#fa1e4e', tab:'dashboard' },
  { id:'wiki', icon:'\ud83d\udcda', label:'Wiki', color:'#3b82f6', url:'../01_dashboard/modules/devkitz-wiki/index.html' },
  { id:'kanban', icon:'\ud83d\udccb', label:'Kanban', color:'#8b5cf6', url:'../01_dashboard/modules/kanban-board/index.html' },
  { id:'wissen', icon:'\ud83e\udde0', label:'WissenHub', color:'#14b8a6', url:'../01_dashboard/modules/wissen-hub/index.html' },
  { id:'deepkeep', icon:'\ud83d\udd12', label:'DeepKeep', color:'#ef4444', url:'../01_dashboard/modules/deepkeep/index.html' },
  { id:'system', icon:'\u2699\ufe0f', label:'System', color:'#6366f1', url:'../01_dashboard/modules/system-check/index.html' },
  { id:'cloudia', icon:'\u2601\ufe0f', label:'CLOUDIA', color:'#84cc16', url:'../01_dashboard/modules/cloudia/index.html' },
]

// Health
const HEALTH = [
  { system:'Gateway v2', status:'online', detail:'Port 3060', icon:'\ud83d\udfe2' },
  { system:'Dashboard', status:'online', detail:'Vite :5173', icon:'\ud83d\udfe2' },
  { system:'NanoChat', status:'offline', detail:'Port 3040', icon:'\ud83d\udd34' },
  { system:'Webhook', status:'offline', detail:'Port 3050', icon:'\ud83d\udd34' },
  { system:'VPS KVM8', status:'unknown', detail:'SSH', icon:'\ud83d\udfe1' },
  { system:'GitHub', status:'online', detail:'API OK', icon:'\ud83d\udfe2' },
  { system:'EventLog', status:'online', detail:'Aktiv', icon:'\ud83d\udfe2' },
  { system:'Java', status:'pending', detail:'Kein JDK', icon:'\ud83d\udfe1' },
]

// Agenda
const TODAY = [
  { time:'06:00', task:'Keep \u2192 Drive Sync + Tags', status:'done', prio:'p1' },
  { time:'06:30', task:'Graphify Multi-Source', status:'done', prio:'p1' },
  { time:'07:00', task:'i18n DE/EN + Contrast', status:'done', prio:'p2' },
  { time:'08:00', task:'Dashboard Charts + Links', status:'wip', prio:'p1' },
  { time:'09:00', task:'Gateway VPS Deploy', status:'open', prio:'p0' },
  { time:'10:00', task:'Health Check Module', status:'open', prio:'p1' },
  { time:'12:00', task:'OpenHands testen', status:'open', prio:'p2' },
  { time:'14:00', task:'Morph Reader + TTS', status:'done', prio:'p2' },
]

// TTS Engine
function speak(text, lang = 'de-DE') {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang; utt.rate = 0.95; utt.pitch = 1
  const voices = window.speechSynthesis.getVoices()
  const deVoice = voices.find(v => v.lang.startsWith('de')) || voices[0]
  if (deVoice) utt.voice = deVoice
  window.speechSynthesis.speak(utt)
}

function stopSpeak() { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }

// Source Ring Chart (4-color)
function SourceRing({ sources }) {
  const total = sources.reduce((s, d) => s + d.nodes, 0) || 1
  let gradient = 'conic-gradient('
  let cum = 0
  sources.forEach((s, i) => {
    const pct = Math.max((s.nodes / total) * 360, s.nodes > 0 ? 10 : 2)
    gradient += `${s.color} ${cum}deg ${cum + pct}deg`
    cum += pct
    if (i < sources.length - 1) gradient += ', '
  })
  gradient += ')'
  return (
    <div style={{width:130, height:130, borderRadius:'50%', background:gradient, position:'relative', boxShadow:'0 0 30px rgba(250,30,78,0.15)'}}>
      <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:80, height:80, borderRadius:'50%', background:'var(--color-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
        <div className="text-xl font-black" style={{color:'var(--color-accent)'}}>{total}</div>
        <div className="text-[8px]" style={{color:'var(--color-text-dim)'}}>Knoten</div>
      </div>
    </div>
  )
}

export default function DashboardPanel({ status }) {
  const [morphMode, setMorphMode] = useState(() => localStorage.getItem('dkz-morph') === 'true')
  const [ttsOn, setTtsOn] = useState(false)
  const [ttsPlaying, setTtsPlaying] = useState(null)
  const [srcData, setSrcData] = useState(SOURCES)
  const [news, setNews] = useState([])

  // Persist morph mode
  useEffect(() => { localStorage.setItem('dkz-morph', String(morphMode)) }, [morphMode])

  // Load source data from localStorage
  useEffect(() => {
    const updated = SOURCES.map(s => {
      if (s.id === 'playbook') return s
      try {
        const keys = { gitnexus:'graphify_import_gitnexus', mirofish:'graphify_import_mirofish', openhumans:'openhumans_graphify_export' }
        const raw = localStorage.getItem(keys[s.id])
        if (raw) { const d = JSON.parse(raw); return { ...s, nodes: d.nodes?.length || 0, edges: d.edges?.length || 0 } }
      } catch {}
      return s
    })
    setSrcData(updated)
  }, [])

  // News feed
  useEffect(() => {
    setNews([
      { id:1, title:'Keep Notes erfolgreich nach Drive exportiert — 482 Dateien, 26 Tags', time:'vor 5 Min', type:'success', full:'Alle Google Keep Notizen wurden ueber Takeout exportiert und in die DEVKiTZ Notepad Struktur importiert. 26 DkZ Tags und GitHub Labels wurden synchronisiert.' },
      { id:2, title:'Graphify v2 mit 4 Quellen deployed — Playbook, GitNexus, MiroFish, OpenHumans', time:'vor 30 Min', type:'feature', full:'Das neue Graphify Panel unterstuetzt Multi-Source Datenimport. Jede Quelle hat ihre eigene Farbe im Graph. Canvas Force-Layout mit Chat-Leiste und Stats Dashboard.' },
      { id:3, title:'Gateway v2 auf GitHub gepusht — Commit c21a23c6', time:'vor 1 Std', type:'deploy', full:'Gateway v2 mit AutoSync FileWatcher, HMAC Webhook-Verifizierung, Ticket-System dkz-XX-NNN und EventLog Bridge. Alles fliesst durch Port 3060.' },
      { id:4, title:'i18n DE/EN + Contrast Mode aktiviert', time:'vor 1.5 Std', type:'feature', full:'Das Dashboard unterstuetzt jetzt Deutsch und Englisch per Toggle. High-Contrast Modus fuer bessere Lesbarkeit mit erhoehten Kontrasten und dickeren Borders.' },
      { id:5, title:'NanoChat Bridge offline — Port 3040 nicht erreichbar', time:'laufend', type:'alert', full:'Der NanoChat Bridge Server auf Port 3040 antwortet nicht. Chat-Funktionen in Graphify und anderen Modulen sind eingeschraenkt. Neustart mit dkz-opencode-start.bat erforderlich.' },
      { id:6, title:'VPS Gateway Deployment steht aus — Prioritaet P0', time:'geplant', type:'alert', full:'Der Gateway v2 muss auf den Hostinger KVM8 VPS deployed werden. SSH-Verbindung pruefen, Python Dependencies installieren, systemd Service einrichten.' },
      { id:7, title:'Java Scanner wartet auf JDK — ModuleScanner + BatchFixer bereit', time:'blockiert', type:'alert', full:'Die Java-Tools ModuleScanner.java und BatchFixer.java kompilieren nicht ohne JDK. JDK 17 oder hoeher installieren, dann build.bat ausfuehren.' },
    ])
  }, [])

  // Auto-TTS for morph mode
  useEffect(() => {
    if (ttsOn && morphMode && news.length > 0) {
      let idx = 0
      const readNext = () => {
        if (idx >= news.length || !ttsOn) return
        setTtsPlaying(news[idx].id)
        const text = `${news[idx].title}. ${news[idx].full || ''}`
        const utt = new SpeechSynthesisUtterance(text)
        utt.lang = 'de-DE'; utt.rate = 0.9
        utt.onend = () => { idx++; setTimeout(readNext, 500) }
        window.speechSynthesis.speak(utt)
      }
      readNext()
      return () => { stopSpeak(); setTtsPlaying(null) }
    }
  }, [ttsOn, morphMode, news])

  const typeConfig = {
    success: { icon:'\u2705', color:'#00ff88', bg:'rgba(0,255,136,0.06)' },
    feature: { icon:'\u2728', color:'#a855f7', bg:'rgba(168,85,247,0.06)' },
    deploy: { icon:'\ud83d\ude80', color:'#3b82f6', bg:'rgba(59,130,246,0.06)' },
    sync: { icon:'\ud83d\udd04', color:'#06b6d4', bg:'rgba(6,182,212,0.06)' },
    alert: { icon:'\u26a0\ufe0f', color:'#ff3b5c', bg:'rgba(255,59,92,0.06)' },
  }

  // === MORPH MODE === Full-screen news reader
  if (morphMode) return (
    <div className="space-y-3">
      {/* Morph Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\ud83d\udcf0'}</span>
          <span className="text-sm font-bold" style={{color:'var(--color-accent)'}}>Morph Reader</span>
          <span className="badge badge-purple">Dauermodus</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setTtsOn(t => !t); if (ttsOn) stopSpeak() }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
            style={{borderColor: ttsOn ? 'var(--color-neon-green)' : 'var(--color-border)', color: ttsOn ? 'var(--color-neon-green)' : 'var(--color-text-dim)', background: ttsOn ? 'rgba(0,255,136,0.1)' : 'transparent'}}>
            {ttsOn ? '\ud83d\udd0a Vorlesen AN' : '\ud83d\udd07 Vorlesen'}
          </button>
          <button onClick={() => setMorphMode(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{borderColor:'var(--color-border)', color:'var(--color-text-dim)'}}>
            {'\u2190'} Dashboard
          </button>
        </div>
      </div>

      {/* News Cards */}
      {news.map(n => {
        const tc = typeConfig[n.type] || typeConfig.sync
        const isPlaying = ttsPlaying === n.id
        return (
          <div key={n.id} className={`glass-card p-4 transition-all ${isPlaying ? 'ring-2' : ''}`}
            style={{borderColor: isPlaying ? tc.color : 'var(--color-border)', background: isPlaying ? tc.bg : undefined, boxShadow: isPlaying ? `0 0 20px ${tc.color}30` : undefined}}>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{tc.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">{n.title}</span>
                  {isPlaying && <span className="animate-pulse-dot text-xs" style={{color:tc.color}}>{'\ud83d\udd0a'}</span>}
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{color:'var(--color-text-dim)'}}>{n.full}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px]" style={{color:'var(--color-text-dim)'}}>{n.time}</span>
                  <button onClick={() => speak(n.title + '. ' + (n.full || ''))} className="text-[10px] px-2 py-0.5 rounded border transition-all hover:border-[var(--color-accent)]" style={{borderColor:'var(--color-border)', color:'var(--color-text-dim)'}}>
                    {'\ud83d\udd0a'} Vorlesen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Morph Footer */}
      <div className="text-center py-2">
        <span className="text-[10px]" style={{color:'var(--color-text-dim)'}}>Morph Reader — {news.length} Nachrichten — Alle Systeme synchronisiert {'\ud83d\udfe2'}</span>
      </div>
    </div>
  )

  // === NORMAL DASHBOARD ===
  return (
    <div className="space-y-4">

      {/* 4 Source Charts */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold" style={{color:'var(--color-text-dim)'}}>{'\ud83c\udf10'} 4 Quellen — Daten-Fusion</div>
          <button onClick={() => setMorphMode(true)} className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:border-[var(--color-accent)] hover:shadow-lg"
            style={{borderColor:'var(--color-border)', color:'var(--color-accent)', background:'rgba(250,30,78,0.05)'}}>
            {'\ud83d\udcf0'} Morph Reader
          </button>
        </div>

        <div className="flex items-center gap-6 justify-center flex-wrap">
          <SourceRing sources={srcData} />
          <div className="grid grid-cols-2 gap-3 flex-1">
            {srcData.map(s => (
              <a key={s.id} href={s.url || '#'} target={s.url ? '_blank' : undefined} rel="noopener"
                className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer group"
                style={{borderColor:`${s.color}30`, background:`${s.color}08`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:`${s.color}15`, boxShadow:`0 0 12px ${s.color}20`}}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold" style={{color:s.color}}>{s.label}</div>
                  <div className="text-[10px] truncate" style={{color:'var(--color-text-dim)'}}>{s.desc}</div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[9px] font-bold" style={{color:s.color}}>{s.nodes} N</span>
                    <span className="text-[9px]" style={{color:'var(--color-text-dim)'}}>{s.edges} E</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Module Quick Access */}
      <div className="glass-card p-3">
        <div className="text-xs font-bold mb-3" style={{color:'var(--color-text-dim)'}}>{'\ud83d\udccc'} Module + Projekte</div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {MODULES.map(m => (
            <a key={m.id} href={m.url || '#'} target={m.url ? '_blank' : undefined} rel="noopener"
              className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all hover:scale-105 cursor-pointer"
              style={{borderColor:'var(--color-border)', background:'rgba(255,255,255,0.02)'}}>
              <span className="text-lg">{m.icon}</span>
              <span className="text-[9px] font-semibold" style={{color:m.color}}>{m.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Agenda + Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tagesplan */}
        <div className="glass-card p-3">
          <div className="text-xs font-bold mb-2" style={{color:'var(--color-text-dim)'}}>{'\ud83d\udcc5'} Heute — 30.05.2026</div>
          {TODAY.map((t, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b text-[11px]" style={{borderColor:'rgba(255,255,255,0.04)'}}>
              <span className="w-10 font-mono text-[10px]" style={{color:'var(--color-text-dim)'}}>{t.time}</span>
              <span className="w-4 text-center">{t.status === 'done' ? '\u2705' : t.status === 'wip' ? '\ud83d\udfe1' : '\u2b1c'}</span>
              <span className={`flex-1 ${t.status === 'done' ? 'line-through opacity-50' : ''}`}>{t.task}</span>
              <span className="px-1 py-0.5 rounded text-[8px] font-bold" style={{background: t.prio === 'p0' ? 'rgba(255,0,0,0.15)' : t.prio === 'p1' ? 'rgba(255,59,92,0.15)' : 'rgba(255,184,0,0.15)', color: t.prio === 'p0' ? '#f00' : t.prio === 'p1' ? '#ff3b5c' : '#ffb800'}}>{t.prio.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Health */}
        <div className="glass-card p-3">
          <div className="text-xs font-bold mb-2" style={{color:'var(--color-text-dim)'}}>{'\ud83c\udfe5'} Health — Was geheilt werden muss</div>
          {HEALTH.map((h, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b text-[11px]" style={{borderColor:'rgba(255,255,255,0.04)'}}>
              <span className="text-sm">{h.icon}</span>
              <span className="font-semibold flex-1">{h.system}</span>
              <span className="text-[10px]" style={{color:'var(--color-text-dim)'}}>{h.detail}</span>
              <span className="px-1 py-0.5 rounded text-[8px] font-bold" style={{background: h.status === 'online' ? 'rgba(0,255,136,0.15)' : h.status === 'offline' ? 'rgba(255,59,92,0.15)' : 'rgba(255,184,0,0.15)', color: h.status === 'online' ? '#00ff88' : h.status === 'offline' ? '#ff3b5c' : '#ffb800'}}>{h.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Morph Reader Preview */}
      <div className="glass-card p-3" style={{background:'rgba(18,18,24,0.7)', backdropFilter:'blur(16px)'}}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold flex items-center gap-2" style={{color:'var(--color-accent)'}}>{'\ud83d\udcf0'} Morph Reader</div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setTtsOn(true); speak(news.map(n => n.title).join('. ')) }}
              className="text-[10px] px-2 py-1 rounded-lg border transition-all hover:border-[var(--color-neon-green)]" style={{borderColor:'var(--color-border)', color:'var(--color-text-dim)'}}>
              {'\ud83d\udd0a'} Alle vorlesen
            </button>
            <button onClick={() => setMorphMode(true)}
              className="text-[10px] px-2 py-1 rounded-lg border font-bold transition-all hover:border-[var(--color-accent)]" style={{borderColor:'var(--color-border)', color:'var(--color-accent)'}}>
              Dauermodus {'\u2192'}
            </button>
          </div>
        </div>
        {news.slice(0, 3).map(n => {
          const tc = typeConfig[n.type] || typeConfig.sync
          return (
            <div key={n.id} className="flex items-center gap-2 py-1.5 border-b text-[11px] cursor-pointer hover:pl-1 transition-all" style={{borderColor:'rgba(255,255,255,0.04)'}}
              onClick={() => speak(n.title + '. ' + (n.full || ''))}>
              <span>{tc.icon}</span>
              <span className="flex-1 truncate">{n.title}</span>
              <span className="text-[9px] shrink-0" style={{color:'var(--color-text-dim)'}}>{n.time}</span>
            </div>
          )
        })}
        <div className="text-center mt-2 text-[10px]" style={{color:'var(--color-text-dim)'}}>Klick = Vorlesen · Dauermodus = Fullscreen Reader</div>
      </div>
    </div>
  )
}
