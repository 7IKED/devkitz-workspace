/**
 * DkZ Notes Shared Data Layer
 * @DKZ:RULES -> R12 Kein Wissensverlust
 * @version v1.0.0
 *
 * Unified read/write API for the 4-Ordner Notiz System.
 * All note modules (notes-manager, noter, knowledge-hub, devnotes)
 * use THIS single localStorage key: "dkz-notes"
 *
 * Schema:
 *   folders[] → { id, icon, name, notes[] }
 *   note → { id, prefix, title, body, tags[], created, modified }
 *
 * Usage: <script src="../../shared/dkz-notes-shared.js"></script>
 */

const DkzNotes = (() => {
    'use strict';

    const KEY = 'dkz-notes';

    const DEFAULT_FOLDERS = [
        { id: 'inbox',   icon: '📥', name: 'Inbox',   notes: [] },
        { id: 'aktiv',   icon: '🔥', name: 'Aktiv',   notes: [] },
        { id: 'archiv',  icon: '📦', name: 'Archiv',  notes: [] },
        { id: 'meeting', icon: '🎤', name: 'Meeting', notes: [] }
    ];

    // Column index ↔ folder mapping (for noter Kanban)
    const COL_TO_FOLDER = ['inbox', 'aktiv', 'aktiv', 'archiv', 'archiv'];
    const FOLDER_TO_COL = { inbox: 0, aktiv: 1, archiv: 4, meeting: 1 };

    // ═══ CORE ═══

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
            }
        } catch { /* corrupt data, use defaults */ }
        return JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
    }

    function save(folders) {
        localStorage.setItem(KEY, JSON.stringify(folders));
        // Dispatch event so other open tabs/components can react
        try {
            window.dispatchEvent(new CustomEvent('dkz-notes-changed', { detail: { folders } }));
        } catch { /* old browser */ }
    }

    // ═══ QUERIES ═══

    function allNotes(folders) {
        const f = folders || load();
        const result = [];
        f.forEach(folder => {
            (folder.notes || []).forEach(note => {
                result.push({ ...note, folder: folder.id, folderName: folder.name, folderIcon: folder.icon });
            });
        });
        return result;
    }

    function findNote(id, folders) {
        const f = folders || load();
        for (const folder of f) {
            const note = (folder.notes || []).find(n => n.id === id);
            if (note) return { note, folderId: folder.id, folderName: folder.name };
        }
        return null;
    }

    function searchNotes(query, folders) {
        const q = (query || '').toLowerCase();
        if (!q) return allNotes(folders);
        return allNotes(folders).filter(n =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.body || '').toLowerCase().includes(q) ||
            (n.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }

    function notesByFolder(folderId, folders) {
        const f = folders || load();
        const folder = f.find(x => x.id === folderId);
        return folder ? (folder.notes || []) : [];
    }

    function stats(folders) {
        const f = folders || load();
        const all = allNotes(f);
        const byPrefix = { P: 0, I: 0, R: 0 };
        all.forEach(n => { if (byPrefix[n.prefix] !== undefined) byPrefix[n.prefix]++; });
        return {
            total: all.length,
            inbox: (f.find(x => x.id === 'inbox')?.notes || []).length,
            aktiv: (f.find(x => x.id === 'aktiv')?.notes || []).length,
            archiv: (f.find(x => x.id === 'archiv')?.notes || []).length,
            meeting: (f.find(x => x.id === 'meeting')?.notes || []).length,
            byPrefix
        };
    }

    // ═══ MUTATIONS ═══

    function addNote(folderId, noteData, folders) {
        const f = folders || load();
        const folder = f.find(x => x.id === folderId);
        if (!folder) return f;
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const note = {
            id: 'n' + Date.now(),
            prefix: noteData.prefix || 'I',
            title: noteData.title || 'Neue Notiz',
            body: noteData.body || '',
            tags: noteData.tags || [],
            created: noteData.created || now,
            modified: now
        };
        folder.notes.unshift(note);
        save(f);
        return f;
    }

    function updateNote(id, updates, folders) {
        const f = folders || load();
        const result = findNote(id, f);
        if (!result) return f;
        const { note } = result;
        if (updates.title !== undefined) note.title = updates.title;
        if (updates.body !== undefined) note.body = updates.body;
        if (updates.prefix !== undefined) note.prefix = updates.prefix;
        if (updates.tags !== undefined) note.tags = updates.tags;
        note.modified = new Date().toISOString().slice(0, 16).replace('T', ' ');
        // Auto-detect prefix from title
        if (updates.title) {
            if (updates.title.startsWith('P-') || updates.title.startsWith('P ')) note.prefix = 'P';
            else if (updates.title.startsWith('I-') || updates.title.startsWith('I ')) note.prefix = 'I';
            else if (updates.title.startsWith('R-') || updates.title.startsWith('R ')) note.prefix = 'R';
        }
        save(f);
        return f;
    }

    function moveNote(id, targetFolderId, folders) {
        const f = folders || load();
        let note = null;
        f.forEach(folder => {
            const idx = (folder.notes || []).findIndex(n => n.id === id);
            if (idx !== -1) {
                note = folder.notes.splice(idx, 1)[0];
            }
        });
        if (note) {
            note.modified = new Date().toISOString().slice(0, 16).replace('T', ' ');
            const target = f.find(x => x.id === targetFolderId);
            if (target) target.notes.unshift(note);
        }
        save(f);
        return f;
    }

    function deleteNote(id, folders) {
        const f = folders || load();
        f.forEach(folder => {
            folder.notes = (folder.notes || []).filter(n => n.id !== id);
        });
        save(f);
        return f;
    }

    function archiveOld(days, folders) {
        days = days || 30;
        const f = folders || load();
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        let moved = 0;
        ['inbox', 'aktiv'].forEach(fid => {
            const folder = f.find(x => x.id === fid);
            if (!folder) return;
            const old = folder.notes.filter(n => new Date(n.modified).getTime() < cutoff);
            old.forEach(n => {
                folder.notes = folder.notes.filter(x => x.id !== n.id);
                f.find(x => x.id === 'archiv').notes.push(n);
                moved++;
            });
        });
        if (moved > 0) save(f);
        return { moved, folders: f };
    }

    // ═══ COLUMN ↔ FOLDER MAPPING (for noter) ═══

    function folderForCol(colIndex) {
        return COL_TO_FOLDER[colIndex] || 'inbox';
    }

    function colForFolder(folderId) {
        return FOLDER_TO_COL[folderId] !== undefined ? FOLDER_TO_COL[folderId] : 0;
    }

    // Convert flat notes array with col → folder structure
    function notesToFolders(notesArray) {
        const f = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
        (notesArray || []).forEach(n => {
            const folderId = folderForCol(n.col);
            const folder = f.find(x => x.id === folderId);
            if (folder) {
                const { col, folder: _, folderName: __, folderIcon: ___, ...noteClean } = n;
                folder.notes.push(noteClean);
            }
        });
        return f;
    }

    // Convert folder structure → flat notes array with col
    function foldersToNotes(folders) {
        const result = [];
        (folders || []).forEach(folder => {
            (folder.notes || []).forEach(note => {
                result.push({
                    ...note,
                    col: colForFolder(folder.id),
                    folder: folder.id
                });
            });
        });
        return result;
    }

    // ═══ DEMO DATA ═══

    function initDemoData() {
        const f = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
        f[0].notes = [
            { id: 'n1', prefix: 'I', title: 'AI-Agent Marketplace Idee', body: 'Marketplace für spezialisierte KI-Agenten. Jeder Agent hat ein Karma-Score basierend auf Feedback.\n\nFeatures:\n- Self-Registration\n- Escrow Payment\n- Quality Rating\n- Skill-based Matching', tags: ['AI', 'Marketplace'], created: '2026-03-10 14:22', modified: '2026-03-10 14:22' },
            { id: 'n2', prefix: 'R', title: 'n8n Workflow Patterns', body: 'Referenz: https://n8n.io/workflows\n\nWichtige Patterns:\n- Webhook → Transform → DB Write\n- Schedule → API Poll → Notification\n- Form → Validation → Email', tags: ['n8n', 'Referenz'], created: '2026-03-09 10:15', modified: '2026-03-09 10:15' }
        ];
        f[1].notes = [
            { id: 'n3', prefix: 'P', title: 'DkZ™ Workflow Viewer', body: 'AKTIV — n8n-Style Live Monitor bauen\n\nAufgaben:\n✅ Node Canvas mit SVG Connectors\n✅ 4 View Modi (Workflow/Agent/Team/Loop)\n✅ 12 Builder Workflows\n☐ Real API Integration\n☐ WebSocket Live Events', tags: ['Workflow', 'Projekt'], created: '2026-03-11 13:55', modified: '2026-03-11 15:00' },
            { id: 'n4', prefix: 'P', title: 'Notes-Manager™ bauen', body: 'AKTIV — 4-Ordner System implementieren\n\n☐ index.html\n☐ Push-to-Talk\n☐ Voice Commands\n☐ DuckDB Integration\n☐ Google Sheets Sync', tags: ['Notes', 'Projekt'], created: '2026-03-11 13:50', modified: '2026-03-11 15:05' },
            { id: 'n5', prefix: 'P', title: 'R24 Archiv-Schutz', body: 'AKTIV — Eiserne Regel einbauen\n\n✅ REGELWERK.md R24 erstellt\n✅ R25 Naming Convention™ erstellt\n☐ James™ Guardian Prompt\n☐ Dashboard Alarm-Banner', tags: ['System', 'Regel'], created: '2026-03-11 15:07', modified: '2026-03-11 15:10' }
        ];
        f[2].notes = [
            { id: 'n6', prefix: 'R', title: 'Alte CSS-Variablen v1', body: 'Archiviert: Altes Design System v1 Variablen-Set.\nErsetzt durch DkZ™ Design System v2 mit --accent: #fa1e4e.', tags: ['CSS', 'Archiv'], created: '2026-03-05 09:00', modified: '2026-03-08 12:00' }
        ];
        f[3].notes = [
            { id: 'n7', prefix: 'P', title: 'Sprint Review 2026-03-11', body: '🎤 Meeting-Aufzeichnung\nDauer: 12:34\n\nThemen:\n- Workflow Viewer v2.0 Launch\n- R24 Archiv-Schutz implementiert\n- 72 Module erreicht\n- Browser-Fix steht noch aus', tags: ['Meeting', 'Sprint'], created: '2026-03-11 14:00', modified: '2026-03-11 14:12' }
        ];
        save(f);
        return f;
    }

    function ensureData() {
        const f = load();
        const total = f.reduce((s, folder) => s + (folder.notes || []).length, 0);
        if (total === 0) return initDemoData();
        return f;
    }

    // ═══ PUBLIC API ═══
    return {
        KEY,
        load,
        save,
        allNotes,
        findNote,
        searchNotes,
        notesByFolder,
        stats,
        addNote,
        updateNote,
        moveNote,
        deleteNote,
        archiveOld,
        folderForCol,
        colForFolder,
        notesToFolders,
        foldersToNotes,
        initDemoData,
        ensureData,
        DEFAULT_FOLDERS
    };
})();
