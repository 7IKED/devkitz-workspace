export default function TabBar({ tabs, active, onChange }) {
  return (
    <nav className="flex overflow-x-auto border-b scrollbar-hide" style={{borderColor:'var(--color-border)'}}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            active === tab.id
              ? 'text-[var(--color-accent)] border-[var(--color-accent)]'
              : 'text-[var(--color-text-dim)] border-transparent hover:text-[var(--color-text)]'
          }`}>
          <span className="mr-1.5">{tab.icon}</span>{tab.label}
        </button>
      ))}
    </nav>
  )
}
