/**
 * DkZ Shortcuts — Standard Keyboard Shortcuts
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:shortcuts] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Standard shortcuts for ALL modules:
 * - Escape    → Close modals/popups/panels
 * - /         → Focus search input
 * - ?         → Show shortcut help overlay
 * - Ctrl+S    → Trigger save (preventDefault)
 * - Ctrl+E    → Trigger export
 * - Ctrl+K    → Open Copilot chat
 * - Ctrl+H    → Navigate to Hub
 */
const DkzShortcuts = (() => {
    'use strict';

    const VERSION = 'v0.01.1_01';
    let _helpOverlayEl = null;
    let _styleInjected = false;
    const _custom = {};

    const STANDARD = [
        { key: 'Escape', label: 'Schließen', desc: 'Modal / Popup / Panel schließen' },
        { key: '/', label: 'Suche', desc: 'Suchfeld fokussieren' },
        { key: '?', label: 'Hilfe', desc: 'Shortcut-Übersicht anzeigen' },
        { key: 'Ctrl+S', label: 'Speichern', desc: 'Modul-Daten speichern' },
        { key: 'Ctrl+E', label: 'Export', desc: 'Daten exportieren' },
        { key: 'Ctrl+K', label: 'Copilot', desc: 'Chat öffnen' },
        { key: 'Ctrl+H', label: 'Hub', desc: 'Zum Hub navigieren' },
    ];

    function _injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;
        const css = document.createElement('style');
        css.id = 'dkz-shortcuts-styles';
        css.textContent = `
.dkz-shortcut-overlay {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .25s; pointer-events: none;
}
.dkz-shortcut-overlay.show { opacity: 1; pointer-events: auto; }
.dkz-shortcut-card {
    background: rgba(20,20,26,.95); border: 1px solid rgba(255,255,255,.08);
    border-radius: 16px; padding: 24px; min-width: 340px; max-width: 440px;
    box-shadow: 0 16px 48px rgba(0,0,0,.5);
}
.dkz-shortcut-title {
    font-size: 15px; font-weight: 800; color: #f6f6f7;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.dkz-shortcut-list { list-style: none; padding: 0; margin: 0; }
.dkz-shortcut-item {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.04);
    font-size: 12px; color: #a1a1aa;
}
.dkz-shortcut-item:last-child { border-bottom: none; }
.dkz-shortcut-key {
    display: inline-flex; padding: 3px 8px; border-radius: 4px;
    background: rgba(250,30,78,.08); border: 1px solid rgba(250,30,78,.2);
    color: #fa1e4e; font-family: 'JetBrains Mono', monospace;
    font-size: 10px; font-weight: 700; min-width: 60px; justify-content: center;
}
.dkz-shortcut-desc { flex: 1; }
`;
        document.head.appendChild(css);
    }

    function _handleKey(e) {
        const tag = (e.target.tagName || '').toLowerCase();
        const inInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
        const ctrl = e.ctrlKey || e.metaKey;

        if (ctrl && e.key === 's') { e.preventDefault(); _triggerAction('save'); return; }
        if (ctrl && e.key === 'e') { e.preventDefault(); _triggerAction('export'); return; }
        if (ctrl && e.key === 'k') {
            e.preventDefault();
            const chatToggle = document.querySelector('.dkz-copilot-toggle, [onclick*="DkzCopilot"]');
            if (chatToggle) chatToggle.click();
            return;
        }
        if (ctrl && e.key === 'h') {
            e.preventDefault();
            const hubLink = document.querySelector('.back-btn[href*="hub"]');
            if (hubLink) window.location.href = hubLink.href;
            return;
        }
        if (inInput && e.key !== 'Escape') return;

        if (e.key === 'Escape') {
            if (_helpOverlayEl && _helpOverlayEl.classList.contains('show')) { _helpOverlayEl.classList.remove('show'); return; }
            document.querySelectorAll('.dkz-info-popup.show').forEach(p => p.classList.remove('show'));
            if (typeof DkzGuide !== 'undefined' && DkzGuide._endTour) DkzGuide._endTour();
            document.querySelectorAll('.modal.show, .overlay.show').forEach(m => m.classList.remove('show'));
            return;
        }
        if (e.key === '/') { e.preventDefault(); const s = document.querySelector('#search, #searchInput, [type="search"], input[placeholder*="uch"]'); if (s) { s.focus(); s.select(); } return; }
        if (e.key === '?') { e.preventDefault(); _showHelp(); return; }

        const combo = `${ctrl ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
        if (_custom[combo]) { e.preventDefault(); _custom[combo].fn(); }
    }

    function _triggerAction(name) {
        const selectors = {
            save: '[onclick*="save"], [onclick*="Save"], .save-btn, #saveBtn',
            export: '[onclick*="export"], [onclick*="Export"], [onclick*="download"], .export-btn, #exportBtn',
        };
        const btn = document.querySelector(selectors[name] || '');
        if (btn) btn.click();
        else document.dispatchEvent(new CustomEvent('dkz:shortcut', { detail: { action: name } }));
    }

    function _showHelp() {
        _injectStyles();
        if (!_helpOverlayEl) {
            _helpOverlayEl = document.createElement('div');
            _helpOverlayEl.className = 'dkz-shortcut-overlay';
            _helpOverlayEl.addEventListener('click', (e) => { if (e.target === _helpOverlayEl) _helpOverlayEl.classList.remove('show'); });
            document.body.appendChild(_helpOverlayEl);
        }
        const all = [...STANDARD, ...Object.entries(_custom).map(([k, v]) => ({ key: k.replace('ctrl+', 'Ctrl+'), label: v.label, desc: v.desc || '' }))];
        _helpOverlayEl.innerHTML = `<div class="dkz-shortcut-card"><div class="dkz-shortcut-title">⌨️ Tastenkürzel</div><ul class="dkz-shortcut-list">${all.map(s => `<li class="dkz-shortcut-item"><span class="dkz-shortcut-key">${s.key}</span><span class="dkz-shortcut-desc"><strong>${s.label}</strong> — ${s.desc}</span></li>`).join('')}</ul></div>`;
        _helpOverlayEl.classList.add('show');
    }

    function register(combo, label, fn, desc) { _custom[combo.toLowerCase()] = { label, fn, desc: desc || '' }; }

    // ═══ Inject visible ? button into header ═══
    function _injectHeaderButton() {
        const hdr = document.querySelector('.hdr-right, .header .ver')?.parentElement || document.querySelector('.header, .dkz-header');
        if (!hdr) return;
        const target = document.querySelector('.hdr-right') || hdr;
        const btn = document.createElement('button');
        btn.className = 'dkz-kbd-hint';
        btn.title = 'Tastenkürzel anzeigen (?)';
        btn.textContent = '⌨️';
        btn.onclick = _showHelp;
        target.appendChild(btn);

        const s = document.createElement('style');
        s.textContent = `.dkz-kbd-hint{padding:5px 8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);font-size:12px;cursor:pointer;transition:all .2s;font-family:inherit}.dkz-kbd-hint:hover{background:rgba(250,30,78,.1);border-color:rgba(250,30,78,.3);color:#fa1e4e}`;
        document.head.appendChild(s);
    }

    document.addEventListener('keydown', _handleKey);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _injectHeaderButton);
    else _injectHeaderButton();

    return { register, showHelp: _showHelp, VERSION };
})();

if (typeof module !== 'undefined') module.exports = DkzShortcuts;
