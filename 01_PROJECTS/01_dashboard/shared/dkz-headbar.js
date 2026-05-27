/**
 * DkZ Headbar — Einheitliche Header-Leiste für alle Module
 * @DKZ:RULES → R21, R12
 * @DKZ:TAG → [SYS:headbar] [CAT:shared] [LANG:js]
 * @version v1.00
 *
 * ═══════════════════════════════════════════════════════════════
 * LLM-ANWEISUNG:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  HEADBAR v1.00: Einheitliche 48px Headbar für ALLE Module  │
 * │                                                             │
 * │  MODI:                                                      │
 * │  - CORP: Im DkZ™ Ökosystem (☰ Hamburger, Brand, Copilot)  │
 * │  - SOLO: Standalone Einzeldatei (nur Modul-Header)          │
 * │                                                             │
 * │  Konfiguration per data-Attribute am <body>:                │
 * │  data-dkz-module="modul-pfad"                               │
 * │  data-dkz-appid="DKZ-WIS-001"                               │
 * │  data-dkz-version="v0.02"                                   │
 * │  data-dkz-title="Modul Titel"                               │
 * │  data-dkz-icon="📝"                                         │
 * │  data-dkz-separable="true|false"                            │
 * │                                                             │
 * │  API: DkzHeadbar.getMode(), DkzHeadbar.setMode('corp')      │
 * │  Einbindung: <script src="../../shared/dkz-headbar.js">     │
 * │  (vor </body>, NACH dkz-theme.css, VOR dkz-navbar.js)      │
 * └─────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // ═══ MODUS-ERKENNUNG ═══
    // Corp = im Ökosystem, Solo = standalone
    function detectMode() {
        // 1. Expliziter Meta-Tag
        const meta = document.querySelector('meta[name="dkz-mode"]');
        if (meta) {
            const val = meta.getAttribute('content');
            if (val === 'corp' || val === 'solo') return val;
        }

        // 2. Prüfe ob Navbar/PanelManager vorliegt (corp-Indikator)
        if (window.DkzPanelManager || document.getElementById('dkz-hamburger')) {
            return 'corp';
        }

        // 3. Prüfe URL — wenn in /modules/ Struktur → wahrscheinlich corp
        const path = window.location.pathname;
        if (path.includes('/01_dashboard/') || path.includes('/modules/')) {
            return 'corp';
        }

        // 4. Default: Solo (standalone)
        return 'solo';
    }

    // ═══ MODUL-CONFIG AUS BODY-ATTRIBUTEN ═══
    function getModuleConfig() {
        const body = document.body;
        return {
            module: body.getAttribute('data-dkz-module') || 'unknown',
            appId: body.getAttribute('data-dkz-appid') || '',
            version: body.getAttribute('data-dkz-version') || 'v0.01',
            title: body.getAttribute('data-dkz-title') || document.title.split('—')[0].split('–')[0].trim(),
            icon: body.getAttribute('data-dkz-icon') || '📦',
            separable: body.getAttribute('data-dkz-separable') !== 'false' // default: true
        };
    }

    // ═══ CSS INJECTION ═══
    function injectStyles() {
        if (document.getElementById('dkz-headbar-styles')) return;

        const style = document.createElement('style');
        style.id = 'dkz-headbar-styles';
        style.textContent = `
/* ═══ DkZ Headbar v1.00 ═══ */
#dkz-headbar {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: rgba(10, 10, 14, 0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(42, 42, 46, 0.6);
    font-family: 'Inter', sans-serif;
    box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
    user-select: none;
}

/* ─── Left Section ─── */
.dkz-hb-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    flex-shrink: 0;
}

/* Hamburger Slot — NUR im Corp-Modus sichtbar */
.dkz-hb-hamburger-slot {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.dkz-hb-hamburger-slot:empty { display: none; }

/* Brand */
.dkz-hb-brand {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 2px;
    font-family: 'JetBrains Mono', monospace;
    color: rgba(250, 30, 78, 0.65);
    white-space: nowrap;
    flex-shrink: 0;
}
.dkz-hb-brand b { color: rgba(250, 30, 78, 0.95); }
.dkz-hb-sep {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.06);
    flex-shrink: 0;
}

/* ─── Center Section ─── */
.dkz-hb-center {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    justify-content: flex-start;
    padding-left: 4px;
}

.dkz-hb-module-icon {
    font-size: 16px;
    flex-shrink: 0;
    line-height: 1;
}

.dkz-hb-module-title {
    font-size: 13px;
    font-weight: 700;
    color: #e8e8ec;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dkz-hb-version {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(85, 172, 238, 0.12);
    color: rgba(85, 172, 238, 0.8);
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    flex-shrink: 0;
}

.dkz-hb-appid {
    font-size: 8px;
    font-weight: 600;
    padding: 2px 5px;
    border-radius: 3px;
    background: rgba(168, 85, 247, 0.1);
    color: rgba(168, 85, 247, 0.6);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
}

.dkz-hb-mode-badge {
    font-size: 7px;
    font-weight: 800;
    padding: 2px 5px;
    border-radius: 3px;
    letter-spacing: 1px;
    font-family: 'JetBrains Mono', monospace;
    white-space: nowrap;
    flex-shrink: 0;
}
.dkz-hb-mode-badge.corp {
    background: rgba(0, 255, 136, 0.08);
    color: rgba(0, 255, 136, 0.5);
    border: 1px solid rgba(0, 255, 136, 0.1);
}
.dkz-hb-mode-badge.solo {
    background: rgba(255, 184, 0, 0.08);
    color: rgba(255, 184, 0, 0.5);
    border: 1px solid rgba(255, 184, 0, 0.1);
}

/* ─── Right Section ─── */
.dkz-hb-right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.dkz-hb-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    color: #a1a1aa;
    position: relative;
    flex-shrink: 0;
}
.dkz-hb-btn:hover {
    background: rgba(250, 30, 78, 0.08);
    border-color: rgba(250, 30, 78, 0.25);
    color: #f6f6f7;
    transform: translateY(-1px);
}
.dkz-hb-btn:active { transform: translateY(0); }

.dkz-hb-btn.copilot-btn {
    background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08));
    border-color: rgba(59,130,246,0.15);
}
.dkz-hb-btn.copilot-btn:hover {
    background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.15));
    border-color: rgba(59,130,246,0.35);
    box-shadow: 0 0 12px rgba(59,130,246,0.1);
}

.dkz-hb-btn .hb-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fa1e4e;
    border: 1.5px solid rgba(10,10,14,0.95);
}

/* Ampel-Dot im Header */
.dkz-hb-ampel {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-left: 4px;
}
.dkz-hb-ampel.green { background: #00ff88; box-shadow: 0 0 6px rgba(0,255,136,0.4); }
.dkz-hb-ampel.yellow { background: #ffb800; box-shadow: 0 0 6px rgba(255,184,0,0.4); }
.dkz-hb-ampel.red { background: #ff3b5c; box-shadow: 0 0 6px rgba(255,59,92,0.4); }

/* ─── Solo-Mode Adjustments ─── */
#dkz-headbar.solo .dkz-hb-brand,
#dkz-headbar.solo .dkz-hb-sep,
#dkz-headbar.solo .dkz-hb-appid,
#dkz-headbar.solo .dkz-hb-ampel,
#dkz-headbar.solo .copilot-btn,
#dkz-headbar.solo .dkz-hb-hamburger-slot {
    display: none !important;
}

#dkz-headbar.solo {
    background: rgba(14, 14, 18, 0.95);
    border-bottom-color: rgba(250, 30, 78, 0.12);
}

#dkz-headbar.solo .dkz-hb-module-title {
    font-size: 14px;
    font-weight: 800;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
    .dkz-hb-brand { display: none; }
    .dkz-hb-sep { display: none; }
    .dkz-hb-appid { display: none; }
    .dkz-hb-mode-badge { display: none; }
    .dkz-hb-module-title { font-size: 12px; }
    #dkz-headbar { padding: 0 8px; }
}

@media (max-width: 480px) {
    .dkz-hb-version { display: none; }
}

/* ─── Headbar body padding ─── */
body.dkz-has-headbar {
    /* Module die bereits ein eigenes <header> hatten,
       müssen ggf. padding-top anpassen */
}
`;
        document.head.appendChild(style);
    }

    // ═══ HEADBAR RENDERING ═══
    function renderHeadbar(mode, config) {
        // Nicht doppelt rendern
        if (document.getElementById('dkz-headbar')) return;

        const headbar = document.createElement('div');
        headbar.id = 'dkz-headbar';
        headbar.className = mode;
        headbar.setAttribute('data-mode', mode);

        // === LEFT ===
        const left = document.createElement('div');
        left.className = 'dkz-hb-left';

        // Hamburger Slot (Corp only — wird von dkz-navbar.js befüllt oder eigenständig)
        if (mode === 'corp') {
            const hamburgerSlot = document.createElement('div');
            hamburgerSlot.className = 'dkz-hb-hamburger-slot';
            hamburgerSlot.id = 'dkz-hb-hamburger-slot';

            // Falls dkz-navbar.js noch nicht geladen → eigenen Mini-Hamburger zeigen
            // Navbar verschiebt seinen Hamburger hierhin wenn sie lädt
            if (!document.getElementById('dkz-hamburger')) {
                hamburgerSlot.innerHTML = `
                    <button id="dkz-hb-hamburger-temp" style="
                        width:30px;height:30px;border:1px solid rgba(250,30,78,0.15);
                        border-radius:8px;background:rgba(250,30,78,0.04);cursor:pointer;
                        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
                    ">
                        <span style="display:block;width:14px;height:1.5px;background:#fa1e4e;border-radius:2px;"></span>
                        <span style="display:block;width:14px;height:1.5px;background:#fa1e4e;border-radius:2px;"></span>
                        <span style="display:block;width:14px;height:1.5px;background:#fa1e4e;border-radius:2px;"></span>
                    </button>`;
            }
            left.appendChild(hamburgerSlot);

            // Brand
            const brand = document.createElement('div');
            brand.className = 'dkz-hb-brand';
            brand.innerHTML = '<b>DEV</b>KiTZ<sup style="font-size:7px;vertical-align:super;margin-left:-1px;letter-spacing:0;opacity:0.7">\u2122</sup>';
            left.appendChild(brand);

            // Separator
            const sep = document.createElement('div');
            sep.className = 'dkz-hb-sep';
            left.appendChild(sep);
        }

        headbar.appendChild(left);

        // === CENTER ===
        const center = document.createElement('div');
        center.className = 'dkz-hb-center';

        // Modul-Icon
        const iconEl = document.createElement('span');
        iconEl.className = 'dkz-hb-module-icon';
        iconEl.textContent = config.icon;
        center.appendChild(iconEl);

        // Modul-Titel
        const titleEl = document.createElement('span');
        titleEl.className = 'dkz-hb-module-title';
        titleEl.textContent = config.title;
        center.appendChild(titleEl);

        // Version Badge
        const versionEl = document.createElement('span');
        versionEl.className = 'dkz-hb-version';
        versionEl.textContent = config.version;
        center.appendChild(versionEl);

        // App-ID Badge (Corp only)
        if (mode === 'corp' && config.appId) {
            const appIdEl = document.createElement('span');
            appIdEl.className = 'dkz-hb-appid';
            appIdEl.textContent = config.appId;
            center.appendChild(appIdEl);
        }

        // Mode Badge
        const modeBadge = document.createElement('span');
        modeBadge.className = 'dkz-hb-mode-badge ' + mode;
        modeBadge.textContent = mode === 'corp' ? 'CORP' : 'SOLO';
        center.appendChild(modeBadge);

        headbar.appendChild(center);

        // === RIGHT ===
        const right = document.createElement('div');
        right.className = 'dkz-hb-right';

        // Copilot Button (Corp only)
        if (mode === 'corp') {
            const copilotBtn = document.createElement('button');
            copilotBtn.className = 'dkz-hb-btn copilot-btn';
            copilotBtn.title = 'DkZ Copilot™';
            copilotBtn.innerHTML = '🧠';
            copilotBtn.onclick = function () {
                if (typeof DkzCopilot !== 'undefined' && DkzCopilot.toggle) {
                    DkzCopilot.toggle();
                } else {
                    console.log('[DkzHeadbar] Copilot nicht verfügbar');
                }
            };
            right.appendChild(copilotBtn);
        }

        // Settings Button
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'dkz-hb-btn';
        settingsBtn.title = 'Einstellungen';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.onclick = function () {
            // Zum Settings-Modul navigieren — Pfaderkennung analog dkz-copilot.js
            var p = window.location.pathname;
            var href = 'modules/settings/index.html';
            if (p.includes('/modules/')) href = '../settings/index.html';
            else if (p.includes('/landing-pages/') || p.includes('/hub/') || p.includes('/mainboard/')) href = '../modules/settings/index.html';
            else if (p.includes('/10_wiki-hub/') || p.includes('/04_flyer_engine/')) href = '../01_dashboard/modules/settings/index.html';
            else if (p.includes('/08_aiaikirk/wiki/dashboards/')) href = '../../../../01_dashboard/modules/settings/index.html';
            else if (p.includes('/08_aiaikirk/wiki/')) href = '../../../01_dashboard/modules/settings/index.html';
            else if (p.includes('/09_autopilot/dashboard/')) href = '../../../01_dashboard/modules/settings/index.html';
            else if (p.includes('/09_autopilot/')) href = '../../01_dashboard/modules/settings/index.html';
            window.location.href = href;
        };
        right.appendChild(settingsBtn);

        // Notes Button
        const notesBtn = document.createElement('button');
        notesBtn.className = 'dkz-hb-btn';
        notesBtn.id = 'dkz-hb-notes-btn';
        notesBtn.title = 'Notizen';
        notesBtn.innerHTML = '📋';
        notesBtn.onclick = function () {
            if (typeof DkzNotes !== 'undefined' && DkzNotes.toggle) {
                DkzNotes.toggle();
            } else {
                console.log('[DkzHeadbar] Notes nicht verfügbar');
            }
        };
        // Badge für offene Notes
        if (typeof DkzNotes !== 'undefined') {
            const count = DkzNotes.count ? DkzNotes.count() : 0;
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'hb-badge';
                notesBtn.appendChild(badge);
            }
        }
        right.appendChild(notesBtn);

        // Ampel-Dot (Corp only)
        if (mode === 'corp') {
            const ampel = document.createElement('div');
            ampel.className = 'dkz-hb-ampel green';
            ampel.id = 'dkz-hb-ampel';
            ampel.title = 'System: OK';
            right.appendChild(ampel);
        }

        headbar.appendChild(right);

        // === INSERT ===
        // Headbar wird als ERSTES Element im Body eingefügt
        document.body.insertBefore(headbar, document.body.firstChild);
        document.body.classList.add('dkz-has-headbar');

        // Existierende in-page <header> ausblenden wenn vorhanden
        hideExistingHeaders();

        return headbar;
    }

    // ═══ EXISTIERENDE HEADER AUSBLENDEN ═══
    function hideExistingHeaders() {
        // Suche nach modul-eigenen <header> Elementen (nicht unsere Headbar)
        const headers = document.querySelectorAll('header, .header, [class*="header"]');
        headers.forEach(function (el) {
            if (el.id === 'dkz-headbar') return; // Unsere Headbar nicht verstecken
            if (el.closest('#dkz-headbar')) return; // Kinder unserer Headbar nicht verstecken
            if (el.id && el.id.startsWith('dkz-')) return; // Andere DkZ-Elemente nicht verstecken

            // Prüfe ob das Element ein Top-Level Header ist (nicht tief verschachtelt)
            const rect = el.getBoundingClientRect();
            if (rect.top < 100 && rect.height > 30 && rect.height < 120) {
                el.style.display = 'none';
                el.setAttribute('data-dkz-hidden-header', 'true');
            }
        });
    }

    // ═══ NAVBAR INTEGRATION ═══
    // Wenn dkz-navbar.js geladen wird, verschiebt es seinen Hamburger in unseren Slot
    function integrateNavbar() {
        const existingHamburger = document.getElementById('dkz-hamburger');
        const slot = document.getElementById('dkz-hb-hamburger-slot');

        if (existingHamburger && slot) {
            // Temp-Hamburger entfernen
            const temp = document.getElementById('dkz-hb-hamburger-temp');
            if (temp) temp.remove();

            // Navbar-Hamburger in unseren Slot verschieben
            // Navbar positioniert ihn jetzt nicht mehr fixed — wir kontrollieren die Position
            existingHamburger.style.position = 'static';
            existingHamburger.style.zIndex = 'auto';
            slot.appendChild(existingHamburger);
        }
    }

    // ═══ PUBLIC API ═══
    const DkzHeadbar = {
        _mode: null,
        _config: null,

        init: function () {
            this._mode = detectMode();
            this._config = getModuleConfig();

            injectStyles();
            renderHeadbar(this._mode, this._config);

            // Navbar-Integration nach kurzer Verzögerung
            // (dkz-navbar.js lädt ggf. asynchron)
            setTimeout(function () { integrateNavbar(); }, 100);
            setTimeout(function () { integrateNavbar(); }, 500);

            console.log('[DkzHeadbar] v1.00 — Mode: ' + this._mode +
                ' | Module: ' + this._config.title +
                ' | App-ID: ' + (this._config.appId || 'N/A') +
                ' | Separable: ' + this._config.separable);

            return this;
        },

        getMode: function () { return this._mode; },

        setMode: function (mode) {
            if (mode !== 'corp' && mode !== 'solo') return;
            this._mode = mode;
            const headbar = document.getElementById('dkz-headbar');
            if (headbar) {
                headbar.remove();
                document.body.classList.remove('dkz-has-headbar');
            }
            renderHeadbar(mode, this._config);
            if (mode === 'corp') {
                setTimeout(integrateNavbar, 200);
            }
        },

        getConfig: function () { return this._config; },

        isCorp: function () { return this._mode === 'corp'; },
        isSolo: function () { return this._mode === 'solo'; },
        isSeparable: function () { return this._config.separable; },

        // Ampel-Status setzen
        setAmpel: function (status) {
            const ampel = document.getElementById('dkz-hb-ampel');
            if (!ampel) return;
            ampel.className = 'dkz-hb-ampel ' + status;
            const labels = { green: 'System: OK', yellow: 'System: Degradiert', red: 'System: Offline' };
            ampel.title = labels[status] || 'Unbekannt';
        },

        // Notes-Badge aktualisieren
        updateNotesBadge: function (hasNotes) {
            const btn = document.getElementById('dkz-hb-notes-btn');
            if (!btn) return;
            let badge = btn.querySelector('.hb-badge');
            if (hasNotes && !badge) {
                badge = document.createElement('span');
                badge.className = 'hb-badge';
                btn.appendChild(badge);
            } else if (!hasNotes && badge) {
                badge.remove();
            }
        },

        // Für Navbar-Integration: Hamburger neu einsetzen
        adoptHamburger: function () {
            integrateNavbar();
        }
    };

    // Global verfügbar machen
    window.DkzHeadbar = DkzHeadbar;

    // Auto-Init bei DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { DkzHeadbar.init(); });
    } else {
        DkzHeadbar.init();
    }

})();
