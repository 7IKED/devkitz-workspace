import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useI18n } from './shared';
import { Navbar, Toast, EmptyState } from './components';

const APP_NAME = 'dkz-keep';

const appTranslations = {
  en: {
    appTitle: 'DkZ Keep',
    newNote: 'Take a note...',
    newTitle: 'Title',
    checklist: 'Checklist',
    pin: 'Pin',
    unpin: 'Unpin',
    archive: 'Archive',
    unarchive: 'Unarchive',
    labels: 'Labels',
    addLabel: 'Add label',
    createLabel: 'Create label',
    color: 'Color',
    pinned: 'Pinned',
    others: 'Others',
    archived: 'Archived',
    notes: 'Notes',
    addItem: 'Add item',
    deleteNote: 'Delete note',
    gridView: 'Grid view',
    listView: 'List view',
    allNotes: 'All Notes',
    noNotes: 'No notes yet',
    noNotesDesc: 'Click the input above to create your first note',
    noArchived: 'No archived notes',
    noArchivedDesc: 'Archived notes will appear here',
    noResults: 'No matching notes',
    noResultsDesc: 'Try a different search term',
    noteDeleted: 'Note deleted',
    notePinned: 'Note pinned',
    noteUnpinned: 'Note unpinned',
    noteArchived: 'Note archived',
    noteUnarchived: 'Note unarchived',
    editLabels: 'Edit labels',
    labelName: 'Label name',
    done: 'Done',
    checkedItems: 'checked',
    uncheckedItems: 'unchecked',
  },
  de: {
    appTitle: 'DkZ Keep',
    newNote: 'Notiz erstellen...',
    newTitle: 'Titel',
    checklist: 'Checkliste',
    pin: 'Anheften',
    unpin: 'Losloeosen',
    archive: 'Archiv',
    unarchive: 'Wiederherstellen',
    labels: 'Labels',
    addLabel: 'Label hinzufuegen',
    createLabel: 'Label erstellen',
    color: 'Farbe',
    pinned: 'Angeheftet',
    others: 'Andere',
    archived: 'Archiviert',
    notes: 'Notizen',
    addItem: 'Element hinzufuegen',
    deleteNote: 'Notiz loeschen',
    gridView: 'Rasteransicht',
    listView: 'Listenansicht',
    allNotes: 'Alle Notizen',
    noNotes: 'Noch keine Notizen',
    noNotesDesc: 'Klicke oben, um deine erste Notiz zu erstellen',
    noArchived: 'Keine archivierten Notizen',
    noArchivedDesc: 'Archivierte Notizen erscheinen hier',
    noResults: 'Keine passenden Notizen',
    noResultsDesc: 'Versuche einen anderen Suchbegriff',
    noteDeleted: 'Notiz geloescht',
    notePinned: 'Notiz angeheftet',
    noteUnpinned: 'Notiz losgeloest',
    noteArchived: 'Notiz archiviert',
    noteUnarchived: 'Notiz wiederhergestellt',
    editLabels: 'Labels bearbeiten',
    labelName: 'Label-Name',
    done: 'Fertig',
    checkedItems: 'erledigt',
    uncheckedItems: 'offen',
  },
};

const NOTE_COLORS = [
  { id: 'default', value: 'transparent', border: 'rgba(26,26,37,1)' },
  { id: 'red', value: 'rgba(250,30,78,0.12)', border: 'rgba(250,30,78,0.25)' },
  { id: 'orange', value: 'rgba(255,152,0,0.12)', border: 'rgba(255,152,0,0.25)' },
  { id: 'yellow', value: 'rgba(255,184,0,0.12)', border: 'rgba(255,184,0,0.25)' },
  { id: 'green', value: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.25)' },
  { id: 'teal', value: 'rgba(0,200,200,0.12)', border: 'rgba(0,200,200,0.25)' },
  { id: 'blue', value: 'rgba(85,172,238,0.12)', border: 'rgba(85,172,238,0.25)' },
  { id: 'purple', value: 'rgba(170,85,255,0.12)', border: 'rgba(170,85,255,0.25)' },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(`${APP_NAME}-notes`)) || [];
  } catch { return []; }
}

function saveNotes(notes) {
  localStorage.setItem(`${APP_NAME}-notes`, JSON.stringify(notes));
}

function loadLabels() {
  try {
    return JSON.parse(localStorage.getItem(`${APP_NAME}-labels`)) || [];
  } catch { return []; }
}

function saveLabels(labels) {
  localStorage.setItem(`${APP_NAME}-labels`, JSON.stringify(labels));
}

// === MAIN APP ===
export default function App() {
  const { t } = useI18n();
  const tt = (key) => t(key, appTranslations);

  const [notes, setNotes] = useState(loadNotes);
  const [labels, setLabels] = useState(loadLabels);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() =>
    localStorage.getItem(`${APP_NAME}-viewMode`) || 'grid'
  );
  const [showArchive, setShowArchive] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [activeLabel, setActiveLabel] = useState(null);
  const [toast, setToast] = useState(null);
  const [dragId, setDragId] = useState(null);

  useEffect(() => { saveNotes(notes); }, [notes]);
  useEffect(() => { saveLabels(labels); }, [labels]);
  useEffect(() => {
    localStorage.setItem(`${APP_NAME}-viewMode`, viewMode);
  }, [viewMode]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const addNote = useCallback((note) => {
    setNotes(prev => [note, ...prev]);
  }, []);

  const updateNote = useCallback((id, updates) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    showToast(tt('noteDeleted'), 'info');
  }, [showToast, tt]);

  const togglePin = useCallback((id) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      const newPinned = !note.pinned;
      showToast(newPinned ? tt('notePinned') : tt('noteUnpinned'));
      return prev.map(n => n.id === id ? { ...n, pinned: newPinned } : n);
    });
  }, [showToast, tt]);

  const toggleArchive = useCallback((id) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      const newArchived = !note.archived;
      showToast(newArchived ? tt('noteArchived') : tt('noteUnarchived'));
      return prev.map(n => n.id === id ? { ...n, archived: newArchived, pinned: newArchived ? false : n.pinned } : n);
    });
  }, [showToast, tt]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => showArchive ? n.archived : !n.archived);

    if (activeLabel) {
      result = result.filter(n => n.labels && n.labels.includes(activeLabel));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => {
        const titleMatch = (n.title || '').toLowerCase().includes(q);
        const contentMatch = (n.content || '').toLowerCase().includes(q);
        const itemsMatch = n.type === 'checklist' && n.items &&
          n.items.some(item => item.text.toLowerCase().includes(q));
        return titleMatch || contentMatch || itemsMatch;
      });
    }

    return result;
  }, [notes, showArchive, searchQuery, activeLabel]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.pinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter(n => !n.pinned), [filteredNotes]);

  // Drag & Drop
  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDragId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;
    setNotes(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(n => n.id === dragId);
      const toIdx = arr.findIndex(n => n.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
    setDragId(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar title={tt('appTitle')} icon="📝">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tt('search')}
            className="input-neon !py-1.5 !px-4 !w-48 md:!w-64 text-sm !rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dkz-muted hover:text-white text-xs"
            >✕</button>
          )}
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="btn-ghost text-lg"
          title={viewMode === 'grid' ? tt('listView') : tt('gridView')}
        >
          {viewMode === 'grid' ? '☰' : '⊞'}
        </button>
      </Navbar>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="sidebar hidden md:block">
          <div className="space-y-1">
            <SidebarItem
              icon="📝"
              label={tt('notes')}
              active={!showArchive && !activeLabel}
              onClick={() => { setShowArchive(false); setActiveLabel(null); }}
            />
            <SidebarItem
              icon="📦"
              label={tt('archived')}
              active={showArchive}
              onClick={() => { setShowArchive(true); setActiveLabel(null); }}
            />
            <div className="border-t border-matrix-border my-3 pt-3">
              <div className="flex items-center justify-between mb-2 px-3">
                <span className="text-xs text-dkz-muted uppercase tracking-wider font-mono">
                  {tt('labels')}
                </span>
                <button
                  onClick={() => setShowLabelManager(true)}
                  className="text-dkz-muted hover:text-neon-green text-sm transition-colors"
                  title={tt('editLabels')}
                >✎</button>
              </div>
              {labels.map(label => (
                <SidebarItem
                  key={label.id}
                  icon="🏷️"
                  label={label.name}
                  active={activeLabel === label.id && !showArchive}
                  onClick={() => { setActiveLabel(label.id); setShowArchive(false); }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Create Note Input */}
          {!showArchive && (
            <NoteCreator
              onAdd={addNote}
              labels={labels}
              tt={tt}
            />
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <EmptyState
              icon={showArchive ? '📦' : searchQuery ? '🔍' : '📝'}
              title={showArchive ? tt('noArchived') : searchQuery ? tt('noResults') : tt('noNotes')}
              description={showArchive ? tt('noArchivedDesc') : searchQuery ? tt('noResultsDesc') : tt('noNotesDesc')}
            />
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-dkz-muted uppercase tracking-widest font-mono mb-3 px-1">
                    {tt('pinned')}
                  </p>
                  <NoteGrid
                    notes={pinnedNotes}
                    viewMode={viewMode}
                    onEdit={setEditingNote}
                    onTogglePin={togglePin}
                    onToggleArchive={toggleArchive}
                    onDelete={deleteNote}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    labels={labels}
                    tt={tt}
                  />
                </div>
              )}

              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <p className="text-xs text-dkz-muted uppercase tracking-widest font-mono mb-3 px-1">
                      {tt('others')}
                    </p>
                  )}
                  <NoteGrid
                    notes={unpinnedNotes}
                    viewMode={viewMode}
                    onEdit={setEditingNote}
                    onTogglePin={togglePin}
                    onToggleArchive={toggleArchive}
                    onDelete={deleteNote}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    labels={labels}
                    tt={tt}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {editingNote && (
        <NoteEditModal
          note={notes.find(n => n.id === editingNote)}
          labels={labels}
          onUpdate={updateNote}
          onClose={() => setEditingNote(null)}
          onDelete={deleteNote}
          onTogglePin={togglePin}
          onToggleArchive={toggleArchive}
          tt={tt}
        />
      )}

      {/* Label Manager */}
      {showLabelManager && (
        <LabelManager
          labels={labels}
          setLabels={setLabels}
          onClose={() => setShowLabelManager(false)}
          tt={tt}
        />
      )}

      {/* Mobile Bottom Nav */}
      <MobileNav
        showArchive={showArchive}
        setShowArchive={setShowArchive}
        setActiveLabel={setActiveLabel}
        onLabelManager={() => setShowLabelManager(true)}
        tt={tt}
      />

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

// === SIDEBAR ITEM ===
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
        ${active
          ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
          : 'text-dkz-text-dim hover:bg-matrix-hover hover:text-dkz-text border border-transparent'
        }`}
    >
      <span className="text-base">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

// === NOTE CREATOR ===
function NoteCreator({ onAdd, labels, tt }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [color, setColor] = useState('default');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [items, setItems] = useState([{ id: generateId(), text: '', checked: false }]);
  const [showColors, setShowColors] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const containerRef = useRef(null);

  const handleClickOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      handleSave();
    }
  }, [title, content, items, type]);

  useEffect(() => {
    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [expanded, handleClickOutside]);

  const handleSave = () => {
    if (type === 'text' && !title.trim() && !content.trim()) {
      resetAndClose();
      return;
    }
    if (type === 'checklist' && !title.trim() && items.every(i => !i.text.trim())) {
      resetAndClose();
      return;
    }

    const note = {
      id: generateId(),
      type,
      title: title.trim(),
      content: type === 'text' ? content.trim() : '',
      items: type === 'checklist' ? items.filter(i => i.text.trim()) : [],
      color,
      labels: selectedLabels,
      pinned: false,
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onAdd(note);
    resetAndClose();
  };

  const resetAndClose = () => {
    setTitle('');
    setContent('');
    setType('text');
    setColor('default');
    setSelectedLabels([]);
    setItems([{ id: generateId(), text: '', checked: false }]);
    setExpanded(false);
    setShowColors(false);
    setShowLabelPicker(false);
  };

  const noteColor = NOTE_COLORS.find(c => c.id === color) || NOTE_COLORS[0];

  const addChecklistItem = () => {
    setItems(prev => [...prev, { id: generateId(), text: '', checked: false }]);
  };

  const updateChecklistItem = (itemId, text) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, text } : i));
  };

  const removeChecklistItem = (itemId) => {
    setItems(prev => prev.length > 1 ? prev.filter(i => i.id !== itemId) : prev);
  };

  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className="neon-card !p-4 max-w-2xl mx-auto mb-8 cursor-text group"
      >
        <p className="text-dkz-muted group-hover:text-dkz-text-dim transition-colors">
          {tt('newNote')}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="neon-card !p-4 max-w-2xl mx-auto mb-8 animate-fade-in"
      style={{ backgroundColor: noteColor.value, borderColor: noteColor.border }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={tt('newTitle')}
        className="w-full bg-transparent text-dkz-text font-semibold text-lg outline-none placeholder:text-dkz-muted mb-2"
        autoFocus
      />

      {type === 'text' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={tt('newNote')}
          className="w-full bg-transparent text-dkz-text-dim text-sm outline-none resize-none min-h-[80px] placeholder:text-dkz-muted"
          rows={3}
        />
      ) : (
        <div className="space-y-1 mb-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group/item">
              <span className="w-4 h-4 rounded border border-matrix-border flex-shrink-0" />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addChecklistItem(); }}
                placeholder={tt('addItem')}
                className="flex-1 bg-transparent text-sm text-dkz-text-dim outline-none placeholder:text-dkz-muted"
              />
              <button
                onClick={() => removeChecklistItem(item.id)}
                className="opacity-0 group-hover/item:opacity-100 text-dkz-muted hover:text-accent text-xs transition-opacity"
              >✕</button>
            </div>
          ))}
          <button
            onClick={addChecklistItem}
            className="text-xs text-dkz-muted hover:text-neon-green transition-colors flex items-center gap-1 mt-1"
          >
            <span>+</span> {tt('addItem')}
          </button>
        </div>
      )}

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {selectedLabels.map(labelId => {
            const label = labels.find(l => l.id === labelId);
            return label ? (
              <span key={labelId} className="badge-neon !text-[10px]">
                {label.name}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-matrix-border/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setType(type === 'text' ? 'checklist' : 'text')}
            className={`btn-ghost !px-2 !py-1 text-sm ${type === 'checklist' ? 'text-neon-green' : ''}`}
            title={tt('checklist')}
          >☑</button>

          <div className="relative">
            <button
              onClick={() => { setShowColors(!showColors); setShowLabelPicker(false); }}
              className="btn-ghost !px-2 !py-1 text-sm"
              title={tt('color')}
            >🎨</button>
            {showColors && (
              <ColorPicker
                selected={color}
                onSelect={(c) => { setColor(c); setShowColors(false); }}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowLabelPicker(!showLabelPicker); setShowColors(false); }}
              className="btn-ghost !px-2 !py-1 text-sm"
              title={tt('labels')}
            >🏷️</button>
            {showLabelPicker && (
              <LabelPicker
                labels={labels}
                selected={selectedLabels}
                onToggle={(id) => setSelectedLabels(prev =>
                  prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
                )}
              />
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-ghost text-sm font-semibold text-neon-green"
        >{tt('close')}</button>
      </div>
    </div>
  );
}

// === NOTE GRID ===
function NoteGrid({ notes, viewMode, onEdit, onTogglePin, onToggleArchive, onDelete,
  onDragStart, onDragEnd, onDragOver, onDrop, labels, tt }) {

  if (viewMode === 'list') {
    return (
      <div className="space-y-2 max-w-2xl mx-auto">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            viewMode={viewMode}
            onEdit={onEdit}
            onTogglePin={onTogglePin}
            onToggleArchive={onToggleArchive}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDrop={onDrop}
            labels={labels}
            tt={tt}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto"
      style={{ gridAutoRows: 'min-content' }}
    >
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          viewMode={viewMode}
          onEdit={onEdit}
          onTogglePin={onTogglePin}
          onToggleArchive={onToggleArchive}
          onDelete={onDelete}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          labels={labels}
          tt={tt}
        />
      ))}
    </div>
  );
}

// === NOTE CARD ===
function NoteCard({ note, viewMode, onEdit, onTogglePin, onToggleArchive, onDelete,
  onDragStart, onDragEnd, onDragOver, onDrop, labels, tt }) {

  const noteColor = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];
  const checkedCount = note.type === 'checklist' ? note.items.filter(i => i.checked).length : 0;
  const uncheckedCount = note.type === 'checklist' ? note.items.filter(i => !i.checked).length : 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, note.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, note.id)}
      onClick={() => onEdit(note.id)}
      className={`neon-card !p-4 cursor-pointer group transition-all duration-300 hover:shadow-neu-float
        ${viewMode === 'list' ? 'flex items-start gap-4' : ''}`}
      style={{ backgroundColor: noteColor.value, borderColor: noteColor.border }}
    >
      <div className={`flex-1 min-w-0 ${viewMode === 'list' ? '' : ''}`}>
        {note.title && (
          <h3 className="font-semibold text-dkz-text mb-1 truncate">{note.title}</h3>
        )}

        {note.type === 'text' && note.content && (
          <p className={`text-sm text-dkz-text-dim ${viewMode === 'grid' ? 'line-clamp-6' : 'line-clamp-2'}`}>
            {note.content}
          </p>
        )}

        {note.type === 'checklist' && note.items && (
          <div className="space-y-1">
            {note.items.slice(0, viewMode === 'grid' ? 5 : 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center text-[10px]
                  ${item.checked
                    ? 'bg-neon-green/20 border-neon-green/40 text-neon-green'
                    : 'border-matrix-border'
                  }`}>
                  {item.checked && '✓'}
                </span>
                <span className={`truncate ${item.checked ? 'line-through text-dkz-muted' : 'text-dkz-text-dim'}`}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.items.length > (viewMode === 'grid' ? 5 : 3) && (
              <p className="text-xs text-dkz-muted mt-1">
                +{note.items.length - (viewMode === 'grid' ? 5 : 3)} more
              </p>
            )}
            {(checkedCount > 0 || uncheckedCount > 0) && (
              <p className="text-xs text-dkz-muted mt-2 font-mono">
                {checkedCount} {tt('checkedItems')} · {uncheckedCount} {tt('uncheckedItems')}
              </p>
            )}
          </div>
        )}

        {/* Labels */}
        {note.labels && note.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.labels.map(labelId => {
              const label = labels.find(l => l.id === labelId);
              return label ? (
                <span key={labelId} className="badge-neon !text-[9px] !px-1.5 !py-0">
                  {label.name}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center gap-0.5 mt-2
        ${viewMode === 'list' ? 'flex-shrink-0' : ''}
        opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onTogglePin(note.id)}
          className={`btn-ghost !px-1.5 !py-1 text-xs ${note.pinned ? 'text-neon-green' : ''}`}
          title={note.pinned ? tt('unpin') : tt('pin')}
        >📌</button>
        <button
          onClick={() => onToggleArchive(note.id)}
          className="btn-ghost !px-1.5 !py-1 text-xs"
          title={note.archived ? tt('unarchive') : tt('archive')}
        >{note.archived ? '📤' : '📦'}</button>
        <button
          onClick={() => onDelete(note.id)}
          className="btn-ghost !px-1.5 !py-1 text-xs hover:!text-accent"
          title={tt('deleteNote')}
        >🗑️</button>
      </div>
    </div>
  );
}

// === NOTE EDIT MODAL ===
function NoteEditModal({ note, labels, onUpdate, onClose, onDelete, onTogglePin, onToggleArchive, tt }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [items, setItems] = useState(note?.items || []);
  const [color, setColor] = useState(note?.color || 'default');
  const [noteLabels, setNoteLabels] = useState(note?.labels || []);
  const [showColors, setShowColors] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  if (!note) return null;

  const noteColor = NOTE_COLORS.find(c => c.id === color) || NOTE_COLORS[0];

  const handleSave = () => {
    onUpdate(note.id, {
      title: title.trim(),
      content: note.type === 'text' ? content.trim() : note.content,
      items: note.type === 'checklist' ? items.filter(i => i.text.trim()) : note.items,
      color,
      labels: noteLabels,
    });
    onClose();
  };

  const toggleItemCheck = (itemId) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i));
  };

  const updateItemText = (itemId, text) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, text } : i));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: generateId(), text: '', checked: false }]);
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleSave} />
      <div
        className="relative z-10 w-full max-w-lg neon-card animate-slide-up max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: noteColor.value, borderColor: noteColor.border }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={tt('newTitle')}
          className="w-full bg-transparent text-dkz-text font-semibold text-xl outline-none placeholder:text-dkz-muted mb-4"
        />

        {note.type === 'text' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={tt('newNote')}
            className="w-full bg-transparent text-dkz-text-dim text-sm outline-none resize-none min-h-[200px] placeholder:text-dkz-muted leading-relaxed"
            rows={8}
          />
        ) : (
          <div className="space-y-2 mb-4">
            {/* Unchecked items first */}
            {items.filter(i => !i.checked).map(item => (
              <div key={item.id} className="flex items-center gap-3 group/item">
                <button
                  onClick={() => toggleItemCheck(item.id)}
                  className="w-5 h-5 rounded border border-matrix-border flex-shrink-0 flex items-center justify-center
                    hover:border-neon-green/40 transition-colors"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
                  className="flex-1 bg-transparent text-sm text-dkz-text-dim outline-none"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover/item:opacity-100 text-dkz-muted hover:text-accent text-xs transition-opacity"
                >✕</button>
              </div>
            ))}

            <button
              onClick={addItem}
              className="text-xs text-dkz-muted hover:text-neon-green transition-colors flex items-center gap-1"
            >
              <span>+</span> {tt('addItem')}
            </button>

            {/* Checked items */}
            {items.filter(i => i.checked).length > 0 && (
              <div className="border-t border-matrix-border/50 pt-3 mt-3">
                <p className="text-xs text-dkz-muted mb-2 font-mono">
                  {items.filter(i => i.checked).length} {tt('checkedItems')}
                </p>
                {items.filter(i => i.checked).map(item => (
                  <div key={item.id} className="flex items-center gap-3 group/item mb-1">
                    <button
                      onClick={() => toggleItemCheck(item.id)}
                      className="w-5 h-5 rounded bg-neon-green/20 border border-neon-green/40 flex-shrink-0
                        flex items-center justify-center text-neon-green text-xs"
                    >✓</button>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItemText(item.id, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-dkz-muted line-through outline-none"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover/item:opacity-100 text-dkz-muted hover:text-accent text-xs transition-opacity"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Labels display */}
        {noteLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {noteLabels.map(labelId => {
              const label = labels.find(l => l.id === labelId);
              return label ? (
                <span key={labelId} className="badge-neon !text-[10px] cursor-pointer"
                  onClick={() => setNoteLabels(prev => prev.filter(l => l !== labelId))}
                >
                  {label.name} ✕
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-matrix-border/50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onTogglePin(note.id)}
              className={`btn-ghost !px-2 !py-1 text-sm ${note.pinned ? 'text-neon-green' : ''}`}
              title={note.pinned ? tt('unpin') : tt('pin')}
            >📌</button>

            <div className="relative">
              <button
                onClick={() => { setShowColors(!showColors); setShowLabelPicker(false); }}
                className="btn-ghost !px-2 !py-1 text-sm"
                title={tt('color')}
              >🎨</button>
              {showColors && (
                <ColorPicker
                  selected={color}
                  onSelect={(c) => { setColor(c); setShowColors(false); }}
                />
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowLabelPicker(!showLabelPicker); setShowColors(false); }}
                className="btn-ghost !px-2 !py-1 text-sm"
                title={tt('labels')}
              >🏷️</button>
              {showLabelPicker && (
                <LabelPicker
                  labels={labels}
                  selected={noteLabels}
                  onToggle={(id) => setNoteLabels(prev =>
                    prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
                  )}
                />
              )}
            </div>

            <button
              onClick={() => { onToggleArchive(note.id); onClose(); }}
              className="btn-ghost !px-2 !py-1 text-sm"
              title={note.archived ? tt('unarchive') : tt('archive')}
            >{note.archived ? '📤' : '📦'}</button>

            <button
              onClick={() => { onDelete(note.id); onClose(); }}
              className="btn-ghost !px-2 !py-1 text-sm hover:!text-accent"
              title={tt('deleteNote')}
            >🗑️</button>
          </div>

          <button
            onClick={handleSave}
            className="btn-ghost text-sm font-semibold text-neon-green"
          >{tt('close')}</button>
        </div>
      </div>
    </div>
  );
}

// === COLOR PICKER ===
function ColorPicker({ selected, onSelect }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 p-2 neon-card !rounded-xl animate-fade-in z-20 flex gap-1.5">
      {NOTE_COLORS.map(c => (
        <button
          key={c.id}
          onClick={(e) => { e.stopPropagation(); onSelect(c.id); }}
          className={`w-7 h-7 rounded-full border-2 transition-all duration-200 hover:scale-110
            ${selected === c.id ? 'border-neon-green scale-110' : 'border-matrix-border'}`}
          style={{ backgroundColor: c.id === 'default' ? '#0a0a0f' : c.value }}
          title={c.id}
        >
          {selected === c.id && (
            <span className="text-neon-green text-xs flex items-center justify-center">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}

// === LABEL PICKER ===
function LabelPicker({ labels, selected, onToggle }) {
  if (labels.length === 0) {
    return (
      <div className="absolute bottom-full left-0 mb-2 p-3 neon-card !rounded-xl animate-fade-in z-20 w-40">
        <p className="text-xs text-dkz-muted">No labels</p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-full left-0 mb-2 p-2 neon-card !rounded-xl animate-fade-in z-20 w-48 max-h-48 overflow-y-auto">
      {labels.map(label => (
        <button
          key={label.id}
          onClick={(e) => { e.stopPropagation(); onToggle(label.id); }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left
            hover:bg-matrix-hover transition-colors"
        >
          <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]
            ${selected.includes(label.id)
              ? 'bg-neon-green/20 border-neon-green/40 text-neon-green'
              : 'border-matrix-border'
            }`}>
            {selected.includes(label.id) && '✓'}
          </span>
          <span className="text-dkz-text-dim truncate">{label.name}</span>
        </button>
      ))}
    </div>
  );
}

// === LABEL MANAGER ===
function LabelManager({ labels, setLabels, onClose, tt }) {
  const [newLabel, setNewLabel] = useState('');

  const addLabel = () => {
    const name = newLabel.trim();
    if (!name) return;
    if (labels.some(l => l.name.toLowerCase() === name.toLowerCase())) return;
    setLabels(prev => [...prev, { id: generateId(), name }]);
    setNewLabel('');
  };

  const removeLabel = (id) => {
    setLabels(prev => prev.filter(l => l.id !== id));
  };

  const renameLabel = (id, newName) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...l, name: newName } : l));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md neon-card animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neon-green text-glow">{tt('editLabels')}</h2>
          <button onClick={onClose} className="btn-ghost text-lg">✕</button>
        </div>

        {/* Create new label */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addLabel(); }}
            placeholder={tt('labelName')}
            className="input-neon !py-2 text-sm flex-1"
          />
          <button onClick={addLabel} className="btn-neon !py-2 !px-4 text-sm">
            +
          </button>
        </div>

        {/* Label list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {labels.map(label => (
            <div key={label.id} className="flex items-center gap-2 group">
              <span className="text-base">🏷️</span>
              <input
                type="text"
                value={label.name}
                onChange={(e) => renameLabel(label.id, e.target.value)}
                className="flex-1 bg-transparent text-sm text-dkz-text-dim outline-none border-b border-transparent
                  focus:border-neon-green/30 transition-colors py-1"
              />
              <button
                onClick={() => removeLabel(label.id)}
                className="opacity-0 group-hover:opacity-100 text-dkz-muted hover:text-accent text-sm transition-opacity"
              >✕</button>
            </div>
          ))}
          {labels.length === 0 && (
            <p className="text-sm text-dkz-muted text-center py-4">{tt('noResults')}</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-matrix-border flex justify-end">
          <button onClick={onClose} className="btn-neon !py-2 text-sm">{tt('done')}</button>
        </div>
      </div>
    </div>
  );
}

// === MOBILE BOTTOM NAV ===
function MobileNav({ showArchive, setShowArchive, setActiveLabel, onLabelManager, tt }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass">
      <div className="flex items-center justify-around py-3">
        <button
          onClick={() => { setShowArchive(false); setActiveLabel(null); }}
          className={`flex flex-col items-center gap-1 text-xs transition-colors
            ${!showArchive ? 'text-neon-green' : 'text-dkz-muted'}`}
        >
          <span className="text-xl">📝</span>
          {tt('notes')}
        </button>
        <button
          onClick={() => setShowArchive(true)}
          className={`flex flex-col items-center gap-1 text-xs transition-colors
            ${showArchive ? 'text-neon-green' : 'text-dkz-muted'}`}
        >
          <span className="text-xl">📦</span>
          {tt('archived')}
        </button>
        <button
          onClick={onLabelManager}
          className="flex flex-col items-center gap-1 text-xs text-dkz-muted"
        >
          <span className="text-xl">🏷️</span>
          {tt('labels')}
        </button>
      </div>
    </div>
  );
}
