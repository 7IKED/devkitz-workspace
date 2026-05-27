/* ============================================================
   DkZ Info Popup System — Universal Component
   Include via <script src="dkz-info-popup.js"></script>
   ============================================================
   
   Usage:
     <span data-info="Tooltip text here">Label</span>
     <button data-info="Click for info">...</button>
     
   Or programmatically:
     DkZ.info('Title', 'Message text');
     DkZ.toast('Saved!', 'success');
     DkZ.toast('Error!', 'error');
   ============================================================ */

(function () {
    'use strict';

    // ── Inject Styles ────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
    /* DkZ Info Popup Tooltip */
    .dkz-tooltip {
      position: fixed;
      z-index: 99999;
      max-width: 320px;
      padding: 12px 16px;
      background: rgba(20, 20, 35, 0.95);
      border: 1px solid rgba(250, 30, 78, 0.25);
      border-radius: 10px;
      color: #e8e8f0;
      font-size: 12.5px;
      line-height: 1.5;
      font-family: 'Inter', -apple-system, sans-serif;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(250,30,78,0.1);
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .dkz-tooltip.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .dkz-tooltip::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #fa1e4e, #ff4d7a);
      border-radius: 10px 10px 0 0;
    }
    .dkz-tooltip .tip-icon {
      color: #fa1e4e;
      margin-right: 6px;
    }

    /* DkZ Info Modal */
    .dkz-info-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: dkzFadeIn 0.2s ease;
    }
    .dkz-info-modal {
      background: #16161a;
      border: 1px solid rgba(250,30,78,0.2);
      border-radius: 16px;
      width: 440px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      animation: dkzSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(250,30,78,0.08);
    }
    .dkz-info-modal::before {
      content: '';
      display: block;
      height: 3px;
      background: linear-gradient(90deg, #fa1e4e, #ff4d7a, #fa1e4e);
      border-radius: 16px 16px 0 0;
      animation: dkzGlowLine 3s ease-in-out infinite;
    }
    @keyframes dkzGlowLine {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    .dkz-info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 22px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .dkz-info-header h3 {
      font-size: 15px;
      font-weight: 700;
      color: #e8e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dkz-info-header h3::before {
      content: 'ℹ️';
    }
    .dkz-info-close {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      cursor: pointer;
      color: #6a6a80;
      background: none;
      border: none;
      font-size: 16px;
      transition: all 0.15s;
    }
    .dkz-info-close:hover {
      background: rgba(255,255,255,0.06);
      color: #e8e8f0;
    }
    .dkz-info-body {
      padding: 20px 22px;
      font-size: 13.5px;
      line-height: 1.7;
      color: #a0a0b8;
    }
    .dkz-info-body strong {
      color: #fa1e4e;
    }
    .dkz-info-footer {
      padding: 14px 22px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      justify-content: flex-end;
    }
    .dkz-info-ok {
      padding: 8px 20px;
      background: linear-gradient(135deg, #fa1e4e, #ff4d7a);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .dkz-info-ok:hover {
      opacity: 0.9;
      box-shadow: 0 0 20px rgba(250,30,78,0.25);
    }

    /* DkZ Toast */
    .dkz-toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100001;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .dkz-toast {
      padding: 14px 20px;
      background: rgba(22,22,26,0.95);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      min-width: 280px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      animation: dkzToastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .dkz-toast.out {
      animation: dkzToastOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    .dkz-toast .toast-icon { font-size: 18px; }
    .dkz-toast.success { border-left: 3px solid #00e676; }
    .dkz-toast.success .toast-icon { color: #00e676; }
    .dkz-toast.error { border-left: 3px solid #ef4444; }
    .dkz-toast.error .toast-icon { color: #ef4444; }
    .dkz-toast.info { border-left: 3px solid #fa1e4e; }
    .dkz-toast.info .toast-icon { color: #fa1e4e; }
    .dkz-toast.warning { border-left: 3px solid #ffab40; }
    .dkz-toast.warning .toast-icon { color: #ffab40; }
    .dkz-toast .toast-text {
      font-size: 13px;
      font-weight: 500;
      color: #e8e8f0;
    }

    /* data-info indicator */
    [data-info] {
      position: relative;
      cursor: help;
    }
    [data-info]::after {
      content: 'ⓘ';
      margin-left: 4px;
      font-size: 11px;
      color: #fa1e4e;
      opacity: 0.6;
      transition: opacity 0.15s;
    }
    [data-info]:hover::after {
      opacity: 1;
    }

    /* Animations */
    @keyframes dkzFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes dkzSlideIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes dkzToastIn {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes dkzToastOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(40px); }
    }

    /* Glow/Pulse accent lines */
    .dkz-accent-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, #fa1e4e, transparent);
      animation: dkzPulseLine 3s ease-in-out infinite;
    }
    @keyframes dkzPulseLine {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.8; }
    }
  `;
    document.head.appendChild(style);

    // ── Toast Container ────────────────────────────────────────
    let toastContainer = null;
    function ensureToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'dkz-toast-container';
            document.body.appendChild(toastContainer);
        }
    }

    // ── Tooltip ────────────────────────────────────────────────
    let tooltip = null;
    function ensureTooltip() {
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'dkz-tooltip';
            document.body.appendChild(tooltip);
        }
    }

    function showTooltip(el) {
        ensureTooltip();
        const text = el.getAttribute('data-info');
        if (!text) return;
        tooltip.innerHTML = '<span class="tip-icon">ℹ️</span> ' + text;
        tooltip.classList.add('visible');

        const rect = el.getBoundingClientRect();
        let top = rect.bottom + 8;
        let left = rect.left + rect.width / 2;

        // Position
        tooltip.style.left = Math.max(10, Math.min(left - 160, window.innerWidth - 340)) + 'px';
        tooltip.style.top = top + 'px';

        // Flip if bottom overflow
        if (top + 100 > window.innerHeight) {
            tooltip.style.top = (rect.top - 60) + 'px';
        }
    }

    function hideTooltip() {
        if (tooltip) tooltip.classList.remove('visible');
    }

    // ── Event Delegation for [data-info] ───────────────────────
    document.addEventListener('mouseenter', function (e) {
        const el = e.target.closest('[data-info]');
        if (el) showTooltip(el);
    }, true);

    document.addEventListener('mouseleave', function (e) {
        const el = e.target.closest('[data-info]');
        if (el) hideTooltip();
    }, true);

    // ── Global API ─────────────────────────────────────────────
    window.DkZ = window.DkZ || {};

    // DkZ.info(title, message) — shows modal popup
    window.DkZ.info = function (title, message) {
        const overlay = document.createElement('div');
        overlay.className = 'dkz-info-overlay';
        overlay.innerHTML = `
      <div class="dkz-info-modal">
        <div class="dkz-info-header">
          <h3>${title}</h3>
          <button class="dkz-info-close">&times;</button>
        </div>
        <div class="dkz-info-body">${message}</div>
        <div class="dkz-info-footer">
          <button class="dkz-info-ok">OK</button>
        </div>
      </div>
    `;

        const close = () => overlay.remove();
        overlay.querySelector('.dkz-info-close').onclick = close;
        overlay.querySelector('.dkz-info-ok').onclick = close;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
        });
        document.body.appendChild(overlay);
    };

    // DkZ.toast(message, type) — shows toast notification
    window.DkZ.toast = function (message, type) {
        ensureToastContainer();
        type = type || 'info';
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        const toast = document.createElement('div');
        toast.className = 'dkz-toast ' + type;
        toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('out');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    // DkZ.confirm(title, message, callback) — confirm dialog
    window.DkZ.confirm = function (title, message, callback) {
        const overlay = document.createElement('div');
        overlay.className = 'dkz-info-overlay';
        overlay.innerHTML = `
      <div class="dkz-info-modal">
        <div class="dkz-info-header">
          <h3>${title}</h3>
          <button class="dkz-info-close">&times;</button>
        </div>
        <div class="dkz-info-body">${message}</div>
        <div class="dkz-info-footer" style="gap:8px">
          <button class="dkz-info-ok" style="background:rgba(255,255,255,0.06);color:#a0a0b8" data-action="cancel">Abbrechen</button>
          <button class="dkz-info-ok" data-action="confirm">Bestätigen</button>
        </div>
      </div>
    `;

        const close = (result) => { overlay.remove(); if (callback) callback(result); };
        overlay.querySelector('.dkz-info-close').onclick = () => close(false);
        overlay.querySelector('[data-action="cancel"]').onclick = () => close(false);
        overlay.querySelector('[data-action="confirm"]').onclick = () => close(true);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
        document.body.appendChild(overlay);
    };

    console.log('%c[DkZ] Info Popup System loaded', 'color: #fa1e4e; font-weight: bold');
})();
