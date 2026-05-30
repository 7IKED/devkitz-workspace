import { useState, useEffect } from 'react'

const esc = (str) => {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}

const API = localStorage.getItem('dkz-copilot-api') || '/api'

const DEMO_CONTAINERS = [
  { name: 'nginx-proxy', status: 'running', image: 'nginx:alpine', uptime: '42d 5h' },
  { name: 'ontherun-mcp', status: 'running', image: 'dkz/mcp:latest', uptime: '42d 5h' },
  { name: 'duckdb-server', status: 'running', image: 'dkz/duckdb:v2', uptime: '38d 12h' },
  { name: 'ollama', status: 'running', image: 'ollama/ollama:latest', uptime: '15d 3h' },
  { name: 'webhook-relay', status: 'stopped', image: 'dkz/relay:v1', uptime: '—' },
  { name: 'backup-cron', status: 'running', image: 'dkz/backup:v3', uptime: '42d 5h' },
]

const DEMO_MODELS = [
  { name: 'deepseek-v3', size: '14.3 GB', status: 'geladen' },
  { name: 'qwen3.6-27b', size: '16.1 GB', status: 'geladen' },
  { name: 'gemma4-26b-a4b', size: '15.2 GB', status: 'bereit' },
  { name: 'codellama-13b', size: '7.4 GB', status: 'bereit' },
]

const DEMO_METRICS = {
  status: 'online',
  cpu: 12,
  ram: 34,
  disk: 45,
  uptime: '42d 5h 17m',
  load: '0.42 / 0.38 / 0.31',
}

const ACTIONS = [
  { label: '🚀 Deploy', cmd: 'deploy', gradient: 'linear-gradient(135deg, var(--color-accent), var(--color-neon-purple))' },
  { label: '💾 Backup', cmd: 'backup', gradient: 'linear-gradient(135deg, var(--color-neon-blue), #06b6d4)' },
  { label: '🔄 Update', cmd: 'update', gradient: 'linear-gradient(135deg, var(--color-neon-green), #10b981)' },
  { label: '🔒 SSL Renew', cmd: 'ssl', gradient: 'linear-gradient(135deg, var(--color-neon-yellow), #f59e0b)' },
]

export default function VPSPanel() {
  const [metrics, setMetrics] = useState(DEMO_METRICS)
  const [containers, setContainers] = useState(DEMO_CONTAINERS)
  const [models, setModels] = useState(DEMO_MODELS)
  const [actionStatus, setActionStatus] = useState(null)

  useEffect(() => {
    fetch(`${API}/vps/status`).then(r => r.json())
      .then(d => { if (d.cpu != null) setMetrics(d) })
      .catch(() => {})

    fetch(`${API}/vps/containers`).then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setContainers(d) })
      .catch(() => {})

    fetch(`${API}/vps/models`).then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setModels(d) })
      .catch(() => {})
  }, [])

  const runAction = async (cmd) => {
    setActionStatus(`${cmd}: Gestartet...`)
    try {
      const res = await fetch(`${API}/vps/${cmd}`, { method: 'POST' })
      const data = await res.json()
      setActionStatus(`${cmd}: ${data.message || 'Erfolgreich'}`)
    } catch {
      setActionStatus(`${cmd}: Befehl gesendet (API offline)`)
    }
    setTimeout(() => setActionStatus(null), 5000)
  }

  const statusBadge = {
    online: 'badge-green',
    degraded: 'badge-yellow',
    offline: 'badge-red',
  }[metrics.status] || 'badge-red'

  const statusLabel = {
    online: 'Online',
    degraded: 'Eingeschraenkt',
    offline: 'Offline',
  }[metrics.status] || 'Unbekannt'

  const barColor = (pct) => {
    if (pct >= 80) return 'var(--color-neon-red)'
    if (pct >= 50) return 'var(--color-neon-yellow)'
    return 'var(--color-neon-green)'
  }

  return (
    <div className="space-y-4">
      {/* Status-Karte */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>🖥️</span> VPS KVM8
          </h3>
          <span className={`badge ${statusBadge}`}>{statusLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* CPU */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--color-text-dim)' }}>CPU</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: barColor(metrics.cpu) }}>{metrics.cpu}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metrics.cpu}%`, background: barColor(metrics.cpu) }} />
            </div>
          </div>

          {/* RAM */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--color-text-dim)' }}>RAM</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: barColor(metrics.ram) }}>{metrics.ram}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metrics.ram}%`, background: barColor(metrics.ram) }} />
            </div>
          </div>

          {/* Disk */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--color-text-dim)' }}>Disk</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: barColor(metrics.disk) }}>{metrics.disk}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metrics.disk}%`, background: barColor(metrics.disk) }} />
            </div>
          </div>

          {/* Uptime */}
          <div className="flex flex-col justify-center">
            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Uptime</span>
            <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)' }}>{esc(metrics.uptime)}</span>
          </div>
        </div>

        {/* Load */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Load Average: </span>
          <span className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{esc(metrics.load)}</span>
        </div>
      </div>

      {/* Aktions-Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map(a => (
          <button key={a.cmd} onClick={() => runAction(a.cmd)}
            className="rounded-xl border-none px-4 py-3 text-white font-semibold cursor-pointer transition-all duration-200 text-sm hover:-translate-y-0.5"
            style={{ background: a.gradient, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Aktion Status */}
      {actionStatus && (
        <div className="glass-card py-2 text-center">
          <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-neon-yellow)' }}>
            {esc(actionStatus)}
          </span>
        </div>
      )}

      {/* Docker Container */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🐳</span> Docker Container
        </h3>
        <div className="space-y-1">
          {containers.map(c => (
            <div key={c.name} className="flex items-center gap-2 py-2 px-2 rounded-lg border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className={`badge ${c.status === 'running' ? 'badge-green' : 'badge-red'} shrink-0`}>
                {c.status === 'running' ? 'Laeuft' : 'Gestoppt'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{esc(c.name)}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>{esc(c.image)}</p>
              </div>
              <span className="text-xs shrink-0" style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>{esc(c.uptime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ollama Models */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🧠</span> Ollama Models
        </h3>
        <div className="space-y-1">
          {models.map(m => (
            <div key={m.name} className="flex items-center gap-2 py-2 px-2 rounded-lg border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className={`badge ${m.status === 'geladen' ? 'badge-green' : 'badge-blue'} shrink-0`}>
                {esc(m.status)}
              </span>
              <span className="text-sm font-semibold flex-1" style={{ fontFamily: 'var(--font-mono)' }}>{esc(m.name)}</span>
              <span className="text-xs shrink-0" style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>{esc(m.size)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
