/**
 * DkZ™ Toast System v1.0
 * @DKZ:RULES → R21 Shared Scripts, R1 XSS-Schutz
 * @version v0.01.1_01
 *
 * Glassmorphism Toast-Benachrichtigungen fuer das gesamte Oekosystem.
 * 4 Typen: success (gruen), info (blau), warn (gelb), error (rot)
 * Stacking oben rechts, Auto-Dismiss, Sound bei Error.
 *
 * API:
 *   DkzToast.show(message, type, options)
 *   DkzToast.success(message)
 *   DkzToast.info(message)
 *   DkzToast.warn(message)
 *   DkzToast.error(message)
 *   DkzToast.clear()
 *
 * Einbindung: <script src="../../shared/dkz-toast.js"></script>
 */
(function () {
    'use strict';

    if (window.DkzToast) return;

    /* ═══════════════════════════════════════════════════
     * XSS Helper
     * ═══════════════════════════════════════════════════ */
    function esc(str) {
        if (str == null) return '';
        var d = document.createElement('div');
        d.textContent = String(str);
        return d.innerHTML;
    }

    /* ═══════════════════════════════════════════════════
     * Konstanten
     * ═══════════════════════════════════════════════════ */
    var MAX_TOASTS = 5;
    var Z_INDEX = 99999;
    var CONTAINER_ID = 'dkz-toast-container';

    var TYPE_CONFIG = {
        success: {
            icon: '✓',
            color: '#00ff88',
            bg: 'rgba(0,255,136,0.08)',
            border: 'rgba(0,255,136,0.2)',
            duration: 5000
        },
        info: {
            icon: 'ℹ',
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.08)',
            border: 'rgba(59,130,246,0.2)',
            duration: 5000
        },
        warn: {
            icon: '⚠',
            color: '#ffb800',
            bg: 'rgba(255,184,0,0.08)',
            border: 'rgba(255,184,0,0.2)',
            duration: 7000
        },
        error: {
            icon: '✕',
            color: '#ff3b5c',
            bg: 'rgba(255,59,92,0.08)',
            border: 'rgba(255,59,92,0.2)',
            duration: 10000
        }
    };

    /* ═══════════════════════════════════════════════════
     * State
     * ═══════════════════════════════════════════════════ */
    var _containerEl = null;
    var _styleInjected = false;
    var _activeToasts = [];
    var _toastCounter = 0;
    var _soundEnabled = true;
    var _audioCtx = null;

    /* ═══════════════════════════════════════════════════
     * Sound (Error Beep via AudioContext)
     * ═══════════════════════════════════════════════════ */
    function playErrorBeep() {
        if (!_soundEnabled) return;
        try {
            if (!_audioCtx) {
                _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            var osc = _audioCtx.createOscillator();
            var gain = _audioCtx.createGain();
            osc.connect(gain);
            gain.connect(_audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, _audioCtx.currentTime);
            osc.frequency.setValueAtTime(660, _audioCtx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.15, _audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.3);

            osc.start(_audioCtx.currentTime);
            osc.stop(_audioCtx.currentTime + 0.3);
        } catch (e) {
            /* AudioContext nicht verfuegbar — still ignorieren */
        }
    }

    function playWarnBeep() {
        if (!_soundEnabled) return;
        try {
            if (!_audioCtx) {
                _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            var osc = _audioCtx.createOscillator();
            var gain = _audioCtx.createGain();
            osc.connect(gain);
            gain.connect(_audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, _audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, _audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.2);

            osc.start(_audioCtx.currentTime);
            osc.stop(_audioCtx.currentTime + 0.2);
        } catch (e) { /* still */ }
    }

    /* ═══════════════════════════════════════════════════
     * Styles
     * ═══════════════════════════════════════════════════ */
    function injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;

        var style = document.createElement('style');
        style.setAttribute('data-dkz', 'toast');
        style.textContent = [
            '/* DkZ Toast Styles */',

            '#' + CONTAINER_ID + ' {',
            '  position:fixed;',
            '  top:16px;',
            '  right:16px;',
            '  z-index:' + Z_INDEX + ';',
            '  display:flex;',
            '  flex-direction:column;',
            '  gap:8px;',
            '  pointer-events:none;',
            '  max-width:380px;',
            '  width:100%;',
            '}',

            '@keyframes dkzToastIn {',
            '  from { opacity:0; transform:translateX(40px) scale(0.95); }',
            '  to { opacity:1; transform:translateX(0) scale(1); }',
            '}',

            '@keyframes dkzToastOut {',
            '  from { opacity:1; transform:translateX(0) scale(1); max-height:120px; margin-bottom:8px; }',
            '  to { opacity:0; transform:translateX(40px) scale(0.9); max-height:0; margin-bottom:0; padding:0; border-width:0; }',
            '}',

            '.dkz-toast {',
            '  pointer-events:auto;',
            '  display:flex;',
            '  align-items:flex-start;',
            '  gap:10px;',
            '  padding:12px 14px;',
            '  border-radius:12px;',
            '  border:1px solid;',
            '  backdrop-filter:blur(24px) saturate(150%);',
            '  -webkit-backdrop-filter:blur(24px) saturate(150%);',
            '  box-shadow:0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset;',
            '  font-family:"Inter",system-ui,-apple-system,sans-serif;',
            '  font-size:0.8rem;',
            '  color:#e8e8ec;',
            '  cursor:pointer;',
            '  animation:dkzToastIn 0.3s ease-out;',
            '  transition:all 0.2s ease;',
            '  overflow:hidden;',
            '}',

            '.dkz-toast:hover {',
            '  transform:scale(1.02);',
            '  box-shadow:0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset;',
            '}',

            '.dkz-toast.removing {',
            '  animation:dkzToastOut 0.35s ease-in forwards;',
            '}',

            '.dkz-toast-icon {',
            '  flex-shrink:0;',
            '  width:22px;',
            '  height:22px;',
            '  border-radius:6px;',
            '  display:flex;',
            '  align-items:center;',
            '  justify-content:center;',
            '  font-size:0.75rem;',
            '  font-weight:700;',
            '}',

            '.dkz-toast-body {',
            '  flex:1;',
            '  min-width:0;',
            '}',

            '.dkz-toast-source {',
            '  font-size:0.6rem;',
            '  font-weight:600;',
            '  text-transform:uppercase;',
            '  letter-spacing:0.06em;',
            '  opacity:0.5;',
            '  margin-bottom:2px;',
            '  font-family:"JetBrains Mono",monospace;',
            '}',

            '.dkz-toast-msg {',
            '  line-height:1.4;',
            '  word-break:break-word;',
            '}',

            '.dkz-toast-time {',
            '  flex-shrink:0;',
            '  font-size:0.6rem;',
            '  color:#52525b;',
            '  font-family:"JetBrains Mono",monospace;',
            '  margin-top:2px;',
            '}',

            '.dkz-toast-progress {',
            '  position:absolute;',
            '  bottom:0;',
            '  left:0;',
            '  height:2px;',
            '  border-radius:0 0 12px 12px;',
            '  transition:width linear;',
            '}',

            '.dkz-toast { position:relative; }'
        ].join('\n');

        document.head.appendChild(style);
    }

    /* ═══════════════════════════════════════════════════
     * Container
     * ═══════════════════════════════════════════════════ */
    function ensureContainer() {
        if (_containerEl && document.body.contains(_containerEl)) return;
        _containerEl = document.createElement('div');
        _containerEl.id = CONTAINER_ID;
        document.body.appendChild(_containerEl);
    }

    /* ═══════════════════════════════════════════════════
     * Toast erstellen
     * ═══════════════════════════════════════════════════ */
    function createToast(message, type, options) {
        type = type || 'info';
        options = options || {};

        var cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
        var duration = options.duration || cfg.duration;
        var source = options.source || '';

        injectStyles();
        ensureContainer();

        // Max toasts durchsetzen
        while (_activeToasts.length >= MAX_TOASTS) {
            removeToast(_activeToasts[0].id, true);
        }

        _toastCounter++;
        var toastId = 'dkz-toast-' + _toastCounter;

        var el = document.createElement('div');
        el.className = 'dkz-toast';
        el.id = toastId;
        el.style.background = cfg.bg;
        el.style.borderColor = cfg.border;

        var timeStr = new Date().toLocaleTimeString('de-DE', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        var html = '';
        // Icon
        html += '<div class="dkz-toast-icon" style="background:' + cfg.bg + ';color:' + cfg.color + '">';
        html += esc(cfg.icon);
        html += '</div>';

        // Body
        html += '<div class="dkz-toast-body">';
        if (source) {
            html += '<div class="dkz-toast-source" style="color:' + cfg.color + '">' + esc(source) + '</div>';
        }
        html += '<div class="dkz-toast-msg">' + esc(message) + '</div>';
        html += '</div>';

        // Time
        html += '<div class="dkz-toast-time">' + esc(timeStr) + '</div>';

        // Progress bar
        html += '<div class="dkz-toast-progress" style="background:' + cfg.color + ';width:100%"></div>';

        el.innerHTML = html;

        // Click to dismiss
        el.addEventListener('click', function () {
            removeToast(toastId);
        });

        _containerEl.appendChild(el);

        // Progress animation
        var progressEl = el.querySelector('.dkz-toast-progress');
        if (progressEl) {
            progressEl.style.transitionDuration = duration + 'ms';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    progressEl.style.width = '0%';
                });
            });
        }

        // Sound
        if (type === 'error') playErrorBeep();
        if (type === 'warn') playWarnBeep();

        // Auto-dismiss timer
        var timer = setTimeout(function () {
            removeToast(toastId);
        }, duration);

        var toastData = { id: toastId, el: el, timer: timer, type: type };
        _activeToasts.push(toastData);

        // EventBus integration
        if (window.DkZ && window.DkZ.EventBus) {
            window.DkZ.EventBus.emit('toast:shown', {
                id: toastId,
                message: message,
                type: type,
                source: source
            }, 'dkz-toast');
        }

        return toastData;
    }

    /* ═══════════════════════════════════════════════════
     * Toast entfernen
     * ═══════════════════════════════════════════════════ */
    function removeToast(id, instant) {
        var idx = -1;
        for (var i = 0; i < _activeToasts.length; i++) {
            if (_activeToasts[i].id === id) { idx = i; break; }
        }
        if (idx === -1) return;

        var toast = _activeToasts[idx];
        clearTimeout(toast.timer);

        if (instant) {
            toast.el.remove();
            _activeToasts.splice(idx, 1);
        } else {
            toast.el.classList.add('removing');
            setTimeout(function () {
                toast.el.remove();
                var newIdx = _activeToasts.indexOf(toast);
                if (newIdx !== -1) _activeToasts.splice(newIdx, 1);
            }, 350);
        }
    }

    /* ═══════════════════════════════════════════════════
     * Browser Notification (optional)
     * ═══════════════════════════════════════════════════ */
    function sendBrowserNotification(title, body, type) {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body: body,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' +
                          (type === 'error' ? '🔴' : type === 'warn' ? '🟡' : '🟢') + '</text></svg>',
                    tag: 'dkz-' + type,
                    silent: true
                });
            } catch (e) { /* Service Worker needed for some browsers */ }
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    /* ═══════════════════════════════════════════════════
     * Public API
     * ═══════════════════════════════════════════════════ */
    window.DkzToast = {

        /**
         * Zeige einen Toast
         * @param {string} message - Nachricht
         * @param {string} type - success|info|warn|error
         * @param {Object} options - { duration, source, notify }
         */
        show: function (message, type, options) {
            options = options || {};
            var toast = createToast(message, type, options);

            // Browser Notification fuer error/warn wenn Seite nicht im Fokus
            if (options.notify !== false && !document.hasFocus()) {
                if (type === 'error' || type === 'warn') {
                    sendBrowserNotification(
                        'DkZ™ ' + (type === 'error' ? 'Fehler' : 'Warnung'),
                        message,
                        type
                    );
                }
            }

            return toast;
        },

        success: function (message, source) {
            return this.show(message, 'success', { source: source });
        },

        info: function (message, source) {
            return this.show(message, 'info', { source: source });
        },

        warn: function (message, source) {
            return this.show(message, 'warn', { source: source });
        },

        error: function (message, source) {
            return this.show(message, 'error', { source: source });
        },

        /** Alle Toasts entfernen */
        clear: function () {
            var ids = _activeToasts.map(function (t) { return t.id; });
            ids.forEach(function (id) { removeToast(id, true); });
        },

        /** Sound ein/aus */
        setSound: function (enabled) {
            _soundEnabled = !!enabled;
        },

        /** Anzahl aktiver Toasts */
        count: function () {
            return _activeToasts.length;
        },

        /** Version */
        version: 'v1.0.0'
    };

})();
