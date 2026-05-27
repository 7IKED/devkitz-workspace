/**
 * DkZ TTS — Text-to-Speech Shared Script v1.0
 * @DKZ:TAG [TOOL:tts] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Features:
 * - 🎧 Kopfhörer-Button in JEDEM Modul (unten links)
 * - Browser Web Speech API (offline-fähig)
 * - Markierten Text vorlesen oder ganze Seite
 * - Stimmen-Auswahl (DE, EN, FR, ES)
 * - Geschwindigkeit + Pitch einstellbar
 * - Console Commands: /tts, /tts:stop, /tts:voices
 * - localStorage Persistenz für Einstellungen
 * - Alt+T Tastenkürzel
 * 
 * Einbinden: <script src="../../shared/dkz-tts.js"></script>
 */
const DkzTTS = (() => {
    'use strict';

    const VERSION = '1.0.0';
    const STORAGE_KEY = 'dkz-tts-settings';
    const HISTORY_KEY = 'dkz-tts-history';

    // Defaults
    let _settings = {
        lang: 'de-DE',
        rate: 1.0,
        pitch: 1.0,
        voiceURI: '',
        enabled: true
    };

    let _speaking = false;
    let _paused = false;
    let _utterance = null;
    let _voices = [];
    let _panelEl = null;
    let _btnEl = null;

    // ════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════
    function init() {
        if (!window.speechSynthesis) {
            console.warn('[DkZ TTS] Web Speech API nicht verfuegbar');
            return;
        }

        _loadSettings();
        _loadVoices();
        _injectButton();
        _registerShortcuts();
        _registerConsole();

        // Voices laden (einige Browser laden async)
        window.speechSynthesis.onvoiceschanged = _loadVoices;

        console.log('[DkZ TTS] v' + VERSION + ' ready | Lang: ' + _settings.lang + ' | Rate: ' + _settings.rate);
    }

    // ════════════════════════════════════════
    // VOICES
    // ════════════════════════════════════════
    function _loadVoices() {
        _voices = window.speechSynthesis.getVoices();
        if (_settings.voiceURI && !_voices.find(v => v.voiceURI === _settings.voiceURI)) {
            _settings.voiceURI = '';
        }
    }

    function getVoices(lang) {
        const all = window.speechSynthesis.getVoices();
        if (lang) return all.filter(v => v.lang.startsWith(lang));
        return all;
    }

    // ════════════════════════════════════════
    // SPEAK
    // ════════════════════════════════════════
    function speak(text, opts) {
        if (!window.speechSynthesis) return;
        opts = opts || {};

        // Stop aktuelle Wiedergabe
        stop();

        if (!text || !text.trim()) {
            text = _getSelectedText() || _getPageText();
        }
        if (!text || !text.trim()) return;

        // Clean text
        text = text.replace(/<[^>]*>/g, ' ')
                   .replace(/\s+/g, ' ')
                   .replace(/[{}[\]]/g, '')
                   .trim();

        // Max 5000 Zeichen pro Utterance
        const chunks = _chunkText(text, 4000);

        _speaking = true;
        _paused = false;
        _updateButton('speaking');
        _saveHistory(text.substring(0, 200));

        let idx = 0;
        function speakNext() {
            if (idx >= chunks.length || !_speaking) {
                _speaking = false;
                _updateButton('idle');
                return;
            }

            _utterance = new SpeechSynthesisUtterance(chunks[idx]);
            _utterance.lang = opts.lang || _settings.lang;
            _utterance.rate = opts.rate || _settings.rate;
            _utterance.pitch = opts.pitch || _settings.pitch;

            // Stimme setzen
            const voiceURI = opts.voiceURI || _settings.voiceURI;
            if (voiceURI) {
                const v = _voices.find(v => v.voiceURI === voiceURI);
                if (v) _utterance.voice = v;
            }

            _utterance.onend = () => { idx++; speakNext(); };
            _utterance.onerror = () => { idx++; speakNext(); };

            window.speechSynthesis.speak(_utterance);
        }

        speakNext();
    }

    function stop() {
        window.speechSynthesis.cancel();
        _speaking = false;
        _paused = false;
        _utterance = null;
        _updateButton('idle');
    }

    function pause() {
        if (_speaking && !_paused) {
            window.speechSynthesis.pause();
            _paused = true;
            _updateButton('paused');
        }
    }

    function resume() {
        if (_paused) {
            window.speechSynthesis.resume();
            _paused = false;
            _updateButton('speaking');
        }
    }

    function toggle() {
        if (_speaking && !_paused) {
            pause();
        } else if (_paused) {
            resume();
        } else {
            speak();
        }
    }

    // ════════════════════════════════════════
    // TEXT HELPERS
    // ════════════════════════════════════════
    function _getSelectedText() {
        const sel = window.getSelection();
        return sel ? sel.toString().trim() : '';
    }

    function _getPageText() {
        const content = document.querySelector('.content, main, [role="main"], .panel.active');
        if (content) return content.innerText.substring(0, 10000);
        return document.body.innerText.substring(0, 5000);
    }

    function _chunkText(text, maxLen) {
        if (text.length <= maxLen) return [text];
        const chunks = [];
        let remaining = text;
        while (remaining.length > 0) {
            let cut = maxLen;
            if (remaining.length > maxLen) {
                // Suche letzten Satzende-Punkt
                const lastDot = remaining.lastIndexOf('.', maxLen);
                const lastExcl = remaining.lastIndexOf('!', maxLen);
                const lastQ = remaining.lastIndexOf('?', maxLen);
                cut = Math.max(lastDot, lastExcl, lastQ);
                if (cut < maxLen * 0.3) cut = maxLen; // Kein guter Cut, nehme maxLen
                cut = Math.min(cut + 1, remaining.length);
            } else {
                cut = remaining.length;
            }
            chunks.push(remaining.substring(0, cut));
            remaining = remaining.substring(cut).trim();
        }
        return chunks;
    }

    // ════════════════════════════════════════
    // UI: 🎧 BUTTON
    // ════════════════════════════════════════
    function _injectButton() {
        if (document.getElementById('dkz-tts-btn')) return;

        _btnEl = document.createElement('button');
        _btnEl.id = 'dkz-tts-btn';
        _btnEl.innerHTML = '🎧';
        _btnEl.title = 'Text vorlesen (Alt+T)';
        _btnEl.setAttribute('aria-label', 'Text vorlesen');

        Object.assign(_btnEl.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a1a20, #222228)',
            border: '1px solid rgba(250, 30, 78, 0.3)',
            color: '#fa1e4e',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            zIndex: '99985',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit'
        });

        _btnEl.addEventListener('click', (e) => {
            if (e.shiftKey) {
                _openPanel();
            } else {
                toggle();
            }
        });

        _btnEl.addEventListener('mouseenter', () => {
            _btnEl.style.transform = 'scale(1.1)';
            _btnEl.style.borderColor = '#fa1e4e';
            _btnEl.style.boxShadow = '0 4px 24px rgba(250, 30, 78, 0.3)';
        });
        _btnEl.addEventListener('mouseleave', () => {
            _btnEl.style.transform = 'scale(1)';
            _btnEl.style.borderColor = 'rgba(250, 30, 78, 0.3)';
            _btnEl.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
        });

        // Long-press → Panel oeffnen
        let pressTimer;
        _btnEl.addEventListener('mousedown', () => {
            pressTimer = setTimeout(() => _openPanel(), 600);
        });
        _btnEl.addEventListener('mouseup', () => clearTimeout(pressTimer));
        _btnEl.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        document.body.appendChild(_btnEl);
    }

    function _updateButton(state) {
        if (!_btnEl) return;
        switch (state) {
            case 'speaking':
                _btnEl.innerHTML = '🔊';
                _btnEl.style.background = 'linear-gradient(135deg, rgba(250, 30, 78, 0.2), rgba(250, 30, 78, 0.1))';
                _btnEl.style.borderColor = '#fa1e4e';
                _btnEl.style.animation = 'dkz-tts-pulse 1.5s infinite';
                break;
            case 'paused':
                _btnEl.innerHTML = '⏸️';
                _btnEl.style.background = 'linear-gradient(135deg, rgba(255, 184, 0, 0.15), rgba(255, 184, 0, 0.05))';
                _btnEl.style.borderColor = '#ffb800';
                _btnEl.style.animation = 'none';
                break;
            default:
                _btnEl.innerHTML = '🎧';
                _btnEl.style.background = 'linear-gradient(135deg, #1a1a20, #222228)';
                _btnEl.style.borderColor = 'rgba(250, 30, 78, 0.3)';
                _btnEl.style.animation = 'none';
        }
    }

    // ════════════════════════════════════════
    // PANEL (Shift+Click oder Long-Press)
    // ════════════════════════════════════════
    function _openPanel() {
        if (_panelEl) { _panelEl.remove(); _panelEl = null; return; }

        const voices = getVoices();
        const deVoices = voices.filter(v => v.lang.startsWith('de'));
        const enVoices = voices.filter(v => v.lang.startsWith('en'));

        const voiceOpts = voices.map(v => {
            const sel = v.voiceURI === _settings.voiceURI ? ' selected' : '';
            const flag = v.lang.startsWith('de') ? '🇩🇪' : v.lang.startsWith('en') ? '🇬🇧' : v.lang.startsWith('fr') ? '🇫🇷' : v.lang.startsWith('es') ? '🇪🇸' : '🌐';
            return '<option value="' + _esc(v.voiceURI) + '"' + sel + '>' + flag + ' ' + _esc(v.name) + '</option>';
        }).join('');

        _panelEl = document.createElement('div');
        _panelEl.id = 'dkz-tts-panel';
        _panelEl.innerHTML =
            '<div style="position:fixed;bottom:74px;left:20px;width:340px;background:rgba(17,17,22,0.97);border:1px solid rgba(250,30,78,0.25);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.6);z-index:99991;font-family:Inter,sans-serif;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)">' +
            '<div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;align-items:center">' +
            '<div style="font-size:13px;font-weight:800;color:#f6f6f7">🎧 DkZ™ TTS</div>' +
            '<button onclick="document.getElementById(\'dkz-tts-panel\').remove();DkzTTS._panelEl=null" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.1rem">✕</button>' +
            '</div>' +
            '<div style="padding:14px 16px">' +
            // Stimme
            '<div style="margin-bottom:12px">' +
            '<label style="font-size:10px;color:#a1a1aa;font-weight:600;display:block;margin-bottom:4px">Stimme</label>' +
            '<select id="dkz-tts-voice" onchange="DkzTTS.setVoice(this.value)" style="width:100%;padding:8px;background:#1a1a20;border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#f6f6f7;font-size:11px;font-family:inherit">' +
            '<option value="">Standard</option>' + voiceOpts +
            '</select></div>' +
            // Sprache
            '<div style="margin-bottom:12px">' +
            '<label style="font-size:10px;color:#a1a1aa;font-weight:600;display:block;margin-bottom:4px">Sprache</label>' +
            '<div style="display:flex;gap:6px">' +
            '<button onclick="DkzTTS.setLang(\'de-DE\')" style="flex:1;padding:6px;border:1px solid ' + (_settings.lang === 'de-DE' ? '#fa1e4e' : 'rgba(255,255,255,0.08)') + ';border-radius:6px;background:' + (_settings.lang === 'de-DE' ? 'rgba(250,30,78,0.1)' : 'transparent') + ';color:#f6f6f7;font-size:11px;cursor:pointer">🇩🇪 DE</button>' +
            '<button onclick="DkzTTS.setLang(\'en-US\')" style="flex:1;padding:6px;border:1px solid ' + (_settings.lang === 'en-US' ? '#fa1e4e' : 'rgba(255,255,255,0.08)') + ';border-radius:6px;background:' + (_settings.lang === 'en-US' ? 'rgba(250,30,78,0.1)' : 'transparent') + ';color:#f6f6f7;font-size:11px;cursor:pointer">🇬🇧 EN</button>' +
            '<button onclick="DkzTTS.setLang(\'fr-FR\')" style="flex:1;padding:6px;border:1px solid ' + (_settings.lang === 'fr-FR' ? '#fa1e4e' : 'rgba(255,255,255,0.08)') + ';border-radius:6px;background:' + (_settings.lang === 'fr-FR' ? 'rgba(250,30,78,0.1)' : 'transparent') + ';color:#f6f6f7;font-size:11px;cursor:pointer">🇫🇷 FR</button>' +
            '<button onclick="DkzTTS.setLang(\'es-ES\')" style="flex:1;padding:6px;border:1px solid ' + (_settings.lang === 'es-ES' ? '#fa1e4e' : 'rgba(255,255,255,0.08)') + ';border-radius:6px;background:' + (_settings.lang === 'es-ES' ? 'rgba(250,30,78,0.1)' : 'transparent') + ';color:#f6f6f7;font-size:11px;cursor:pointer">🇪🇸 ES</button>' +
            '</div></div>' +
            // Speed
            '<div style="margin-bottom:12px">' +
            '<label style="font-size:10px;color:#a1a1aa;font-weight:600;display:block;margin-bottom:4px">Geschwindigkeit: <span id="dkz-tts-rate-val">' + _settings.rate + 'x</span></label>' +
            '<input type="range" id="dkz-tts-rate" min="0.5" max="2" step="0.1" value="' + _settings.rate + '" oninput="DkzTTS.setRate(this.value)" style="width:100%;accent-color:#fa1e4e">' +
            '</div>' +
            // Pitch
            '<div style="margin-bottom:12px">' +
            '<label style="font-size:10px;color:#a1a1aa;font-weight:600;display:block;margin-bottom:4px">Tonhöhe: <span id="dkz-tts-pitch-val">' + _settings.pitch + '</span></label>' +
            '<input type="range" id="dkz-tts-pitch" min="0.5" max="2" step="0.1" value="' + _settings.pitch + '" oninput="DkzTTS.setPitch(this.value)" style="width:100%;accent-color:#fa1e4e">' +
            '</div>' +
            // Actions
            '<div style="display:flex;gap:8px">' +
            '<button onclick="DkzTTS.speak()" style="flex:1;padding:8px;background:linear-gradient(135deg,#fa1e4e,#ec4899);border:none;border-radius:8px;color:white;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">▶ Vorlesen</button>' +
            '<button onclick="DkzTTS.stop()" style="padding:8px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#a1a1aa;font-size:11px;cursor:pointer;font-family:inherit">⏹</button>' +
            '</div>' +
            // Info
            '<div style="margin-top:10px;font-size:9px;color:#52525b;text-align:center">' +
            'Tipp: Text markieren → 🎧 klicken | Shift+🎧 = Panel | Alt+T = Toggle' +
            '</div>' +
            '</div></div>';

        document.body.appendChild(_panelEl);

        // Inject pulse animation
        if (!document.getElementById('dkz-tts-css')) {
            const css = document.createElement('style');
            css.id = 'dkz-tts-css';
            css.textContent = '@keyframes dkz-tts-pulse{0%,100%{box-shadow:0 0 0 0 rgba(250,30,78,0.3)}50%{box-shadow:0 0 0 8px rgba(250,30,78,0)}}';
            document.head.appendChild(css);
        }
    }

    // ════════════════════════════════════════
    // SETTINGS
    // ════════════════════════════════════════
    function setLang(lang) {
        _settings.lang = lang;
        _saveSettings();
        if (_panelEl) { _panelEl.remove(); _panelEl = null; _openPanel(); }
    }

    function setRate(rate) {
        _settings.rate = parseFloat(rate);
        _saveSettings();
        const el = document.getElementById('dkz-tts-rate-val');
        if (el) el.textContent = _settings.rate + 'x';
    }

    function setPitch(pitch) {
        _settings.pitch = parseFloat(pitch);
        _saveSettings();
        const el = document.getElementById('dkz-tts-pitch-val');
        if (el) el.textContent = _settings.pitch;
    }

    function setVoice(uri) {
        _settings.voiceURI = uri;
        _saveSettings();
    }

    function _loadSettings() {
        try {
            const s = localStorage.getItem(STORAGE_KEY);
            if (s) _settings = Object.assign(_settings, JSON.parse(s));
        } catch (e) { /* ignore */ }
    }

    function _saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_settings));
        } catch (e) { /* ignore */ }
    }

    function _saveHistory(text) {
        try {
            const h = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            h.unshift({ text: text, date: new Date().toISOString() });
            while (h.length > 20) h.pop();
            localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
        } catch (e) { /* ignore */ }
    }

    // ════════════════════════════════════════
    // SHORTCUTS
    // ════════════════════════════════════════
    function _registerShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt+T = Toggle TTS
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                toggle();
            }
        });
    }

    // ════════════════════════════════════════
    // CONSOLE COMMANDS
    // ════════════════════════════════════════
    function _registerConsole() {
        if (typeof DkzConsole === 'undefined') return;
        // Commands werden ueber die Console registriert wenn verfuegbar
        // Fallback: window.addEventListener fuer dkz:console:command events
        document.addEventListener('dkz:console:command', (e) => {
            const cmd = e.detail;
            if (!cmd) return;
            if (cmd.startsWith('/tts:stop')) { stop(); return; }
            if (cmd.startsWith('/tts:voices')) {
                const v = getVoices();
                console.log('[TTS Voices]', v.map(vo => vo.lang + ' — ' + vo.name).join('\n'));
                return;
            }
            if (cmd.startsWith('/tts ')) {
                const text = cmd.substring(5).trim();
                if (text) speak(text);
                return;
            }
        });
    }

    // ════════════════════════════════════════
    // UTILS
    // ════════════════════════════════════════
    function _esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ════════════════════════════════════════
    // AUTO-INIT
    // ════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }

    return {
        speak: speak,
        stop: stop,
        pause: pause,
        resume: resume,
        toggle: toggle,
        getVoices: getVoices,
        setLang: setLang,
        setRate: setRate,
        setPitch: setPitch,
        setVoice: setVoice,
        _panelEl: _panelEl,
        VERSION: VERSION
    };
})();

// Global Alias
if (typeof window !== 'undefined') window.DkzTTS = DkzTTS;
