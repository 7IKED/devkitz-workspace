/**
 * DkZ Prompt Hub — Unified Prompt Storage & Cross-Module Navigation
 * @DKZ:RULES → R21 Shared Scripts, R12 No Data Loss, R100 No Deletion
 * @DKZ:TAG → [SYS:prompt-hub] [CAT:shared] [LANG:js]
 * @version v0.01
 *
 * ═══════════════════════════════════════════════════════════════
 * LLM-ANWEISUNG:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Dieses Script vereinheitlicht ALLE Prompt-Datenquellen.    │
 * │  Es gibt EINE zentrale Quelle: dkz-prompts (localStorage)  │
 * │  PLUS 2 Backups: dkz-prompts-bak1, dkz-prompts-bak2        │
 * │                                                              │
 * │  DATENFLUSS:                                                 │
 * │  prompt-generator → speichert in dkz-prompts (source:gen)   │
 * │  prompt-viewer    → liest/schreibt dkz-prompts (source:arc) │
 * │  loop-dashboard   → liest dkz-prompts für Prompt-Auswahl   │
 * │  prompter         → speichert in dkz-prompts (source:eng)   │
 * │  ai-chat          → speichert in dkz-prompts (source:chat)  │
 * │                                                              │
 * │  MIGRATION: Beim ersten Laden werden bestehende Prompts     │
 * │  aus alten Keys (dkz-promptgen-saved, dkz-prompt-archive,   │
 * │  dkz-prompt-viewer) in dkz-prompts migriert. Alte Keys      │
 * │  bleiben als zusätzliches Backup erhalten (R100).            │
 * │                                                              │
 * │  SOURCE TAGS:                                                │
 * │  gen  = Prompt Generator (Timeline Builder)                  │
 * │  arc  = Prompt Archive (Viewer)                              │
 * │  eng  = Prompter (Engineering Tool)                          │
 * │  chat = AI Chat (Gespräch gespeichert)                       │
 * │  loop = Loop Dashboard (Workflow)                            │
 * │  import = CSV/JSON Import                                    │
 * │                                                              │
 * │  CROSS-NAV: Injiziert Navigation-Buttons in jedes Modul     │
 * │  das Prompts nutzt. Buttons verlinken zu verwandten Modulen. │
 * └─────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════
 */

const DkzPromptHub = (() => {
    const MAIN_KEY = 'dkz-prompts';
    const BAK1_KEY = 'dkz-prompts-bak1';
    const BAK2_KEY = 'dkz-prompts-bak2';

    // Legacy keys to migrate FROM (R100: never deleted)
    const LEGACY_KEYS = [
        'dkz-promptgen-saved',
        'dkz-prompt-archive',
        'dkz-prompt-viewer',
        'dkz-prompter-saved'
    ];

    // Source tag definitions
    const SOURCES = {
        gen:    { label: 'Prompt Generator', icon: '⚙️', color: '#fa1e4e' },
        arc:    { label: 'Prompt Archiv',    icon: '📖', color: '#55ACEE' },
        eng:    { label: 'Prompter',         icon: '✏️', color: '#ec4899' },
        chat:   { label: 'AI Chat',          icon: '🤖', color: '#00ff88' },
        loop:   { label: 'Loop Dashboard',   icon: '🔄', color: '#FFB800' },
        import: { label: 'Import',           icon: '📥', color: '#a78bfa' }
    };

    // ═══ CORE STORAGE ═══

    function load() {
        try {
            return JSON.parse(localStorage.getItem(MAIN_KEY) || '[]');
        } catch { return []; }
    }

    function save(prompts) {
        const json = JSON.stringify(prompts);
        localStorage.setItem(MAIN_KEY, json);
        // Rolling backup: bak2 ← bak1 ← current
        const bak1 = localStorage.getItem(BAK1_KEY);
        if (bak1) localStorage.setItem(BAK2_KEY, bak1);
        localStorage.setItem(BAK1_KEY, json);
    }

    function addPrompt(prompt, source = 'gen') {
        const prompts = load();
        const entry = {
            id: prompt.id || 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            title: prompt.title || prompt.name || 'Untitled',
            content: prompt.content || prompt.text || prompt.prompt || '',
            source: source,
            sourceLabel: SOURCES[source]?.label || source,
            tags: prompt.tags || [],
            category: prompt.category || 'general',
            status: prompt.status || 'active',
            created: prompt.created || new Date().toISOString(),
            modified: new Date().toISOString(),
            meta: prompt.meta || {}
        };
        prompts.push(entry);
        save(prompts);
        return entry;
    }

    function getAll(filter = {}) {
        let prompts = load();
        if (filter.source) prompts = prompts.filter(p => p.source === filter.source);
        if (filter.category) prompts = prompts.filter(p => p.category === filter.category);
        if (filter.status) prompts = prompts.filter(p => p.status === filter.status);
        if (filter.search) {
            const q = filter.search.toLowerCase();
            prompts = prompts.filter(p =>
                (p.title || '').toLowerCase().includes(q) ||
                (p.content || '').toLowerCase().includes(q)
            );
        }
        return prompts;
    }

    function getById(id) {
        return load().find(p => p.id === id);
    }

    function updatePrompt(id, updates) {
        const prompts = load();
        const idx = prompts.findIndex(p => p.id === id);
        if (idx === -1) return null;
        prompts[idx] = { ...prompts[idx], ...updates, modified: new Date().toISOString() };
        save(prompts);
        return prompts[idx];
    }

    function getStats() {
        const prompts = load();
        const bySource = {};
        for (const s of Object.keys(SOURCES)) bySource[s] = 0;
        prompts.forEach(p => { bySource[p.source] = (bySource[p.source] || 0) + 1; });
        return { total: prompts.length, bySource, lastModified: prompts.length ? prompts[prompts.length - 1].modified : null };
    }

    // ═══ MIGRATION ═══

    function migrate() {
        if (localStorage.getItem('dkz-prompts-migrated')) return;

        const prompts = load();
        let added = 0;

        // Migrate from prompt-generator saved templates
        try {
            const gen = JSON.parse(localStorage.getItem('dkz-promptgen-saved') || '[]');
            gen.forEach(g => {
                if (!prompts.find(p => p.content === (g.content || g.text || g.prompt || ''))) {
                    prompts.push({
                        id: 'p-mig-gen-' + Date.now() + '-' + (added++),
                        title: g.title || g.name || 'Generator Prompt',
                        content: g.content || g.text || g.prompt || JSON.stringify(g),
                        source: 'gen',
                        sourceLabel: 'Prompt Generator',
                        tags: g.tags || ['migriert'],
                        category: g.category || 'generated',
                        status: 'active',
                        created: g.created || new Date().toISOString(),
                        modified: new Date().toISOString(),
                        meta: { migrated: true, originalKey: 'dkz-promptgen-saved' }
                    });
                }
            });
        } catch (e) { /* ignore */ }

        // Migrate from prompt-archive
        try {
            const arc = JSON.parse(localStorage.getItem('dkz-prompt-archive') || '[]');
            arc.forEach(a => {
                if (!prompts.find(p => p.content === (a.content || a.text || a.prompt || ''))) {
                    prompts.push({
                        id: 'p-mig-arc-' + Date.now() + '-' + (added++),
                        title: a.title || a.name || 'Archived Prompt',
                        content: a.content || a.text || a.prompt || JSON.stringify(a),
                        source: 'arc',
                        sourceLabel: 'Prompt Archiv',
                        tags: a.tags || ['migriert'],
                        category: a.category || 'archived',
                        status: a.status || 'active',
                        created: a.created || a.date || new Date().toISOString(),
                        modified: new Date().toISOString(),
                        meta: { migrated: true, originalKey: 'dkz-prompt-archive' }
                    });
                }
            });
        } catch (e) { /* ignore */ }

        // Migrate from prompt-viewer (legacy)
        try {
            const pv = JSON.parse(localStorage.getItem('dkz-prompt-viewer') || '[]');
            pv.forEach(v => {
                if (!prompts.find(p => p.content === (v.content || v.text || v.prompt || ''))) {
                    prompts.push({
                        id: 'p-mig-pv-' + Date.now() + '-' + (added++),
                        title: v.title || v.name || 'Viewer Prompt',
                        content: v.content || v.text || v.prompt || JSON.stringify(v),
                        source: 'arc',
                        sourceLabel: 'Prompt Archiv',
                        tags: v.tags || ['migriert'],
                        category: v.category || 'archived',
                        status: v.status || 'active',
                        created: v.created || new Date().toISOString(),
                        modified: new Date().toISOString(),
                        meta: { migrated: true, originalKey: 'dkz-prompt-viewer' }
                    });
                }
            });
        } catch (e) { /* ignore */ }

        // Migrate from Prompter (Web Prompt Builder — dkz-prompter-saved)
        try {
            const eng = JSON.parse(localStorage.getItem('dkz-prompter-saved') || '[]');
            eng.forEach(e => {
                if (!prompts.find(p => p.content === (e.content || e.text || e.prompt || ''))) {
                    prompts.push({
                        id: 'p-mig-eng-' + Date.now() + '-' + (added++),
                        title: e.title || e.name || 'Prompter Template',
                        content: e.content || e.text || e.prompt || JSON.stringify(e),
                        source: 'eng',
                        sourceLabel: 'Prompter',
                        tags: e.tags || ['migriert', 'prompter'],
                        category: e.category || 'engineering',
                        status: e.status || 'active',
                        created: e.created || new Date().toISOString(),
                        modified: new Date().toISOString(),
                        meta: { migrated: true, originalKey: 'dkz-prompter-saved' }
                    });
                }
            });
        } catch (e) { /* ignore */ }

        if (added > 0) {
            save(prompts);
            console.log(`[DkZ PromptHub] Migration: ${added} Prompts aus Legacy-Keys importiert`);
        }

        localStorage.setItem('dkz-prompts-migrated', new Date().toISOString());
    }

    // ═══ CROSS-MODULE NAVIGATION ═══

    const NAV_MODULES = [
        { id: 'prompt-generator', name: 'Prompt Generator', icon: '⚙️', path: '../prompt-generator/index.html', desc: 'Timeline Prompt Builder' },
        { id: 'prompt-viewer',    name: 'Prompt Archiv',    icon: '📖', path: '../prompt-viewer/index.html',    desc: 'Alle Prompts durchsuchen' },
        { id: 'prompter',         name: 'Prompter',         icon: '✏️', path: '../prompter/index.html',         desc: 'Prompt Engineering' },
        { id: 'loop-dashboard',   name: 'Loop Dashboard',   icon: '🔄', path: '../loop-dashboard/index.html',  desc: 'Automation Workflows' },
        { id: 'ai_chat',          name: 'AI Chat',          icon: '🤖', path: '../ai_chat/index.html',          desc: 'Multi-Provider Chat' },
        { id: 'action-builder',   name: 'Action Builder',   icon: '🧩', path: '../action-builder/index.html',  desc: 'Aktionen definieren' },
        { id: 'skill-builder',    name: 'Skill Builder',    icon: '🎯', path: '../skill-builder/index.html',   desc: 'Skills erstellen' },
        { id: 'agent-builder',    name: 'Agent Builder',    icon: '🤖', path: '../agent-builder/index.html',   desc: 'Agenten bauen' },
        { id: 'workflow-builder', name: 'Workflow Builder',  icon: '🔀', path: '../workflow-builder/index.html', desc: 'Workflows gestalten' },
        { id: 'team-builder',     name: 'Team Builder',     icon: '👥', path: '../team-builder/index.html',    desc: 'Teams koordinieren' },
        { id: 'tenor-builder',    name: 'TEN0R Builder',    icon: '🎸', path: '../tenor-builder/index.html',   desc: 'Claw Builder' },
        { id: 'black8-builder',   name: 'BLACK8 Builder',   icon: '⚡', path: '../black8-builder/index.html',  desc: 'n8n Builder' },
        { id: 'iceberg',          name: 'ICEberg',          icon: '🧊', path: '../iceberg/index.html',         desc: 'Knowledge Lake' },
        { id: 'llm-cost-board',   name: 'Kostenrechner',    icon: '💰', path: '../llm-cost-board/index.html',  desc: 'LLM Kosten' },
    ];

    function detectCurrentModule() {
        const path = window.location.pathname;
        for (const m of NAV_MODULES) {
            if (path.includes('/' + m.id + '/')) return m.id;
        }
        return null;
    }

    function injectNavBar() {
        const currentId = detectCurrentModule();
        if (!currentId) return;

        // Filter: show related modules, not self
        const related = NAV_MODULES.filter(m => m.id !== currentId);

        // Group: Prompt-tools first, then builders, then system
        const promptModules = ['prompt-generator', 'prompt-viewer', 'prompter', 'loop-dashboard', 'ai_chat'];
        const builderModules = ['action-builder', 'skill-builder', 'agent-builder', 'workflow-builder', 'team-builder', 'tenor-builder', 'black8-builder'];

        const promptGroup = related.filter(m => promptModules.includes(m.id));
        const builderGroup = related.filter(m => builderModules.includes(m.id));
        const otherGroup = related.filter(m => !promptModules.includes(m.id) && !builderModules.includes(m.id));

        const bar = document.createElement('div');
        bar.id = 'dkz-prompt-hub-nav';
        bar.style.cssText = `
            position:fixed;bottom:0;left:0;right:0;z-index:999;
            background:rgba(14,14,22,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
            border-top:1px solid rgba(250,30,78,.12);
            padding:6px 12px;display:flex;align-items:center;gap:6px;
            overflow-x:auto;font-family:'Inter',sans-serif;
            scrollbar-width:thin;
        `;

        function makeGroup(label, items) {
            if (!items.length) return '';
            let html = `<span style="font-size:7px;letter-spacing:1.5px;color:rgba(161,161,170,.4);text-transform:uppercase;margin-right:4px;white-space:nowrap">${label}</span>`;
            items.forEach(m => {
                html += `<a href="${m.path}" title="${m.desc}" style="
                    display:inline-flex;align-items:center;gap:4px;
                    padding:4px 10px;border-radius:6px;font-size:10px;font-weight:600;
                    background:rgba(255,255,255,.03);border:1px solid rgba(51,51,56,.6);
                    color:#a1a1aa;text-decoration:none;white-space:nowrap;
                    transition:all .2s;flex-shrink:0;
                " onmouseover="this.style.borderColor='rgba(250,30,78,.4)';this.style.color='#f6f6f7';this.style.background='rgba(250,30,78,.06)'"
                   onmouseout="this.style.borderColor='rgba(51,51,56,.6)';this.style.color='#a1a1aa';this.style.background='rgba(255,255,255,.03)'"
                >${m.icon} ${m.name}</a>`;
            });
            return html;
        }

        // Stats badge
        const stats = getStats();
        let html = `<span style="font-size:8px;color:rgba(250,30,78,.6);font-family:'JetBrains Mono',monospace;border:1px solid rgba(250,30,78,.15);padding:3px 8px;border-radius:4px;white-space:nowrap;flex-shrink:0" title="Prompts in der zentralen Datenbank">📦 ${stats.total} Prompts</span>`;
        html += `<span style="width:1px;height:20px;background:rgba(51,51,56,.5);flex-shrink:0"></span>`;
        html += makeGroup('Prompts', promptGroup);
        html += `<span style="width:1px;height:20px;background:rgba(51,51,56,.5);flex-shrink:0"></span>`;
        html += makeGroup('Builder', builderGroup);
        if (otherGroup.length) {
            html += `<span style="width:1px;height:20px;background:rgba(51,51,56,.5);flex-shrink:0"></span>`;
            html += makeGroup('System', otherGroup);
        }

        bar.innerHTML = html;
        document.body.appendChild(bar);

        // Add bottom padding to body so content isn't hidden behind nav
        document.body.style.paddingBottom = '44px';
    }

    // ═══ TRANSFER HELPERS (for builder chain) ═══

    function sendToModule(targetModule, data) {
        const key = `dkz-transfer-${targetModule}`;
        localStorage.setItem(key, JSON.stringify({
            ...data,
            sentFrom: detectCurrentModule(),
            sentAt: new Date().toISOString()
        }));
        const target = NAV_MODULES.find(m => m.id === targetModule);
        if (target) window.location.href = target.path;
    }

    function receiveFromModule(sourceModule) {
        const key = `dkz-transfer-${detectCurrentModule()}`;
        try {
            const data = JSON.parse(localStorage.getItem(key) || 'null');
            if (data) {
                localStorage.removeItem(key);
                return data;
            }
        } catch { /* ignore */ }
        return null;
    }

    // ═══ INIT ═══
    function init() {
        migrate();
        // Delay nav injection to not block page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => setTimeout(injectNavBar, 300));
        } else {
            setTimeout(injectNavBar, 300);
        }
    }

    init();

    // Public API
    return {
        load, save, addPrompt, getAll, getById, updatePrompt, getStats,
        migrate, SOURCES, NAV_MODULES,
        sendToModule, receiveFromModule, detectCurrentModule
    };
})();
