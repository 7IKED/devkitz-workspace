import { useState, useEffect } from 'react'

const esc = (str) => {
  const el = document.createElement('span')
  el.textContent = str
  return el.innerHTML
}

const API = localStorage.getItem('dkz-copilot-api') || '/api'

const DEMO_PRS = [
  { id: 142, title: 'feat(swarm): Auto-Discovery fuer NanoBots', state: 'merged', labels: [{ name: 'feature', color: '7c3aed' }], url: 'https://github.com/7IKED/devkitz-ecosystem/pull/142' },
  { id: 141, title: 'fix(navbar): Responsive Layout auf Mobile', state: 'merged', labels: [{ name: 'bugfix', color: '00ff88' }], url: 'https://github.com/7IKED/devkitz-ecosystem/pull/141' },
  { id: 140, title: 'feat(copilot): Chat-Panel mit Slash-Commands', state: 'open', labels: [{ name: 'feature', color: '7c3aed' }, { name: 'WIP', color: 'ffb800' }], url: 'https://github.com/7IKED/devkitz-ecosystem/pull/140' },
  { id: 139, title: 'refactor(modules): Shared Scripts Migration', state: 'open', labels: [{ name: 'refactor', color: '3b82f6' }], url: 'https://github.com/7IKED/devkitz-ecosystem/pull/139' },
  { id: 138, title: 'chore(ci): GitHub Actions Workflow Update', state: 'closed', labels: [{ name: 'ci', color: '888888' }], url: 'https://github.com/7IKED/devkitz-ecosystem/pull/138' },
]

const DEMO_ISSUES = [
  { id: 247, title: 'NavBar bricht auf 320px Viewports', labels: [{ name: 'P1', color: 'ff3b5c' }, { name: 'bug', color: 'ff3b5c' }], url: 'https://github.com/7IKED/devkitz-ecosystem/issues/247' },
  { id: 246, title: 'WissenHub: Suche findet keine Artefakte', labels: [{ name: 'P2', color: 'ffb800' }, { name: 'bug', color: 'ff3b5c' }], url: 'https://github.com/7IKED/devkitz-ecosystem/issues/246' },
  { id: 245, title: 'MiroFish Simulator: Canvas Performance', labels: [{ name: 'P3', color: '3b82f6' }, { name: 'enhancement', color: '7c3aed' }], url: 'https://github.com/7IKED/devkitz-ecosystem/issues/245' },
  { id: 244, title: 'Dark Mode Toggle persistent machen', labels: [{ name: 'P3', color: '3b82f6' }, { name: 'feature', color: '7c3aed' }], url: 'https://github.com/7IKED/devkitz-ecosystem/issues/244' },
  { id: 243, title: 'Git Push Hook: Auto-Changelog generieren', labels: [{ name: 'P2', color: 'ffb800' }, { name: 'feature', color: '7c3aed' }], url: 'https://github.com/7IKED/devkitz-ecosystem/issues/243' },
]

const DOCS = [
  { name: 'RULES.md', badge: 'badge-red', icon: '📜', desc: '48 Regeln' },
  { name: 'PATTERNS.md', badge: 'badge-purple', icon: '🧩', desc: '24 Patterns' },
  { name: 'AGENTS.md', badge: 'badge-blue', icon: '🤖', desc: '41 Agenten' },
  { name: 'llms.txt', badge: 'badge-yellow', icon: '🧠', desc: 'LLM Navigation' },
  { name: 'README.md', badge: 'badge-green', icon: '📖', desc: 'Einstieg' },
]

export default function GitHubPanel() {
  const [prs, setPrs] = useState(DEMO_PRS)
  const [issues, setIssues] = useState(DEMO_ISSUES)
  const [stats, setStats] = useState({ issues: 23, prs: 7, repos: 29 })

  useEffect(() => {
    fetch(`${API}/github/prs`).then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setPrs(d) })
      .catch(() => {})

    fetch(`${API}/github/issues`).then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setIssues(d) })
      .catch(() => {})

    fetch(`${API}/github/stats`).then(r => r.json())
      .then(d => { if (d.repos != null) setStats(d) })
      .catch(() => {})
  }, [])

  const prIcon = (state) => {
    if (state === 'merged') return { icon: '🟣', cls: 'badge-purple' }
    if (state === 'open') return { icon: '🟢', cls: 'badge-green' }
    return { icon: '🔴', cls: 'badge-red' }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Offene Issues', value: stats.issues, color: 'var(--color-neon-yellow)', icon: '📋' },
          { label: 'Offene PRs', value: stats.prs, color: 'var(--color-neon-green)', icon: '🔀' },
          { label: 'Repositories', value: stats.repos, color: 'var(--color-neon-blue)', icon: '📁' },
        ].map(s => (
          <div key={s.label} className="glass-card text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="stat-value text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pull Requests */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>🔀</span> Pull Requests
        </h3>
        <div className="space-y-1">
          {prs.map(pr => {
            const { icon, cls } = prIcon(pr.state)
            return (
              <a key={pr.id} href={pr.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer border-b"
                style={{ borderColor: 'var(--color-border)', textDecoration: 'none', color: 'inherit' }}>
                <span className="text-sm">{icon}</span>
                <span className={`badge ${cls} shrink-0`}>{esc(pr.state)}</span>
                <span className="text-sm flex-1 truncate">{esc(pr.title)}</span>
                <span className="text-xs shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>#{pr.id}</span>
                <div className="flex gap-1 shrink-0">
                  {pr.labels?.map(l => (
                    <span key={l.name} className="badge text-[10px]" style={{ background: `${l.color}25`, color: `#${l.color}` }}>
                      {esc(l.name)}
                    </span>
                  ))}
                </div>
              </a>
            )
          })}
        </div>
      </div>

      {/* Issues */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>📋</span> Issues
        </h3>
        <div className="space-y-1">
          {issues.map(issue => (
            <a key={issue.id} href={issue.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all hover:bg-white/5 cursor-pointer border-b"
              style={{ borderColor: 'var(--color-border)', textDecoration: 'none', color: 'inherit' }}>
              <span className="text-xs shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-dim)' }}>#{issue.id}</span>
              <span className="text-sm flex-1 truncate">{esc(issue.title)}</span>
              <div className="flex gap-1 shrink-0">
                {issue.labels?.map(l => (
                  <span key={l.name} className="badge text-[10px]" style={{ background: `#${l.color}25`, color: `#${l.color}` }}>
                    {esc(l.name)}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Dokumentation */}
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <span>📚</span> Dokumentation
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DOCS.map(doc => (
            <div key={doc.name} className="glass-card flex items-center gap-2 p-3 cursor-pointer">
              <span className="text-lg">{doc.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{doc.name}</p>
                <span className={`badge ${doc.badge} text-[10px]`}>{doc.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
