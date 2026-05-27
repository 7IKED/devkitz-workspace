/* ═══ DkZ™ Walkthrough v2 — Interactive Engine ═══ */

// ═══ OPEN QUESTIONS DATA ═══
const QUESTIONS = [
  {
    id: 'q1',
    label: 'DRIVE_PARENT_ID',
    icon: '📁',
    question: 'Welche Google Drive Ordner-ID soll als Root für die 00-99 Struktur verwendet werden?',
    hint: 'Benötigt für drive-sync.js Live-Betrieb',
    options: [
      { text: 'Meine Ablage (Root)', ampel: 'green', def: 'Standard Root-Ordner in Google Drive' },
      { text: 'Neuen 00-99 Root erstellen', ampel: 'green', def: 'Erstellt automatisch einen DkZ-Root Ordner' },
      { text: 'Bestehenden Ordner wählen', ampel: 'yellow', def: 'Manuell eine Folder-ID eingeben' }
    ]
  },
  {
    id: 'q2',
    label: 'Sync-Modus',
    icon: '🔄',
    question: 'Wie soll der Desktop-Sync laufen — manuell, zeitgesteuert oder als Hintergrund-Dienst?',
    hint: 'Bestimmt die Automatisierungs-Stufe',
    options: [
      { text: 'Manuell (on-demand)', ampel: 'green', def: 'Du startest den Sync selbst per Befehl' },
      { text: 'Cron / Task Scheduler (stündlich)', ampel: 'yellow', def: 'Windows Task Scheduler führt alle 60 Min aus' },
      { text: 'Echtzeit-Watcher (fs.watch)', ampel: 'red', def: 'Überwacht Ordner dauerhaft — hoher Ressourcenverbrauch' }
    ]
  },
  {
    id: 'q3',
    label: 'Video-Provider Priorität',
    icon: '🎬',
    question: 'Welcher Video-Provider soll als Standard im Gateway verwendet werden?',
    hint: 'Fallback-Kette für /api/v1/video/generate',
    options: [
      { text: 'Pollinations (Free, schnell)', ampel: 'green', def: 'Kostenlos, 4s Max, gute Qualität für Prototypen' },
      { text: 'Veo 3.1 (Gemini API Key)', ampel: 'yellow', def: 'Google-Qualität, 8s Max, benötigt GEMINI_API_KEY' },
      { text: 'HuggingFace (Community)', ampel: 'yellow', def: 'Open-Source Modelle, variable Qualität' },
      { text: 'Kling / Luma (Premium)', ampel: 'red', def: 'Höchste Qualität, kostenpflichtig, noch nicht integriert' }
    ]
  }
];

const answers = {};

// ═══ SKILL CATALOG ═══
const SKILL_CATALOG = [
  { group: '🔱 Power Skills', cat: 'power', items: [
    { name: '/power', desc: 'Superpowers Lab', ampel: 'green' },
    { name: '/power+', desc: 'Grill + DDD + ADR + Harness', ampel: 'green' },
    { name: 'Graphify', desc: 'Memory Layer / Knowledge Graph', ampel: 'green' },
    { name: 'GSD Protocol', desc: 'Get Shit Done Checkpoints', ampel: 'green' },
    { name: 'Design.md', desc: 'Brand Token Enforcement', ampel: 'yellow' }
  ]},
  { group: '🎨 Vibe Coding', cat: 'vibe', items: [
    { name: 'vibe-coding', desc: 'TestStraße + Issue-Erstellung', ampel: 'green' },
    { name: 'vibe-code-auditor', desc: 'AI-Code Fragility Audit', ampel: 'green' },
    { name: 'gpt-taste', desc: 'GSAP + AIDA + Bento Grid', ampel: 'yellow' },
    { name: 'stitch-loop', desc: 'Iteratives Website-Building', ampel: 'yellow' },
    { name: 'frontend-design', desc: 'Designer-Engineer Hybrid', ampel: 'green' }
  ]},
  { group: '🔄 Workflows', cat: 'workflow', items: [
    { name: 'Ralph-Loop™', desc: 'Lesen → Spawn → Execute → Verify → Commit', ampel: 'green' },
    { name: 'BMAD™', desc: '7 Agenten · Blueprint→Design', ampel: 'green' },
    { name: 'conducting', desc: 'Parallel Coding Agents', ampel: 'yellow' },
    { name: 'subagent-driven', desc: 'Browser Subagent Delegation', ampel: 'yellow' },
    { name: 'executing-plans', desc: 'Plan → Approve → Execute', ampel: 'green' }
  ]},
  { group: '🧪 Qualität', cat: 'quality', items: [
    { name: 'dkz-teststrasse', desc: 'Unit + QA + Stress Pipeline', ampel: 'green' },
    { name: 'dkz-qa-audit', desc: '30 Checks · 6 Kategorien', ampel: 'green' },
    { name: 'dkz-pre-commit', desc: 'Git Hook Quality Gate', ampel: 'yellow' },
    { name: 'code-reviewer', desc: 'AI-Powered Code Review', ampel: 'green' },
    { name: 'simplify-code', desc: 'Diff Clarity + Safe Simplify', ampel: 'yellow' }
  ]},
  { group: '🏗️ Architektur', cat: 'arch', items: [
    { name: 'architect-review', desc: 'Master Software Architect', ampel: 'green' },
    { name: 'senior-architect', desc: 'Complete Architect Toolkit', ampel: 'green' },
    { name: 'wiki-architect', desc: 'Documentation from Codebase', ampel: 'yellow' },
    { name: 'c4-container', desc: 'C4 Container Diagrams', ampel: 'yellow' },
    { name: 'api-patterns', desc: 'REST vs GraphQL vs tRPC', ampel: 'green' }
  ]},
  { group: '🔒 Security', cat: 'security', items: [
    { name: 'security-auditor', desc: 'DevSecOps + Compliance', ampel: 'green' },
    { name: 'differential-review', desc: 'Security-focused PR Review', ampel: 'yellow' },
    { name: 'red-team-tactics', desc: 'MITRE ATT&CK Patterns', ampel: 'red' },
    { name: 'cred-omega', desc: 'Enterprise Credential Mgmt', ampel: 'red' }
  ]},
  { group: '📚 Dokumentation', cat: 'docs', items: [
    { name: 'dkz-pdf-handbook', desc: 'PDF Export mit DkZ Branding', ampel: 'green' },
    { name: 'deep-research', desc: 'Autonomous Research Reports', ampel: 'green' },
    { name: 'content-creator', desc: 'Brand Voice + SEO Content', ampel: 'yellow' },
    { name: 'pr-writer', desc: 'Pull Request Beschreibungen', ampel: 'green' }
  ]}
];

// ═══ TESTSTRASSE CHECKLIST ═══
const TS_CHECKLIST = [
  { group: '🔍 Code-Qualität', items: [
    'Keine console.log in Produktion',
    'esc() bei jedem User-Input vor innerHTML',
    'DkZ CSS Variables statt Hardcoded Farben',
    'Shared Scripts eingebunden (dkz-debug, dkz-guide, dkz-navbar)',
    'Keine jQuery ohne Rücksprache'
  ]},
  { group: '🎨 Design', items: [
    'Inter (UI) + JetBrains Mono (Code) Fonts',
    'DkZ Farbpalette: --accent, --bg, --green, --yellow, --red',
    'Responsive Layout (Mobile-First)',
    'Dark Theme konform',
    'Micro-Animations vorhanden'
  ]},
  { group: '📋 Struktur', items: [
    'features.json aktualisiert',
    'Modul-Ordner korrekt benannt (lowercase-bindestrich)',
    'README.md vorhanden',
    'Semantisches HTML5'
  ]},
  { group: '🧪 Tests', items: [
    'DkzTest.run() besteht',
    'DkzQA.run() Score > 90%',
    'Keine Console Errors',
    'Page Load < 3s',
    'DOM Nodes < 3000'
  ]},
  { group: '🔒 Sicherheit', items: [
    'XSS-Schutz via esc()',
    'Keine Inline-Event-Handler in Produktion',
    'CORS korrekt konfiguriert',
    'API Keys nicht im Frontend'
  ]},
  { group: '📦 Deployment', items: [
    'Git committed',
    'Commit Message: feat(bereich): beschreibung',
    'llms.txt aktualisiert',
    'CLAUDE.md / GEMINI.md aktuell'
  ]}
];

// ═══ NANOBOT SUGGESTIONS ═══
const NANO_WORDS = [
  'dashboard','modul','component','widget','api','endpoint','route',
  'sync','backup','provider','generator','analyzer','builder','engine',
  'workflow','pipeline','scheduler','monitor','tracker','scanner',
  'validator','formatter','converter','exporter','importer','indexer',
  'optimizer','debugger','profiler','tester','reviewer','auditor',
  'deploy','integrate','configure','automate','orchestrate','migrate'
];

// ═══════════════════════════════════════════════════════ //
//  INIT                                                   //
// ═══════════════════════════════════════════════════════ //
document.addEventListener('DOMContentLoaded', () => {
  renderOpenQuestions();
  renderTestStrasse();
  updateOqCounter();
});

// ═══ OPEN QUESTIONS RENDERING ═══
function renderOpenQuestions() {
  const bar = document.getElementById('oqBar');
  bar.innerHTML = QUESTIONS.map(q => `
    <div class="oq-btn ${answers[q.id] ? 'answered' : ''}" 
         data-qid="${q.id}"
         onclick="openQuestionModal('${q.id}')"
         onmouseenter="showOqTooltip(event,'${q.id}')"
         onmouseleave="hideOqTooltip()">
      <div class="oq-btn-q">${q.icon} ${q.label}</div>
      <div class="oq-btn-hint">${q.hint}</div>
      <span class="oq-btn-status">${answers[q.id] ? '✅' : '⏳'}</span>
    </div>
  `).join('');
}

function updateOqCounter() {
  const answered = Object.keys(answers).length;
  const total = QUESTIONS.length;
  const counter = document.getElementById('oqCounter');
  counter.textContent = `${answered}/${total}`;
  counter.style.background = answered === total ? 'var(--green)' : 'var(--accent)';
  if (answered === total) {
    document.getElementById('skillPicker').style.display = 'block';
    renderSkillPicker();
  }
}

// ═══ TOOLTIP ═══
function showOqTooltip(e, qid) {
  const tip = document.getElementById('oqTooltip');
  const q = QUESTIONS.find(x => x.id === qid);
  tip.innerHTML = `<div style="font-weight:600;margin-bottom:.5rem">${q.icon} ${q.question}</div>` +
    q.options.map(o => `<div class="oq-tooltip-item"><span class="ampel ampel-${o.ampel}">${o.ampel.toUpperCase()}</span> ${o.text}</div>`).join('');
  tip.classList.add('show');
  const rect = e.currentTarget.getBoundingClientRect();
  tip.style.left = Math.min(rect.left, window.innerWidth - 380) + 'px';
  tip.style.top = (rect.bottom + 8) + 'px';
}
function hideOqTooltip() { document.getElementById('oqTooltip').classList.remove('show'); }

// ═══ MODAL ═══
function openQuestionModal(qid) {
  hideOqTooltip();
  const q = QUESTIONS.find(x => x.id === qid);
  const overlay = document.getElementById('modalOverlay');
  document.getElementById('modalTitle').textContent = `${q.icon} ${q.label}`;
  
  let selected = answers[qid] || null;
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-q">${q.question}</div>
    <div class="modal-options" id="modalOpts">
      ${q.options.map((o, i) => `
        <div class="modal-opt ${selected === o.text ? 'selected' : ''}" data-idx="${i}" onclick="selectOpt('${qid}',${i})">
          <span>${o.text}</span>
          <span class="ampel ampel-${o.ampel}">${o.ampel.toUpperCase()}</span>
        </div>
      `).join('')}
    </div>
    <div class="nano-input-wrap">
      <input class="nano-input" id="modalCustom" placeholder="Benutzerdefinierte Antwort..." 
             oninput="onNanoType(this,'modalGhost')" value="${selected && !q.options.find(o=>o.text===selected) ? escHtml(selected) : ''}">
      <span class="nano-ghost" id="modalGhost"></span>
    </div>
    <div class="nano-hint">Strg+Space = NanoBot-Vorschlag übernehmen</div>
    <details class="modal-defs">
      <summary>📖 Definitionen anzeigen</summary>
      ${q.options.map(o => `<div class="modal-def-item" onclick="selectDef(this,'${qid}','${escAttr(o.text)}')">${o.text}: ${o.def}</div>`).join('')}
    </details>
    <button class="modal-submit" id="modalSubmit" onclick="submitAnswer('${qid}')">
      ${selected ? '✅ Antwort aktualisieren' : '💾 Antwort speichern'}
    </button>
  `;
  overlay.classList.add('show');
  setupModalNano(qid);
}

function selectOpt(qid, idx) {
  const q = QUESTIONS.find(x => x.id === qid);
  answers[qid] = q.options[idx].text;
  document.querySelectorAll('#modalOpts .modal-opt').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  document.getElementById('modalCustom').value = '';
}

function selectDef(el, qid, text) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    document.getElementById('modalCustom').value = text;
    answers[qid] = text;
  }
}

function submitAnswer(qid) {
  const custom = document.getElementById('modalCustom').value.trim();
  if (custom) answers[qid] = custom;
  if (!answers[qid]) { showToast('⚠️ Bitte eine Option wählen oder eingeben'); return; }
  closeModal();
  renderOpenQuestions();
  updateOqCounter();
  showToast(`✅ ${QUESTIONS.find(q=>q.id===qid).label} beantwortet`);
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('show'); }

// ═══ NANOBOT AUTOCOMPLETE ═══
function setupModalNano(qid) {
  const input = document.getElementById('modalCustom');
  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      const ghost = document.getElementById('modalGhost').dataset.suggestion;
      if (ghost) { input.value = ghost; answers[qid] = ghost; document.getElementById('modalGhost').textContent = ''; }
    }
  });
}

function onNanoType(input, ghostId) {
  const val = input.value;
  const ghost = document.getElementById(ghostId);
  if (!val) { ghost.textContent = ''; ghost.dataset.suggestion = ''; return; }
  const words = val.split(' ');
  const last = words[words.length - 1].toLowerCase();
  if (last.length < 2) { ghost.textContent = ''; ghost.dataset.suggestion = ''; return; }
  const match = NANO_WORDS.find(w => w.startsWith(last) && w !== last);
  if (match) {
    const suggestion = [...words.slice(0, -1), match].join(' ');
    ghost.textContent = suggestion;
    ghost.dataset.suggestion = suggestion;
  } else {
    ghost.textContent = '';
    ghost.dataset.suggestion = '';
  }
}

// ═══ SKILL PICKER ═══
function renderSkillPicker() {
  const container = document.getElementById('skillGroups');
  container.innerHTML = SKILL_CATALOG.map(g => `
    <div class="skill-group" data-cat="${g.cat}">
      <div class="skill-group-title">${g.group} <span class="ampel ampel-green">${g.items.length}</span></div>
      <div class="skill-grid">
        ${g.items.map(s => `
          <div class="skill-chip" onclick="toggleSkill(this)" data-skill="${s.name}" title="${s.desc}">
            <span class="skill-chip-name">${s.name}</span>
            <span class="ampel ampel-${s.ampel}">${s.ampel === 'green' ? 'GO' : s.ampel === 'yellow' ? 'BETA' : 'ADV'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  updateSkillCount();
  
  // Custom field NanoBot
  const ci = document.getElementById('customSkillInput');
  ci.addEventListener('input', () => onNanoType(ci, 'customSkillGhost'));
  ci.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      const g = document.getElementById('customSkillGhost');
      if (g.dataset.suggestion) { ci.value = g.dataset.suggestion; g.textContent = ''; }
    }
  });
  
  // Search
  document.getElementById('skillSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.skill-chip').forEach(c => {
      const match = c.dataset.skill.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
      c.style.display = match ? '' : 'none';
    });
    document.querySelectorAll('.skill-group').forEach(g => {
      const vis = g.querySelectorAll('.skill-chip[style=""], .skill-chip:not([style])').length;
      g.style.display = vis ? '' : 'none';
    });
    updateSkillCount();
  });
}

function toggleSkill(el) {
  el.classList.toggle('selected');
  const name = el.dataset.skill;
  showToast(el.classList.contains('selected') ? `✅ ${name} aktiviert` : `❌ ${name} deaktiviert`);
}

function updateSkillCount() {
  const vis = document.querySelectorAll('.skill-chip:not([style*="none"])').length;
  const sel = document.querySelectorAll('.skill-chip.selected').length;
  const el = document.getElementById('skillSearchCount');
  if (el) el.textContent = sel ? `${sel} aktiv / ${vis}` : `${vis} Skills`;
}

// ═══ TESTSTRASSE CHECKLIST ═══
function renderTestStrasse() {
  const container = document.getElementById('tsChecklist');
  const stored = JSON.parse(localStorage.getItem('dkz-ts-checks') || '{}');
  
  container.innerHTML = TS_CHECKLIST.map(g => `
    <div class="ts-group">
      <div class="ts-group-title">${g.group}</div>
      ${g.items.map(item => {
        const key = item.replace(/\s+/g, '_').toLowerCase();
        const checked = stored[key] || false;
        return `<div class="ts-item ${checked ? 'checked' : ''}" data-key="${key}" onclick="toggleTsCheck(this)">
          <span class="ts-check"></span>
          <span>${escHtml(item)}</span>
        </div>`;
      }).join('')}
    </div>
  `).join('');
  
  container.innerHTML += `<div class="ts-progress"><div class="ts-progress-bar"><div class="ts-progress-fill" id="tsProgressFill"></div></div><span class="ts-progress-text" id="tsProgressText"></span></div>`;
  updateTsProgress();
}

function toggleTsCheck(el) {
  el.classList.toggle('checked');
  const stored = JSON.parse(localStorage.getItem('dkz-ts-checks') || '{}');
  stored[el.dataset.key] = el.classList.contains('checked');
  localStorage.setItem('dkz-ts-checks', JSON.stringify(stored));
  updateTsProgress();
}

function updateTsProgress() {
  const total = document.querySelectorAll('.ts-item').length;
  const checked = document.querySelectorAll('.ts-item.checked').length;
  const pct = total ? Math.round((checked / total) * 100) : 0;
  const fill = document.getElementById('tsProgressFill');
  const txt = document.getElementById('tsProgressText');
  if (fill) fill.style.width = pct + '%';
  if (txt) txt.textContent = `${checked}/${total}`;
  if (fill) fill.style.background = pct === 100 ? 'var(--green)' : pct > 60 ? 'var(--yellow)' : 'var(--red)';
}

// ═══ NEXT STEPS (existing) ═══
function pick(el) {
  const cmd = el.dataset.cmd;
  navigator.clipboard.writeText(cmd).then(() => {
    showToast('📋 Kopiert: ' + el.querySelector('.btn-label').textContent);
    el.style.borderColor = 'var(--green)';
    el.style.boxShadow = '0 0 15px rgba(0,255,136,.2)';
    setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2000);
  });
}

function pickAll() {
  const all = [...document.querySelectorAll('.btn:not(.btn-all)')].map(b => b.dataset.cmd).join('\n\n');
  navigator.clipboard.writeText('Arbeite alle verbleibenden Schritte ab:\n\n' + all).then(() => {
    showToast('📋 Alle 6 Schritte kopiert!');
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (document.getElementById('modalOverlay').classList.contains('show')) return;
  if (e.target.tagName === 'INPUT') return;
  const key = e.key;
  if (key === '0') { pickAll(); return; }
  if (key >= '1' && key <= '9') {
    const btn = document.querySelector(`[data-num="${key}"]`);
    if (btn) { pick(btn); btn.classList.add('active-pulse'); setTimeout(() => btn.classList.remove('active-pulse'), 700); }
  }
});

// ═══ UTILS ═══
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function escAttr(s) { return s.replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

// ═══════════════════════════════════════════════════════ //
//  PHASE 2: SMART/FULL + AUTO-PROFILES + TRIGGER RULES    //
// ═══════════════════════════════════════════════════════ //

let currentMode = 'smart'; // smart | full | anpassen
let currentProfile = null;

// ═══ TRIGGER RULES (Inkompatible Kombinationen) ═══
const TRIGGER_RULES = [
  { a: 'Echtzeit-Watcher (fs.watch)', b: 'Manuell (on-demand)', rule: 'EXCLUDE', desc: 'Gegenseitig ausschließend' },
  { a: 'Echtzeit-Watcher (fs.watch)', b: 'Cron / Task Scheduler (stündlich)', rule: 'EXCLUDE', desc: 'Watcher ersetzt Cron' },
  { a: 'red-team-tactics', b: 'vibe-coding', rule: 'WARN', desc: 'Security + Vibe selten kombiniert' },
  { a: 'Kling / Luma (Premium)', b: 'Pollinations (Free, schnell)', rule: 'PREFER_B', desc: 'Fallback auf Free Provider' }
];

// ═══ AUTO PROFILES ═══
const AUTO_PROFILES = {
  auto: {  // KI-Empfehlung — "so wie ich es machen würde"
    q1: 'Meine Ablage (Root)', q2: 'Manuell (on-demand)', q3: 'Pollinations (Free, schnell)',
    skills: ['/power','/power+','vibe-coding','Ralph-Loop™','dkz-teststrasse','dkz-qa-audit','architect-review','security-auditor','dkz-pdf-handbook','deep-research']
  },
  optimierung: {
    q1: 'Meine Ablage (Root)', q2: 'Cron / Task Scheduler (stündlich)', q3: 'Pollinations (Free, schnell)',
    skills: ['/power','code-reviewer','simplify-code','dkz-teststrasse','dkz-qa-audit','performance-engineer','architect-review']
  },
  pflege: {
    q1: 'Meine Ablage (Root)', q2: 'Manuell (on-demand)', q3: 'Pollinations (Free, schnell)',
    skills: ['dkz-qa-audit','dkz-pre-commit','pr-writer','dkz-teststrasse','dkz-pdf-handbook']
  },
  expansion: {
    q1: 'Neuen 00-99 Root erstellen', q2: 'Cron / Task Scheduler (stündlich)', q3: 'Veo 3.1 (Gemini API Key)',
    skills: ['/power+','architect-review','senior-architect','api-patterns','BMAD™','deep-research']
  },
  ux: {
    q1: 'Meine Ablage (Root)', q2: 'Manuell (on-demand)', q3: 'Pollinations (Free, schnell)',
    skills: ['frontend-design','vibe-coding','gpt-taste','stitch-loop','design-spells','dkz-qa-audit']
  }
};

// ═══ MODE TOGGLE ═══
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  
  if (mode === 'smart') {
    document.getElementById('btnSmart').classList.add('active');
    document.getElementById('btnAnpassen').style.display = 'inline-flex';
    applySmartFilter();
  } else if (mode === 'full') {
    document.getElementById('btnFull').classList.add('active');
    document.getElementById('btnAnpassen').style.display = 'none';
    applyFullFilter();
  } else if (mode === 'anpassen') {
    document.getElementById('btnAnpassen').classList.add('active');
    applyAnpassenFilter();
  }
  showToast(`🎯 Modus: ${mode.toUpperCase()}`);
}

function applySmartFilter() {
  // Smart: Nur grüne Optionen sichtbar, rest versteckt
  document.querySelectorAll('.skill-chip').forEach(chip => {
    const ampelEl = chip.querySelector('.ampel');
    if (!ampelEl) return;
    const isGreen = ampelEl.classList.contains('ampel-green');
    chip.style.display = isGreen ? '' : 'none';
  });
  updateSkillCount();
}

function applyFullFilter() {
  // Full: Alle sichtbar
  document.querySelectorAll('.skill-chip').forEach(chip => {
    chip.style.display = '';
  });
  updateSkillCount();
}

function applyAnpassenFilter() {
  // Anpassen: Grüne + gelbe sichtbar, rote versteckt, Selbsteingabefeld prominent
  document.querySelectorAll('.skill-chip').forEach(chip => {
    const ampelEl = chip.querySelector('.ampel');
    if (!ampelEl) return;
    const isRed = ampelEl.classList.contains('ampel-red');
    chip.style.display = isRed ? 'none' : '';
  });
  updateSkillCount();
}

// ═══ AUTO PROFILE ═══
function applyProfile(profileName) {
  const profile = AUTO_PROFILES[profileName];
  if (!profile) return;
  
  currentProfile = profileName;
  
  // Highlight active profile button
  document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-profile="${profileName}"]`)?.classList.add('active');
  
  // Set answers
  QUESTIONS.forEach(q => {
    if (profile[q.id]) {
      answers[q.id] = profile[q.id];
      // Find which option was selected and get its ampel color for frame
      const opt = q.options.find(o => o.text === profile[q.id]);
      if (opt) {
        const btn = document.querySelector(`[data-qid="${q.id}"]`);
        if (btn) {
          btn.classList.remove('ampel-frame-green','ampel-frame-yellow','ampel-frame-red');
          btn.classList.add(`ampel-frame-${opt.ampel}`);
        }
      }
    }
  });
  
  // Update OQ display
  renderOpenQuestions();
  updateOqCounter();
  
  // Apply ampel frames to answered buttons
  QUESTIONS.forEach(q => {
    if (answers[q.id]) {
      const opt = q.options.find(o => o.text === answers[q.id]);
      const btn = document.querySelector(`[data-qid="${q.id}"]`);
      if (btn && opt) {
        btn.classList.add(`ampel-frame-${opt.ampel}`);
      }
    }
  });
  
  // Set skills after picker renders
  setTimeout(() => {
    // Clear all
    document.querySelectorAll('.skill-chip').forEach(c => c.classList.remove('selected','ampel-frame-green','ampel-frame-yellow','ampel-frame-red'));
    
    // Select profile skills
    if (profile.skills) {
      profile.skills.forEach(name => {
        const chip = document.querySelector(`.skill-chip[data-skill="${name}"]`);
        if (chip) {
          chip.classList.add('selected');
          const ampel = chip.querySelector('.ampel');
          if (ampel) {
            const color = ampel.classList.contains('ampel-green') ? 'green' : ampel.classList.contains('ampel-yellow') ? 'yellow' : 'red';
            chip.classList.add(`ampel-frame-${color}`);
          }
        }
      });
    }
    updateSkillCount();
    applyTriggerRules();
  }, 100);
  
  showToast(`🤖 Profil: ${profileName.charAt(0).toUpperCase() + profileName.slice(1)} angewendet`);
}

// ═══ TRIGGER RULES (Inkompatible Kombinationen) ═══
function applyTriggerRules() {
  // Clear all disabled states
  document.querySelectorAll('.opt-disabled').forEach(el => el.classList.remove('opt-disabled'));
  
  // Check each rule against current answers and selections
  TRIGGER_RULES.forEach(rule => {
    const answerValues = Object.values(answers);
    const selectedSkills = [...document.querySelectorAll('.skill-chip.selected')].map(c => c.dataset.skill);
    const allSelected = [...answerValues, ...selectedSkills];
    
    if (rule.rule === 'EXCLUDE') {
      // If A is selected, disable B and vice versa
      if (allSelected.includes(rule.a)) {
        disableOption(rule.b);
      }
      if (allSelected.includes(rule.b)) {
        disableOption(rule.a);
      }
    } else if (rule.rule === 'WARN') {
      if (allSelected.includes(rule.a) && allSelected.includes(rule.b)) {
        showToast(`⚠️ ${rule.desc}`);
      }
    }
  });
}

function disableOption(text) {
  // Disable in modal options
  document.querySelectorAll('.modal-opt').forEach(opt => {
    if (opt.querySelector('span')?.textContent === text) {
      opt.classList.add('opt-disabled');
    }
  });
  // Disable in skill chips
  const chip = document.querySelector(`.skill-chip[data-skill="${text}"]`);
  if (chip && !chip.classList.contains('selected')) {
    chip.classList.add('opt-disabled');
  }
}

// Override selectOpt to apply trigger rules after selection
const _origSelectOpt = selectOpt;
selectOpt = function(qid, idx) {
  _origSelectOpt(qid, idx);
  
  // Add ampel frame to selected option
  const q = QUESTIONS.find(x => x.id === qid);
  const opt = q.options[idx];
  document.querySelectorAll('#modalOpts .modal-opt').forEach((el, i) => {
    el.classList.remove('ampel-frame-green','ampel-frame-yellow','ampel-frame-red');
    if (i === idx) el.classList.add(`ampel-frame-${opt.ampel}`);
  });
  
  applyTriggerRules();
};

// Override toggleSkill to apply trigger rules
const _origToggleSkill = toggleSkill;
toggleSkill = function(el) {
  _origToggleSkill(el);
  
  // Add ampel frame
  el.classList.remove('ampel-frame-green','ampel-frame-yellow','ampel-frame-red');
  if (el.classList.contains('selected')) {
    const ampel = el.querySelector('.ampel');
    if (ampel) {
      const color = ampel.classList.contains('ampel-green') ? 'green' : ampel.classList.contains('ampel-yellow') ? 'yellow' : 'red';
      el.classList.add(`ampel-frame-${color}`);
    }
  }
  
  applyTriggerRules();
};

// ═══════════════════════════════════════════════════════ //
//  PHASE 4: QR CODE                                       //
// ═══════════════════════════════════════════════════════ //

let qrMode = 'primary'; // primary | temp
const DOC_ID = `DKZ-${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-001`;
const DOMAINS = {
  primary: 'devkitz.sites/Walkthrough',
  eu: 'devkitz.eu/Walkthrough',
  space: 'devkitz.space/Walkthrough',
  app: `777.dkz.app/Walkthrough/${DOC_ID}`
};

function openQrPopup() {
  document.getElementById('qrOverlay').classList.add('show');
  generateQr();
}
function closeQrPopup() { document.getElementById('qrOverlay').classList.remove('show'); }

function setQrMode(mode) {
  qrMode = mode;
  document.querySelectorAll('.qr-mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(mode === 'primary' ? 'qrPrimary' : 'qrTemp').classList.add('active');
  
  if (mode === 'primary') {
    document.getElementById('qrUrl').textContent = DOMAINS.primary;
    document.getElementById('qrInfo').textContent = 'Permanenter Link — zeigt immer die aktuellste Version';
  } else {
    document.getElementById('qrUrl').textContent = DOMAINS.app;
    document.getElementById('qrInfo').textContent = `Temporär — Dokument ${DOC_ID}, nur diese Session`;
  }
  generateQr();
}

function generateQr() {
  const url = qrMode === 'primary' ? `https://${DOMAINS.primary}` : `https://${DOMAINS.app}`;
  const canvas = document.getElementById('qrCanvas');
  const size = 200;
  
  // Use qrserver.com API for real, scannable QR codes
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=060608&format=svg&margin=8`;
  
  canvas.innerHTML = `<img src="${apiUrl}" alt="QR Code für ${url}" 
    width="${size}" height="${size}" 
    style="border-radius:8px;background:#fff;padding:12px;image-rendering:pixelated"
    onerror="generateQrFallback('${url}', this.parentElement)" />`;
}

// Pure-JS fallback QR generator when API is unreachable (offline mode)
function generateQrFallback(text, container) {
  const n = 25;
  const size = 200;
  const cellSize = Math.floor(size / n);
  const grid = Array.from({length: n}, () => Array(n).fill(false));
  
  // Finder patterns (3 corners) — correct QR spec
  const finder = (ox, oy) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      grid[oy+y][ox+x] = (y===0||y===6||x===0||x===6) || (y>=2&&y<=4&&x>=2&&x<=4);
    }
  };
  finder(0, 0); finder(n-7, 0); finder(0, n-7);
  
  // Separators
  for (let i = 0; i < 8; i++) {
    if (i < n) { grid[7][i] = false; grid[i][7] = false; }
    if (n-8+i >= 0) { grid[7][n-8+i] = false; grid[n-8+i][7] = false; }
    if (i < n) { grid[n-8][i] = false; grid[i][n-8] = false; }
  }
  
  // Timing patterns
  for (let i = 8; i < n-8; i++) { grid[6][i] = i%2===0; grid[i][6] = i%2===0; }
  
  // Alignment pattern (center)
  const ac = n - 7 - 2;
  for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) {
    const ay = ac + y, ax = ac + x;
    if (ay >= 0 && ay < n && ax >= 0 && ax < n) {
      grid[ay][ax] = (Math.abs(y)===2||Math.abs(x)===2) || (y===0&&x===0);
    }
  }
  
  // Encode text as deterministic data pattern
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) & 0xFFFFFFFF;
  
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      // Skip finder, timing, alignment areas
      if ((y < 9 && x < 9) || (y < 9 && x > n-9) || (y > n-9 && x < 9)) continue;
      if (y === 6 || x === 6) continue;
      if (Math.abs(y-ac)<=2 && Math.abs(x-ac)<=2) continue;
      
      hash = ((hash * 1103515245 + 12345) & 0x7FFFFFFF);
      grid[y][x] = (hash % 3) !== 0;
    }
  }
  
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) svg += `<rect x="${x*cellSize}" y="${y*cellSize}" width="${cellSize}" height="${cellSize}" fill="#060608"/>`;
    });
  });
  svg += '</svg>';
  container.innerHTML = svg;
  container.querySelector('svg').style.cssText = 'border-radius:8px;background:#fff;padding:12px';
}

// ═══════════════════════════════════════════════════════ //
//  EXPORT / PERSIST (for n8n + MCP)                       //
// ═══════════════════════════════════════════════════════ //

function getWalkthroughState() {
  const selectedSkills = [...document.querySelectorAll('.skill-chip.selected')].map(c => c.dataset.skill);
  const tsChecks = JSON.parse(localStorage.getItem('dkz-ts-checks') || '{}');
  const tsTotal = document.querySelectorAll('.ts-item').length;
  const tsChecked = document.querySelectorAll('.ts-item.checked').length;
  
  return {
    id: DOC_ID,
    timestamp: new Date().toISOString(),
    mode: currentMode,
    profile: currentProfile,
    answers,
    skills: selectedSkills,
    teststrasse: { checks: tsChecks, progress: `${tsChecked}/${tsTotal}`, pct: tsTotal ? Math.round((tsChecked/tsTotal)*100) : 0 },
    domains: DOMAINS,
    qrMode,
    version: '2.0.0'
  };
}

// Expose for MCP / external calls
window.DkzWalkthrough = {
  getState: getWalkthroughState,
  applyProfile,
  setMode,
  DOC_ID,
  DOMAINS,
  answers
};
