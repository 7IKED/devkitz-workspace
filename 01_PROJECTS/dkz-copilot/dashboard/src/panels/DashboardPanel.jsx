import { useState, useEffect } from 'react'

const esc = (str) => {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}

const API = localStorage.getItem('dkz-copilot-api') || '/api'

const DEMO_FEED = [
  { id: 1, text: 'PR #142 merged: feat(swarm): Auto-Discovery', badge: 'merged', badgeClass: 'badge-purple', time: 'vor 3 Min' },
  { id: 2, text: 'Issue #247 geschlossen: NavBar Responsive Fix', badge: 'closed', badgeClass: 'badge-red', time: 'vor 12 Min' },
  { id: 3, text: 'Modul system-check aktualisiert', badge: 'update', badgeClass: 'badge-blue', time: 'vor 28 Min' },
  { id: 4, text: 'VPS Backup erfolgreich abgeschlossen', badge: 'backup', badgeClass: 'badge-green', time: 'vor 1 Std' },
  { id: 5, text: 'NanoBot Swarm: 3 neue Datenpunkte', badge: 'swarm', badgeClass: 'badge-yellow', time: 'vor 2 Std' },
]

export default function DashboardPanel({ status, integrations }) {
  const [stats, setStats] = useState({ prs: 7, issues: 23, modules: 152, tokens: '1.2k' })
  const [feed, setFeed] = useState(DEMO_FEED)
  const [pico, setPico] = useState({ active: false, bpm: 0, spo2: 0 })
  const [swarm, setSwarm] = useState({ bots: 3, collected: 847 })

  useEffect(() => {
    fetch(`${API}/dashboard/stats`).then(r => r.json())
      .then(d => {
        if (d.prs != null) setStats(d)
      }).catch(() => {})

    fetch(`${API}/dashboard/feed`).then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setFeed(d) })
      .catch(() => {})
  }, [])

  // Pico Claw Heartbeat Polling
  useEffect(() => {
    if (!integrations?.['pico-claw']) {
      setPico({ active: false, bpm: 0, spo2: 0 })
      return
    }
    const poll = setInterval(() => {
      fetch(`${API}/pico/heart`).then(r => r.json())
        .then(d => setPico({ active: true, bpm: d.bpm || 72, spo2: d.spo2 || 98 }))
        .catch(() => setPico(prev => ({ ...prev, active: false })))
    }, 5000)
    return () => clearInterval(poll)
  }, [integrations])

  // Swarm Status
  useEffect(() => {
    if (!integrations?.['swarm']) return
    fetch(`${API}/swarm/status`).then(r => r.json())
      .then(d => { if (d.bots != null) setSwarm(d) })
      .catch(() => {})
  }, [integrations])

  const statusLabel = {
    idle: 'Bereit', working: 'Arbeitet...', error: 'Fehler', offline: 'Offline'
  }[status] || 'Unbekannt'

  const statusBadge = {
    idle: 'badge-green', working: 'badge-yellow', error: 'badge-red', offline: 'badge-red'
  }[status] || 'badge-blue'

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`badge ${statusBadge}`}>{statusLabel}</span>
        <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
          System Status
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Pull Requests', value: stats.prs, icon: '🔀', color: 'var(--color-neon-purple)' },
          { label: 'Issues', value: stats.issues, icon: '📋', color: 'var(--color-neon-yellow)' },
          { label: 'Module', value: stats.modules, icon: '📦', color: 'var(--color-neon-green)' },
          { label: 'Tokens', value: stats.tokens, icon: '🔑', color: 'var(--color-neon-blue)' },
        ].map(s => (
          <div key={s.label} className="glass-card text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Aktivitaets-Feed */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>⚡</span> Letzte Aktivitaeten
        </h3>
        <div className="space-y-2">
          {feed.map(item => (
            <div key={item.id} className="flex items-start gap-2 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className={`badge ${item.badgeClass} shrink-0 mt-0.5`}>{esc(item.badge)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{esc(item.text)}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{esc(item.time)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Pico + Swarm */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pico Herzschlag */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>💓</span> Pico Herzschlag
          </h3>
          {pico.active ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="stat-value text-2xl" style={{ color: 'var(--color-neon-red)' }}>{pico.bpm}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>BPM</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="stat-value text-2xl" style={{ color: 'var(--color-neon-blue)' }}>{pico.spo2}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>% SpO2</span>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full animate-pulse-dot" style={{ width: '80%', background: 'var(--color-neon-red)' }} />
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-2xl opacity-30">💤</span>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>Pico Claw inaktiv</p>
            </div>
          )}
        </div>

        {/* Swarm Status */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span>🐝</span> NanoBot Swarm
          </h3>
          {integrations?.['swarm'] ? (
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="stat-value text-2xl" style={{ color: 'var(--color-neon-green)' }}>{swarm.bots}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Bots aktiv</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="stat-value text-2xl" style={{ color: 'var(--color-neon-yellow)' }}>{swarm.collected}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Daten gesammelt</span>
              </div>
              <span className="badge badge-green">Laeuft</span>
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-2xl opacity-30">🔌</span>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>Swarm deaktiviert</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
