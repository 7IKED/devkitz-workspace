/**
 * DkZ A11y — Accessibility Enhancements
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:a11y] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Auto-injects: Skip-Link, ARIA labels, Focus-Trap, Screen-Reader announcements
 */
const DkzA11y = (() => {
    'use strict';
    const VERSION = 'v0.01.1_01';

    // ═══ Skip-to-Content Link ═══
    function _addSkipLink() {
        const content = document.querySelector('.content, main, [role="main"]');
        if (!content) return;
        if (!content.id) content.id = 'main-content';

        const skip = document.createElement('a');
        skip.href = '#' + content.id;
        skip.className = 'skip-link';
        skip.textContent = '⏭ Zum Inhalt springen';
        document.body.prepend(skip);
    }

    // ═══ Auto ARIA Labels ═══
    function _addAriaLabels() {
        // Buttons without aria-label
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            const text = btn.textContent.trim();
            if (text && text.length < 50) btn.setAttribute('aria-label', text);
        });
        // Links without aria-label
        document.querySelectorAll('a:not([aria-label])').forEach(a => {
            const text = a.textContent.trim() || a.title;
            if (text && text.length < 50) a.setAttribute('aria-label', text);
        });
        // Inputs without labels
        document.querySelectorAll('input:not([aria-label]):not([id])').forEach(input => {
            const ph = input.placeholder;
            if (ph) input.setAttribute('aria-label', ph);
        });
        // Role landmarks
        const header = document.querySelector('.header, .dkz-header');
        if (header && !header.getAttribute('role')) header.setAttribute('role', 'banner');
        const content = document.querySelector('.content');
        if (content && !content.getAttribute('role')) content.setAttribute('role', 'main');
    }

    // ═══ Focus Trap for Modals ═══
    function trapFocus(container) {
        const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        container.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
        first.focus();
    }

    // ═══ Screen Reader Announce ═══
    let _liveRegion = null;
    function announce(message, priority) {
        if (!_liveRegion) {
            _liveRegion = document.createElement('div');
            _liveRegion.setAttribute('role', 'status');
            _liveRegion.setAttribute('aria-live', priority || 'polite');
            _liveRegion.setAttribute('aria-atomic', 'true');
            _liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
            document.body.appendChild(_liveRegion);
        }
        _liveRegion.textContent = '';
        setTimeout(() => { _liveRegion.textContent = message; }, 50);
    }

    // ═══ Patch showToast for SR ═══
    const _origToast = window.showToast;
    if (typeof _origToast === 'function') {
        window.showToast = function (msg) {
            _origToast(msg);
            announce(msg.replace(/[^\w\s]/g, ''));
        };
    }

    // ═══ Init ═══
    function _init() {
        _addSkipLink();
        _addAriaLabels();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
    else _init();

    return { trapFocus, announce, VERSION };
})();

if (typeof module !== 'undefined') module.exports = DkzA11y;
