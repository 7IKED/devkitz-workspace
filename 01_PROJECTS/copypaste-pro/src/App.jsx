import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from './shared';
import { Navbar, Toast, EmptyState } from './components';

// === APP TRANSLATIONS ===
const appTranslations = {
  en: {
    appTitle: 'CopyPaste Pro',
    clipboard: 'Clipboard',
    paste: 'Paste',
    pin: 'Pin',
    unpin: 'Unpin',
    copyBack: 'Copy',
    deleteItem: 'Delete',
    clearAll: 'Clear All',
    clearConfirm: 'Are you sure you want to clear all clipboard entries?',
    bulkDelete: 'Bulk Delete',
    bulkDeleteConfirm: 'Delete all selected entries?',
    exportJson: 'Export JSON',
    favorites: 'Favorites',
    all: 'All',
    urls: 'URLs',
    code: 'Code',
    emails: 'Emails',
    text: 'Text',
    searchPlaceholder: 'Search clipboard history...',
    emptyTitle: 'No Clipboard Entries',
    emptyDesc: 'Paste something (Ctrl+V) to add it to your history.',
    copiedToClipboard: 'Copied to clipboard!',
    itemDeleted: 'Entry deleted',
    allCleared: 'All entries cleared',
    pinned: 'Pinned!',
    unpinned: 'Unpinned',
    exported: 'Exported as JSON',
    pastedNew: 'New entry added',
    chars: 'chars',
    entries: 'entries',
    selected: 'selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    addManual: 'Add Entry',
    addPlaceholder: 'Type or paste text here...',
    add: 'Add',
    timestamp: 'Timestamp',
  },
  de: {
    appTitle: 'CopyPaste Pro',
    clipboard: 'Zwischenablage',
    paste: 'Einfuegen',
    pin: 'Anheften',
    unpin: 'Loslassen',
    copyBack: 'Kopieren',
    deleteItem: 'Loeschen',
    clearAll: 'Alles loeschen',
    clearConfirm: 'Wirklich alle Eintraege loeschen?',
    bulkDelete: 'Mehrere loeschen',
    bulkDeleteConfirm: 'Ausgewaehlte Eintraege loeschen?',
    exportJson: 'Als JSON exportieren',
    favorites: 'Favoriten',
    all: 'Alle',
    urls: 'URLs',
    code: 'Code',
    emails: 'E-Mails',
    text: 'Text',
    searchPlaceholder: 'Verlauf durchsuchen...',
    emptyTitle: 'Keine Eintraege',
    emptyDesc: 'Fuege etwas ein (Strg+V) um es zum Verlauf hinzuzufuegen.',
    copiedToClipboard: 'In Zwischenablage kopiert!',
    itemDeleted: 'Eintrag geloescht',
    allCleared: 'Alle Eintraege geloescht',
    pinned: 'Angeheftet!',
    unpinned: 'Losgelassen',
    exported: 'Als JSON exportiert',
    pastedNew: 'Neuer Eintrag hinzugefuegt',
    chars: 'Zeichen',
    entries: 'Eintraege',
    selected: 'ausgewaehlt',
    selectAll: 'Alle auswaehlen',
    deselectAll: 'Auswahl aufheben',
    addManual: 'Eintrag hinzufuegen',
    addPlaceholder: 'Text eingeben oder einfuegen...',
    add: 'Hinzufuegen',
    timestamp: 'Zeitstempel',
  },
};

const MAX_ENTRIES = 200;
const STORAGE_KEY = 'copypaste-pro-entries';

// === TYPE DETECTION ===
function detectType(text) {
  if (!text) return 'text';
  const trimmed = text.trim();
  if (/^https?:\/\/\S+$/i.test(trimmed) || /^www\.\S+$/i.test(trimmed)) return 'url';
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return 'email';
  if (
    /[{}\[\]();]/.test(trimmed) &&
    (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('let ') ||
     trimmed.includes('import ') || trimmed.includes('class ') || trimmed.includes('=>') ||
     trimmed.includes('def ') || trimmed.includes('return ') || /^\s*(\/\/|#|\/\*)/.test(trimmed) ||
     trimmed.includes('console.') || trimmed.includes('document.') || trimmed.includes('window.'))
  ) return 'code';
  if (trimmed.split('\n').length > 3 && /[{}<>\/\\;=]/.test(trimmed)) return 'code';
  return 'text';
}

// === XSS ESCAPE ===
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === BADGE CONFIG ===
const typeBadgeConfig = {
  url: { label: 'URL', color: 'bg-dkz-blue/15 text-dkz-blue border-dkz-blue/25', icon: '🔗' },
  email: { label: 'Email', color: 'bg-dkz-yellow/15 text-dkz-yellow border-dkz-yellow/25', icon: '📧' },
  code: { label: 'Code', color: 'bg-neon-green/15 text-neon-green border-neon-green/25', icon: '💻' },
  text: { label: 'Text', color: 'bg-accent/15 text-accent border-accent/25', icon: '📝' },
};

// === MAIN APP ===
export default function App() {
  const { t } = useI18n();
  const tApp = (key) => t(key, appTranslations);

  // State
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addText, setAddText] = useState('');
  const inputRef = useRef(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Show toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Add new entry
  const addEntry = useCallback((text) => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();
    // Skip duplicates at top
    if (entries.length > 0 && entries[0].text === trimmed) return;
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: trimmed,
      type: detectType(trimmed),
      pinned: false,
      timestamp: new Date().toISOString(),
    };
    setEntries((prev) => {
      const updated = [newEntry, ...prev.filter((e) => e.text !== trimmed)];
      return updated.slice(0, MAX_ENTRIES);
    });
    showToast(tApp('pastedNew'), 'success');
  }, [entries, showToast]);

  // Keyboard listener for Ctrl+V
  useEffect(() => {
    const handler = async (e) => {
      // Don't capture if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        try {
          const text = await navigator.clipboard.readText();
          if (text) addEntry(text);
        } catch {
          // Clipboard API may not be available
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addEntry]);

  // Copy back to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(tApp('copiedToClipboard'), 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  // Pin/Unpin
  const togglePin = (id) => {
    setEntries((prev) =>
      prev.map((e) => e.id === id ? { ...e, pinned: !e.pinned } : e)
    );
    const entry = entries.find((e) => e.id === id);
    showToast(entry?.pinned ? tApp('unpinned') : tApp('pinned'), 'info');
  };

  // Delete single
  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    showToast(tApp('itemDeleted'), 'warning');
  };

  // Clear all with confirm
  const clearAll = () => {
    setEntries([]);
    setSelected(new Set());
    setShowConfirm(null);
    showToast(tApp('allCleared'), 'warning');
  };

  // Bulk delete
  const bulkDelete = () => {
    setEntries((prev) => prev.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
    setShowConfirm(null);
    showToast(`${selected.size} ${tApp('itemDeleted')}`, 'warning');
  };

  // Toggle selection
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  // Export as JSON
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copypaste-pro-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(tApp('exported'), 'success');
  };

  // Manual add
  const handleManualAdd = () => {
    if (addText.trim()) {
      addEntry(addText);
      setAddText('');
      setShowAddModal(false);
    }
  };

  // Filter + Search
  const filteredEntries = entries.filter((entry) => {
    // Filter by category
    if (filter === 'favorites' && !entry.pinned) return false;
    if (filter === 'urls' && entry.type !== 'url') return false;
    if (filter === 'code' && entry.type !== 'code') return false;
    if (filter === 'emails' && entry.type !== 'email') return false;
    if (filter === 'text' && entry.type !== 'text') return false;
    // Search
    if (search && !entry.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort: pinned first, then by timestamp
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Category counts
  const counts = {
    all: entries.length,
    favorites: entries.filter((e) => e.pinned).length,
    urls: entries.filter((e) => e.type === 'url').length,
    code: entries.filter((e) => e.type === 'code').length,
    emails: entries.filter((e) => e.type === 'email').length,
    text: entries.filter((e) => e.type === 'text').length,
  };

  const filterButtons = [
    { key: 'all', label: tApp('all'), icon: '📋' },
    { key: 'favorites', label: tApp('favorites'), icon: '⭐' },
    { key: 'urls', label: tApp('urls'), icon: '🔗' },
    { key: 'code', label: tApp('code'), icon: '💻' },
    { key: 'emails', label: tApp('emails'), icon: '📧' },
    { key: 'text', label: tApp('text'), icon: '📝' },
  ];

  const selectAll = () => {
    setSelected(new Set(sortedEntries.map((e) => e.id)));
  };
  const deselectAll = () => {
    setSelected(new Set());
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen">
      <Navbar title={tApp('appTitle')} icon="📋" />

      <main className="pt-24 pb-8 px-4 md:px-8 max-w-6xl mx-auto">

        {/* === SEARCH BAR === */}
        <div className="mb-6 animate-fade-in">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dkz-muted text-lg">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tApp('searchPlaceholder')}
              className="input-neon !pl-12 !pr-4"
              ref={inputRef}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dkz-muted hover:text-neon-green transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* === FILTER TABS === */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in animate-delay-100">
          {filterButtons.map((fb) => (
            <button
              key={fb.key}
              onClick={() => setFilter(fb.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border
                ${filter === fb.key
                  ? 'bg-neon-green/15 text-neon-green border-neon-green/30 shadow-neon'
                  : 'bg-matrix-card text-dkz-text-dim border-matrix-border hover:border-neon-green/20 hover:text-dkz-text'
                }`}
            >
              <span>{fb.icon}</span>
              {fb.label}
              <span className="ml-1 text-xs opacity-60 font-mono">({counts[fb.key]})</span>
            </button>
          ))}
        </div>

        {/* === ACTION BAR === */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in animate-delay-200">
          <button onClick={() => setShowAddModal(true)} className="btn-neon !py-2 !px-4 text-sm">
            ➕ {tApp('addManual')}
          </button>
          <button onClick={exportJson} className="btn-ghost text-sm" disabled={entries.length === 0}>
            📦 {tApp('exportJson')}
          </button>

          {selected.size > 0 && (
            <>
              <span className="text-xs text-dkz-muted font-mono">
                {selected.size} {tApp('selected')}
              </span>
              <button
                onClick={() => setShowConfirm('bulk')}
                className="btn-accent !py-2 !px-4 text-sm"
              >
                🗑️ {tApp('bulkDelete')}
              </button>
              <button onClick={deselectAll} className="btn-ghost text-sm">
                {tApp('deselectAll')}
              </button>
            </>
          )}

          {entries.length > 0 && selected.size === 0 && (
            <button onClick={selectAll} className="btn-ghost text-sm">
              ☑️ {tApp('selectAll')}
            </button>
          )}

          <div className="flex-1" />

          {entries.length > 0 && (
            <button
              onClick={() => setShowConfirm('clearAll')}
              className="btn-ghost text-sm text-accent hover:text-accent"
            >
              🗑️ {tApp('clearAll')}
            </button>
          )}

          <span className="text-xs text-dkz-muted font-mono">
            {entries.length}/{MAX_ENTRIES} {tApp('entries')}
          </span>
        </div>

        {/* === ENTRIES LIST === */}
        {sortedEntries.length === 0 ? (
          <EmptyState
            icon="📋"
            title={tApp('emptyTitle')}
            description={tApp('emptyDesc')}
          />
        ) : (
          <div className="space-y-3">
            {sortedEntries.map((entry, idx) => (
              <ClipboardEntry
                key={entry.id}
                entry={entry}
                isSelected={selected.has(entry.id)}
                onToggleSelect={() => toggleSelect(entry.id)}
                onCopy={() => copyToClipboard(entry.text)}
                onPin={() => togglePin(entry.id)}
                onDelete={() => deleteEntry(entry.id)}
                formatTime={formatTime}
                tApp={tApp}
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
              />
            ))}
          </div>
        )}
      </main>

      {/* === ADD MODAL === */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-lg neon-card animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neon-green text-glow">
                ➕ {tApp('addManual')}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost text-lg">✕</button>
            </div>
            <textarea
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              placeholder={tApp('addPlaceholder')}
              className="input-neon !min-h-[120px] resize-y mb-4 font-mono text-sm"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-dkz-muted font-mono">
                {addText.length} {tApp('chars')}
              </span>
              <div className="flex gap-2">
                <button onClick={() => setShowAddModal(false)} className="btn-ghost">
                  {t('cancel', appTranslations)}
                </button>
                <button onClick={handleManualAdd} className="btn-neon" disabled={!addText.trim()}>
                  {tApp('add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === CONFIRM DIALOG === */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm neon-card animate-slide-up text-center">
            <p className="text-dkz-text mb-6 text-sm">
              {showConfirm === 'clearAll' ? tApp('clearConfirm') : tApp('bulkDeleteConfirm')}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowConfirm(null)} className="btn-ghost">
                {t('cancel', appTranslations)}
              </button>
              <button
                onClick={showConfirm === 'clearAll' ? clearAll : bulkDelete}
                className="btn-accent"
              >
                {t('delete', appTranslations)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === TOAST === */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// === CLIPBOARD ENTRY COMPONENT ===
function ClipboardEntry({ entry, isSelected, onToggleSelect, onCopy, onPin, onDelete, formatTime, tApp, style }) {
  const badge = typeBadgeConfig[entry.type] || typeBadgeConfig.text;
  const isLong = entry.text.length > 300;
  const [expanded, setExpanded] = useState(false);
  const displayText = isLong && !expanded ? entry.text.slice(0, 300) + '...' : entry.text;

  return (
    <div
      className={`neon-card !p-4 animate-slide-up group transition-all duration-300
        ${entry.pinned ? 'border-dkz-yellow/30 bg-dkz-yellow/[0.02]' : ''}
        ${isSelected ? 'border-neon-green/40 bg-neon-green/[0.03]' : ''}`}
      style={style}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggleSelect}
          className={`mt-1 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all duration-200
            ${isSelected
              ? 'bg-neon-green/20 border-neon-green text-neon-green'
              : 'border-matrix-border hover:border-neon-green/40 text-transparent'
            }`}
        >
          {isSelected && '✓'}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: Badge + Pin indicator + Timestamp */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${badge.color}`}>
              {badge.icon} {badge.label}
            </span>
            {entry.pinned && (
              <span className="text-dkz-yellow text-xs">⭐</span>
            )}
            <span className="text-[10px] text-dkz-muted font-mono ml-auto shrink-0">
              {formatTime(entry.timestamp)}
            </span>
          </div>

          {/* Text content */}
          <div className="mb-2">
            {entry.type === 'code' ? (
              <pre className="text-sm font-mono text-dkz-text whitespace-pre-wrap break-all bg-matrix-dark/50 rounded-lg p-3 border border-matrix-border">
                {displayText}
              </pre>
            ) : entry.type === 'url' ? (
              <a
                href={entry.text}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-dkz-blue hover:text-dkz-blue/80 underline break-all"
              >
                {displayText}
              </a>
            ) : (
              <p className="text-sm text-dkz-text break-words leading-relaxed">
                {displayText}
              </p>
            )}
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-neon-green hover:text-neon-green-dim mt-1 transition-colors"
              >
                {expanded ? '▲ Show less' : '▼ Show more'}
              </button>
            )}
          </div>

          {/* Bottom: char count */}
          <span className="text-[10px] text-dkz-muted font-mono">
            {entry.text.length} {tApp('chars')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onCopy}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-neon-green/10 hover:text-neon-green transition-all"
            title={tApp('copyBack')}
          >
            📋
          </button>
          <button
            onClick={onPin}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all
              ${entry.pinned ? 'bg-dkz-yellow/10 text-dkz-yellow' : 'hover:bg-dkz-yellow/10 hover:text-dkz-yellow'}`}
            title={entry.pinned ? tApp('unpin') : tApp('pin')}
          >
            {entry.pinned ? '⭐' : '☆'}
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-accent/10 hover:text-accent transition-all"
            title={tApp('deleteItem')}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
