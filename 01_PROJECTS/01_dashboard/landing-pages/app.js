/**
 * DkZ Landing Pages – App Logic
 * Search, Clock, Audio, Tiles, Business Widgets
 */
const DkZApp = (() => {
    let audioCtx = null;
    let ambientOsc = null;
    let ambientGain = null;
    let audioEnabled = false;
    let audioMenuOpen = false;

    // ═══════════════════════════════
    // CLOCK
    // ═══════════════════════════════
    function updateClock() {
        const now = new Date();
        const clockEl = document.getElementById('hero-clock');
        const dateEl = document.getElementById('hero-date');
        const greetEl = document.getElementById('hero-greeting-text');

        if (clockEl) {
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            clockEl.textContent = `${h}:${m}:${s}`;
        }

        if (dateEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('de-DE', options);
        }

        if (greetEl) {
            const hour = now.getHours();
            let greeting = 'Guten Tag';
            if (hour < 6) greeting = 'Gute Nacht';
            else if (hour < 12) greeting = 'Guten Morgen';
            else if (hour < 18) greeting = 'Guten Tag';
            else greeting = 'Guten Abend';
            greetEl.textContent = greeting;
        }
    }

    // ═══════════════════════════════
    // DUCKDUCKGO SEARCH
    // ═══════════════════════════════
    function initSearch() {
        const form = document.getElementById('search-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('search-input');
            const query = input.value.trim();
            if (query) {
                playUISound('search');
                window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            }
        });

        // Focus shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.getElementById('search-input')?.focus();
            }
        });
    }

    // ═══════════════════════════════
    // AUDIO ENGINE (Web Audio API)
    // ═══════════════════════════════
    function initAudio() {
        const toggle = document.getElementById('audio-toggle');
        const menu = document.getElementById('audio-menu');
        if (!toggle) return;

        toggle.addEventListener('click', () => {
            if (!audioMenuOpen) {
                menu.classList.add('open');
                audioMenuOpen = true;
            } else {
                menu.classList.remove('open');
                audioMenuOpen = false;
            }
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.audio-panel')) {
                menu?.classList.remove('open');
                audioMenuOpen = false;
            }
        });
    }

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function toggleAmbient() {
        const ctx = getAudioContext();
        if (ambientOsc) {
            ambientOsc.stop();
            ambientOsc = null;
            ambientGain = null;
            document.getElementById('audio-toggle')?.classList.remove('active');
            document.getElementById('ambient-status')?.setAttribute('data-status', 'off');
            audioEnabled = false;
            return;
        }

        audioEnabled = true;
        document.getElementById('audio-toggle')?.classList.add('active');
        document.getElementById('ambient-status')?.setAttribute('data-status', 'on');

        // Create a gentle ambient pad
        ambientGain = ctx.createGain();
        ambientGain.gain.value = 0.03;
        ambientGain.connect(ctx.destination);

        // Soft pad oscillator
        ambientOsc = ctx.createOscillator();
        ambientOsc.type = 'sine';
        ambientOsc.frequency.value = 174; // Solfeggio frequency – relaxing

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 1;

        ambientOsc.connect(filter);
        filter.connect(ambientGain);
        ambientOsc.start();

        // Add slight frequency modulation for organic feel
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2;
        lfo.connect(lfoGain);
        lfoGain.connect(ambientOsc.frequency);
        lfo.start();
    }

    function setAmbientVolume(value) {
        if (ambientGain) {
            ambientGain.gain.value = value / 100 * 0.08;
        }
    }

    function playUISound(type) {
        if (!audioEnabled) return;
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        gain.gain.value = 0.05;
        gain.connect(ctx.destination);
        osc.connect(gain);

        switch (type) {
            case 'click':
                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.value = 0.03;
                break;
            case 'search':
                osc.frequency.value = 1200;
                osc.type = 'triangle';
                gain.gain.value = 0.04;
                break;
            case 'hover':
                osc.frequency.value = 600;
                osc.type = 'sine';
                gain.gain.value = 0.015;
                break;
            case 'notify':
                osc.frequency.value = 523;
                osc.type = 'sine';
                gain.gain.value = 0.05;
                // Two-tone notification
                setTimeout(() => {
                    const osc2 = ctx.createOscillator();
                    const g2 = ctx.createGain();
                    g2.gain.value = 0.05;
                    g2.connect(ctx.destination);
                    osc2.connect(g2);
                    osc2.frequency.value = 659;
                    osc2.type = 'sine';
                    osc2.start();
                    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    osc2.stop(ctx.currentTime + 0.2);
                }, 120);
                break;
        }

        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
    }

    // ═══════════════════════════════
    // TILES – Click sounds
    // ═══════════════════════════════
    function initTiles() {
        document.querySelectorAll('.tile').forEach(tile => {
            tile.addEventListener('click', () => playUISound('click'));
            tile.addEventListener('mouseenter', () => playUISound('hover'));
        });
    }

    // ═══════════════════════════════
    // BUSINESS WIDGETS
    // ═══════════════════════════════
    function initBusinessWidgets() {
        // Task toggle
        document.querySelectorAll('.biz-task-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('done');
                const check = item.querySelector('.check');
                check.textContent = item.classList.contains('done') ? '✓' : '';
                playUISound('click');
                saveBusinessData();
            });
        });

        // Notes auto-save
        const notes = document.getElementById('biz-notes');
        if (notes) {
            const saved = localStorage.getItem('dkz-landing-notes');
            if (saved) notes.value = saved;
            notes.addEventListener('input', () => {
                localStorage.setItem('dkz-landing-notes', notes.value);
            });
        }

        // Calendar
        buildCalendar();
    }

    function buildCalendar() {
        const container = document.getElementById('biz-calendar');
        if (!container) return;

        const now = new Date();
        const today = now.getDate();
        const dayOfWeek = now.getDay() || 7; // Monday = 1
        const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

        container.innerHTML = '';
        for (let i = 1; i <= 7; i++) {
            const diff = i - dayOfWeek;
            const d = new Date(now);
            d.setDate(today + diff);
            const isToday = diff === 0;

            const el = document.createElement('div');
            el.className = `biz-cal-day${isToday ? ' today' : ''}`;
            el.innerHTML = `<div class="day-num">${d.getDate()}</div><div class="day-label">${labels[i - 1]}</div>`;
            container.appendChild(el);
        }
    }

    function saveBusinessData() {
        const tasks = [];
        document.querySelectorAll('.biz-task-item').forEach((item, i) => {
            tasks.push({ index: i, done: item.classList.contains('done') });
        });
        localStorage.setItem('dkz-landing-tasks', JSON.stringify(tasks));
    }

    function loadBusinessData() {
        try {
            const tasks = JSON.parse(localStorage.getItem('dkz-landing-tasks') || '[]');
            const items = document.querySelectorAll('.biz-task-item');
            tasks.forEach(t => {
                if (items[t.index] && t.done) {
                    items[t.index].classList.add('done');
                    items[t.index].querySelector('.check').textContent = '✓';
                }
            });
        } catch (e) { /* ignore */ }
    }

    // ═══════════════════════════════
    // CONTEXT BADGE
    // ═══════════════════════════════
    function updateContextBadge() {
        const badge = document.getElementById('context-text');
        if (badge) {
            badge.textContent = DkZDetect.getBadgeText();
        }
    }

    // ═══════════════════════════════
    // BACKGROUND IMAGE ROTATION
    // ═══════════════════════════════
    const bgImages = [
        'linear-gradient(135deg, #0a0a2e 0%, #0e0e14 50%, #1a0a2e 100%)',
        'linear-gradient(135deg, #0e1a2e 0%, #0a0a0f 50%, #2e0a1a 100%)',
        'linear-gradient(135deg, #1a0e2e 0%, #0a0f0e 50%, #0a1a2e 100%)',
    ];
    let bgIndex = 0;

    function rotateBg() {
        const el = document.getElementById('bg-image');
        if (!el) return;
        el.style.background = bgImages[bgIndex];
        bgIndex = (bgIndex + 1) % bgImages.length;
    }

    // ═══════════════════════════════
    // INIT
    // ═══════════════════════════════
    async function init() {
        // Wait for detection
        const ctx = await DkZDetect.init();

        updateClock();
        setInterval(updateClock, 1000);

        initSearch();
        initAudio();
        initTiles();
        updateContextBadge();

        if (ctx.profile === 'business') {
            initBusinessWidgets();
            loadBusinessData();
        }

        rotateBg();
        setInterval(rotateBg, 30000);

        // Listen for context changes (resize)
        window.addEventListener('dkz-context-change', () => {
            updateContextBadge();
        });

        console.log('[DkZ Landing] Initialized', ctx);
    }

    // Expose for inline handlers
    return {
        init,
        toggleAmbient,
        setAmbientVolume,
        playUISound
    };
})();

// Boot
document.addEventListener('DOMContentLoaded', DkZApp.init);
