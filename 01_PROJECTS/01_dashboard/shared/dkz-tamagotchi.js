/**
 * DkZ Tamagotchi — System-Wächter-Bot mit Feed/Report/Alarm
 * @DKZ:TAG → [SYS:tamagotchi] [CAT:shared]
 * @version v1.0.0
 *
 * Konzept: Ein Bot der "gefüttert" werden muss.
 * Während der Fütterung: Prüft System, erstellt Report, findet Fehler.
 * Bei Problemen: Erscheint automatisch mit Alarm.
 */
(function() {
  'use strict';

  const VERSION = 'v1.0.0';
  const FEED_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 Stunden
  const CHECK_INTERVAL_MS = 60 * 1000; // Jede Minute prüfen
  const STORAGE_KEY = 'dkz_tamagotchi';

  // XSS-Schutz
  const esc = window.esc || function(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  };

  // State
  let state = {
    lastFed: Date.now(),
    mood: 'happy',    // happy | neutral | hungry | alarm
    health: 100,
    issues: [],
    feedCount: 0,
    reports: []
  };

  // Load persisted state
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch(e) { /* fresh start */ }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  // --- Mood Calculation ---
  function updateMood() {
    const elapsed = Date.now() - state.lastFed;
    const hasAlarm = state.issues.length > 0;

    if (hasAlarm) {
      state.mood = 'alarm';
    } else if (elapsed > FEED_INTERVAL_MS * 2) {
      state.mood = 'hungry';
    } else if (elapsed > FEED_INTERVAL_MS) {
      state.mood = 'neutral';
    } else {
      state.mood = 'happy';
    }
    renderBadge();
  }

  const MOOD_CONFIG = {
    happy:   { emoji: '\u{1F60A}', color: '#00ff88', label: 'Glücklich' },
    neutral: { emoji: '\u{1F610}', color: '#ffb800', label: 'Neutral' },
    hungry:  { emoji: '\u{1F622}', color: '#ff3b5c', label: 'Hungrig' },
    alarm:   { emoji: '\u{1F525}', color: '#fa1e4e', label: 'ALARM' }
  };

  // --- System Checks (Fütterung) ---
  function runHealthChecks() {
    const issues = [];
    let score = 100;

    // 1. Shared Scripts geladen?
    const scripts = ['DkzDebug', 'DkzAutoHealth', 'DkzGuide', 'DkzCopilot'];
    scripts.forEach(s => {
      if (!window[s]) {
        issues.push({ type: 'missing-script', name: s, severity: 'warning' });
        score -= 5;
      }
    });

    // 2. CSS Variables
    const root = getComputedStyle(document.documentElement);
    ['--accent', '--bg'].forEach(v => {
      if (!root.getPropertyValue(v).trim()) {
        issues.push({ type: 'missing-css-var', name: v, severity: 'warning' });
        score -= 5;
      }
    });

    // 3. esc() verfügbar?
    if (typeof window.esc !== 'function') {
      issues.push({ type: 'no-xss-protection', severity: 'critical' });
      score -= 15;
    }

    // 4. localStorage
    try {
      localStorage.setItem('_tama_test', '1');
      localStorage.removeItem('_tama_test');
    } catch(e) {
      issues.push({ type: 'localstorage-blocked', severity: 'critical' });
      score -= 20;
    }

    // 5. Offline?
    if (!navigator.onLine) {
      issues.push({ type: 'offline', severity: 'info' });
      score -= 5;
    }

    // 6. Memory
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      if (used / limit > 0.8) {
        issues.push({ type: 'high-memory', used: Math.round(used/1024/1024) + 'MB', severity: 'warning' });
        score -= 10;
      }
    }

    // 7. Error count in eventlog
    try {
      const log = JSON.parse(localStorage.getItem('dkz_eventlog') || '[]');
      const errors = log.filter(e => e.level === 'error' && Date.now() - new Date(e.ts).getTime() < 3600000);
      if (errors.length > 0) {
        issues.push({ type: 'recent-errors', count: errors.length, severity: 'warning' });
        score -= errors.length * 3;
      }
    } catch(e) {}

    state.health = Math.max(0, Math.min(100, score));
    state.issues = issues;
    save();
    return { score, issues };
  }

  // --- Feed ---
  function feed() {
    state.lastFed = Date.now();
    state.feedCount++;

    // Animate feeding
    const badge = document.getElementById('tama-badge');
    if (badge) {
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 400);
    }

    // Run checks during feeding
    const result = runHealthChecks();

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      score: result.score,
      issues: result.issues,
      feedCount: state.feedCount
    };
    state.reports.unshift(report);
    if (state.reports.length > 10) state.reports.length = 10;

    updateMood();
    save();

    // Dispatch event
    document.dispatchEvent(new CustomEvent('dkz:tamagotchi-fed', { detail: report }));
    return report;
  }

  // --- Report Modal ---
  function showReport() {
    let modal = document.getElementById('tama-modal');
    if (modal) { modal.remove(); return; }

    const mc = MOOD_CONFIG[state.mood];
    const elapsed = Date.now() - state.lastFed;
    const elapsedStr = elapsed < 60000 ? 'Gerade eben' :
      elapsed < 3600000 ? Math.round(elapsed / 60000) + ' Min' :
      Math.round(elapsed / 3600000) + 'h ' + Math.round((elapsed % 3600000) / 60000) + 'min';

    const scoreColor = state.health >= 80 ? '#00ff88' : state.health >= 50 ? '#ffb800' : '#ff3b5c';

    const issueHTML = state.issues.length === 0
      ? '<div style="color:#71717a;text-align:center;padding:8px">\u2714 Keine Probleme</div>'
      : state.issues.map(i =>
        '<div class="tama-issue tama-' + esc(i.severity || 'info') + '">' +
        '<span>' + esc(i.type) + '</span>' +
        (i.name ? ' <code>' + esc(i.name) + '</code>' : '') +
        (i.count ? ' (' + esc(String(i.count)) + 'x)' : '') +
        '</div>'
      ).join('');

    modal = document.createElement('div');
    modal.id = 'tama-modal';
    modal.innerHTML =
      '<div class="tama-modal-inner">' +
        '<div class="tama-modal-header">' +
          '<span style="font-size:28px">' + mc.emoji + '</span>' +
          '<div>' +
            '<div class="tama-modal-title">' + esc(mc.label) + '</div>' +
            '<div style="font-size:10px;color:#71717a">Letzte F\u00fctterung: ' + esc(elapsedStr) + ' \u00b7 Feed #' + esc(String(state.feedCount)) + '</div>' +
          '</div>' +
          '<button class="tama-close" onclick="document.getElementById(\'tama-modal\').remove()">\u2715</button>' +
        '</div>' +
        '<div class="tama-score-bar">' +
          '<div class="tama-score-fill" style="width:' + state.health + '%;background:' + scoreColor + '"></div>' +
          '<span class="tama-score-label">' + state.health + '/100</span>' +
        '</div>' +
        '<div class="tama-section-title">Probleme</div>' +
        '<div class="tama-issues">' + issueHTML + '</div>' +
        '<button class="tama-feed-btn" onclick="window.DkzTamagotchi.feed();document.getElementById(\'tama-modal\').remove();setTimeout(function(){window.DkzTamagotchi.showReport()},500)">\u{1F35C} F\u00fcttern</button>' +
      '</div>';

    document.body.appendChild(modal);
  }

  // --- Badge Rendering ---
  function renderBadge() {
    let badge = document.getElementById('tama-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'tama-badge';
      badge.onclick = showReport;
      badge.title = 'DkZ Tamagotchi';
      document.body.appendChild(badge);
    }

    const mc = MOOD_CONFIG[state.mood];
    badge.textContent = mc.emoji;
    badge.style.cssText = 'position:fixed;bottom:80px;right:20px;width:48px;height:48px;' +
      'border-radius:50%;background:rgba(10,10,18,0.85);backdrop-filter:blur(12px);' +
      'border:2px solid ' + mc.color + ';display:flex;align-items:center;justify-content:center;' +
      'font-size:22px;cursor:pointer;z-index:99998;transition:all 0.3s;' +
      'box-shadow:0 0 16px ' + mc.color + '40,0 0 4px ' + mc.color + '80;' +
      'animation:tama-pulse 2s ease-in-out infinite';
  }

  // --- Inject Styles ---
  function injectStyles() {
    if (document.getElementById('tama-styles')) return;
    const style = document.createElement('style');
    style.id = 'tama-styles';
    style.textContent =
      '@keyframes tama-pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }' +
      '#tama-modal { position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
        'background:rgba(0,0,0,0.6);backdrop-filter:blur(8px); }' +
      '.tama-modal-inner { width:380px;max-height:80vh;overflow-y:auto;background:rgba(14,14,18,0.95);' +
        'backdrop-filter:blur(20px);border:1px solid rgba(250,30,78,0.2);border-radius:16px;padding:20px;' +
        'font-family:Inter,sans-serif;color:#f6f6f7; }' +
      '.tama-modal-header { display:flex;align-items:center;gap:12px;margin-bottom:16px; }' +
      '.tama-modal-title { font-size:16px;font-weight:700; }' +
      '.tama-close { margin-left:auto;background:none;border:none;color:#71717a;font-size:16px;cursor:pointer; }' +
      '.tama-score-bar { height:8px;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:16px;position:relative;overflow:hidden; }' +
      '.tama-score-fill { height:100%;border-radius:4px;transition:width 0.5s; }' +
      '.tama-score-label { position:absolute;right:0;top:-18px;font-size:11px;font-family:"JetBrains Mono",monospace;color:#a1a1aa; }' +
      '.tama-section-title { font-size:11px;text-transform:uppercase;color:#71717a;letter-spacing:0.5px;font-weight:600;margin-bottom:6px; }' +
      '.tama-issues { margin-bottom:16px; }' +
      '.tama-issue { padding:4px 8px;margin-bottom:3px;border-radius:6px;font-size:11px;font-family:"JetBrains Mono",monospace; }' +
      '.tama-issue code { background:rgba(255,255,255,0.06);padding:1px 4px;border-radius:3px; }' +
      '.tama-critical { background:rgba(255,59,92,0.1);color:#ff3b5c; }' +
      '.tama-warning { background:rgba(255,184,0,0.1);color:#ffb800; }' +
      '.tama-info { background:rgba(59,130,246,0.1);color:#93c5fd; }' +
      '.tama-feed-btn { width:100%;padding:10px;border:none;border-radius:8px;' +
        'background:linear-gradient(135deg,#fa1e4e,#ec4899);color:#fff;font-weight:700;' +
        'font-size:13px;cursor:pointer;font-family:Inter,sans-serif;transition:opacity 0.2s; }' +
      '.tama-feed-btn:hover { opacity:0.85; }';
    document.head.appendChild(style);
  }

  // --- Auto-Check Timer ---
  let checkTimer = null;
  function startAutoCheck() {
    if (checkTimer) return;
    checkTimer = setInterval(() => {
      runHealthChecks();
      updateMood();

      // Alarm bei kritischen Issues
      if (state.issues.some(i => i.severity === 'critical')) {
        document.dispatchEvent(new CustomEvent('dkz:tamagotchi-alarm', { detail: state.issues }));
      }
    }, CHECK_INTERVAL_MS);
  }

  // --- Init ---
  function init() {
    injectStyles();
    runHealthChecks();
    updateMood();
    renderBadge();
    startAutoCheck();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // --- Public API ---
  window.DkzTamagotchi = {
    feed: feed,
    getStatus: function() { return { mood: state.mood, health: state.health, issues: state.issues, lastFed: state.lastFed }; },
    getReport: function() { return state.reports[0] || null; },
    showReport: showReport,
    VERSION: VERSION
  };
})();
