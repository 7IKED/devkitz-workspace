const esc = (str) => {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}

const MODULES = [
  // Immer aktiv
  { group: 'Immer aktiv', items: [
    { key: 'computer-use', name: 'Computer Use', desc: 'Desktop-Automatisierung via Screenshot+Klick', icon: '🖥️', locked: true },
    { key: 'playwright', name: 'Playwright', desc: 'Browser-Testing & Web-Scraping', icon: '🎭', locked: true },
  ]},
  // An/Aus Toggle
  { group: 'An/Aus Toggle', items: [
    { key: 'openhumans', name: 'OpenHumans', desc: 'Citizen-Science Datenplattform', icon: '🧬' },
    { key: 'browser-use', name: 'Browser Use', desc: 'KI-gesteuertes Web-Browsing', icon: '🌐' },
    { key: 'open-manus', name: 'Open Manus', desc: 'Multi-Agent Orchestrierung', icon: '🤝' },
    { key: 'pico-claw', name: 'Pico Claw', desc: 'Raspberry Pi Pico Herzschlag-Sensor', icon: '💓', extra: 'pico-auto' },
    { key: 'openhands', name: 'OpenHands', desc: 'AI Software Developer Agent', icon: '✋' },
    { key: 'swarm', name: 'NanoBot Swarm', desc: 'Verteilte Bot-Flotte fuer Datensammlung', icon: '🐝', extra: 'swarm-auto' },
  ]},
  // DkZ Module
  { group: 'DkZ Module', items: [
    { key: 'mirofish', name: 'MiroFish', desc: 'Aquarium-Simulator Modul', icon: '🐠' },
    { key: 'gitnexus', name: 'GitNexus', desc: 'Git Repository Explorer', icon: '🔗' },
    { key: 'second-brain', name: 'SecondBrain', desc: 'Obsidian Wissens-Sync', icon: '🧠', extra: 'brain-auto' },
    { key: 'cloudia2', name: 'CLOUDIA2', desc: 'Cloud Infrastructure Control', icon: '☁️' },
    { key: 'aiaikirk', name: 'AiAiKirk', desc: 'AI Modul Integration Hub', icon: '🤖' },
    { key: 'pr-agent', name: 'PR-Agent', desc: 'Automatische PR Reviews', icon: '🔍' },
  ]},
  // System
  { group: 'System', items: [
    { key: 'auto-update', name: 'AutoUpdate', desc: 'Automatische System-Aktualisierung', icon: '🔄' },
  ]},
]

function ToggleSwitch({ checked, onChange, color }) {
  const bgActive = color === 'blue' ? 'var(--color-neon-blue)' : 'var(--color-neon-green)'
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" style={checked ? { background: bgActive } : {}} />
    </label>
  )
}

export default function IntegrationsPanel({ integrations, onToggle }) {
  return (
    <div className="space-y-4">
      {MODULES.map(group => (
        <div key={group.group} className="glass-card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            {group.group}
          </h3>
          <div className="space-y-1">
            {group.items.map(mod => (
              <div key={mod.key} className="flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all hover:bg-white/5 border-b" style={{ borderColor: 'var(--color-border)' }}>
                {/* Icon + Name + Desc */}
                <span className="text-xl shrink-0">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{esc(mod.name)}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>{esc(mod.desc)}</p>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-2 shrink-0">
                  {mod.locked ? (
                    <span className="badge badge-green">AKTIV</span>
                  ) : (
                    <>
                      {/* Extra Auto-Toggle (blau) */}
                      {mod.extra && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]" style={{ color: 'var(--color-neon-blue)' }}>Auto</span>
                          <ToggleSwitch
                            checked={!!integrations?.[mod.extra]}
                            onChange={(v) => onToggle(mod.extra, v)}
                            color="blue"
                          />
                        </div>
                      )}
                      {/* Haupt-Toggle (gruen) */}
                      <ToggleSwitch
                        checked={!!integrations?.[mod.key]}
                        onChange={(v) => onToggle(mod.key, v)}
                        color="green"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Zusammenfassung */}
      <div className="glass-card text-center">
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
          {Object.values(integrations || {}).filter(Boolean).length} von {Object.keys(integrations || {}).length} Integrationen aktiv
        </p>
      </div>
    </div>
  )
}
