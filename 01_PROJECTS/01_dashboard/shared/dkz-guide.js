/**
 * DkZ Guide — Info-Popups, Step-by-Step Guides, Visual Hints & Cross-Module Links
 * @DKZ:RULES → R12 Kein Wissensverlust, R20 Dok-Pflicht, R21 Shared Scripts
 * @DKZ:TAG → [SYS:guide] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Features:
 * 1. ℹ️ Info-Popups (Glassmorphism Tooltips)
 * 2. 📖 Step-by-Step Interactive Tours
 * 3. 💡 Visual Hints (Pulse/Glow animations)
 * 4. 🔗 Cross-Module Link Buttons
 * 5. 👤 Admin/User Role Management
 * 6. . Prefix Commands for Power Users
 */

const DkzGuide = (() => {
    'use strict';

    const VERSION = 'v0.01.2_01';
    const ROLE_KEY = 'dkz-role';
    const TOURS_KEY = 'dkz-tours-completed';
    const ADMIN_NAME = 'XMAN';

    // ═══════════════════════════════════════
    // Registry — all guides, infos, links per module
    // ═══════════════════════════════════════
    const _infos = {};      // { elementId: { title, text, links[], steps[] } }
    const _highlights = {}; // { elementId: 'pulse' | 'glow' | 'none' }
    const _tours = {};      // { tourName: [{ target, title, text }] }
    const _links = {};      // { moduleId: [{ icon, label, href, hint }] }
    let _activeTour = null;
    let _tourStep = 0;
    let _styleInjected = false;
    let _overlayEl = null;

    // ═══════════════════════════════════════
    // Role Management
    // ═══════════════════════════════════════
    function isAdmin() {
        return (localStorage.getItem(ROLE_KEY) || 'admin') === 'admin';
    }

    function setRole(role) {
        localStorage.setItem(ROLE_KEY, role === 'admin' ? 'admin' : 'user');
        document.body.setAttribute('data-dkz-role', role);
        _refreshRoleUI();
    }

    function getRole() {
        return localStorage.getItem(ROLE_KEY) || 'admin';
    }

    function _refreshRoleUI() {
        document.querySelectorAll('[data-admin-only]').forEach(el => {
            el.style.display = isAdmin() ? '' : 'none';
        });
    }

    // ═══════════════════════════════════════
    // Style Injection
    // ═══════════════════════════════════════
    function _injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;

        const css = document.createElement('style');
        css.id = 'dkz-guide-styles';
        css.textContent = `
/* ═══ DkZ Guide System ═══ */

/* Info Icon */
.dkz-info-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(250,30,78,.08);
    border: 1px solid rgba(250,30,78,.2);
    color: #fa1e4e;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
    transition: all .3s;
    position: relative;
    z-index: 50;
    flex-shrink: 0;
    font-family: 'Inter', sans-serif;
    line-height: 1;
}
.dkz-info-icon:hover {
    background: rgba(250,30,78,.15);
    box-shadow: 0 0 12px rgba(250,30,78,.25);
    transform: scale(1.15);
}

/* Info Popup */
.dkz-info-popup {
    position: absolute;
    z-index: 1000;
    min-width: 260px;
    max-width: 360px;
    background: rgba(20,20,26,.92);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,.5);
    opacity: 0;
    transform: translateY(6px) scale(.97);
    transition: all .25s cubic-bezier(.4,0,.2,1);
    pointer-events: none;
}
.dkz-info-popup.show {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}
.dkz-info-popup .dkz-ip-title {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 6px;
    color: #f6f6f7;
    display: flex;
    align-items: center;
    gap: 6px;
}
.dkz-info-popup .dkz-ip-text {
    font-size: 11px;
    color: #a1a1aa;
    line-height: 1.6;
    margin-bottom: 8px;
}
.dkz-info-popup .dkz-ip-steps {
    list-style: none;
    padding: 0;
    margin: 8px 0;
    counter-reset: step;
}
.dkz-info-popup .dkz-ip-steps li {
    counter-increment: step;
    font-size: 11px;
    color: #a1a1aa;
    padding: 4px 0 4px 24px;
    position: relative;
    line-height: 1.5;
}
.dkz-info-popup .dkz-ip-steps li::before {
    content: counter(step);
    position: absolute;
    left: 0;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(250,30,78,.1);
    color: #fa1e4e;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 4px;
}

/* Info Popup Links */
.dkz-ip-links {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,.06);
}
.dkz-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 6px;
    background: rgba(85,172,238,.06);
    border: 1px solid rgba(85,172,238,.15);
    color: #55ACEE;
    font-size: 10px;
    font-weight: 600;
    text-decoration: none;
    transition: all .25s;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
}
.dkz-link-btn:hover {
    background: rgba(85,172,238,.12);
    border-color: rgba(85,172,238,.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(85,172,238,.15);
}

/* ═══ Visual Hints ═══ */

/* Pulse — next required step */
@keyframes dkzPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(250,30,78,.4); }
    50% { box-shadow: 0 0 0 8px rgba(250,30,78,0); }
}
.dkz-hint-pulse {
    animation: dkzPulse 2s ease-in-out infinite;
    border-color: rgba(250,30,78,.4) !important;
}

/* Glow — optional suggestion */
@keyframes dkzGlow {
    0%, 100% { box-shadow: 0 0 4px rgba(85,172,238,.15); }
    50% { box-shadow: 0 0 12px rgba(85,172,238,.25); }
}
.dkz-hint-glow {
    animation: dkzGlow 3s ease-in-out infinite;
    border-color: rgba(85,172,238,.25) !important;
}

/* ═══ Tour Overlay ═══ */
.dkz-tour-overlay {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(2px);
    transition: opacity .3s;
}
.dkz-tour-spotlight {
    position: absolute;
    z-index: 9999;
    border-radius: 12px;
    box-shadow: 0 0 0 4000px rgba(0,0,0,.6), 0 0 20px rgba(250,30,78,.3);
    transition: all .4s cubic-bezier(.4,0,.2,1);
    pointer-events: none;
}
.dkz-tour-card {
    position: absolute;
    z-index: 10000;
    width: 320px;
    background: rgba(20,20,26,.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(250,30,78,.2);
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 16px 48px rgba(0,0,0,.6);
    transition: all .4s cubic-bezier(.4,0,.2,1);
}
.dkz-tour-step-num {
    font-size: 10px;
    font-weight: 700;
    color: #fa1e4e;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
    font-family: 'JetBrains Mono', monospace;
}
.dkz-tour-title {
    font-size: 15px;
    font-weight: 800;
    color: #f6f6f7;
    margin-bottom: 6px;
}
.dkz-tour-text {
    font-size: 12px;
    color: #a1a1aa;
    line-height: 1.6;
    margin-bottom: 14px;
}
.dkz-tour-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}
.dkz-tour-btn {
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all .2s;
    border: 1px solid rgba(255,255,255,.08);
    background: transparent;
    color: #a1a1aa;
}
.dkz-tour-btn:hover {
    color: #f6f6f7;
    border-color: rgba(255,255,255,.15);
}
.dkz-tour-btn.primary {
    background: linear-gradient(135deg, #fa1e4e, #d91643);
    border: none;
    color: #fff;
}
.dkz-tour-btn.primary:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(250,30,78,.3);
}
.dkz-tour-progress {
    display: flex;
    gap: 4px;
    margin-top: 10px;
}
.dkz-tour-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,.12);
    transition: all .3s;
}
.dkz-tour-dot.active {
    background: #fa1e4e;
    width: 18px;
    border-radius: 3px;
}
.dkz-tour-dot.done {
    background: #00ff88;
}

/* ═══ Cross-Module Link Bar ═══ */
.dkz-linkbar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 12px 0;
}
.dkz-linkbar-title {
    font-size: 10px;
    font-weight: 700;
    color: #a1a1aa;
    text-transform: uppercase;
    letter-spacing: 1px;
    width: 100%;
    margin-bottom: 4px;
}

/* ═══ Role Badge ═══ */
.dkz-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    letter-spacing: .5px;
}
.dkz-role-badge.admin {
    background: rgba(250,30,78,.1);
    color: #fa1e4e;
    border: 1px solid rgba(250,30,78,.2);
}
.dkz-role-badge.user {
    background: rgba(85,172,238,.1);
    color: #55ACEE;
    border: 1px solid rgba(85,172,238,.2);
}

/* ═══ Guide Button (floating) ═══ */
.dkz-guide-fab {
    position: fixed;
    bottom: 24px;
    left: 24px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fa1e4e, #d91643);
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(250,30,78,.35);
    transition: all .3s;
}
.dkz-guide-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(250,30,78,.5);
}

/* Guide FAB Menu */
.dkz-guide-menu {
    position: fixed;
    bottom: 78px;
    left: 24px;
    z-index: 901;
    background: rgba(20,20,26,.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px;
    padding: 8px;
    min-width: 200px;
    box-shadow: 0 12px 40px rgba(0,0,0,.5);
    opacity: 0;
    transform: translateY(10px) scale(.95);
    pointer-events: none;
    transition: all .25s cubic-bezier(.4,0,.2,1);
}
.dkz-guide-menu.show {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}
.dkz-guide-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #a1a1aa;
    cursor: pointer;
    transition: all .2s;
    font-family: 'Inter', sans-serif;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
}
.dkz-guide-menu-item:hover {
    background: rgba(250,30,78,.06);
    color: #f6f6f7;
}
.dkz-guide-menu-item .icon { font-size: 16px; }
.dkz-guide-menu-sep {
    height: 1px;
    background: rgba(255,255,255,.06);
    margin: 4px 0;
}
`;
        document.head.appendChild(css);
    }

    // ═══════════════════════════════════════
    // Info Popups
    // ═══════════════════════════════════════
    function addInfo(elementId, config) {
        _infos[elementId] = config;
        _injectStyles();

        const target = document.getElementById(elementId);
        if (!target) return;

        // Don't add duplicate icons
        if (target.querySelector('.dkz-info-icon')) return;

        const icon = document.createElement('button');
        icon.className = 'dkz-info-icon';
        icon.textContent = 'ℹ';
        icon.title = config.title || 'Info';
        icon.setAttribute('aria-label', config.title || 'Info');

        const popup = document.createElement('div');
        popup.className = 'dkz-info-popup';
        popup.innerHTML = _buildPopupHTML(config);

        // Position relative to parent
        const wrapper = document.createElement('span');
        wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;margin-left:6px;';
        wrapper.appendChild(icon);
        wrapper.appendChild(popup);

        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other popups
            document.querySelectorAll('.dkz-info-popup.show').forEach(p => {
                if (p !== popup) p.classList.remove('show');
            });
            popup.classList.toggle('show');
            // Position popup
            _positionPopup(popup, icon);
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) popup.classList.remove('show');
        });

        target.appendChild(wrapper);
    }

    function _buildPopupHTML(config) {
        let html = `<div class="dkz-ip-title">ℹ️ ${_esc(config.title || '')}</div>`;
        if (config.text) html += `<div class="dkz-ip-text">${_esc(config.text)}</div>`;

        if (config.steps && config.steps.length) {
            html += '<ol class="dkz-ip-steps">';
            config.steps.forEach(s => { html += `<li>${_esc(s)}</li>`; });
            html += '</ol>';
        }

        if (config.links && config.links.length) {
            html += '<div class="dkz-ip-links">';
            config.links.forEach(l => {
                html += `<a class="dkz-link-btn" href="${_esc(l.href)}" title="${_esc(l.hint || '')}">${l.icon || '🔗'} ${_esc(l.label)}</a>`;
            });
            html += '</div>';
        }

        return html;
    }

    function _positionPopup(popup, icon) {
        const rect = icon.getBoundingClientRect();
        const popW = 300;
        if (rect.left + popW > window.innerWidth) {
            popup.style.right = '0';
            popup.style.left = 'auto';
        } else {
            popup.style.left = '0';
            popup.style.right = 'auto';
        }
        popup.style.top = '28px';
    }

    // ═══════════════════════════════════════
    // Visual Hints
    // ═══════════════════════════════════════
    function highlight(elementId, type) {
        _injectStyles();
        const el = document.getElementById(elementId);
        if (!el) return;

        el.classList.remove('dkz-hint-pulse', 'dkz-hint-glow');
        _highlights[elementId] = type;

        if (type === 'pulse') el.classList.add('dkz-hint-pulse');
        else if (type === 'glow') el.classList.add('dkz-hint-glow');
    }

    function clearHighlights() {
        Object.keys(_highlights).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('dkz-hint-pulse', 'dkz-hint-glow');
        });
    }

    // ═══════════════════════════════════════
    // Interactive Tours
    // ═══════════════════════════════════════
    function registerTour(name, steps) {
        _tours[name] = steps;
    }

    function startTour(name) {
        _injectStyles();
        const tour = _tours[name];
        if (!tour || !tour.length) return;

        _activeTour = { name, steps: tour };
        _tourStep = 0;
        _showTourStep();
    }

    function _showTourStep() {
        if (!_activeTour) return;
        const { steps } = _activeTour;
        if (_tourStep >= steps.length) { _endTour(); return; }

        const step = steps[_tourStep];
        const target = document.querySelector(step.target);

        // Remove old overlay
        _removeTourOverlay();

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'dkz-tour-overlay';
        overlay.id = 'dkz-tour-overlay';
        document.body.appendChild(overlay);

        // Spotlight
        if (target) {
            const rect = target.getBoundingClientRect();
            const spotlight = document.createElement('div');
            spotlight.className = 'dkz-tour-spotlight';
            spotlight.style.cssText = `top:${rect.top - 6}px;left:${rect.left - 6}px;width:${rect.width + 12}px;height:${rect.height + 12}px;`;
            document.body.appendChild(spotlight);

            // Scroll into view
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Tour card
        const card = document.createElement('div');
        card.className = 'dkz-tour-card';
        card.innerHTML = `
            <div class="dkz-tour-step-num">Schritt ${_tourStep + 1} von ${steps.length}</div>
            <div class="dkz-tour-title">${_esc(step.title)}</div>
            <div class="dkz-tour-text">${_esc(step.text)}</div>
            <div class="dkz-tour-actions">
                ${_tourStep > 0 ? '<button class="dkz-tour-btn" onclick="DkzGuide._prevStep()">← Zurück</button>' : ''}
                <button class="dkz-tour-btn" onclick="DkzGuide._endTour()">Beenden</button>
                <button class="dkz-tour-btn primary" onclick="DkzGuide._nextStep()">${_tourStep < steps.length - 1 ? 'Weiter →' : '✅ Fertig'}</button>
            </div>
            <div class="dkz-tour-progress">
                ${steps.map((_, i) => `<div class="dkz-tour-dot ${i < _tourStep ? 'done' : ''} ${i === _tourStep ? 'active' : ''}"></div>`).join('')}
            </div>
        `;

        // Position card
        if (target) {
            const rect = target.getBoundingClientRect();
            const below = rect.bottom + 16;
            const above = rect.top - 200;
            card.style.top = (below + 320 < window.innerHeight) ? below + 'px' : Math.max(8, above) + 'px';
            card.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';
        } else {
            card.style.top = '50%';
            card.style.left = '50%';
            card.style.transform = 'translate(-50%,-50%)';
        }

        document.body.appendChild(card);

        // Save completed tours
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) _endTour();
        });
    }

    function _nextStep() {
        _tourStep++;
        _showTourStep();
    }

    function _prevStep() {
        if (_tourStep > 0) _tourStep--;
        _showTourStep();
    }

    function _endTour() {
        if (_activeTour) {
            const completed = JSON.parse(localStorage.getItem(TOURS_KEY) || '[]');
            if (!completed.includes(_activeTour.name)) {
                completed.push(_activeTour.name);
                localStorage.setItem(TOURS_KEY, JSON.stringify(completed));
            }
        }
        _activeTour = null;
        _tourStep = 0;
        _removeTourOverlay();
    }

    function _removeTourOverlay() {
        document.querySelectorAll('.dkz-tour-overlay, .dkz-tour-spotlight, .dkz-tour-card').forEach(el => el.remove());
    }

    function isTourCompleted(name) {
        return (JSON.parse(localStorage.getItem(TOURS_KEY) || '[]')).includes(name);
    }

    // ═══════════════════════════════════════
    // Cross-Module Links
    // ═══════════════════════════════════════
    function registerLinks(moduleId, links) {
        _links[moduleId] = links;
    }

    function renderLinkBar(containerId, moduleId) {
        _injectStyles();
        const container = document.getElementById(containerId);
        const links = _links[moduleId];
        if (!container || !links) return;

        let html = '<div class="dkz-linkbar"><span class="dkz-linkbar-title">🔗 Verknüpfte Module</span>';
        links.forEach(l => {
            const glowClass = l.recommended ? 'dkz-hint-glow' : '';
            html += `<a class="dkz-link-btn ${glowClass}" href="${_esc(l.href)}" title="${_esc(l.hint || '')}">${l.icon || '🔗'} ${_esc(l.label)}</a>`;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // Floating Guide FAB
    // ═══════════════════════════════════════
    function injectGuideFAB(options = {}) {
        _injectStyles();

        if (document.getElementById('dkz-guide-fab')) return;

        const fab = document.createElement('button');
        fab.id = 'dkz-guide-fab';
        fab.className = 'dkz-guide-fab';
        fab.textContent = '❓';
        fab.title = 'Guide & Hilfe';

        const menu = document.createElement('div');
        menu.id = 'dkz-guide-menu';
        menu.className = 'dkz-guide-menu';

        const menuItems = [
            { icon: '📖', label: 'Modul-Guide starten', action: () => { if (options.defaultTour) startTour(options.defaultTour); } },
            { icon: 'ℹ️', label: 'Alle Info-Popups zeigen', action: _showAllInfos },
            { icon: '💡', label: 'Tipps ein/aus', action: _toggleHints },
            { sep: true },
            { icon: '👤', label: `Rolle: ${isAdmin() ? ADMIN_NAME : 'USER'}`, action: _toggleRole, id: 'dkz-role-item' },
        ];

        if (isAdmin()) {
            menuItems.push(
                { sep: true },
                { icon: '📋', label: 'REGELWERK', action: () => window.open('../../REGELWERK.md') },
                { icon: '🗺️', label: 'BLAUPAUSE', action: () => window.open('../../BLAUPAUSE.md') },
                { icon: '📊', label: 'System-Check', action: () => window.location.href = '../system-check/index.html' }
            );
        }

        menu.innerHTML = menuItems.map(item => {
            if (item.sep) return '<div class="dkz-guide-menu-sep"></div>';
            return `<button class="dkz-guide-menu-item" data-action="${_esc(item.label)}" ${item.id ? 'id="' + item.id + '"' : ''}><span class="icon">${item.icon}</span> ${_esc(item.label)}</button>`;
        }).join('');

        let menuOpen = false;
        fab.addEventListener('click', () => {
            menuOpen = !menuOpen;
            menu.classList.toggle('show', menuOpen);
            fab.textContent = menuOpen ? '✕' : '❓';
        });

        // Attach actions
        menu.querySelectorAll('.dkz-guide-menu-item').forEach((btn, i) => {
            const realItems = menuItems.filter(m => !m.sep);
            if (realItems[i] && realItems[i].action) {
                btn.addEventListener('click', () => {
                    realItems[i].action();
                    menuOpen = false;
                    menu.classList.remove('show');
                    fab.textContent = '❓';
                });
            }
        });

        document.addEventListener('click', (e) => {
            if (!fab.contains(e.target) && !menu.contains(e.target)) {
                menuOpen = false;
                menu.classList.remove('show');
                fab.textContent = '❓';
            }
        });

        document.body.appendChild(menu);
        document.body.appendChild(fab);
    }

    function _showAllInfos() {
        document.querySelectorAll('.dkz-info-popup').forEach(p => p.classList.add('show'));
        setTimeout(() => {
            document.querySelectorAll('.dkz-info-popup').forEach(p => p.classList.remove('show'));
        }, 4000);
    }

    let _hintsVisible = true;
    function _toggleHints() {
        _hintsVisible = !_hintsVisible;
        if (_hintsVisible) {
            Object.entries(_highlights).forEach(([id, type]) => highlight(id, type));
        } else {
            clearHighlights();
        }
    }

    function _toggleRole() {
        const newRole = isAdmin() ? 'user' : 'admin';
        setRole(newRole);
        const roleItem = document.getElementById('dkz-role-item');
        if (roleItem) roleItem.innerHTML = `<span class="icon">👤</span> Rolle: ${newRole === 'admin' ? ADMIN_NAME : 'USER'}`;
        // Refresh FAB with new role
        const fab = document.getElementById('dkz-guide-fab');
        const menu = document.getElementById('dkz-guide-menu');
        if (fab) fab.remove();
        if (menu) menu.remove();
        injectGuideFAB();
    }

    // ═══════════════════════════════════════
    // Prefix Commands (.help, .guide, etc.)
    // ═══════════════════════════════════════
    const _commands = {
        '.help': () => _showAllInfos(),
        '.guide': (args) => { if (args && _tours[args]) startTour(args); },
        '.role': (args) => { if (args) setRole(args); },
        '.tours': () => { console.log('[DkZ Guide] Available tours:', Object.keys(_tours)); },
        '.links': () => { console.log('[DkZ Guide] Registered links:', _links); },
        '.info': () => { console.log('[DkZ Guide] Registered infos:', Object.keys(_infos)); },
    };

    function handleCommand(input) {
        const trimmed = input.trim();
        if (!trimmed.startsWith('.')) return false;

        const parts = trimmed.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        if (_commands[cmd]) {
            _commands[cmd](args);
            return true;
        }
        return false;
    }

    // ═══════════════════════════════════════
    // Role Badge Renderer
    // ═══════════════════════════════════════
    function renderRoleBadge(containerId) {
        _injectStyles();
        const container = document.getElementById(containerId);
        if (!container) return;
        const role = getRole();
        container.innerHTML = `<span class="dkz-role-badge ${role}">${role === 'admin' ? '🔑 ' + ADMIN_NAME : '👤 USER'}</span>`;
    }

    // ═══════════════════════════════════════
    // XSS Protection
    // ═══════════════════════════════════════
    function _esc(s) {
        const d = document.createElement('div');
        d.appendChild(document.createTextNode(s));
        return d.innerHTML;
    }

    // ═══════════════════════════════════════
    // Init
    // ═══════════════════════════════════════
    function init() {
        _injectStyles();
        // Set default role to admin (XMAN) if not yet set
        if (!localStorage.getItem(ROLE_KEY)) {
            localStorage.setItem(ROLE_KEY, 'admin');
        }
        document.body.setAttribute('data-dkz-role', getRole());
        _refreshRoleUI();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return {
        // Core
        addInfo, highlight, clearHighlights,
        // Tours
        registerTour, startTour, isTourCompleted,
        // Links
        registerLinks, renderLinkBar,
        // UI
        injectGuideFAB, renderRoleBadge,
        // Role
        isAdmin, setRole, getRole, ADMIN_NAME,
        // Commands
        handleCommand,
        // Internal (for tour buttons)
        _nextStep, _prevStep, _endTour,
        // Meta
        VERSION
    };
})();

if (typeof module !== 'undefined') module.exports = DkzGuide;
