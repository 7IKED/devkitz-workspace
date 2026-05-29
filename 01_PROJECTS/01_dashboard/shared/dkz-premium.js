/**
 * DkZ Premium Module v1.0 — Shared UI Enhancements
 * 
 * Features: Sound System, i18n (EN/DE), Dark/Light Toggle,
 *           FadeIn Stagger, Glassmorphism Helpers
 * 
 * Usage: <script src="../../shared/dkz-premium.js" defer></script>
 * 
 * @DKZ:TAG -> [SYS:shared] [CAT:ui] [LANG:js]
 * @version v1.00.0_01
 */
(function() {
  'use strict';

  // === XSS Protection ===
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  // ========================================
  //  SOUND SYSTEM (WebAudio, no files)
  // ========================================
  const SFX = {
    enabled: localStorage.getItem('dkz-sfx') !== 'off',
    _ctx: null,

    _getCtx() {
      if (!this._ctx) {
        try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { return null; }
      }
      return this._ctx;
    },

    play(type) {
      if (!this.enabled) return;
      const ctx = this._getCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';

      switch(type) {
        case 'click':
          osc.frequency.value = 800;
          gain.gain.value = 0.06;
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.04);
          break;
        case 'success':
          osc.frequency.value = 520;
          gain.gain.value = 0.05;
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.08);
          setTimeout(function() {
            try {
              const o2 = ctx.createOscillator();
              const g2 = ctx.createGain();
              o2.connect(g2); g2.connect(ctx.destination);
              o2.type = 'sine';
              o2.frequency.value = 780;
              g2.gain.value = 0.05;
              o2.start(ctx.currentTime);
              o2.stop(ctx.currentTime + 0.1);
            } catch(e) {}
          }, 70);
          break;
        case 'error':
          osc.frequency.value = 200;
          gain.gain.value = 0.04;
          osc.type = 'square';
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.12);
          break;
        case 'toggle':
          osc.frequency.value = 660;
          gain.gain.value = 0.03;
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.03);
          break;
        case 'hover':
          osc.frequency.value = 1200;
          gain.gain.value = 0.015;
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.02);
          break;
        default:
          osc.frequency.value = 600;
          gain.gain.value = 0.03;
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.04);
      }
    },

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('dkz-sfx', this.enabled ? 'on' : 'off');
      if (this.enabled) this.play('toggle');
      updateSoundIcon();
    }
  };

  // ========================================
  //  i18n (EN/DE)
  // ========================================
  const DKZ_LANG = {
    current: localStorage.getItem('dkz-lang') || 'en',
    _dict: {},

    register(translations) {
      for (var lang in translations) {
        if (!this._dict[lang]) this._dict[lang] = {};
        for (var key in translations[lang]) {
          this._dict[lang][key] = translations[lang][key];
        }
      }
    },

    t(key) {
      return (this._dict[this.current] && this._dict[this.current][key])
        || (this._dict.en && this._dict.en[key])
        || key;
    },

    toggle() {
      this.current = this.current === 'en' ? 'de' : 'en';
      localStorage.setItem('dkz-lang', this.current);
      SFX.play('toggle');
      updateLangIcon();
      // Dispatch event for modules to react
      document.dispatchEvent(new CustomEvent('dkz-lang-change', { detail: { lang: this.current } }));
    }
  };

  // Register core translations
  DKZ_LANG.register({
    en: {
      sound_on: 'Sound On',
      sound_off: 'Sound Off',
      dark_mode: 'Dark Mode',
      light_mode: 'Light Mode',
      lang_switch: 'Deutsch',
      hub: 'Hub',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      search: 'Search...',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    },
    de: {
      sound_on: 'Sound An',
      sound_off: 'Sound Aus',
      dark_mode: 'Dunkelmodus',
      light_mode: 'Hellmodus',
      lang_switch: 'English',
      hub: 'Hub',
      settings: 'Einstellungen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schliessen',
      search: 'Suchen...',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg'
    }
  });

  // ========================================
  //  THEME (Dark/Light)
  // ========================================
  const DKZ_THEME = {
    current: localStorage.getItem('dkz-theme') || 'dark',

    apply() {
      document.documentElement.setAttribute('data-theme', this.current);
      updateThemeIcon();
    },

    toggle() {
      this.current = this.current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dkz-theme', this.current);
      this.apply();
      SFX.play('toggle');
    }
  };

  // ========================================
  //  FADE-IN STAGGER (IntersectionObserver)
  // ========================================
  function initFadeIn() {
    // Add CSS if not present
    if (!document.getElementById('dkz-fadein-css')) {
      var style = document.createElement('style');
      style.id = 'dkz-fadein-css';
      style.textContent = [
        '@keyframes dkzFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}',
        '.dkz-fade{opacity:0}',
        '.dkz-fade.dkz-visible{animation:dkzFadeIn .5s ease forwards}',
        '.dkz-fade.s1{animation-delay:.1s}.dkz-fade.s2{animation-delay:.2s}',
        '.dkz-fade.s3{animation-delay:.3s}.dkz-fade.s4{animation-delay:.4s}',
        '.dkz-fade.s5{animation-delay:.5s}.dkz-fade.s6{animation-delay:.6s}',
        /* Light Theme Override */
        '[data-theme="light"]{--bg:#f0f0f4;--surface:#fff;--card:#fafafa;--text:#1a1a2e;--muted:#6b7280;--border:#e0e0e8;--text-bg:rgba(240,240,244,0.9)}',
        /* Glassmorphism base */
        '.glass{background:rgba(17,17,24,.6);backdrop-filter:blur(20px) saturate(1.4);-webkit-backdrop-filter:blur(20px) saturate(1.4);border:1px solid rgba(255,255,255,.06);border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.05)}',
        '[data-theme="light"] .glass{background:rgba(255,255,255,.7);border-color:rgba(0,0,0,.08);box-shadow:0 4px 16px rgba(0,0,0,.06),inset 0 1px 0 rgba(255,255,255,.8)}'
      ].join('\n');
      document.head.appendChild(style);
    }

    // Auto-observe elements with class 'dkz-fade'
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('dkz-visible');
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.dkz-fade').forEach(function(el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all
      document.querySelectorAll('.dkz-fade').forEach(function(el) {
        el.classList.add('dkz-visible');
      });
    }
  }

  // ========================================
  //  TOOLBAR (Auto-inject Sound/Lang/Theme)
  // ========================================
  function injectToolbar() {
    // Check if toolbar already exists
    if (document.getElementById('dkz-premium-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'dkz-premium-bar';
    bar.style.cssText = 'position:fixed;top:12px;right:12px;z-index:9999;display:flex;gap:6px;align-items:center';

    // Lang toggle
    var langBtn = document.createElement('button');
    langBtn.id = 'dkz-lang-btn';
    langBtn.title = 'EN / DE';
    langBtn.style.cssText = btnStyle();
    langBtn.onclick = function() { DKZ_LANG.toggle(); };
    bar.appendChild(langBtn);

    // Theme toggle
    var themeBtn = document.createElement('button');
    themeBtn.id = 'dkz-theme-btn';
    themeBtn.title = 'Dark / Light';
    themeBtn.style.cssText = btnStyle();
    themeBtn.onclick = function() { DKZ_THEME.toggle(); };
    bar.appendChild(themeBtn);

    // Sound toggle
    var soundBtn = document.createElement('button');
    soundBtn.id = 'dkz-sound-btn';
    soundBtn.title = 'Sound';
    soundBtn.style.cssText = btnStyle();
    soundBtn.onclick = function() { SFX.toggle(); };
    bar.appendChild(soundBtn);

    document.body.appendChild(bar);

    updateLangIcon();
    updateThemeIcon();
    updateSoundIcon();
  }

  function btnStyle() {
    return [
      'background:rgba(17,17,24,.5)',
      'backdrop-filter:blur(12px)',
      'border:1px solid rgba(255,255,255,.08)',
      'border-radius:8px',
      'color:#e8e8ed',
      'font-size:13px',
      'font-family:Inter,sans-serif',
      'font-weight:600',
      'padding:5px 10px',
      'cursor:pointer',
      'transition:all .2s',
      'min-width:36px',
      'text-align:center'
    ].join(';');
  }

  function updateLangIcon() {
    var btn = document.getElementById('dkz-lang-btn');
    if (btn) btn.textContent = DKZ_LANG.current === 'en' ? 'EN' : 'DE';
  }

  function updateThemeIcon() {
    var btn = document.getElementById('dkz-theme-btn');
    if (btn) btn.textContent = DKZ_THEME.current === 'dark' ? '\uD83C\uDF19' : '\u2600\uFE0F';
  }

  function updateSoundIcon() {
    var btn = document.getElementById('dkz-sound-btn');
    if (btn) btn.textContent = SFX.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
  }

  // ========================================
  //  CLICK SOUND on all buttons
  // ========================================
  function initClickSounds() {
    document.addEventListener('click', function(e) {
      var target = e.target.closest('button, .btn, [role="button"], a.btn-hr');
      if (target && target.id !== 'dkz-sound-btn') {
        SFX.play('click');
      }
    });
  }

  // ========================================
  //  INIT
  // ========================================
  function init() {
    DKZ_THEME.apply();
    injectToolbar();
    initClickSounds();

    // Wait for DOM then fade-in
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFadeIn);
    } else {
      initFadeIn();
    }
  }

  // Auto-init when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ========================================
  //  PUBLIC API
  // ========================================
  window.DKZ = window.DKZ || {};
  window.DKZ.SFX = SFX;
  window.DKZ.LANG = DKZ_LANG;
  window.DKZ.THEME = DKZ_THEME;
  window.DKZ.esc = esc;
  window.DKZ.t = function(key) { return DKZ_LANG.t(key); };

})();
