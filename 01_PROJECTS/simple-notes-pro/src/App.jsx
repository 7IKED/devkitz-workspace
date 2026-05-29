import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from './shared';
import { Navbar, Toast, EmptyState } from './components';

// === XSS Protection ===
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// === i18n Translations ===
const appT = {
  en: {
    appTitle: 'Simple Notes Pro',
    newNote: 'New Note',
    preview: 'Preview',
    editor: 'Editor',
    tags: 'Tags',
    allNotes: 'All Notes',
    untitled: 'Untitled Note',
    words: 'Words',
    chars: 'Characters',
    autoSaved: 'Auto-saved',
    sortByDate: 'Sort by Date',
    sortByTitle: 'Sort by Title',
    addTag: 'Add tag...',
    filterTags: 'Filter by tag',
    exportMd: 'Export .md',
    exportTxt: 'Export .txt',
    exportJson: 'Export .json',
    exportAll: 'Export All (.json)',
    importFile: 'Import',
    deleteNote: 'Delete Note',
    deleteConfirm: 'Delete this note?',
    noNotes: 'No notes yet',
    noNotesDesc: 'Create your first note to get started',
    searchNotes: 'Search notes...',
    colorCategory: 'Color',
    noResults: 'No matching notes',
    noResultsDesc: 'Try a different search term or filter',
    created: 'Created',
    modified: 'Modified',
    importSuccess: 'Notes imported successfully',
    importError: 'Failed to import file',
    sidebar: 'Sidebar',
  },
  de: {
    appTitle: 'Simple Notes Pro',
    newNote: 'Neue Notiz',
    preview: 'Vorschau',
    editor: 'Editor',
    tags: 'Tags',
    allNotes: 'Alle Notizen',
    untitled: 'Unbenannte Notiz',
    words: 'Woerter',
    chars: 'Zeichen',
    autoSaved: 'Auto-gespeichert',
    sortByDate: 'Nach Datum sortieren',
    sortByTitle: 'Nach Titel sortieren',
    addTag: 'Tag hinzufuegen...',
    filterTags: 'Nach Tag filtern',
    exportMd: 'Export .md',
    exportTxt: 'Export .txt',
    exportJson: 'Export .json',
    exportAll: 'Alle exportieren (.json)',
    importFile: 'Importieren',
    deleteNote: 'Notiz loeschen',
    deleteConfirm: 'Diese Notiz loeschen?',
    noNotes: 'Noch keine Notizen',
    noNotesDesc: 'Erstelle deine erste Notiz',
    searchNotes: 'Notizen suchen...',
    colorCategory: 'Farbe',
    noResults: 'Keine passenden Notizen',
    noResultsDesc: 'Versuche einen anderen Suchbegriff',
    created: 'Erstellt',
    modified: 'Geaendert',
    importSuccess: 'Notizen erfolgreich importiert',
    importError: 'Fehler beim Importieren',
    sidebar: 'Seitenleiste',
  },
};

// === Color Categories ===
const NOTE_COLORS = [
  { id: 'none', label: 'None', hex: '#555570' },
  { id: 'red', label: 'Red', hex: '#ff3b5c' },
  { id: 'green', label: 'Green', hex: '#00ff88' },
  { id: 'blue', label: 'Blue', hex: '#55acee' },
  { id: 'yellow', label: 'Yellow', hex: '#ffb800' },
  { id: 'purple', label: 'Purple', hex: '#a855f7' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
];

// === Markdown Parser (Custom Regex) ===
function parseMarkdown(md) {
  if (!md) return '';
  let html = esc(md);

  // Code blocks (triple backtick) — must be first
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="md-codeblock"><code class="lang-${lang}">${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Images — ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-image" />');

  // Links — [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');

  // Headers H1-H6
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="md-h6">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="md-h5">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Horizontal rule
  html = html.replace(/^---+$/gm, '<hr class="md-hr" />');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em class="md-italic">$1</em>');

  // Unordered lists
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/(<li class="md-li">.*<\/li>\n?)+/g, (match) => `<ul class="md-ul">${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="md-oli">$1</li>');
  html = html.replace(/(<li class="md-oli">.*<\/li>\n?)+/g, (match) => `<ol class="md-ol">${match}</ol>`);

  // Paragraphs — wrap remaining lines
  html = html.replace(/^(?!<[a-z])(.*\S.*)$/gm, '<p class="md-p">$1</p>');

  return html;
}

// === Create New Note ===
function createNote() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    title: '',
    content: '',
    tags: [],
    color: 'none',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// === Main App ===
export default function App() {
  const { t } = useI18n();

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('snp-notes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterTag, setFilterTag] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [toast, setToast] = useState(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimer = useRef(null);

  const activeNote = notes.find((n) => n.id === activeId) || null;

  // === Auto-save to localStorage every 3 seconds ===
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      localStorage.setItem('snp-notes', JSON.stringify(notes));
    }, 3000);
    return () => clearInterval(autoSaveTimer.current);
  }, [notes]);

  // === Save immediately on notes change (backup) ===
  useEffect(() => {
    localStorage.setItem('snp-notes', JSON.stringify(notes));
  }, [notes]);

  // === Toast auto-dismiss ===
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // === Get all unique tags ===
  const allTags = [...new Set(notes.flatMap((n) => n.tags))].sort();

  // === Filtered + Sorted notes ===
  const filteredNotes = notes
    .filter((n) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q));
      const matchTag = !filterTag || n.tags.includes(filterTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return b.updatedAt - a.updatedAt;
    });

  // === Handlers ===
  const handleNewNote = () => {
    const note = createNote();
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    if (window.innerWidth < 768) setShowSidebar(false);
    setTimeout(() => editorRef.current?.focus(), 100);
  };

  const updateNote = useCallback((field, value) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId
          ? { ...n, [field]: value, updatedAt: Date.now() }
          : n
      )
    );
  }, [activeId]);

  const handleTitleChange = (e) => {
    updateNote('title', e.target.value);
  };

  const handleContentChange = (e) => {
    updateNote('content', e.target.value);
  };

  const handleDeleteNote = () => {
    if (!activeNote) return;
    setNotes((prev) => prev.filter((n) => n.id !== activeId));
    setActiveId(null);
    setToast({ message: t('deleteNote', appT), type: 'info' });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = newTagName.trim();
    if (!tag || !activeNote) return;
    if (!activeNote.tags.includes(tag)) {
      updateNote('tags', [...activeNote.tags, tag]);
    }
    setNewTagName('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag) => {
    if (!activeNote) return;
    updateNote('tags', activeNote.tags.filter((t) => t !== tag));
  };

  const handleColorChange = (colorId) => {
    updateNote('color', colorId);
    setShowColorPicker(false);
  };

  // === Export Functions ===
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMd = () => {
    if (!activeNote) return;
    const filename = (activeNote.title || 'untitled').replace(/[^a-zA-Z0-9]/g, '_') + '.md';
    downloadFile(activeNote.content, filename, 'text/markdown');
    setShowExportMenu(false);
  };

  const handleExportTxt = () => {
    if (!activeNote) return;
    const filename = (activeNote.title || 'untitled').replace(/[^a-zA-Z0-9]/g, '_') + '.txt';
    downloadFile(activeNote.content, filename, 'text/plain');
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    if (!activeNote) return;
    const filename = (activeNote.title || 'untitled').replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    downloadFile(JSON.stringify(activeNote, null, 2), filename, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportAll = () => {
    downloadFile(
      JSON.stringify(notes, null, 2),
      'simple-notes-pro-backup.json',
      'application/json'
    );
    setShowExportMenu(false);
    setToast({ message: t('exportAll', appT), type: 'success' });
  };

  // === Import ===
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target.result;

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            setNotes((prev) => [...data, ...prev]);
          } else if (data.id) {
            setNotes((prev) => [data, ...prev]);
          }
          setToast({ message: t('importSuccess', appT), type: 'success' });
        } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          const note = createNote();
          note.title = file.name.replace(/\.(md|txt)$/, '');
          note.content = content;
          setNotes((prev) => [note, ...prev]);
          setActiveId(note.id);
          setToast({ message: t('importSuccess', appT), type: 'success' });
        }
      } catch {
        setToast({ message: t('importError', appT), type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // === Word + Char count ===
  const wordCount = activeNote?.content
    ? activeNote.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = activeNote?.content?.length || 0;

  // === Format date ===
  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-matrix-black">
      <Navbar title={t('appTitle', appT)} icon="📝">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="btn-ghost text-xs font-mono md:hidden"
          title={t('sidebar', appT)}
        >
          {showSidebar ? '✕' : '☰'}
        </button>
      </Navbar>

      <div className="flex pt-16 h-screen">
        {/* === SIDEBAR === */}
        <div
          className={`${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative md:translate-x-0 z-30 w-72 h-[calc(100vh-4rem)]
          bg-matrix-dark/95 backdrop-blur-lg border-r border-matrix-border
          flex flex-col transition-transform duration-300 ease-out`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-matrix-border space-y-3">
            <button
              onClick={handleNewNote}
              className="btn-neon w-full flex items-center justify-center gap-2 text-sm"
            >
              <span className="text-lg">+</span> {t('newNote', appT)}
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchNotes', appT)}
                className="input-neon !py-2 !pl-9 text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dkz-muted text-sm">🔍</span>
            </div>

            {/* Sort + Filter Row */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}
                className="btn-ghost text-xs flex-1 text-center"
                title={sortBy === 'date' ? t('sortByTitle', appT) : t('sortByDate', appT)}
              >
                {sortBy === 'date' ? '📅' : '🔤'} {sortBy === 'date' ? t('sortByDate', appT) : t('sortByTitle', appT)}
              </button>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterTag('')}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-all duration-200 cursor-pointer
                    ${!filterTag ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-matrix-surface text-dkz-muted border border-matrix-border hover:border-neon-green/20'}`}
                >
                  {t('allNotes', appT)}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono transition-all duration-200 cursor-pointer
                      ${filterTag === tag ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-matrix-surface text-dkz-muted border border-matrix-border hover:border-neon-green/20'}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-dkz-muted text-xs">{notes.length === 0 ? t('noNotes', appT) : t('noResults', appT)}</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const color = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setActiveId(note.id);
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group cursor-pointer
                      ${activeId === note.id
                        ? 'bg-neon-green/10 border border-neon-green/20'
                        : 'hover:bg-matrix-hover border border-transparent'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          activeId === note.id ? 'text-neon-green' : 'text-dkz-text group-hover:text-neon-green/80'
                        }`}>
                          {note.title || t('untitled', appT)}
                        </p>
                        <p className="text-[11px] text-dkz-muted truncate mt-0.5">
                          {note.content.slice(0, 60) || '...'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-dkz-muted font-mono">
                            {formatDate(note.updatedAt)}
                          </span>
                          {note.tags.length > 0 && (
                            <span className="text-[10px] text-neon-green/50 font-mono">
                              {note.tags.length} tag{note.tags.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-matrix-border flex items-center justify-between">
            <span className="text-[10px] text-dkz-muted font-mono">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost text-xs"
                title={t('importFile', appT)}
              >
                📥
              </button>
              <button
                onClick={handleExportAll}
                className="btn-ghost text-xs"
                title={t('exportAll', appT)}
              >
                📤
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* === Sidebar backdrop on mobile === */}
        {showSidebar && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* === MAIN CONTENT === */}
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
          {activeNote ? (
            <>
              {/* Editor Toolbar */}
              <div className="px-4 py-2 border-b border-matrix-border flex items-center gap-2 flex-wrap bg-matrix-dark/50">
                {/* Title Input */}
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={handleTitleChange}
                  placeholder={t('untitled', appT)}
                  className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-lg font-semibold text-dkz-text placeholder:text-dkz-muted"
                />

                {/* Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="btn-ghost text-xs flex items-center gap-1"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: (NOTE_COLORS.find((c) => c.id === activeNote.color) || NOTE_COLORS[0]).hex }}
                    />
                    {t('colorCategory', appT)}
                  </button>
                  {showColorPicker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowColorPicker(false)} />
                      <div className="absolute top-full right-0 z-40 mt-1 p-2 neon-card !rounded-lg flex gap-1.5 animate-slide-up">
                        {NOTE_COLORS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleColorChange(c.id)}
                            className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer hover:scale-110
                              ${activeNote.color === c.id ? 'ring-2 ring-white/50 scale-110' : ''}`}
                            style={{ backgroundColor: c.hex }}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Export */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="btn-ghost text-xs"
                  >
                    📤 {t('export', appT)}
                  </button>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute top-full right-0 z-40 mt-1 neon-card !p-2 !rounded-lg min-w-[140px] animate-slide-up space-y-0.5">
                        <button onClick={handleExportMd} className="btn-ghost w-full text-left text-xs">📄 {t('exportMd', appT)}</button>
                        <button onClick={handleExportTxt} className="btn-ghost w-full text-left text-xs">📃 {t('exportTxt', appT)}</button>
                        <button onClick={handleExportJson} className="btn-ghost w-full text-left text-xs">📋 {t('exportJson', appT)}</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={handleDeleteNote}
                  className="btn-ghost text-xs text-accent hover:text-accent"
                  title={t('deleteNote', appT)}
                >
                  🗑️
                </button>
              </div>

              {/* Tags Bar */}
              <div className="px-4 py-2 border-b border-matrix-border flex items-center gap-2 flex-wrap bg-matrix-dark/30">
                <span className="text-[10px] text-dkz-muted font-mono uppercase tracking-wider">{t('tags', appT)}:</span>
                {activeNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge-neon flex items-center gap-1 cursor-default"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-neon-green/50 hover:text-accent text-[10px] ml-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {showTagInput ? (
                  <form onSubmit={handleAddTag} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder={t('addTag', appT)}
                      className="bg-transparent border border-neon-green/20 rounded-full px-2 py-0.5 text-[10px] text-neon-green outline-none w-24 font-mono"
                      autoFocus
                      onBlur={() => {
                        if (!newTagName.trim()) setShowTagInput(false);
                      }}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="text-[10px] text-dkz-muted hover:text-neon-green transition-colors cursor-pointer"
                  >
                    + {t('addTag', appT)}
                  </button>
                )}
              </div>

              {/* Split View: Editor + Preview */}
              <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 flex flex-col border-r border-matrix-border">
                  <div className="px-4 py-1.5 border-b border-matrix-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-dkz-muted font-mono uppercase tracking-wider">
                      ✏️ {t('editor', appT)}
                    </span>
                    <span className="text-[10px] text-dkz-muted font-mono">
                      {wordCount} {t('words', appT)} · {charCount} {t('chars', appT)}
                    </span>
                  </div>
                  <textarea
                    ref={editorRef}
                    value={activeNote.content}
                    onChange={handleContentChange}
                    className="flex-1 w-full p-4 bg-transparent text-dkz-text font-mono text-sm leading-relaxed resize-none outline-none placeholder:text-dkz-muted/50"
                    placeholder="# Start writing in Markdown..."
                    spellCheck={false}
                  />
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col hidden md:flex">
                  <div className="px-4 py-1.5 border-b border-matrix-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-dkz-muted font-mono uppercase tracking-wider">
                      👁️ {t('preview', appT)}
                    </span>
                    <span className="text-[10px] text-neon-green/40 font-mono animate-glow-pulse">
                      ● LIVE
                    </span>
                  </div>
                  <div
                    className="flex-1 p-4 overflow-y-auto markdown-preview"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(activeNote.content) }}
                  />
                </div>
              </div>

              {/* Status Bar */}
              <div className="px-4 py-1.5 border-t border-matrix-border flex items-center justify-between bg-matrix-dark/30">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-dkz-muted font-mono">
                    {t('created', appT)}: {formatDate(activeNote.createdAt)}
                  </span>
                  <span className="text-[10px] text-dkz-muted font-mono">
                    {t('modified', appT)}: {formatDate(activeNote.updatedAt)}
                  </span>
                </div>
                <span className="text-[10px] text-neon-green/50 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green/50 animate-glow-pulse" />
                  {t('autoSaved', appT)}
                </span>
              </div>
            </>
          ) : (
            <EmptyState
              icon="📝"
              title={t('noNotes', appT)}
              description={t('noNotesDesc', appT)}
            />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Markdown Preview Styles */}
      <style>{`
        .markdown-preview {
          color: #e8e8f0;
          line-height: 1.8;
        }
        .markdown-preview .md-h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #00ff88;
          margin: 1.5rem 0 0.75rem;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
          border-bottom: 1px solid rgba(0, 255, 136, 0.1);
          padding-bottom: 0.5rem;
        }
        .markdown-preview .md-h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #00ff88;
          margin: 1.25rem 0 0.5rem;
          opacity: 0.9;
        }
        .markdown-preview .md-h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #00cc6a;
          margin: 1rem 0 0.5rem;
        }
        .markdown-preview .md-h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #8888aa;
          margin: 0.75rem 0 0.5rem;
        }
        .markdown-preview .md-h5 {
          font-size: 1rem;
          font-weight: 500;
          color: #8888aa;
          margin: 0.5rem 0;
        }
        .markdown-preview .md-h6 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #555570;
          margin: 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .markdown-preview .md-p {
          margin: 0.5rem 0;
        }
        .markdown-preview .md-bold {
          color: #fff;
        }
        .markdown-preview .md-italic {
          color: #bbbbdd;
        }
        .markdown-preview .md-inline-code {
          background: rgba(0, 255, 136, 0.08);
          color: #00ff88;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
        }
        .markdown-preview .md-codeblock {
          background: #060608;
          border: 1px solid #1a1a25;
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
          color: #e8e8f0;
        }
        .markdown-preview .md-blockquote {
          border-left: 3px solid #00ff88;
          padding: 0.5rem 1rem;
          margin: 0.75rem 0;
          background: rgba(0, 255, 136, 0.03);
          color: #8888aa;
          border-radius: 0 8px 8px 0;
        }
        .markdown-preview .md-hr {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, #00ff88, transparent);
          margin: 1.5rem 0;
          opacity: 0.3;
        }
        .markdown-preview .md-ul,
        .markdown-preview .md-ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .markdown-preview .md-li {
          margin: 0.25rem 0;
          list-style-type: disc;
        }
        .markdown-preview .md-li::marker {
          color: #00ff88;
        }
        .markdown-preview .md-oli {
          margin: 0.25rem 0;
          list-style-type: decimal;
        }
        .markdown-preview .md-oli::marker {
          color: #00ff88;
        }
        .markdown-preview .md-link {
          color: #55acee;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .markdown-preview .md-link:hover {
          color: #00ff88;
        }
        .markdown-preview .md-image {
          max-width: 100%;
          border-radius: 12px;
          border: 1px solid #1a1a25;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
}
