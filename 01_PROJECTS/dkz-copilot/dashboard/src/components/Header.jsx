export default function Header({ status, onRefresh }) {
  const dotClass = {
    idle: 'bg-[var(--color-neon-green)] shadow-[0_0_8px_var(--color-neon-green)]',
    working: 'bg-[var(--color-neon-yellow)] shadow-[0_0_8px_var(--color-neon-yellow)] animate-pulse-dot',
    error: 'bg-[var(--color-neon-red)] shadow-[0_0_8px_var(--color-neon-red)]',
    offline: 'bg-[var(--color-neon-red)] shadow-[0_0_8px_var(--color-neon-red)]'
  }[status] || 'bg-[var(--color-neon-green)]'

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3 border-b backdrop-blur-xl" style={{background:'rgba(6,6,8,0.85)',borderColor:'var(--color-border)'}}>
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-neon-purple)] bg-clip-text text-transparent">
          DkZ CoPilot&trade;
        </h1>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(250,30,78,0.15)',color:'var(--color-accent)'}}>
          v2.0
        </span>
      </div>
      <div className="flex gap-2">
        <button onClick={onRefresh} className="px-3 py-1.5 rounded-lg text-xs border transition-all hover:border-[var(--color-accent)]" style={{background:'var(--color-card)',borderColor:'var(--color-border)',color:'var(--color-text)'}}>
          ↻ Refresh
        </button>
      </div>
    </header>
  )
}
