import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useI18n } from './shared';
import { Navbar, Toast, EmptyState, Spinner } from './components';

const APP_NAME = 'dkz-files';

const appTranslations = {
  en: {
    appTitle: 'DkZ Files',
    openFolder: 'Open Folder',
    newFolder: 'New Folder',
    rename: 'Rename',
    preview: 'Preview',
    delete: 'Delete',
    copy: 'Copy',
    move: 'Move',
    open: 'Open',
    size: 'Size',
    type: 'Type',
    date: 'Date Modified',
    name: 'Name',
    sortBy: 'Sort by',
    leftPane: 'Left Pane',
    rightPane: 'Right Pane',
    noFolder: 'No folder open',
    noFolderDesc: 'Click "Open Folder" to browse your files',
    unsupported: 'Browser not supported',
    unsupportedDesc: 'File System Access API requires a Chromium-based browser (Chrome, Edge, Brave, Vivaldi). Please switch to a supported browser.',
    fileDeleted: 'File deleted',
    folderCreated: 'Folder created',
    fileRenamed: 'File renamed',
    copied: 'Copied',
    moved: 'Moved',
    confirmDelete: 'Delete this item?',
    enterName: 'Enter name',
    enterNewName: 'Enter new name',
    enterFolderName: 'Folder name',
    cancel: 'Cancel',
    confirm: 'Confirm',
    items: 'items',
    file: 'File',
    folder: 'Folder',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    code: 'Code',
    archive: 'Archive',
    document: 'Document',
    unknown: 'Unknown',
    noPreview: 'No preview available',
    loading: 'Loading...',
    filter: 'Filter files...',
    closePreview: 'Close Preview',
    dragHint: 'Drag files between panes',
    root: 'Root',
  },
  de: {
    appTitle: 'DkZ Files',
    openFolder: 'Ordner oeffnen',
    newFolder: 'Neuer Ordner',
    rename: 'Umbenennen',
    preview: 'Vorschau',
    delete: 'Loeschen',
    copy: 'Kopieren',
    move: 'Verschieben',
    open: 'Oeffnen',
    size: 'Groesse',
    type: 'Typ',
    date: 'Geaendert',
    name: 'Name',
    sortBy: 'Sortieren nach',
    leftPane: 'Linke Seite',
    rightPane: 'Rechte Seite',
    noFolder: 'Kein Ordner geoeffnet',
    noFolderDesc: 'Klicke "Ordner oeffnen" um Dateien zu durchsuchen',
    unsupported: 'Browser nicht unterstuetzt',
    unsupportedDesc: 'Die File System Access API benoetigt einen Chromium-Browser (Chrome, Edge, Brave, Vivaldi). Bitte wechsle zu einem unterstuetzten Browser.',
    fileDeleted: 'Datei geloescht',
    folderCreated: 'Ordner erstellt',
    fileRenamed: 'Datei umbenannt',
    copied: 'Kopiert',
    moved: 'Verschoben',
    confirmDelete: 'Dieses Element loeschen?',
    enterName: 'Name eingeben',
    enterNewName: 'Neuen Namen eingeben',
    enterFolderName: 'Ordnername',
    cancel: 'Abbrechen',
    confirm: 'Bestaetigen',
    items: 'Elemente',
    file: 'Datei',
    folder: 'Ordner',
    image: 'Bild',
    video: 'Video',
    audio: 'Audio',
    code: 'Code',
    archive: 'Archiv',
    document: 'Dokument',
    unknown: 'Unbekannt',
    noPreview: 'Keine Vorschau verfuegbar',
    loading: 'Laden...',
    filter: 'Dateien filtern...',
    closePreview: 'Vorschau schliessen',
    dragHint: 'Dateien zwischen Seiten ziehen',
    root: 'Stammverzeichnis',
  },
};

// === FILE TYPE DETECTION ===
const FILE_TYPES = {
  folder: { icon: '📁', color: 'text-dkz-yellow' },
  image: { icon: '🖼️', color: 'text-dkz-blue', ext: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif'] },
  video: { icon: '🎬', color: 'text-accent', ext: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv'] },
  audio: { icon: '🎵', color: 'text-neon-green', ext: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'] },
  code: { icon: '💻', color: 'text-neon-green', ext: ['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'css', 'html', 'vue', 'svelte', 'php', 'sh', 'bash', 'yml', 'yaml', 'toml'] },
  document: { icon: '📄', color: 'text-dkz-text', ext: ['txt', 'md', 'json', 'xml', 'csv', 'log', 'ini', 'cfg', 'conf', 'env'] },
  archive: { icon: '📦', color: 'text-dkz-yellow', ext: ['zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz'] },
  pdf: { icon: '📕', color: 'text-accent', ext: ['pdf'] },
  spreadsheet: { icon: '📊', color: 'text-neon-green', ext: ['xls', 'xlsx', 'ods'] },
  presentation: { icon: '📽️', color: 'text-dkz-yellow', ext: ['ppt', 'pptx', 'odp'] },
  font: { icon: '🔤', color: 'text-dkz-blue', ext: ['ttf', 'otf', 'woff', 'woff2', 'eot'] },
  unknown: { icon: '📄', color: 'text-dkz-muted' },
};

function getFileType(name, isDirectory) {
  if (isDirectory) return 'folder';
  const ext = name.split('.').pop().toLowerCase();
  for (const [type, info] of Object.entries(FILE_TYPES)) {
    if (info.ext && info.ext.includes(ext)) return type;
  }
  return 'unknown';
}

function getFileIcon(type) {
  return FILE_TYPES[type]?.icon || '📄';
}

function getFileColor(type) {
  return FILE_TYPES[type]?.color || 'text-dkz-muted';
}

function formatSize(bytes) {
  if (bytes === 0 || bytes === undefined) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const isSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

// === MAIN APP ===
export default function App() {
  const { t } = useI18n();
  const tt = (key) => t(key, appTranslations);

  const [toast, setToast] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Unsupported browser fallback
  if (!isSupported) {
    return (
      <div className="min-h-screen">
        <Navbar title={tt('appTitle')} icon="📁" />
        <div className="pt-24 px-4">
          <EmptyState
            icon="🚫"
            title={tt('unsupported')}
            description={tt('unsupportedDesc')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title={tt('appTitle')} icon="📁" />

      <div className={`flex-1 pt-16 flex ${isMobile ? 'flex-col' : ''}`}>
        {isMobile ? (
          <MobilePanes
            tt={tt}
            showToast={showToast}
            onPreview={setPreviewFile}
          />
        ) : (
          <>
            <FilePane
              paneId="left"
              tt={tt}
              showToast={showToast}
              onPreview={setPreviewFile}
              className="w-1/2 border-r border-matrix-border"
            />
            <FilePane
              paneId="right"
              tt={tt}
              showToast={showToast}
              onPreview={setPreviewFile}
              className="w-1/2"
            />
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          tt={tt}
        />
      )}

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

// === MOBILE PANES (Tab Switcher) ===
function MobilePanes({ tt, showToast, onPreview }) {
  const [activePane, setActivePane] = useState('left');

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex border-b border-matrix-border bg-matrix-dark">
        <button
          onClick={() => setActivePane('left')}
          className={`flex-1 py-2.5 text-sm font-mono transition-colors
            ${activePane === 'left' ? 'text-neon-green border-b-2 border-neon-green' : 'text-dkz-muted'}`}
        >
          {tt('leftPane')}
        </button>
        <button
          onClick={() => setActivePane('right')}
          className={`flex-1 py-2.5 text-sm font-mono transition-colors
            ${activePane === 'right' ? 'text-neon-green border-b-2 border-neon-green' : 'text-dkz-muted'}`}
        >
          {tt('rightPane')}
        </button>
      </div>
      <FilePane
        paneId={activePane}
        tt={tt}
        showToast={showToast}
        onPreview={onPreview}
        className="flex-1"
      />
    </div>
  );
}

// === FILE PANE ===
function FilePane({ paneId, tt, showToast, onPreview, className = '' }) {
  const [rootHandle, setRootHandle] = useState(null);
  const [pathStack, setPathStack] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [filterText, setFilterText] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const paneRef = useRef(null);

  const currentHandle = pathStack.length > 0 ? pathStack[pathStack.length - 1].handle : rootHandle;

  // Load directory entries
  const loadEntries = useCallback(async (dirHandle) => {
    if (!dirHandle) return;
    setLoading(true);
    try {
      const items = [];
      for await (const entry of dirHandle.values()) {
        const info = {
          name: entry.name,
          kind: entry.kind,
          handle: entry,
          type: getFileType(entry.name, entry.kind === 'directory'),
        };

        if (entry.kind === 'file') {
          try {
            const file = await entry.getFile();
            info.size = file.size;
            info.lastModified = file.lastModified;
          } catch {
            info.size = 0;
            info.lastModified = 0;
          }
        }

        items.push(info);
      }
      setEntries(items);
    } catch (err) {
      setEntries([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentHandle) {
      loadEntries(currentHandle);
    }
  }, [currentHandle, loadEntries]);

  // Open folder picker
  const openFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setRootHandle(handle);
      setPathStack([]);
      setFilterText('');
    } catch {
      // User cancelled
    }
  };

  // Navigate into directory
  const navigateInto = useCallback((entry) => {
    if (entry.kind === 'directory') {
      setPathStack(prev => [...prev, { name: entry.name, handle: entry.handle }]);
      setFilterText('');
    }
  }, []);

  // Navigate breadcrumb
  const navigateTo = useCallback((index) => {
    if (index === -1) {
      setPathStack([]);
    } else {
      setPathStack(prev => prev.slice(0, index + 1));
    }
    setFilterText('');
  }, []);

  // Sort entries
  const sortedEntries = useMemo(() => {
    let filtered = entries;
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      filtered = entries.filter(e => e.name.toLowerCase().includes(q));
    }

    return [...filtered].sort((a, b) => {
      // Directories first
      if (a.kind !== b.kind) {
        return a.kind === 'directory' ? -1 : 1;
      }

      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          break;
        case 'size':
          cmp = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          cmp = (a.lastModified || 0) - (b.lastModified || 0);
          break;
        case 'type':
          cmp = a.type.localeCompare(b.type);
          break;
        default:
          cmp = 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [entries, sortField, sortDir, filterText]);

  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Context menu
  const handleContextMenu = (e, entry) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      entry,
    });
  };

  // Close context menu on click outside
  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Delete entry
  const deleteEntry = async (entry) => {
    try {
      if (currentHandle) {
        await currentHandle.removeEntry(entry.name, { recursive: true });
        await loadEntries(currentHandle);
        showToast(tt('fileDeleted'), 'info');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setContextMenu(null);
  };

  // Rename entry
  const startRename = (entry) => {
    setRenaming({ entry, newName: entry.name });
    setContextMenu(null);
  };

  const confirmRename = async () => {
    if (!renaming || !renaming.newName.trim() || renaming.newName === renaming.entry.name) {
      setRenaming(null);
      return;
    }

    try {
      const entry = renaming.entry;
      if (entry.kind === 'file') {
        // Read the file, create new file with new name, delete old
        const file = await entry.handle.getFile();
        const newHandle = await currentHandle.getFileHandle(renaming.newName, { create: true });
        const writable = await newHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await currentHandle.removeEntry(entry.name);
      } else {
        // For directories: unfortunately FSAA doesn't support direct rename
        // We'll just show an error for directories
        showToast('Directory rename not supported by FSAA', 'warning');
        setRenaming(null);
        return;
      }
      await loadEntries(currentHandle);
      showToast(tt('fileRenamed'));
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setRenaming(null);
  };

  // Create new folder
  const createFolder = async () => {
    if (!newFolderName.trim() || !currentHandle) {
      setNewFolderMode(false);
      setNewFolderName('');
      return;
    }

    try {
      await currentHandle.getDirectoryHandle(newFolderName.trim(), { create: true });
      await loadEntries(currentHandle);
      showToast(tt('folderCreated'));
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
    setNewFolderMode(false);
    setNewFolderName('');
  };

  // Open file for preview
  const openFile = async (entry) => {
    if (entry.kind === 'directory') {
      navigateInto(entry);
      return;
    }

    try {
      const file = await entry.handle.getFile();
      const type = getFileType(entry.name, false);

      if (['image'].includes(type)) {
        const url = URL.createObjectURL(file);
        onPreview({ name: entry.name, type, url, isBlob: true });
      } else if (['document', 'code'].includes(type)) {
        const text = await file.text();
        onPreview({ name: entry.name, type, text });
      } else {
        onPreview({ name: entry.name, type, noPreview: true });
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // Drag & Drop
  const handleDragStart = (e, entry) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      name: entry.name,
      kind: entry.kind,
      paneId,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // SortIndicator
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return <span className="text-neon-green ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!rootHandle) {
    return (
      <div className={`flex flex-col ${className}`} ref={paneRef}>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <EmptyState
            icon="📂"
            title={tt('noFolder')}
            description={tt('noFolderDesc')}
          />
          <button onClick={openFolder} className="btn-neon mt-4">
            📂 {tt('openFolder')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] ${className}`} ref={paneRef}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-matrix-dark border-b border-matrix-border flex-wrap">
        <button onClick={openFolder} className="btn-ghost !px-2 !py-1 text-xs" title={tt('openFolder')}>
          📂
        </button>
        <button
          onClick={() => setNewFolderMode(true)}
          className="btn-ghost !px-2 !py-1 text-xs"
          title={tt('newFolder')}
        >📁+</button>
        <button
          onClick={() => loadEntries(currentHandle)}
          className="btn-ghost !px-2 !py-1 text-xs"
          title="Refresh"
        >🔄</button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={tt('filter')}
            className="input-neon !py-1 !px-2 !text-xs !rounded-md w-full max-w-48"
          />
        </div>

        <span className="text-xs text-dkz-muted font-mono">
          {sortedEntries.length} {tt('items')}
        </span>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-matrix-surface border-b border-matrix-border overflow-x-auto flex-shrink-0">
        <button
          onClick={() => navigateTo(-1)}
          className="text-xs text-dkz-muted hover:text-neon-green transition-colors flex-shrink-0 font-mono"
        >
          {rootHandle.name || tt('root')}
        </button>
        {pathStack.map((segment, i) => (
          <span key={i} className="flex items-center gap-1 flex-shrink-0">
            <span className="text-matrix-border text-xs">/</span>
            <button
              onClick={() => navigateTo(i)}
              className={`text-xs transition-colors font-mono
                ${i === pathStack.length - 1 ? 'text-neon-green' : 'text-dkz-muted hover:text-neon-green'}`}
            >
              {segment.name}
            </button>
          </span>
        ))}
      </div>

      {/* New Folder Input */}
      {newFolderMode && (
        <div className="flex items-center gap-2 px-3 py-2 bg-matrix-card border-b border-neon-green/20 animate-slide-up">
          <span>📁</span>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') { setNewFolderMode(false); setNewFolderName(''); } }}
            placeholder={tt('enterFolderName')}
            className="input-neon !py-1 !px-2 text-xs flex-1"
            autoFocus
          />
          <button onClick={createFolder} className="btn-neon !py-1 !px-3 !text-xs">✓</button>
          <button onClick={() => { setNewFolderMode(false); setNewFolderName(''); }} className="btn-ghost !py-1 !px-2 text-xs">✕</button>
        </div>
      )}

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_80px_100px_140px] gap-2 px-3 py-1.5 bg-matrix-dark border-b border-matrix-border text-xs text-dkz-muted font-mono">
        <button onClick={() => toggleSort('name')} className="text-left hover:text-neon-green transition-colors flex items-center">
          {tt('name')} <SortIndicator field="name" />
        </button>
        <button onClick={() => toggleSort('size')} className="text-right hover:text-neon-green transition-colors hidden sm:flex items-center justify-end">
          {tt('size')} <SortIndicator field="size" />
        </button>
        <button onClick={() => toggleSort('type')} className="text-left hover:text-neon-green transition-colors hidden md:flex items-center">
          {tt('type')} <SortIndicator field="type" />
        </button>
        <button onClick={() => toggleSort('date')} className="text-right hover:text-neon-green transition-colors hidden lg:flex items-center justify-end">
          {tt('date')} <SortIndicator field="date" />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-dkz-muted">{tt('noFolder')}</p>
          </div>
        ) : (
          <div>
            {sortedEntries.map((entry) => (
              <FileRow
                key={entry.name}
                entry={entry}
                renaming={renaming}
                setRenaming={setRenaming}
                confirmRename={confirmRename}
                onDoubleClick={() => openFile(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)}
                onDragStart={(e) => handleDragStart(e, entry)}
                tt={tt}
              />
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          entry={contextMenu.entry}
          onOpen={() => { openFile(contextMenu.entry); setContextMenu(null); }}
          onRename={() => startRename(contextMenu.entry)}
          onDelete={() => deleteEntry(contextMenu.entry)}
          onPreview={() => { openFile(contextMenu.entry); setContextMenu(null); }}
          tt={tt}
        />
      )}
    </div>
  );
}

// === FILE ROW ===
function FileRow({ entry, renaming, setRenaming, confirmRename, onDoubleClick, onContextMenu, onDragStart, tt }) {
  const isRenaming = renaming && renaming.entry.name === entry.name;
  const typeInfo = FILE_TYPES[entry.type] || FILE_TYPES.unknown;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className="grid grid-cols-[1fr_80px_100px_140px] gap-2 px-3 py-2 hover:bg-matrix-hover
        border-b border-matrix-border/30 cursor-pointer transition-all duration-150 group"
    >
      {/* Name */}
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-base flex-shrink-0 ${getFileColor(entry.type)}`}>
          {getFileIcon(entry.type)}
        </span>
        {isRenaming ? (
          <input
            type="text"
            value={renaming.newName}
            onChange={(e) => setRenaming({ ...renaming, newName: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenaming(null); }}
            onBlur={confirmRename}
            className="input-neon !py-0.5 !px-1 !text-xs flex-1 min-w-0"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`text-sm truncate ${entry.kind === 'directory' ? 'text-dkz-text font-medium' : 'text-dkz-text-dim'}`}>
            {entry.name}
          </span>
        )}
      </div>

      {/* Size */}
      <span className="text-xs text-dkz-muted text-right self-center hidden sm:block font-mono">
        {entry.kind === 'file' ? formatSize(entry.size) : '—'}
      </span>

      {/* Type */}
      <span className="text-xs text-dkz-muted self-center hidden md:block capitalize">
        {entry.kind === 'directory' ? tt('folder') : entry.type}
      </span>

      {/* Date */}
      <span className="text-xs text-dkz-muted text-right self-center hidden lg:block font-mono">
        {entry.lastModified ? formatDate(entry.lastModified) : '—'}
      </span>
    </div>
  );
}

// === CONTEXT MENU ===
function ContextMenu({ x, y, entry, onOpen, onRename, onDelete, onPreview, tt }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      let nx = x, ny = y;
      if (x + rect.width > window.innerWidth) nx = window.innerWidth - rect.width - 10;
      if (y + rect.height > window.innerHeight) ny = window.innerHeight - rect.height - 10;
      setPos({ x: nx, y: ny });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 neon-card !p-1 !rounded-xl animate-fade-in min-w-[160px]"
      style={{ left: pos.x, top: pos.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onOpen} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dkz-text-dim hover:bg-matrix-hover hover:text-dkz-text transition-colors text-left">
        <span>📂</span> {tt('open')}
      </button>
      {entry.kind === 'file' && (
        <button onClick={onPreview} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dkz-text-dim hover:bg-matrix-hover hover:text-dkz-text transition-colors text-left">
          <span>👁️</span> {tt('preview')}
        </button>
      )}
      <button onClick={onRename} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dkz-text-dim hover:bg-matrix-hover hover:text-dkz-text transition-colors text-left">
        <span>✏️</span> {tt('rename')}
      </button>
      <div className="border-t border-matrix-border my-1" />
      <button onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent hover:bg-accent/10 transition-colors text-left">
        <span>🗑️</span> {tt('delete')}
      </button>
    </div>
  );
}

// === PREVIEW MODAL ===
function PreviewModal({ file, onClose, tt }) {
  useEffect(() => {
    return () => {
      if (file.isBlob && file.url) {
        URL.revokeObjectURL(file.url);
      }
    };
  }, [file]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] neon-card animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{getFileIcon(file.type)}</span>
            <h2 className="text-neon-green font-semibold text-glow truncate">{file.name}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost text-lg flex-shrink-0">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {file.noPreview ? (
            <EmptyState
              icon="🚫"
              title={tt('noPreview')}
              description={file.name}
            />
          ) : file.type === 'image' ? (
            <div className="flex items-center justify-center">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          ) : (
            <pre className="bg-matrix-dark rounded-xl p-4 overflow-auto text-sm text-dkz-text-dim font-mono leading-relaxed max-h-[70vh] border border-matrix-border">
              <code>{file.text}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
