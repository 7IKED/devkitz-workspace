/**
 * DkZ Smart UI — Automatische UX-Verbesserungen für alle Module
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:smart-ui] [CAT:shared] [LANG:js]
 * @version v1.0.0
 *
 * Einbinden: <script src="../../shared/dkz-smart-ui.js"></script>
 *
 * Features:
 * 1. Auto-Close Popups (5s oder Scroll)
 * 2. Breadcrumbs (auto-generiert aus URL)
 * 3. Next-Step Indicator (pulsierender Pfeil)
 * 4. Auto-Zurück-Buttons (wenn referrer vorhanden)
 * 5. Toast-Notifications (statt Alerts)
 * 6. Kinder-Modus (vereinfachte Sprache, größere Buttons)
 * 7. Multi-Page Workflow Links
 * 8. Auto-Closing Windows mit Next-Step Anzeige
 */
const DkzSmartUI = (() => {
    'use strict';
    const VERSION = 'v1.0.0';
    const KIDS_KEY = 'dkz-kids-mode';
    let _toastContainer = null;
    let _breadcrumbEl = null;

    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    // ═══════════════════════════════════════
    // 1. AUTO-CLOSE POPUPS
    // ═══════════════════════════════════════
    function _initAutoClose() {
        // Auto-close DkzGuide info popups after 6s
        const observer = new MutationObserver(mutations => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('show') && node.classList.contains('dkz-info-popup')) {
                        setTimeout(() => { node.classList.remove('show'); }, 6000);
                    }
                });
            });
        });
        observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

        // Close popups on scroll
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                document.querySelectorAll('.dkz-info-popup.show').forEach(p => p.classList.remove('show'));
            }, 200);
        }, { passive: true });
    }

    // ═══════════════════════════════════════
    // 2. BREADCRUMBS
    // ═══════════════════════════════════════
    function _initBreadcrumbs() {
        const path = location.pathname.replace(/\\/g, '/');
        const parts = path.split('/').filter(Boolean);
        if (parts.length < 2) return;

        // Find insertion point
        const header = document.querySelector('.header, .dkz-header, header, [role="banner"]');
        if (!header) return;

        _breadcrumbEl = document.createElement('nav');
        _breadcrumbEl.className = 'dkz-breadcrumb';
        _breadcrumbEl.setAttribute('aria-label', 'Breadcrumb Navigation');
        _breadcrumbEl.style.cssText = 'padding:6px 16px;font-size:11px;color:rgba(255,255,255,.3);display:flex;gap:4px;align-items:center;flex-wrap:wrap;';

        let crumbs = [];
        // Build breadcrumb trail
        const moduleIdx = parts.findIndex(p => p === 'modules');
        if (moduleIdx >= 0) {
            crumbs.push({ label: '🏠 Dashboard', href: '../../index.html' });
            if (parts[moduleIdx + 1]) {
                crumbs.push({ label: '📂 ' + parts[moduleIdx + 1].replace(/-/g, ' '), href: null });
            }
        } else {
            crumbs.push({ label: '🏠 Home', href: '../index.html' });
            const last = parts[parts.length - 1].replace('.html', '').replace(/-/g, ' ');
            if (last !== 'index') crumbs.push({ label: last, href: null });
        }

        _breadcrumbEl.innerHTML = crumbs.map((c, i) => {
            if (i < crumbs.length - 1) {
                return `<a href="${_esc(c.href || '#')}" style="color:rgba(255,255,255,.4);text-decoration:none;transition:.2s" onmouseenter="this.style.color='#00ff88'" onmouseleave="this.style.color='rgba(255,255,255,.4)'">${c.label}</a><span style="color:rgba(255,255,255,.15)">›</span>`;
            }
            return `<span style="color:#a1a1aa;font-weight:600">${_esc(c.label)}</span>`;
        }).join('');

        header.insertAdjacentElement('afterend', _breadcrumbEl);
    }

    // ═══════════════════════════════════════
    // 3. NEXT-STEP INDICATOR
    // ═══════════════════════════════════════
    function showNextStep(targetSelector, text) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        const indicator = document.createElement('div');
        indicator.className = 'dkz-next-step';
        indicator.style.cssText = 'position:absolute;z-index:9000;display:flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.25);border-radius:20px;font-size:11px;font-weight:600;color:#00ff88;animation:dkzPulse 2s ease-in-out infinite;pointer-events:none;font-family:Inter,sans-serif;white-space:nowrap;';
        indicator.innerHTML = '→ ' + _esc(text || 'Nächster Schritt');

        target.style.position = target.style.position || 'relative';
        target.appendChild(indicator);

        // Auto-remove after 8s
        setTimeout(() => { indicator.remove(); }, 8000);
    }

    // ═══════════════════════════════════════
    // 4. AUTO-ZURÜCK-BUTTONS
    // ═══════════════════════════════════════
    function _initBackButton() {
        // Only add if no back button exists
        if (document.querySelector('[class*="back"], a[href*=".."]')) return;

        const referrer = document.referrer;
        if (!referrer) return;

        const btn = document.createElement('a');
        btn.href = referrer;
        btn.className = 'dkz-auto-back';
        btn.style.cssText = 'position:fixed;top:16px;left:16px;z-index:800;display:flex;align-items:center;gap:4px;padding:6px 14px;background:rgba(10,10,10,.8);border:1px solid rgba(255,255,255,.08);border-radius:20px;color:rgba(255,255,255,.5);font-size:11px;font-weight:600;text-decoration:none;font-family:Inter,sans-serif;backdrop-filter:blur(16px);transition:all .3s;';
        btn.innerHTML = '← Zurück';
        btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'rgba(0,255,136,.3)'; btn.style.color = '#00ff88'; });
        btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'rgba(255,255,255,.08)'; btn.style.color = 'rgba(255,255,255,.5)'; });
        document.body.appendChild(btn);
    }

    // ═══════════════════════════════════════
    // 5. TOAST NOTIFICATIONS
    // ═══════════════════════════════════════
    function _initToastContainer() {
        if (_toastContainer) return;
        _toastContainer = document.createElement('div');
        _toastContainer.id = 'dkz-toast-container';
        _toastContainer.style.cssText = 'position:fixed;top:16px;right:16px;z-index:10010;display:flex;flex-direction:column;gap:8px;pointer-events:none;max-width:360px;';
        document.body.appendChild(_toastContainer);
    }

    function toast(message, type, duration) {
        _initToastContainer();
        type = type || 'info';
        duration = duration || 4000;

        const colors = { success: '#00ff88', error: '#fa1e4e', warn: '#eab308', info: '#55ACEE' };
        const icons = { success: '✅', error: '❌', warn: '⚠️', info: 'ℹ️' };
        const color = colors[type] || colors.info;
        const icon = icons[type] || icons.info;

        const el = document.createElement('div');
        el.style.cssText = `pointer-events:auto;padding:10px 16px;background:rgba(10,10,10,.95);border:1px solid ${color}40;border-left:3px solid ${color};border-radius:10px;color:#f6f6f7;font-size:12px;font-family:Inter,sans-serif;display:flex;align-items:center;gap:8px;backdrop-filter:blur(16px);box-shadow:0 8px 30px rgba(0,0,0,.4);animation:nbSlideUp .3s ease;cursor:pointer;`;
        el.innerHTML = `<span style="font-size:14px">${icon}</span><span>${_esc(message)}</span>`;
        el.addEventListener('click', () => el.remove());

        _toastContainer.appendChild(el);
        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(20px)';
            el.style.transition = 'all .3s';
            setTimeout(() => el.remove(), 300);
        }, duration);
    }

    // Override window.alert with toast
    const _origAlert = window.alert;
    window.alert = function(msg) {
        toast(msg, 'info', 5000);
    };

    // ═══════════════════════════════════════
    // 6. KINDER-MODUS
    // ═══════════════════════════════════════
    function isKidsMode() {
        return localStorage.getItem(KIDS_KEY) === 'true';
    }

    function setKidsMode(enabled) {
        localStorage.setItem(KIDS_KEY, enabled ? 'true' : 'false');
        _applyKidsMode();
    }

    function _applyKidsMode() {
        if (!isKidsMode()) {
            document.body.classList.remove('dkz-kids-mode');
            return;
        }
        document.body.classList.add('dkz-kids-mode');

        // Inject kids mode styles
        if (!document.getElementById('dkz-kids-styles')) {
            const s = document.createElement('style');
            s.id = 'dkz-kids-styles';
            s.textContent = `
.dkz-kids-mode { font-size: 16px !important; }
.dkz-kids-mode button, .dkz-kids-mode a, .dkz-kids-mode [role="button"] {
    min-height: 48px !important; min-width: 48px !important; font-size: 14px !important;
    padding: 10px 20px !important;
}
.dkz-kids-mode .dkz-info-popup, .dkz-kids-mode .dkz-tour-text {
    font-size: 14px !important; line-height: 1.8 !important;
}
.dkz-kids-mode h1, .dkz-kids-mode h2, .dkz-kids-mode h3 {
    font-size: 1.4em !important;
}
`;
            document.head.appendChild(s);
        }
    }

    // ═══════════════════════════════════════
    // 7. AUTO-CLOSING WINDOWS + NEXT STEP
    // ═══════════════════════════════════════
    function showAutoCloseDialog(title, message, nextAction, duration) {
        duration = duration || 5000;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(14,14,22,.97);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.5);font-family:Inter,sans-serif;text-align:center;animation:nbSlideUp .3s ease;';

        const secs = Math.ceil(duration / 1000);
        card.innerHTML = `
            <div style="font-size:28px;margin-bottom:8px">✅</div>
            <div style="font-size:16px;font-weight:800;color:#f6f6f7;margin-bottom:6px">${_esc(title)}</div>
            <div style="font-size:12px;color:#a1a1aa;margin-bottom:12px;line-height:1.6">${_esc(message)}</div>
            <div style="height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;margin-bottom:12px">
                <div id="dkz-ac-bar" style="height:100%;width:100%;background:#00ff88;border-radius:2px;transition:width ${duration}ms linear"></div>
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,.3)">Schließt automatisch in <span id="dkz-ac-timer">${secs}</span>s</div>
            ${nextAction ? '<button onclick="this.closest(\'div[style*=fixed]\').remove();(' + nextAction + ')()" style="margin-top:12px;padding:8px 20px;background:linear-gradient(135deg,#00ff88,#06b6d4);border:none;border-radius:8px;color:#000;font-weight:700;font-size:12px;cursor:pointer;font-family:inherit">→ Weiter</button>' : ''}
        `;

        overlay.appendChild(card);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);

        // Animate progress bar
        requestAnimationFrame(() => {
            const bar = document.getElementById('dkz-ac-bar');
            if (bar) bar.style.width = '0%';
        });

        // Countdown timer
        let remaining = secs;
        const interval = setInterval(() => {
            remaining--;
            const timerEl = document.getElementById('dkz-ac-timer');
            if (timerEl) timerEl.textContent = remaining;
            if (remaining <= 0) { clearInterval(interval); overlay.remove(); }
        }, 1000);
    }

    // ═══════════════════════════════════════
    // 8. WORKFLOW LINKS (Multi-Page)
    // ═══════════════════════════════════════
    function addWorkflowLinks(containerId, steps) {
        const container = document.getElementById(containerId);
        if (!container || !steps || steps.length < 2) return;

        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;gap:4px;padding:10px 0;flex-wrap:wrap;align-items:center;';

        steps.forEach((step, i) => {
            const isCurrent = step.current;
            const link = document.createElement(isCurrent ? 'span' : 'a');
            if (!isCurrent) link.href = step.href || '#';
            link.style.cssText = `display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:8px;font-size:10px;font-weight:600;font-family:Inter,sans-serif;text-decoration:none;transition:.2s;${isCurrent ? 'background:rgba(0,255,136,.1);color:#00ff88;border:1px solid rgba(0,255,136,.2)' : 'background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.06)'}`;
            link.innerHTML = `<span style="font-size:8px;background:rgba(255,255,255,.1);padding:2px 6px;border-radius:4px">${i + 1}</span> ${_esc(step.label)}`;
            if (!isCurrent) {
                link.addEventListener('mouseenter', () => { link.style.borderColor = 'rgba(85,172,238,.3)'; link.style.color = '#55ACEE'; });
                link.addEventListener('mouseleave', () => { link.style.borderColor = 'rgba(255,255,255,.06)'; link.style.color = 'rgba(255,255,255,.4)'; });
            }
            bar.appendChild(link);
            if (i < steps.length - 1) {
                const sep = document.createElement('span');
                sep.textContent = '→';
                sep.style.cssText = 'color:rgba(255,255,255,.15);font-size:10px;';
                bar.appendChild(sep);
            }
        });

        container.appendChild(bar);
    }

    // ═══ INIT ═══
    function _init() {
        const run = () => {
            _initAutoClose();
            _initBreadcrumbs();
            _initBackButton();
            _applyKidsMode();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    }

    _init();

    return {
        VERSION,
        toast,
        showNextStep,
        showAutoCloseDialog,
        addWorkflowLinks,
        setKidsMode,
        isKidsMode,
    };
})();

if (typeof window !== 'undefined') window.DkzSmartUI = DkzSmartUI;
