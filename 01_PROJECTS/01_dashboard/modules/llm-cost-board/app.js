// DkZ LLM Cost Board — Application Logic
(function () {
  'use strict';

  // State
  let state = {
    hours: 8, utilization: 75, tokensPerHour: 500000,
    activeTab: 'role-board', roles: {},
    podcastLength: 10, podcastPages: 50,
    imgCount: 10, videoSec: 30, speechChars: 50000
  };

  const TABS = [
    { id: 'role-board', label: '🎯 Role Board' },
    { id: 'llm-models', label: '🧠 LLM Models' },
    { id: 'image-models', label: '🎨 Image & Video' },
    { id: 'speech-models', label: '🔊 Speech & TTS' },
    { id: 'ocr-models', label: '📄 OCR Models' },
    { id: 'notebooklm', label: '📓 NotebookLM' },
    { id: 'google-studio', label: '🔬 Google AI Studio' },
    { id: 'debug-tools', label: '🐛 Debug Tools' },
    { id: 'nano-models', label: '⚡ Nano & OpenClaw' },
    { id: 'voice-bots', label: '📞 Voice Bots' },
    { id: 'uncensored', label: '🔓 Uncensored Models' },
    { id: 'module-builder', label: '🧩 Module Builder' },
    { id: 'live-tracker', label: '📊 Live-Tracker' },
    { id: 'ecosystem-costs', label: '🏗️ Ökosystem' },
    { id: 'timeline', label: '📈 Timeline' },
    { id: 'cost-tags', label: '🏷️ Tags' }
  ];

  const provClass = p => {
    const m = {
      'OpenAI': 'openai', 'Anthropic': 'anthropic', 'Google': 'google', 'xAI': 'xai',
      'DeepSeek': 'deepseek', 'Alibaba': 'alibaba', 'Moonshot': 'moonshot', 'MiniMax': 'minimax',
      'Zhipu AI': 'zhipu', 'Mistral': 'mistral', 'Meta': 'meta', 'Community': 'local',
      'HuggingFace': 'local', 'Stability': 'local', 'H2O': 'local', 'OpenBMB': 'local',
      'Shanghai AI': 'local', '01.AI': 'local', 'BFL': 'local'
    };
    return 'prov-' + (m[p] || 'local');
  };

  function init() {
    renderTabs();
    renderAllPanels();
    setTab('role-board');
    updateStats();
  }

  function renderTabs() {
    const nav = document.getElementById('tabNav');
    nav.innerHTML = TABS.map(t => `<button class="tab" data-tab="${t.id}" onclick="setTab('${t.id}')">${t.label}</button>`).join('');
  }

  window.setTab = function (id) {
    state.activeTab = id;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
  };

  function renderAllPanels() {
    const c = document.getElementById('panelContainer');
    c.innerHTML = TABS.map(t => `<div class="panel" id="panel-${t.id}"></div>`).join('');
    renderControls();
    renderRoleBoard();
    renderLLMModels();
    renderImageVideo();
    renderSpeech();
    renderOCR();
    renderNotebookLM();
    renderGoogleStudio();
    renderDebugTools();
    renderNanoModels();
    renderVoiceBots();
    renderUncensored();
    renderModuleBuilder();
    renderLiveTracker();
    renderEcosystemCosts();
    renderTimeline();
    renderCostTags();
  }

  function renderControls() {
    // Insert global controls before panels
    const ctrl = document.createElement('div');
    ctrl.className = 'controls';
    ctrl.innerHTML = `
  <div class="ctrl-card">
    <label>Betriebsstunden / Tag</label>
    <div class="val-display" id="vHours">${state.hours}h</div>
    <input type="range" min="0.5" max="24" step="0.5" value="${state.hours}" oninput="updateSlider('hours',this.value)">
  </div>
  <div class="ctrl-card">
    <label>Auslastung / Utilization</label>
    <div class="val-display" id="vUtil">${state.utilization}%</div>
    <input type="range" min="1" max="100" step="1" value="${state.utilization}" oninput="updateSlider('util',this.value)">
  </div>
  <div class="ctrl-card">
    <label>Tokens / Stunde</label>
    <div class="val-display" id="vTokens">${(state.tokensPerHour / 1000).toFixed(0)}K</div>
    <input type="range" min="10000" max="5000000" step="10000" value="${state.tokensPerHour}" oninput="updateSlider('tokens',this.value)">
  </div>`;
    document.getElementById('panelContainer').prepend(ctrl);
  }

  window.updateSlider = function (type, val) {
    val = parseFloat(val);
    if (type === 'hours') { state.hours = val; document.getElementById('vHours').textContent = val + 'h'; }
    if (type === 'util') { state.utilization = val; document.getElementById('vUtil').textContent = val + '%'; }
    if (type === 'tokens') { state.tokensPerHour = val; document.getElementById('vTokens').textContent = (val / 1000).toFixed(0) + 'K'; }
    updateAllCosts();
    updateStats();
  };

  function calcDailyCost(m) {
    const tph = state.tokensPerHour * (state.utilization / 100);
    const totalIn = tph * state.hours * 0.6;
    const totalOut = tph * state.hours * 0.4;
    return (totalIn / 1e6) * m.input + (totalOut / 1e6) * m.output;
  }

  function updateAllCosts() {
    document.querySelectorAll('.mc-cost .cost-val').forEach(el => {
      const id = el.dataset.modelId;
      const m = MODELS.llm.find(x => x.id === id);
      if (m) el.textContent = '€' + calcDailyCost(m).toFixed(2) + '/Tag';
    });
    // Update role costs
    ROLES.forEach(r => {
      if (state.roles[r.id]) {
        const m = MODELS.llm.find(x => x.id === state.roles[r.id]);
        if (m) { const el = document.getElementById('rcost-' + r.id); if (el) el.textContent = '€' + calcDailyCost(m).toFixed(2) + '/Tag'; }
      }
    });
  }

  function updateStats() {
    document.getElementById('totalModels').textContent = MODELS.llm.length + MODELS.image.length + MODELS.video.length + MODELS.speech.length + MODELS.ocr.length;
    let totalCost = 0;
    Object.values(state.roles).forEach(mid => {
      const m = MODELS.llm.find(x => x.id === mid);
      if (m) totalCost += calcDailyCost(m);
    });
    document.getElementById('totalCost').textContent = '€' + totalCost.toFixed(2);
    document.getElementById('totalRoles').textContent = Object.keys(state.roles).length + '/' + ROLES.length;
  }

  // == ROLE BOARD ==
  function renderRoleBoard() {
    const p = document.getElementById('panel-role-board');
    p.innerHTML = `<h2 style="font-size:1.1rem;margin-bottom:16px;font-weight:700">🎯 LLM Role Assignment Board</h2>
  <div class="role-board">
    <div class="role-list" id="roleSlots"></div>
    <div>
      <div class="filter-bar"><input type="text" id="roleFilter" placeholder="Model suchen..." oninput="filterRolePicker(this.value)"></div>
      <div class="model-picker" id="modelPicker"></div>
    </div>
  </div>
  <div class="summary-card" id="roleSummary"></div>`;
    renderRoleSlots();
    renderModelPicker();
    updateRoleSummary();
  }

  let activeRoleSlot = null;

  function renderRoleSlots() {
    document.getElementById('roleSlots').innerHTML = ROLES.map(r => {
      const mid = state.roles[r.id];
      const m = mid ? MODELS.llm.find(x => x.id === mid) : null;
      return `<div class="role-slot ${m ? 'filled' : ''}" onclick="selectRole('${r.id}')">
      <div class="r-name">${r.name}</div>
      <div style="font-size:.65rem;color:var(--text3)">${r.desc}</div>
      ${m ? `<div class="r-model">${m.name} (${m.provider})</div><div class="r-cost" id="rcost-${r.id}">€${calcDailyCost(m).toFixed(2)}/Tag</div>`
          : '<div style="font-size:.65rem;color:var(--text3);margin-top:4px">Klicken zum Zuweisen →</div>'}
    </div>`;
    }).join('');
  }

  window.selectRole = function (rid) { activeRoleSlot = rid; document.querySelectorAll('.role-slot').forEach((s, i) => s.style.borderColor = ROLES[i].id === rid ? 'var(--accent)' : ''); };

  window.assignModel = function (mid) {
    if (!activeRoleSlot) return;
    state.roles[activeRoleSlot] = mid;
    renderRoleSlots();
    updateRoleSummary();
    updateStats();
    updateAllCosts();
  };

  function renderModelPicker(filter = '') {
    const f = filter.toLowerCase();
    document.getElementById('modelPicker').innerHTML = MODELS.llm.filter(m => !f || m.name.toLowerCase().includes(f) || m.provider.toLowerCase().includes(f))
      .map(m => `<div class="mp-item" onclick="assignModel('${m.id}')">
      <div><div class="mp-name">${m.name}</div><div style="font-size:.6rem;color:var(--text3)">${m.provider} • ${(m.ctx / 1000).toFixed(0)}K ctx</div></div>
      <div class="mp-cost">€${calcDailyCost(m).toFixed(2)}/d</div>
    </div>`).join('');
  }

  window.filterRolePicker = function (v) { renderModelPicker(v); };

  function updateRoleSummary() {
    let total = 0, items = [];
    ROLES.forEach(r => {
      if (state.roles[r.id]) {
        const m = MODELS.llm.find(x => x.id === state.roles[r.id]);
        if (m) { const c = calcDailyCost(m); total += c; items.push({ role: r.name, model: m.name, cost: c }); }
      }
    });
    document.getElementById('roleSummary').innerHTML = `<h3>💰 Gesamtkosten Übersicht</h3>
  <div class="summary-grid">
    <div class="sg-item"><div class="sg-val">€${total.toFixed(2)}</div><div class="sg-lbl">Pro Tag</div></div>
    <div class="sg-item"><div class="sg-val">€${(total * 30).toFixed(2)}</div><div class="sg-lbl">Pro Monat</div></div>
    <div class="sg-item"><div class="sg-val">€${(total * 365).toFixed(2)}</div><div class="sg-lbl">Pro Jahr</div></div>
    <div class="sg-item"><div class="sg-val">${Object.keys(state.roles).length}/${ROLES.length}</div><div class="sg-lbl">Rollen Besetzt</div></div>
  </div>
  ${items.length ? `<table class="data-table" style="margin-top:16px"><tr><th>Rolle</th><th>Model</th><th>€/Tag</th><th>€/Monat</th></tr>
  ${items.map(i => `<tr><td>${i.role}</td><td>${i.model}</td><td style="color:var(--accent)">€${i.cost.toFixed(2)}</td><td>€${(i.cost * 30).toFixed(2)}</td></tr>`).join('')}</table>` : '<p style="color:var(--text3);margin-top:12px;font-size:.8rem">Wähle eine Rolle links und weise ein Model rechts zu.</p>'}`;
  }

  // == LLM MODELS ==
  function renderLLMModels() {
    const p = document.getElementById('panel-llm-models');
    p.innerHTML = `<div class="filter-bar">
    <input type="text" id="llmSearch" placeholder="Model suchen..." oninput="filterLLM()">
    <select id="llmProvider" onchange="filterLLM()"><option value="">Alle Provider</option>
    ${[...new Set(MODELS.llm.map(m => m.provider))].map(p => `<option>${p}</option>`).join('')}</select>
    <select id="llmSort" onchange="filterLLM()"><option value="cost">Kosten ↑</option><option value="costh">Kosten ↓</option><option value="name">Name</option></select>
  </div><div class="model-grid" id="llmGrid"></div>`;
    window.filterLLM = function () {
      const s = document.getElementById('llmSearch').value.toLowerCase();
      const pv = document.getElementById('llmProvider').value;
      const sort = document.getElementById('llmSort').value;
      let list = MODELS.llm.filter(m => (!s || m.name.toLowerCase().includes(s) || m.provider.toLowerCase().includes(s)) && (!pv || m.provider === pv));
      if (sort === 'cost') list.sort((a, b) => calcDailyCost(a) - calcDailyCost(b));
      if (sort === 'costh') list.sort((a, b) => calcDailyCost(b) - calcDailyCost(a));
      if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
      document.getElementById('llmGrid').innerHTML = list.map(m => `<div class="model-card">
      <div class="mc-head"><span class="mc-name">${m.name}</span><span class="mc-provider ${provClass(m.provider)}">${m.provider}</span></div>
      <div class="mc-prices">
        <div class="mc-price"><div class="p-val" style="color:var(--green)">$${m.input}</div><div class="p-lbl">Input/1M tok</div></div>
        <div class="mc-price"><div class="p-val" style="color:var(--orange)">$${m.output}</div><div class="p-lbl">Output/1M tok</div></div>
      </div>
      <div class="mc-meta">
        <span class="mc-tag">${(m.ctx / 1000).toFixed(0)}K ctx</span>
        ${m.local ? '<span class="mc-tag" style="color:var(--green)">🖥 Local</span>' : ''}
        ${m.uncensored ? '<span class="badge-uncensored">Uncensored</span>' : ''}
        ${m.input === 0 && m.output === 0 ? '<span class="badge-free">FREE</span>' : ''}
        <span class="mc-tag">${m.notes}</span>
      </div>
      <div class="mc-cost"><div class="cost-val" data-model-id="${m.id}">€${calcDailyCost(m).toFixed(2)}/Tag</div><div class="cost-lbl">Geschätzte Tageskosten bei aktueller Auslastung</div></div>
    </div>`).join('');
    };
    filterLLM();
  }

  // == IMAGE & VIDEO ==
  function renderImageVideo() {
    const p = document.getElementById('panel-image-models');
    p.innerHTML = `
  <div class="controls" style="grid-template-columns:1fr 1fr">
    <div class="ctrl-card"><label>Bilder pro Tag</label><div class="val-display" id="vImg">${state.imgCount}</div>
    <input type="range" min="1" max="500" step="1" value="${state.imgCount}" oninput="state.imgCount=+this.value;document.getElementById('vImg').textContent=this.value;renderImgCards()"></div>
    <div class="ctrl-card"><label>Video Sekunden / Tag</label><div class="val-display" id="vVid">${state.videoSec}s</div>
    <input type="range" min="1" max="300" step="1" value="${state.videoSec}" oninput="state.videoSec=+this.value;document.getElementById('vVid').textContent=this.value+'s';renderVidCards()"></div>
  </div>
  <h3 style="margin:12px 0 8px;font-size:.9rem">🎨 Bild-Generierung</h3>
  <div class="model-grid" id="imgGrid"></div>
  <h3 style="margin:16px 0 8px;font-size:.9rem">🎬 Video-Generierung</h3>
  <div class="model-grid" id="vidGrid"></div>`;
    window.renderImgCards = function () {
      document.getElementById('imgGrid').innerHTML = MODELS.image.map(m => `<div class="model-card">
      <div class="mc-head"><span class="mc-name">${m.name}</span><span class="mc-provider prov-${m.provider === 'OpenAI' ? 'openai' : 'local'}">${m.provider}</span></div>
      <div class="mc-prices">
        <div class="mc-price"><div class="p-val" style="color:var(--cyan)">$${m.cost}</div><div class="p-lbl">Standard</div></div>
        <div class="mc-price"><div class="p-val" style="color:var(--purple)">$${m.costHd}</div><div class="p-lbl">HD/Pro</div></div>
      </div>
      <div class="mc-meta"><span class="mc-tag">${m.resolution}</span><span class="mc-tag">${m.notes}</span></div>
      <div class="mc-cost"><div class="cost-val">€${(m.cost * state.imgCount).toFixed(2)}/Tag</div><div class="cost-lbl">${state.imgCount} Bilder × $${m.cost}</div></div>
    </div>`).join('');
    };
    window.renderVidCards = function () {
      document.getElementById('vidGrid').innerHTML = MODELS.video.map(m => `<div class="model-card">
      <div class="mc-head"><span class="mc-name">${m.name}</span><span class="mc-provider prov-${(m.provider === 'OpenAI' ? 'openai' : m.provider === 'Zhipu' ? 'zhipu' : 'local')}">${m.provider}</span></div>
      <div class="mc-prices"><div class="mc-price" style="grid-column:span 2"><div class="p-val" style="color:var(--yellow)">$${m.cost}</div><div class="p-lbl">${m.unit}</div></div></div>
      <div class="mc-meta"><span class="mc-tag">${m.notes}</span>${m.cost === 0 ? '<span class="badge-free">FREE LOCAL</span>' : ''}</div>
      <div class="mc-cost"><div class="cost-val">€${(m.cost * state.videoSec).toFixed(2)}/Tag</div><div class="cost-lbl">${state.videoSec}s × $${m.cost}/s</div></div>
    </div>`).join('');
    };
    renderImgCards(); renderVidCards();
  }

  // == SPEECH ==
  function renderSpeech() {
    const p = document.getElementById('panel-speech-models');
    p.innerHTML = `<div class="ctrl-card" style="margin-bottom:16px"><label>Zeichen / Tag für TTS</label>
    <div class="val-display" id="vSpeech">${(state.speechChars / 1000).toFixed(0)}K</div>
    <input type="range" min="1000" max="1000000" step="1000" value="${state.speechChars}" oninput="state.speechChars=+this.value;document.getElementById('vSpeech').textContent=(this.value/1000).toFixed(0)+'K';renderSpeechCards()"></div>
  <div class="model-grid" id="speechGrid"></div>`;
    window.renderSpeechCards = function () {
      document.getElementById('speechGrid').innerHTML = MODELS.speech.map(m => {
        let daily = 0;
        if (m.unit.includes('1M')) { daily = (state.speechChars / 1e6) * m.cost; }
        else if (m.unit.includes('1K')) { daily = (state.speechChars / 1000) * m.cost; }
        else if (m.unit === 'open source') { daily = 0; }
        else { daily = m.cost * 60; } // per minute estimate
        return `<div class="model-card">
        <div class="mc-head"><span class="mc-name">${m.name}</span><span class="mc-provider prov-google">${m.provider || ''}</span></div>
        <div class="mc-prices"><div class="mc-price" style="grid-column:span 2"><div class="p-val" style="color:var(--cyan)">$${m.cost}</div><div class="p-lbl">${m.unit}</div></div></div>
        <div class="mc-meta"><span class="mc-tag">${m.notes}</span>${m.cost === 0 ? '<span class="badge-free">FREE</span>' : ''}</div>
        <div class="mc-cost"><div class="cost-val">€${daily.toFixed(4)}/Tag</div><div class="cost-lbl">Bei ${(state.speechChars / 1000).toFixed(0)}K Zeichen</div></div>
      </div>`;
      }).join('');
    };
    renderSpeechCards();
  }

  // == OCR ==
  function renderOCR() {
    const p = document.getElementById('panel-ocr-models');
    p.innerHTML = `<h3 style="margin-bottom:12px;font-size:.95rem">📄 OCR Modelle — Vergleich</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Model</th><th>Provider</th><th>Input $/1M</th><th>Output $/1M</th><th>Notizen</th><th>Typ</th></tr>
    ${MODELS.ocr.map(m => `<tr>
      <td style="font-weight:600">${m.name}</td><td>${m.provider}</td>
      <td style="color:${m.input === 0 ? 'var(--green)' : 'var(--orange)'}">${m.input === 0 ? 'FREE' : '$' + m.input}</td>
      <td>${m.output === 0 ? '—' : '$' + m.output}</td>
      <td style="font-size:.7rem;color:var(--text2)">${m.notes}</td>
      <td>${m.input === 0 ? '<span class="badge-free">Open Source</span>' : '<span class="mc-tag">API</span>'}</td>
    </tr>`).join('')}
  </table></div>`;
  }

  // == NOTEBOOKLM ==
  function renderNotebookLM() {
    const p = document.getElementById('panel-notebooklm');
    const nl = MODELS.notebooklm;
    p.innerHTML = `<h3 style="margin-bottom:12px">📓 NotebookLM Tier-Vergleich</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Tier</th><th>Preis/Mo</th><th>Notebooks</th><th>Sources/NB</th><th>Audio Overviews/Tag</th><th>Notizen</th></tr>
    ${nl.tiers.map(t => `<tr><td style="font-weight:600">${t.name}</td><td style="color:var(--accent)">$${t.price}/mo</td>
      <td>${t.notebooks}</td><td>${t.sources}</td><td>${t.audioOverviews}</td><td style="font-size:.7rem">${t.notes}</td></tr>`).join('')}
  </table></div>
  <h3 style="margin:20px 0 12px">🎙 Podcast Kosten-Kalkulator</h3>
  <div class="controls" style="grid-template-columns:1fr 1fr">
    <div class="ctrl-card"><label>Podcast Länge (Min)</label><div class="val-display" id="vPodLen">${state.podcastLength} min</div>
    <input type="range" min="1" max="60" step="1" value="${state.podcastLength}" oninput="state.podcastLength=+this.value;document.getElementById('vPodLen').textContent=this.value+' min';updatePodcast()"></div>
    <div class="ctrl-card"><label>Quell-Seiten</label><div class="val-display" id="vPodPg">${state.podcastPages}</div>
    <input type="range" min="1" max="500" step="1" value="${state.podcastPages}" oninput="state.podcastPages=+this.value;document.getElementById('vPodPg').textContent=this.value;updatePodcast()"></div>
  </div>
  <div class="summary-card" id="podcastCalc"></div>
  <h3 style="margin:20px 0 12px">📦 Produkt-Kosten</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Produkt</th><th>Geschätzte Kosten</th><th>In Tier inkl.?</th></tr>
    ${nl.products.map(pr => `<tr><td>${pr.name}</td><td>${pr.estCostPer}</td><td>${pr.included ? '<span class="badge-free">✓ Ja</span>' : '<span class="badge-uncensored">✗ Nur Ultra</span>'}</td></tr>`).join('')}
  </table></div>
  <h3 style="margin:20px 0 12px">⚠️ Nicht nutzbar in diesem Szenario</h3>
  <div style="display:flex;flex-wrap:wrap;gap:8px">${nl.unusable.map(u => `<span class="mc-tag" style="background:rgba(255,0,0,.1);color:#ff6666;padding:6px 12px;font-size:.75rem">✗ ${u}</span>`).join('')}</div>`;
    window.updatePodcast = function () {
      const costPer100 = 0.625; // midpoint estimate
      const cost = (state.podcastPages / 100) * costPer100 * (state.podcastLength / 10);
      document.getElementById('podcastCalc').innerHTML = `<div class="summary-grid">
      <div class="sg-item"><div class="sg-val">~$${cost.toFixed(2)}</div><div class="sg-lbl">Pro Podcast</div></div>
      <div class="sg-item"><div class="sg-val">~$${(cost * 30).toFixed(2)}</div><div class="sg-lbl">30 Podcasts/Mo</div></div>
      <div class="sg-item"><div class="sg-val">${state.podcastLength} min</div><div class="sg-lbl">Länge</div></div>
      <div class="sg-item"><div class="sg-val">${state.podcastPages} Seiten</div><div class="sg-lbl">Quellen</div></div>
    </div>`;
    };
    updatePodcast();
  }

  // == GOOGLE AI STUDIO ==
  function renderGoogleStudio() {
    const p = document.getElementById('panel-google-studio');
    const gs = MODELS.googleAIStudio;
    p.innerHTML = `<h3 style="margin-bottom:12px">🔬 Google AI Studio & Producer</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Tier</th><th>Preis/Mo</th><th>Details</th></tr>
    ${gs.tiers.map(t => `<tr><td style="font-weight:600">${t.name}</td><td style="color:var(--accent)">${typeof t.price === 'number' ? '$' + t.price : t.price}</td><td style="font-size:.75rem">${t.notes}</td></tr>`).join('')}
  </table></div>
  <h3 style="margin:20px 0 12px">📊 Nano/Pro Preise (Google AI)</h3>
  <div class="model-grid">
    <div class="model-card"><div class="mc-head"><span class="mc-name">Gemini Nano</span><span class="mc-provider prov-google">Google</span></div>
      <div class="mc-prices"><div class="mc-price" style="grid-column:span 2"><div class="p-val" style="color:var(--green)">FREE</div><div class="p-lbl">On-device, Chrome built-in</div></div></div>
      <div class="mc-meta"><span class="mc-tag">Edge AI</span><span class="mc-tag">Offline capable</span><span class="badge-free">FREE</span></div></div>
    <div class="model-card"><div class="mc-head"><span class="mc-name">Gemini 2 (AI Pro)</span><span class="mc-provider prov-google">Google</span></div>
      <div class="mc-prices"><div class="mc-price" style="grid-column:span 2"><div class="p-val" style="color:var(--accent)">$19.99/mo</div><div class="p-lbl">AI Pro subscription</div></div></div>
      <div class="mc-meta"><span class="mc-tag">Advanced features</span><span class="mc-tag">2TB storage</span><span class="mc-tag">NotebookLM Plus</span></div></div>
  </div>
  <h3 style="margin:20px 0 12px">⚠️ Nicht nutzbar</h3>
  <div style="display:flex;flex-wrap:wrap;gap:8px">${gs.unusable.map(u => `<span class="mc-tag" style="background:rgba(255,0,0,.1);color:#ff6666;padding:6px 12px;font-size:.75rem">✗ ${u}</span>`).join('')}</div>`;
  }

  // == DEBUG TOOLS ==
  function renderDebugTools() {
    const p = document.getElementById('panel-debug-tools');
    p.innerHTML = `<h3 style="margin-bottom:12px">🐛 Debug Model Pairings — Beste Kombinationen</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Tool + Model</th><th>Typ</th><th>Notizen</th><th>Geschätzte Kosten/Tag</th></tr>
    ${MODELS.debugModels.map(d => {
      let cost = 'Variabel';
      if (d.name.includes('DeepSeek R1')) cost = '~€1-5';
      if (d.name.includes('Claude Sonnet')) cost = '~€10-30';
      if (d.name.includes('GPT-4o')) cost = '~€5-15';
      if (d.name.includes('Qwen Coder')) cost = 'FREE (local)';
      if (d.name.includes('Codestral')) cost = 'FREE (local)';
      if (d.name.includes('StarCoder')) cost = 'FREE (local)';
      if (d.name.includes('DeepSeek V3')) cost = '~€0.50-2';
      return `<tr><td style="font-weight:600">${d.name}</td><td><span class="mc-tag">${d.type}</span></td><td style="font-size:.7rem">${d.notes}</td><td style="color:var(--accent)">${cost}</td></tr>`;
    }).join('')}
  </table></div>`;
  }

  // == NANO MODELS & OPENCLAW ==
  function renderNanoModels() {
    const p = document.getElementById('panel-nano-models');
    p.innerHTML = `<h3 style="margin-bottom:12px">⚡ OpenClaw Ökosystem</h3>
  <div class="model-grid">
    ${MODELS.openclaw.map(m => `<div class="model-card">
      <div class="mc-head"><span class="mc-name">${m.name}</span><span class="mc-tag">${m.type}</span></div>
      <div class="mc-cost"><div class="cost-val" style="color:var(--green)">€${m.monthlyCost}/mo</div><div class="cost-lbl">${m.notes}</div></div>
    </div>`).join('')}
  </div>
  <h3 style="margin:20px 0 12px">🔬 Top 15 Nano & Mini Models für OpenClaw</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Model</th><th>Provider</th><th>VRAM</th><th>Qualität</th><th>Uncensored</th></tr>
    ${MODELS.nanoModels.map(m => `<tr>
      <td style="font-weight:600">${m.name}</td><td>${m.provider}</td><td>${m.vram}</td>
      <td><div style="background:var(--bg4);border-radius:4px;overflow:hidden;height:8px;width:80px"><div style="height:100%;width:${m.quality * 10}%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:4px"></div></div></td>
      <td>${m.uncensored ? '<span class="badge-uncensored">JA</span>' : '<span class="mc-tag">Nein</span>'}</td>
    </tr>`).join('')}
  </table></div>`;
  }

  // == VOICE BOTS ==
  function renderVoiceBots() {
    const p = document.getElementById('panel-voice-bots');
    p.innerHTML = `<h3 style="margin-bottom:12px">📞 Voice Bot API Kosten — Vergleich</h3>
  <div class="table-wrap"><table class="data-table">
    <tr><th>Plattform</th><th>$/Minute</th><th>$/Stunde</th><th>$/8h Tag</th><th>Notizen</th></tr>
    ${MODELS.voiceBots.sort((a, b) => a.costPerMin - b.costPerMin).map(v => `<tr>
      <td style="font-weight:600">${v.name}</td>
      <td style="color:var(--accent)">$${v.costPerMin.toFixed(3)}</td>
      <td>$${(v.costPerMin * 60).toFixed(2)}</td>
      <td style="color:var(--orange)">$${(v.costPerMin * 60 * 8).toFixed(2)}</td>
      <td style="font-size:.7rem">${v.notes}</td>
    </tr>`).join('')}
  </table></div>
  <div class="summary-card"><h3>🔥 Speed-Vergleich: Gemini Fast vs Grok Fast vs Grok Fast Thinking</h3>
  <div class="summary-grid" style="margin-top:12px">
    <div class="sg-item"><div class="sg-val" style="color:var(--blue)">$0.05/$0.20</div><div class="sg-lbl">Gemini Fast I/O per 1M</div></div>
    <div class="sg-item"><div class="sg-val" style="color:var(--cyan)">$0.20/$0.50</div><div class="sg-lbl">Grok 4.1 Fast I/O per 1M</div></div>
    <div class="sg-item"><div class="sg-val" style="color:var(--purple)">$0.50/$1.50</div><div class="sg-lbl">Grok Fast Thinking I/O per 1M</div></div>
    <div class="sg-item"><div class="sg-val" style="color:var(--green)">$0.10/$0.40</div><div class="sg-lbl">Gemini Flash-Lite (AI Studio Free)</div></div>
  </div></div>`;
  }

  // == UNCENSORED ==
  function renderUncensored() {
    const p = document.getElementById('panel-uncensored');
    const unc = MODELS.llm.filter(m => m.uncensored);
    p.innerHTML = `<h3 style="margin-bottom:4px">🔓 Uncensored / Wenig zensierte Modelle</h3>
  <p style="font-size:.75rem;color:var(--text3);margin-bottom:16px">Modelle mit minimaler oder keiner Inhaltsfilterung. Nutzung auf eigene Verantwortung.</p>
  <div class="model-grid">
    ${unc.map(m => `<div class="model-card">
      <div class="mc-head"><span class="mc-name">${m.name}</span><span class="mc-provider ${provClass(m.provider)}">${m.provider}</span></div>
      <div class="mc-prices">
        <div class="mc-price"><div class="p-val" style="color:var(--green)">$${m.input}</div><div class="p-lbl">Input/1M</div></div>
        <div class="mc-price"><div class="p-val" style="color:var(--orange)">$${m.output}</div><div class="p-lbl">Output/1M</div></div>
      </div>
      <div class="mc-meta">
        <span class="badge-uncensored">UNCENSORED</span>
        ${m.local ? '<span class="mc-tag" style="color:var(--green)">🖥 Local</span>' : '<span class="mc-tag">☁️ API</span>'}
        <span class="mc-tag">${(m.ctx / 1000).toFixed(0)}K ctx</span>
        <span class="mc-tag">${m.notes}</span>
      </div>
      <div class="mc-cost"><div class="cost-val" data-model-id="${m.id}">€${calcDailyCost(m).toFixed(2)}/Tag</div><div class="cost-lbl">Bei aktueller Auslastung</div></div>
    </div>`).join('')}
  </div>
  <div class="summary-card" style="margin-top:16px"><h3>ℹ️ Hinweise</h3>
  <ul style="font-size:.78rem;color:var(--text2);margin-top:8px;padding-left:16px">
    <li>Grok (alle Versionen) — Minimale Zensur, xAI Richtlinien</li>
    <li>Mistral (Nemo, Small, Large) — Open weights, Community kann uncensored qlora</li>
    <li>Qwen 3B/8B/32B — Open weights, uncensored Versionen auf HuggingFace</li>
    <li>Llama 4 (alle) — Meta open weights, uncensored fine-tunes verfügbar</li>
    <li>DeepSeek R1 — Open weights, wenig Zensur im Reasoning</li>
    <li>TinyLlama, Danube, Yi-Coder — Klein genug für lokale uncensored fine-tunes</li>
  </ul></div>`;
  }

  // == MODULE BUILDER ==
  function renderModuleBuilder() {
    const p = document.getElementById('panel-module-builder');
    const modules = [
      { name: 'Code Assistant', icon: '💻', local: ['Qwen Coder 7B', 'Codestral', 'DeepSeek Coder 1.3B'], web: ['GPT-4o', 'Claude Sonnet 4.6', 'Gemini 3.1 Pro'] },
      { name: 'Document OCR Pipeline', icon: '📄', local: ['Tesseract', 'Surya OCR', 'PaddleOCR'], web: ['Mistral OCR 0.8', 'Google Doc AI', 'GPT-4V'] },
      { name: 'Voice Bot', icon: '🎙', local: ['Fish Speech (self-host)', 'Qwen Audio'], web: ['ElevenLabs', 'Vapi.ai', 'Google TTS'] },
      { name: 'Image Generator', icon: '🎨', local: ['Flux Schnell', 'SD 3.5 (ComfyUI)'], web: ['DALL-E 3', 'Midjourney', 'Flux 2 Pro'] },
      { name: 'Video Creator', icon: '🎬', local: ['CogVideoX'], web: ['Sora 2', 'Runway Gen-3', 'Kling 2.0'] },
      { name: 'Research Agent', icon: '🔬', local: ['Llama 4 70B', 'Qwen3 32B'], web: ['Perplexity Sonar', 'Gemini 3.1 Pro'] },
      { name: 'Translation Hub', icon: '🌐', local: ['Qwen3 8B', 'Mistral Nemo'], web: ['GPT-4o', 'DeepSeek V3.2'] },
      { name: 'Content Writer', icon: '✍️', local: ['Llama 4 8B', 'Mistral Small'], web: ['Claude Opus 4.6', 'GPT-5.2'] },
      { name: 'Debug Pipeline', icon: '🐛', local: ['Continue.dev + Codestral', 'Tabby + StarCoder'], web: ['Aider + Claude', 'SWE-Agent + GPT'] },
      { name: 'Podcast Producer', icon: '🎧', local: ['Qwen Audio + Fish Speech'], web: ['NotebookLM', 'ElevenLabs'] },
    ];
    p.innerHTML = `<h3 style="margin-bottom:16px">🧩 Modul-Baukasten — Local vs. Web</h3>
  <div class="model-grid">
    ${modules.map(m => `<div class="model-card">
      <div class="mc-head"><span class="mc-name">${m.icon} ${m.name}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        <div style="padding:10px;background:rgba(0,230,118,.05);border:1px solid rgba(0,230,118,.15);border-radius:var(--radius2)">
          <div style="font-size:.65rem;color:var(--green);font-weight:700;margin-bottom:6px">🖥 LOCAL</div>
          ${m.local.map(l => `<div style="font-size:.72rem;padding:2px 0;color:var(--text)">${l}</div>`).join('')}
        </div>
        <div style="padding:10px;background:rgba(68,138,255,.05);border:1px solid rgba(68,138,255,.15);border-radius:var(--radius2)">
          <div style="font-size:.65rem;color:var(--blue);font-weight:700;margin-bottom:6px">☁️ WEB / API</div>
          ${m.web.map(w => `<div style="font-size:.72rem;padding:2px 0;color:var(--text)">${w}</div>`).join('')}
        </div>
      </div>
    </div>`).join('')}
  </div>`;
  }

  // == LIVE TRACKER ==
  function renderLiveTracker() {
    const p = document.getElementById('panel-live-tracker');
    p.innerHTML = `<h3 style="margin-bottom:16px">📊 Live Session-Kosten</h3>
  <div class="summary-card" id="liveTrackerSummary">
    <div class="summary-grid">
      <div class="sg-item"><div class="sg-val" id="ltSessionCost">€0.0000</div><div class="sg-lbl">Aktuelle Session</div></div>
      <div class="sg-item"><div class="sg-val" id="ltTotalCost">€0.0000</div><div class="sg-lbl">Gesamt (alle Sessions)</div></div>
      <div class="sg-item"><div class="sg-val" id="ltEntries">0</div><div class="sg-lbl">Log-Einträge</div></div>
      <div class="sg-item"><div class="sg-val" id="ltSessions">0</div><div class="sg-lbl">Sessions</div></div>
    </div>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    <button class="tab" onclick="simulateUsage()" style="background:rgba(250,30,78,.1);border:1px solid rgba(250,30,78,.2)">🎲 Nutzung simulieren</button>
    <button class="tab" onclick="refreshTracker()" style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.2)">🔄 Aktualisieren</button>
    <button class="tab" onclick="exportTrackerJSON()" style="background:rgba(68,138,255,.1);border:1px solid rgba(68,138,255,.2)">📥 JSON Export</button>
    <button class="tab" onclick="gitSync()" style="background:rgba(179,136,255,.1);border:1px solid rgba(179,136,255,.2)">💾 Git Sync</button>
    <button class="tab" onclick="gitLoad()" style="background:rgba(24,255,255,.1);border:1px solid rgba(24,255,255,.2)">📂 Von Git laden</button>
    <button class="tab" onclick="gitHistory()" style="background:rgba(255,171,64,.1);border:1px solid rgba(255,171,64,.2)">📜 Git History</button>
    <span id="gitSyncStatus" style="padding:8px 14px;font-size:.7rem;color:#666;display:flex;align-items:center">⚪ Prüfe...</span>
  </div>
  <div class="summary-card" id="gitHistoryPanel" style="display:none;margin-bottom:16px"></div>
  <div class="table-wrap" id="liveTrackerTable"></div>`;
    window.refreshTracker = function () {
      if (!window.DkzCostTracker) return;
      const T = window.DkzCostTracker;
      document.getElementById('ltSessionCost').textContent = '€' + T.getSessionCost().toFixed(4);
      document.getElementById('ltTotalCost').textContent = '€' + T.getTotalCost().toFixed(4);
      document.getElementById('ltEntries').textContent = T.currentSession ? T.currentSession.entries.length : 0;
      document.getElementById('ltSessions').textContent = T.sessions.length;
      // Render table
      const entries = T.currentSession ? T.currentSession.entries.slice(-50).reverse() : [];
      document.getElementById('liveTrackerTable').innerHTML = `<table class="data-table">
              <tr><th>Zeit</th><th>Model</th><th>Tokens In</th><th>Tokens Out</th><th>Kosten</th><th>Tags</th></tr>
              ${entries.map(e => `<tr>
                <td style="font-size:.7rem">${new Date(e.ts).toLocaleTimeString()}</td>
                <td style="font-weight:600">${esc(e.model)}</td>
                <td style="color:var(--green)">${e.tokensIn.toLocaleString()}</td>
                <td style="color:var(--orange)">${e.tokensOut.toLocaleString()}</td>
                <td style="color:var(--accent);font-weight:700">€${e.totalCost.toFixed(4)}</td>
                <td>${e.tags.map(t => `<span class="mc-tag">${esc(t)}</span>`).join(' ')}</td>
              </tr>`).join('')}
            </table>`;
    };
    window.simulateUsage = function () {
      if (!window.DkzCostTracker) return;
      const models = ['GPT-4o', 'Claude Sonnet', 'Gemini Pro', 'DeepSeek V3', 'Grok 4'];
      const tags = ['debug', 'build', 'review', 'chat', 'generate'];
      const costs = [{ i: 2.5, o: 10 }, { i: 3, o: 15 }, { i: 2, o: 12 }, { i: 0.27, o: 1.10 }, { i: 3, o: 15 }];
      const idx = Math.floor(Math.random() * models.length);
      const tIn = Math.floor(Math.random() * 50000) + 1000;
      const tOut = Math.floor(Math.random() * 20000) + 500;
      const tag = [tags[Math.floor(Math.random() * tags.length)], 'cost-board'];
      window.DkzCostTracker.log(models[idx], tIn, tOut, costs[idx].i, costs[idx].o, tag);
      refreshTracker();
    };
    window.exportTrackerJSON = function () {
      if (!window.DkzCostTracker) return;
      const blob = new Blob([window.DkzCostTracker.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'dkz-cost-log-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
    };
    window.gitSync = async function () {
      if (!window.DkzCostTracker) return;
      const status = document.getElementById('gitSyncStatus');
      status.textContent = '⏳ Syncing...';
      status.style.color = '#ffd740';
      const result = await window.DkzCostTracker.syncToGit();
      if (result.ok) {
        status.textContent = '✅ ' + result.msg;
        status.style.color = '#00ff88';
      } else {
        status.textContent = '❌ ' + (result.error || 'Error');
        status.style.color = '#ff4444';
      }
      refreshTracker();
    };
    window.gitLoad = async function () {
      if (!window.DkzCostTracker) return;
      const status = document.getElementById('gitSyncStatus');
      status.textContent = '⏳ Loading from Git...';
      const result = await window.DkzCostTracker.loadFromGit();
      if (result.ok) {
        status.textContent = `✅ ${result.imported} Sessions importiert`;
        status.style.color = '#00ff88';
      } else {
        status.textContent = '❌ ' + (result.error || 'Error');
        status.style.color = '#ff4444';
      }
      refreshTracker();
    };
    window.gitHistory = async function () {
      if (!window.DkzCostTracker) return;
      const panel = document.getElementById('gitHistoryPanel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        const data = await window.DkzCostTracker.getGitHistory();
        panel.innerHTML = `<h3 style="margin-bottom:12px">📜 Git Cost-Commits</h3>
                ${data.commits.length ? data.commits.map(c => `<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:.75rem;font-family:'JetBrains Mono',monospace">${esc(c)}</div>`).join('') : '<p style="color:var(--text3);font-size:.8rem">Keine Cost-Commits gefunden. Starte den Sync-Server: <code>node cost-sync.js</code></p>'}`;
      }
    };
    setTimeout(refreshTracker, 500);
  }

  // == ECOSYSTEM COSTS ==
  function renderEcosystemCosts() {
    const p = document.getElementById('panel-ecosystem-costs');
    const modules = [
      { name: 'Hub', icon: '🏠', est: 0.002 }, { name: 'Ruleboard', icon: '📜', est: 0.001 },
      { name: 'Clipboard', icon: '📋', est: 0.005 }, { name: 'AI Chat', icon: '🤖', est: 0.15 },
      { name: 'Markdown Gen', icon: '📝', est: 0.03 }, { name: 'SEO Toolkit', icon: '🔍', est: 0.02 },
      { name: 'Prompt Viewer', icon: '💡', est: 0.01 }, { name: 'CS2 Config', icon: '🎮', est: 0.001 },
      { name: 'Sportwetten', icon: '⚽', est: 0.008 }, { name: 'Blog Designer', icon: '✍️', est: 0.04 },
      { name: 'LLM Cost Board', icon: '💰', est: 0.001 }, { name: 'Doc Engine', icon: '📚', est: 0.05 },
      { name: 'Domain Control', icon: '🌐', est: 0.003 }, { name: 'Music Board', icon: '🎵', est: 0.02 },
      { name: 'Debugger', icon: '🐛', est: 0.06 }, { name: 'Watchdog', icon: '🐕', est: 0.02 },
    ];
    const totalEst = modules.reduce((s, m) => s + m.est, 0);
    const trackerCosts = window.DkzCostTracker ? window.DkzCostTracker.getElementCosts() : {};
    p.innerHTML = `<h3 style="margin-bottom:16px">🏗️ Ökosystem-Kosten — Alle Module</h3>
  <div class="summary-card" style="margin-bottom:16px">
    <div class="summary-grid">
      <div class="sg-item"><div class="sg-val">€${totalEst.toFixed(3)}</div><div class="sg-lbl">Ges. geschätzt/Session</div></div>
      <div class="sg-item"><div class="sg-val">€${(totalEst * 30).toFixed(2)}</div><div class="sg-lbl">Pro Monat</div></div>
      <div class="sg-item"><div class="sg-val">${modules.length}</div><div class="sg-lbl">Aktive Module</div></div>
      <div class="sg-item"><div class="sg-val">56</div><div class="sg-lbl">Gesamt Module</div></div>
    </div>
  </div>
  <div class="model-grid">
    ${modules.map(m => {
      const real = trackerCosts[m.name.toLowerCase().replace(/ /g, '-')] || null;
      const pct = Math.min(100, Math.round((m.est / totalEst) * 100));
      return `<div class="model-card">
        <div class="mc-head"><span class="mc-name">${m.icon} ${m.name}</span>
          <span class="update-lamp ${real ? 'current' : 'unknown'}" style="width:8px;height:8px;display:inline-block;border-radius:50%" title="${real ? 'Tracked' : 'Geschätzt'}"></span>
        </div>
        <div class="mc-prices">
          <div class="mc-price"><div class="p-val" style="color:var(--accent)">€${m.est.toFixed(4)}</div><div class="p-lbl">Geschätzt/Session</div></div>
          <div class="mc-price"><div class="p-val" style="color:${real ? 'var(--green)' : 'var(--text3)'}">€${real ? real.cost.toFixed(4) : '—'}</div><div class="p-lbl">Real (Tracker)</div></div>
        </div>
        <div style="margin-top:8px;background:var(--bg4);border-radius:4px;overflow:hidden;height:6px">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:4px;transition:width .3s"></div>
        </div>
        <div style="font-size:.6rem;color:var(--text3);margin-top:4px">${pct}% vom Budget</div>
      </div>`;
    }).join('')}
  </div>`;
  }

  // == TIMELINE ==
  function renderTimeline() {
    const p = document.getElementById('panel-timeline');
    const now = new Date();
    const dayAgo = new Date(now - 86400000);
    p.innerHTML = `<h3 style="margin-bottom:16px">📈 Timeline — Kosten-Analyse</h3>
  <div class="controls" style="grid-template-columns:1fr 1fr 1fr;margin-bottom:16px">
    <div class="ctrl-card">
      <label>Von</label>
      <input type="datetime-local" id="tlFrom" value="${dayAgo.toISOString().slice(0, 16)}" style="width:100%;padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);color:var(--text);font-family:inherit" onchange="updateTimeline()">
    </div>
    <div class="ctrl-card">
      <label>Bis</label>
      <input type="datetime-local" id="tlTo" value="${now.toISOString().slice(0, 16)}" style="width:100%;padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);color:var(--text);font-family:inherit" onchange="updateTimeline()">
    </div>
    <div class="ctrl-card">
      <label>Granularität</label>
      <select id="tlGran" style="width:100%;padding:8px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);color:var(--text);font-family:inherit" onchange="updateTimeline()">
        <option value="hour">Stündlich</option>
        <option value="day" selected>Täglich</option>
        <option value="month">Monatlich</option>
      </select>
    </div>
  </div>
  <div class="summary-card" id="tlChart" style="min-height:200px"></div>
  <div class="summary-card" id="tlSummary" style="margin-top:16px"></div>`;

    window.updateTimeline = function () {
      if (!window.DkzCostTracker) { document.getElementById('tlChart').innerHTML = '<p style="color:var(--text3)">Tracker nicht geladen</p>'; return; }
      const from = document.getElementById('tlFrom').value;
      const to = document.getElementById('tlTo').value;
      const gran = document.getElementById('tlGran').value;
      const data = window.DkzCostTracker.getTimeline(from, to, gran);
      const keys = Object.keys(data).sort();
      const maxCost = Math.max(...keys.map(k => data[k].cost), 0.001);
      const totalCost = keys.reduce((s, k) => s + data[k].cost, 0);
      const totalTokens = keys.reduce((s, k) => s + data[k].tokens, 0);
      const totalEntries = keys.reduce((s, k) => s + data[k].entries, 0);
      // Bar chart (CSS only)
      document.getElementById('tlChart').innerHTML = keys.length === 0
        ? '<p style="color:var(--text3);text-align:center;padding:40px">Keine Daten im Zeitraum. Nutze "🎲 Simulieren" im Live-Tracker Tab.</p>'
        : `<div style="display:flex;align-items:flex-end;gap:4px;height:160px;padding:10px 0">
              ${keys.map(k => {
          const h = Math.max(4, (data[k].cost / maxCost) * 140);
          const label = gran === 'hour' ? k.slice(11) + ':00' : gran === 'day' ? k.slice(5) : k;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                  <div style="font-size:.55rem;color:var(--accent);font-weight:700">€${data[k].cost.toFixed(3)}</div>
                  <div style="width:100%;max-width:40px;height:${h}px;background:linear-gradient(to top,var(--accent),var(--green));border-radius:4px 4px 0 0;transition:height .3s"></div>
                  <div style="font-size:.5rem;color:var(--text3);transform:rotate(-45deg);white-space:nowrap">${label}</div>
                </div>`;
        }).join('')}
            </div>`;
      document.getElementById('tlSummary').innerHTML = `<div class="summary-grid">
              <div class="sg-item"><div class="sg-val">€${totalCost.toFixed(4)}</div><div class="sg-lbl">Gesamt im Zeitraum</div></div>
              <div class="sg-item"><div class="sg-val">${totalTokens.toLocaleString()}</div><div class="sg-lbl">Tokens</div></div>
              <div class="sg-item"><div class="sg-val">${totalEntries}</div><div class="sg-lbl">Einträge</div></div>
              <div class="sg-item"><div class="sg-val">${keys.length}</div><div class="sg-lbl">${gran === 'hour' ? 'Stunden' : gran === 'day' ? 'Tage' : 'Monate'}</div></div>
            </div>`;
    };
    setTimeout(updateTimeline, 500);
  }

  // == COST TAGS ==
  function renderCostTags() {
    const p = document.getElementById('panel-cost-tags');
    const tags = window.DkzCostTracker ? window.DkzCostTracker.getTags() : ['debug', 'build', 'review', 'chat', 'generate', 'analyze'];
    p.innerHTML = `<h3 style="margin-bottom:16px">🏷️ Kosten nach Tags filtern</h3>
  <div class="filter-bar" id="tagButtons">
    ${tags.map(t => `<button class="tab" onclick="filterTag('${t}')" style="background:rgba(250,30,78,.05);border:1px solid rgba(250,30,78,.1)">${t}</button>`).join('')}
    <button class="tab" onclick="filterTag('all')" style="background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.2)">ALLE</button>
  </div>
  <div class="summary-card" id="tagSummary"></div>
  <div class="model-grid" id="tagGrid" style="margin-top:16px"></div>`;

    window.filterTag = function (tag) {
      if (!window.DkzCostTracker) return;
      const costs = window.DkzCostTracker.getCostsByTag();
      if (tag === 'all') {
        // Show all tags
        const entries = Object.entries(costs).sort((a, b) => b[1].cost - a[1].cost);
        const total = entries.reduce((s, e) => s + e[1].cost, 0);
        document.getElementById('tagSummary').innerHTML = `<div class="summary-grid">
                  <div class="sg-item"><div class="sg-val">€${total.toFixed(4)}</div><div class="sg-lbl">Gesamt</div></div>
                  <div class="sg-item"><div class="sg-val">${entries.length}</div><div class="sg-lbl">Aktive Tags</div></div>
                </div>`;
        document.getElementById('tagGrid').innerHTML = entries.map(([t, d]) => {
          const pct = total > 0 ? Math.round((d.cost / total) * 100) : 0;
          return `<div class="model-card">
                      <div class="mc-head"><span class="mc-name">🏷️ ${esc(t)}</span><span class="mc-tag">${d.count}x</span></div>
                      <div class="mc-prices">
                        <div class="mc-price"><div class="p-val" style="color:var(--accent)">€${d.cost.toFixed(4)}</div><div class="p-lbl">Kosten</div></div>
                        <div class="mc-price"><div class="p-val" style="color:var(--cyan)">${d.tokens.toLocaleString()}</div><div class="p-lbl">Tokens</div></div>
                      </div>
                      <div style="margin-top:8px;background:var(--bg4);border-radius:4px;overflow:hidden;height:6px">
                        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--green));border-radius:4px"></div>
                      </div>
                      <div style="font-size:.6rem;color:var(--text3);margin-top:4px">${pct}% der Gesamtkosten</div>
                    </div>`;
        }).join('');
      } else {
        const d = costs[tag] || { cost: 0, tokens: 0, count: 0 };
        const entries = window.DkzCostTracker.filterByTags([tag]);
        document.getElementById('tagSummary').innerHTML = `<div class="summary-grid">
                  <div class="sg-item"><div class="sg-val">€${d.cost.toFixed(4)}</div><div class="sg-lbl">Kosten: ${esc(tag)}</div></div>
                  <div class="sg-item"><div class="sg-val">${d.tokens.toLocaleString()}</div><div class="sg-lbl">Tokens</div></div>
                  <div class="sg-item"><div class="sg-val">${d.count}</div><div class="sg-lbl">Einträge</div></div>
                </div>`;
        document.getElementById('tagGrid').innerHTML = entries.slice(-20).reverse().map(e => `<div class="model-card">
                  <div class="mc-head"><span class="mc-name">${esc(e.model)}</span><span style="font-size:.6rem;color:var(--text3)">${new Date(e.ts).toLocaleString()}</span></div>
                  <div class="mc-prices">
                    <div class="mc-price"><div class="p-val" style="color:var(--green)">${e.tokensIn.toLocaleString()}</div><div class="p-lbl">In</div></div>
                    <div class="mc-price"><div class="p-val" style="color:var(--orange)">${e.tokensOut.toLocaleString()}</div><div class="p-lbl">Out</div></div>
                  </div>
                  <div class="mc-cost"><div class="cost-val">€${e.totalCost.toFixed(4)}</div></div>
                </div>`).join('');
      }
      // Highlight active tag
      document.querySelectorAll('#tagButtons .tab').forEach(b => b.style.background = b.textContent === tag ? 'rgba(250,30,78,.2)' : 'rgba(250,30,78,.05)');
    };
    setTimeout(() => filterTag('all'), 500);
  }

  // XSS helper
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // Init
  document.addEventListener('DOMContentLoaded', init);
})();
