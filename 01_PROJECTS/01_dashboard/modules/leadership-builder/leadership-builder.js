/* ═══════════════════════════════════════════════════════════════
   DkZ Leadership Builder — Core Logic
   Team-Leiter koordinieren mehrere Teams, analysieren Infos,
   delegieren fallbasiert an die richtigen Teams
   ═══════════════════════════════════════════════════════════════ */

var LB = {
    leaderships: [],
    current: null,
    leaderName: 'Neues Leadership',
    leaderDesc: '',
    leaderIcon: '🏢',
    leaderPrompt: '',
    leaderTokens: 10000,
    leaderModel: 'claude-sonnet',
    genre: '',
    tags: [],
    assignedTeams: [],
    routingRules: [],
    loopMode: 'memory',
    loopRounds: 5,
    memoryFields: ['strategic_decisions','team_performance','blockers'],
    playbook: [],
    totalCost: 0,
    demoRunning: false,
    demoStep: 0,
    savedTeams: []
};

var ROLE_COLORS = { leader:'#fa1e4e', worker:'#00D084', reviewer:'#55ACEE', validator:'#f59e0b', specialist:'#a855f7' };
var COST_RATES = {
    'mistral-nemo':{in:0.00015,out:0.00015},'claude-sonnet':{in:0.003,out:0.015},'gpt-4o':{in:0.005,out:0.015},
    'gemini-2.5-flash':{in:0.00015,out:0.0006},'deepseek-r1':{in:0.0008,out:0.002},'openrouter-free':{in:0,out:0}
};

function initLeadership() {
    loadSavedTeams();
    loadSavedLeaderships();
    renderLeadershipList();
    renderOrgChart();
    renderLeadershipProps();
    updateLeadershipCost();
    checkLBOnboarding();
}

function loadSavedTeams() {
    LB.savedTeams = [];
    try {
        Object.keys(localStorage).forEach(function(k) {
            if (k.startsWith('dkz-team-')) {
                var d = JSON.parse(localStorage.getItem(k));
                LB.savedTeams.push(d);
            }
        });
    } catch(e) {}
    // Also add BMAD template names as available
    var tplNames = ['BMAD v00 — Original','SEO Content Team','E-Commerce Team','DevOps & QA','Social Media Team','Enterprise Security'];
    tplNames.forEach(function(n) {
        if (!LB.savedTeams.some(function(t){return t.name===n})) {
            LB.savedTeams.push({ name: n, agents: [], totalCost: 0 });
        }
    });
}

function loadSavedLeaderships() {
    LB.leaderships = [];
    try {
        Object.keys(localStorage).forEach(function(k) {
            if (k.startsWith('dkz-leadership-')) {
                var d = JSON.parse(localStorage.getItem(k));
                LB.leaderships.push(d);
            }
        });
    } catch(e) {}
}

// ── LEADERSHIP LIST (Left) ──
function renderLeadershipList() {
    var el = document.getElementById('leadership-list');
    if (!el) return;
    var h = '<div class="ll-header"><button class="btn-sm" onclick="createNewLeadership()" style="width:100%">+ Neues Leadership</button></div>';
    // Saved leaderships
    if (LB.leaderships.length > 0) {
        h += '<div class="ll-group-title">Gespeicherte Leaderships</div>';
        LB.leaderships.forEach(function(l, i) {
            h += '<div class="ll-item' + (LB.current===i?' active':'') + '" onclick="selectLeadership(' + i + ')">';
            h += '<span class="ll-icon">' + (l.icon||'🏢') + '</span>';
            h += '<div class="ll-info"><div class="ll-name">' + esc(l.name) + '</div>';
            h += '<div class="ll-teams">' + (l.assignedTeams?l.assignedTeams.length:0) + ' Teams</div></div></div>';
        });
    }
    // Templates
    h += '<div class="ll-group-title">Templates <button class="info-btn" onclick="showLBInfo(\'templates\')">ℹ</button></div>';
    var tpls = [
        {id:'cto',icon:'🏢',name:'CTO Leadership',desc:'DevOps + Development'},
        {id:'cmo',icon:'📣',name:'CMO Leadership',desc:'SEO + Social + E-Commerce'},
        {id:'ciso',icon:'🛡️',name:'CISO Leadership',desc:'Security + Compliance'}
    ];
    tpls.forEach(function(t) {
        h += '<div class="ll-item tpl" onclick="loadLBTemplate(\'' + t.id + '\')">';
        h += '<span class="ll-icon">' + t.icon + '</span>';
        h += '<div class="ll-info"><div class="ll-name">' + t.name + '</div>';
        h += '<div class="ll-teams">' + t.desc + '</div></div></div>';
    });
    el.innerHTML = h;
}

// ── ORG CHART (Center) ──
function renderOrgChart() {
    var el = document.getElementById('org-chart');
    if (!el) return;
    if (LB.assignedTeams.length === 0) {
        el.innerHTML = '<div class="empty-org"><div style="font-size:4rem;margin-bottom:.75rem;animation:float 3s ease-in-out infinite">🏢</div><div style="font-size:1.5rem;font-weight:800;margin-bottom:.5rem;background:linear-gradient(135deg,#fa1e4e,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Leadership aufbauen</div><div style="font-size:.9rem;color:#606060;line-height:1.8">Erstelle einen Team-Leiter und weise Teams zu<br>oder lade ein Leadership-Template</div></div>';
        return;
    }
    var h = '<div class="org-tree">';
    // Leader node
    h += '<div class="org-leader"><div class="org-node leader-main">';
    h += '<div class="org-icon">' + LB.leaderIcon + '</div>';
    h += '<div class="org-name">' + esc(LB.leaderName) + '</div>';
    h += '<div class="org-role">Team-Leiter</div>';
    h += '<div class="org-tokens">' + LB.leaderTokens.toLocaleString() + ' tokens</div>';
    h += '</div></div>';
    // Connector
    h += '<div class="org-connector"><svg width="2" height="40"><line x1="1" y1="0" x2="1" y2="40" stroke="#2a2a2e" stroke-width="2" stroke-dasharray="4"/></svg></div>';
    // Teams
    h += '<div class="org-teams-row">';
    LB.assignedTeams.forEach(function(team, i) {
        h += '<div class="org-node team-node">';
        h += '<button class="org-remove" onclick="removeTeamFromLeadership(' + i + ')">✕</button>';
        h += '<div class="org-icon">👥</div>';
        h += '<div class="org-name">' + esc(team.name) + '</div>';
        h += '<div class="org-agents">' + (team.agents?team.agents.length:0) + ' Agenten</div>';
        if (team.totalCost) h += '<div class="org-cost">€' + team.totalCost.toFixed(4) + '/run</div>';
        h += '<div class="org-status" id="lb-status-' + i + '"></div>';
        h += '</div>';
    });
    h += '</div></div>';
    // Stats bar
    h += '<div class="org-stats">';
    h += '<div class="stat"><span class="stat-label">Teams</span><span class="stat-value">' + LB.assignedTeams.length + '</span></div>';
    h += '<div class="stat"><span class="stat-label">Agenten total</span><span class="stat-value">' + LB.assignedTeams.reduce(function(s,t){return s+(t.agents?t.agents.length:0)},0) + '</span></div>';
    h += '<div class="stat"><span class="stat-label">Kosten/Run</span><span class="stat-value" style="color:#00D084">€' + LB.totalCost.toFixed(4) + '</span></div>';
    h += '</div>';
    el.innerHTML = h;
}

// ── PROPERTIES (Right) ──
function renderLeadershipProps() {
    var p = document.getElementById('lb-props');
    if (!p) return;
    var h = '';
    // Leader Config
    h += '<div class="prop-section"><div class="prop-title">Team-Leiter <button class="info-btn" onclick="showLBInfo(\'leader\')">ℹ</button></div>';
    h += '<div class="prop-group"><label>Name</label><input type="text" class="prop-input" value="' + esc(LB.leaderName) + '" onchange="LB.leaderName=this.value;renderOrgChart()"></div>';
    h += '<div class="prop-group"><label>Icon</label><input type="text" class="prop-input" value="' + esc(LB.leaderIcon) + '" maxlength="4" onchange="LB.leaderIcon=this.value;renderOrgChart()"></div>';
    h += '<div class="prop-group"><label>System Prompt</label><textarea class="prop-textarea" onchange="LB.leaderPrompt=this.value">' + esc(LB.leaderPrompt) + '</textarea></div>';
    h += '<div class="prop-group"><label>Tokens</label><input type="range" min="1000" max="50000" step="500" value="' + LB.leaderTokens + '" style="width:calc(100% - 60px)" oninput="LB.leaderTokens=parseInt(this.value);this.nextElementSibling.textContent=this.value;updateLeadershipCost();renderOrgChart()"><span style="font-size:.75rem;font-weight:700;color:#00D084;margin-left:.5rem">' + LB.leaderTokens + '</span></div>';
    h += '<div class="prop-group"><label>Model</label><select class="prop-select" onchange="LB.leaderModel=this.value;updateLeadershipCost()">';
    Object.keys(COST_RATES).forEach(function(m) { h += '<option value="' + m + '"' + (LB.leaderModel===m?' selected':'') + '>' + m + '</option>'; });
    h += '</select></div></div>';

    // Team Assignment
    h += '<div class="prop-section"><div class="prop-title">Teams zuweisen <button class="info-btn" onclick="showLBInfo(\'team-assign\')">ℹ</button></div>';
    h += '<div class="team-chooser">';
    LB.savedTeams.forEach(function(t) {
        var assigned = LB.assignedTeams.some(function(a){return a.name===t.name});
        h += '<div class="tc-item' + (assigned?' assigned':'') + '" onclick="toggleTeamAssign(\'' + esc(t.name) + '\')">';
        h += '<span class="tc-check">' + (assigned?'✅':'⬜') + '</span>';
        h += '<span class="tc-name">' + esc(t.name) + '</span></div>';
    });
    h += '</div></div>';

    // Routing Rules
    h += '<div class="prop-section"><div class="prop-title">Routing-Regeln <button class="info-btn" onclick="showLBInfo(\'routing\')">ℹ</button></div>';
    LB.routingRules.forEach(function(r, i) {
        h += '<div class="rr-item"><input class="prop-input" style="width:45%" placeholder="Bedingung" value="' + esc(r.condition) + '" onchange="LB.routingRules[' + i + '].condition=this.value">';
        h += '<span style="color:#808080;font-size:.7rem">→</span>';
        h += '<select class="prop-select" style="width:40%" onchange="LB.routingRules[' + i + '].route_to=this.value">';
        LB.assignedTeams.forEach(function(t) { h += '<option' + (r.route_to===t.name?' selected':'') + '>' + esc(t.name) + '</option>'; });
        h += '</select><button class="pb-del" onclick="LB.routingRules.splice(' + i + ',1);renderLeadershipProps()">✕</button></div>';
    });
    h += '<button class="btn-sm" onclick="LB.routingRules.push({condition:\'\',route_to:\'\'});renderLeadershipProps()">+ Regel</button>';
    h += '</div>';

    // Loop Config
    h += '<div class="prop-section"><div class="prop-title">Loop Konfiguration <button class="info-btn" onclick="showLBInfo(\'loop\')">ℹ</button></div>';
    h += '<div class="prop-group"><div class="toggle-group">';
    h += '<button class="toggle-btn' + (LB.loopMode==='stateless'?' active':'') + '" onclick="LB.loopMode=\'stateless\';renderLeadershipProps()">🔄 Stateless</button>';
    h += '<button class="toggle-btn' + (LB.loopMode==='memory'?' active':'') + '" onclick="LB.loopMode=\'memory\';renderLeadershipProps()">🧠 Memory</button>';
    h += '</div></div>';
    h += '<div class="prop-group"><label>Runden</label><input type="number" class="prop-input" value="' + LB.loopRounds + '" min="1" max="100" onchange="LB.loopRounds=parseInt(this.value);updateLeadershipCost()"></div>';
    if (LB.loopMode === 'memory') {
        h += '<div class="prop-group"><label>Gedächtnis-Felder</label><input type="text" class="prop-input" value="' + LB.memoryFields.join(', ') + '" onchange="LB.memoryFields=this.value.split(\',\').map(function(s){return s.trim()}).filter(Boolean)"></div>';
    }
    h += '</div>';

    // Mini Playbook
    h += '<div class="prop-section"><div class="prop-title">Leadership Playbook <button class="info-btn" onclick="showLBInfo(\'playbook\')">ℹ</button></div>';
    LB.playbook.forEach(function(s, i) {
        h += '<div class="pb-step"><span class="pb-num">' + (i+1) + '</span><input class="prop-input pb-input" value="' + esc(s) + '" onchange="LB.playbook[' + i + ']=this.value"><button class="pb-del" onclick="LB.playbook.splice(' + i + ',1);renderLeadershipProps()">✕</button></div>';
    });
    h += '<button class="btn-sm" onclick="LB.playbook.push(\'Neuer Schritt\');renderLeadershipProps()">+ Schritt</button>';
    h += '</div>';

    // Cost
    h += '<div class="prop-section"><div class="prop-title">Kostenrechner <button class="info-btn" onclick="showLBInfo(\'costs\')">ℹ</button></div>';
    h += '<div class="cost-display"><div class="cost-main">€' + LB.totalCost.toFixed(4) + '</div><div class="cost-label">pro Durchlauf (Leader + alle Teams)</div>';
    h += '<div class="cost-total">€' + (LB.totalCost * LB.loopRounds).toFixed(4) + ' für ' + LB.loopRounds + ' Runden</div></div></div>';

    // Actions
    h += '<div class="prop-section">';
    h += '<button class="btn-primary" onclick="startLBDemo()" style="width:100%;margin-bottom:.5rem">▶️ Leadership Demo starten</button>';
    h += '<button class="btn-secondary" onclick="saveLeadership()" style="width:100%;margin-bottom:.5rem">💾 Leadership speichern</button>';
    h += '<button class="btn-secondary" onclick="exportLeadership()" style="width:100%;margin-bottom:.5rem">⬇️ Exportieren</button>';
    h += '<a href="../team-builder/index.html" class="btn-secondary" style="width:100%;display:block;text-align:center;text-decoration:none;padding:.625rem;border:1px solid #2a2a2e;border-radius:6px;color:#f6f6f7;font-weight:600;font-size:.8rem">👥 → Team Builder</a>';
    h += '</div>';

    // Skills Loop Link
    h += '<div class="prop-section"><div class="prop-title">Skills & Loops <button class="info-btn" onclick="showLBInfo(\'skills\')">ℹ</button></div>';
    h += '<a href="../skill-builder/index.html" class="btn-sm link-btn">🎯 Neue Skills</a>';
    h += '<a href="../loop-dashboard/index.html" class="btn-sm link-btn">🔄 Loop Dashboard</a>';
    h += '</div>';

    p.innerHTML = h;
}

// ── OPERATIONS ──
function createNewLeadership() {
    LB.leaderName = 'Neues Leadership'; LB.leaderDesc = ''; LB.leaderIcon = '🏢';
    LB.leaderPrompt = ''; LB.leaderTokens = 10000; LB.assignedTeams = [];
    LB.routingRules = []; LB.playbook = []; LB.current = null;
    renderAll(); toast('Neues Leadership erstellt');
}

function selectLeadership(i) {
    var l = LB.leaderships[i]; if (!l) return;
    LB.current = i; LB.leaderName = l.name; LB.leaderDesc = l.description || '';
    LB.leaderIcon = l.icon || '🏢'; LB.leaderPrompt = l.prompt || '';
    LB.leaderTokens = l.tokens || 10000; LB.leaderModel = l.model || 'claude-sonnet';
    LB.assignedTeams = l.assignedTeams || []; LB.routingRules = l.routingRules || [];
    LB.loopMode = l.loopMode || 'memory'; LB.loopRounds = l.loopRounds || 5;
    LB.memoryFields = l.memoryFields || []; LB.playbook = l.playbook || [];
    updateLeadershipCost(); renderAll(); toast('Leadership geladen: ' + l.name);
}

function toggleTeamAssign(name) {
    var idx = LB.assignedTeams.findIndex(function(t){return t.name===name});
    if (idx >= 0) { LB.assignedTeams.splice(idx, 1); }
    else {
        var team = LB.savedTeams.find(function(t){return t.name===name});
        if (team) LB.assignedTeams.push(JSON.parse(JSON.stringify(team)));
    }
    updateLeadershipCost(); renderAll();
}

function removeTeamFromLeadership(i) {
    LB.assignedTeams.splice(i, 1);
    updateLeadershipCost(); renderAll();
}

function updateLeadershipCost() {
    var rate = COST_RATES[LB.leaderModel] || COST_RATES['openrouter-free'];
    LB.totalCost = (LB.leaderTokens / 1000) * (rate.in + rate.out);
    LB.assignedTeams.forEach(function(t) { LB.totalCost += (t.totalCost || 0); });
}

function loadLBTemplate(id) {
    var tpls = {
        'cto': { name:'CTO Leadership', icon:'🏢', prompt:'Du bist der CTO-Agent. Koordiniere alle technischen Teams.', tokens:10000, model:'claude-sonnet', teams:['BMAD v00 — Original','DevOps & QA'], rules:[{condition:'code_task',route_to:'BMAD v00 — Original'},{condition:'infra_task',route_to:'DevOps & QA'}] },
        'cmo': { name:'CMO Leadership', icon:'📣', prompt:'Du bist der CMO-Agent. Koordiniere alle Marketing-Teams.', tokens:8000, model:'gpt-4o', teams:['SEO Content Team','Social Media Team','E-Commerce Team'], rules:[{condition:'seo_task',route_to:'SEO Content Team'},{condition:'social_task',route_to:'Social Media Team'}] },
        'ciso': { name:'CISO Leadership', icon:'🛡️', prompt:'Du bist der CISO-Agent. Stelle Compliance und Security sicher.', tokens:8000, model:'claude-sonnet', teams:['Enterprise Security'], rules:[{condition:'security_audit',route_to:'Enterprise Security'},{condition:'incident',route_to:'Enterprise Security'}] }
    };
    var t = tpls[id]; if (!t) return;
    LB.leaderName = t.name; LB.leaderIcon = t.icon; LB.leaderPrompt = t.prompt;
    LB.leaderTokens = t.tokens; LB.leaderModel = t.model;
    LB.assignedTeams = t.teams.map(function(n) {
        var saved = LB.savedTeams.find(function(s){return s.name===n});
        return saved ? JSON.parse(JSON.stringify(saved)) : { name: n, agents: [], totalCost: 0 };
    });
    LB.routingRules = t.rules || [];
    updateLeadershipCost(); renderAll(); toast('Template geladen: ' + t.name);
}

function saveLeadership() {
    var key = 'dkz-leadership-' + LB.leaderName.replace(/\s+/g, '-').toLowerCase();
    var data = { name: LB.leaderName, icon: LB.leaderIcon, prompt: LB.leaderPrompt, tokens: LB.leaderTokens, model: LB.leaderModel, assignedTeams: LB.assignedTeams, routingRules: LB.routingRules, loopMode: LB.loopMode, loopRounds: LB.loopRounds, memoryFields: LB.memoryFields, playbook: LB.playbook, totalCost: LB.totalCost, saved: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(data));
    loadSavedLeaderships(); renderLeadershipList(); toast('Leadership gespeichert!');
}

function exportLeadership() {
    var data = { name: LB.leaderName, icon: LB.leaderIcon, prompt: LB.leaderPrompt, tokens: LB.leaderTokens, model: LB.leaderModel, assignedTeams: LB.assignedTeams, routingRules: LB.routingRules, loopMode: LB.loopMode, loopRounds: LB.loopRounds, playbook: LB.playbook, totalCost: LB.totalCost };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = LB.leaderName.replace(/\s+/g, '_') + '.leadership.json'; a.click();
    toast('Leadership exportiert!');
}

// ── DEMO RUN ──
function startLBDemo() {
    if (LB.assignedTeams.length === 0) { toast('Erst Teams zuweisen!'); return; }
    if (LB.demoRunning) { stopLBDemo(); return; }
    LB.demoRunning = true; LB.demoStep = 0;
    var m = document.getElementById('lb-demo-modal');
    m.style.opacity='1'; m.style.pointerEvents='all';
    document.getElementById('lb-demo-mode').textContent = LB.loopMode;
    runLBDemoStep();
}

function stopLBDemo() {
    LB.demoRunning = false;
    document.getElementById('lb-demo-modal').style.opacity='0';
    document.getElementById('lb-demo-modal').style.pointerEvents='none';
    document.getElementById('lb-demo-log').innerHTML = '';
}

function runLBDemoStep() {
    if (!LB.demoRunning) return;
    var log = document.getElementById('lb-demo-log');
    var round = Math.floor(LB.demoStep / (LB.assignedTeams.length + 1));
    var idx = LB.demoStep % (LB.assignedTeams.length + 1);
    if (round >= LB.loopRounds) { toast('Leadership Demo abgeschlossen!'); LB.demoRunning = false; return; }
    document.getElementById('lb-demo-round').textContent = (round+1) + '/' + LB.loopRounds;
    var runCost = LB.totalCost * (round + 1);
    document.getElementById('lb-demo-cost').textContent = '€' + runCost.toFixed(4);
    if (idx === 0) {
        log.innerHTML = '<div class="demo-entry"><span class="de-icon">' + LB.leaderIcon + '</span><span class="de-badge" style="color:#fa1e4e">👑</span><span class="de-name">' + esc(LB.leaderName) + '</span><span class="de-msg">Analysiert Situation, delegiert an Teams (Runde ' + (round+1) + ')</span></div>' + log.innerHTML;
    } else {
        var team = LB.assignedTeams[idx - 1];
        log.innerHTML = '<div class="demo-entry"><span class="de-icon">👥</span><span class="de-badge" style="color:#55ACEE">⚙️</span><span class="de-name">' + esc(team.name) + '</span><span class="de-msg">Team arbeitet... ✅ Fertig</span><span class="de-cost">€' + (team.totalCost || 0).toFixed(4) + '</span></div>' + log.innerHTML;
    }
    LB.demoStep++;
    setTimeout(runLBDemoStep, 800);
}

// ── INFO POPUPS ──
var LB_INFO = {
    'templates': '<h3>Leadership Templates</h3><p><strong>CTO:</strong> Chief Technology Officer leitet technische Teams (BMAD Original + DevOps).</p><p><strong>CMO:</strong> Chief Marketing Officer leitet Marketing-Teams (SEO + Social + E-Commerce).</p><p><strong>CISO:</strong> Chief Information Security Officer leitet Security-Teams.</p><p>Templates laden vorkonfigurierte Leader-Prompts, Team-Zuweisungen und Routing-Regeln.</p>',
    'leader': '<h3>Team-Leiter Konfiguration</h3><p>Der Team-Leiter ist ein Meta-Orchestrator, der mehrere Teams koordiniert.</p><p><strong>Name:</strong> Identifiziert den Leader in der Hierarchie.</p><p><strong>System Prompt:</strong> Definiert wie der Leader analysiert, delegiert und entscheidet.</p><p><strong>Tokens:</strong> Budget für Leader-Entscheidungen (typisch: 8K-50K).</p><p><strong>Model:</strong> Das LLM für den Leader (empfohlen: claude-sonnet oder gpt-4o für komplexe Entscheidungen).</p>',
    'team-assign': '<h3>Teams zuweisen</h3><p>Weise diesem Leader Teams zu, die er koordiniert.</p><p>Teams können aus dem Team Builder stammen (gespeicherte Teams) oder BMAD-Templates sein.</p><p>Jedes zugewiesene Team wird im Organigramm als Unterknoten dargestellt.</p>',
    'routing': '<h3>Routing-Regeln</h3><p>Definiere fallbasierte Regeln, wann welches Team aktiviert wird.</p><p><strong>Bedingung:</strong> Ein Keyword oder Muster (z.B. "code_task", "security_issue").</p><p><strong>Route:</strong> Das Team, das bei dieser Bedingung aktiviert wird.</p><p>Der Leader analysiert die Situation und routet basierend auf diesen Regeln an das beste Team.</p>',
    'loop': '<h3>Leadership Loop</h3><p>Meta-Loop über alle Sub-Teams.</p><p><strong>Stateless:</strong> Jede Runde startet frisch.</p><p><strong>Memory:</strong> Strategische Entscheidungen, Team-Performance und Blocker werden zwischen Runden gespeichert.</p><p>Loop-Funktion kann als automatisierbare Funktion in den gesamten Workflow eingebunden werden.</p>',
    'playbook': '<h3>Leadership Playbook</h3><p>Definiere die Leadership-Schritte:</p><ul><li>1. Leader analysiert Situation</li><li>2. Leader wählt Team basierend auf Routing-Regeln</li><li>3. Team führt Aufgabe aus</li><li>4. Leader prüft Ergebnis</li><li>5. Eskalation oder nächste Runde</li></ul>',
    'costs': '<h3>Leadership Kostenrechner</h3><p>Aggregiert die Kosten des Leaders PLUS aller zugewiesenen Teams.</p><p>Zeigt Kosten pro Durchlauf und Gesamtkosten über alle Runden.</p><p>Alle Kosten fließen in die DkZ Statistik und das Cost Dashboard.</p>',
    'skills': '<h3>Skills & Loops</h3><p>Erstelle neue Skills im Skill-Builder, die jedem Team oder Agent zugewiesen werden können.</p><p>Das Loop Dashboard zeigt alle aktiven Loops über Teams und Leaderships.</p>'
};

function showLBInfo(key) {
    document.getElementById('lb-info-content').innerHTML = LB_INFO[key] || '<p>Info nicht verfügbar.</p>';
    var m = document.getElementById('lb-info-modal');
    m.style.opacity='1'; m.style.pointerEvents='all';
}

function closeLBInfo() {
    var m = document.getElementById('lb-info-modal');
    m.style.opacity='0'; m.style.pointerEvents='none';
}

function showLBModuleInfo() {
    var m = document.getElementById('lb-module-info');
    m.style.opacity='1'; m.style.pointerEvents='all';
}

function checkLBOnboarding() {
    if (!localStorage.getItem('dkz-leadership-builder-onboarded')) {
        var ob = document.getElementById('lb-onboarding');
        if (ob) { ob.style.opacity='1'; ob.style.pointerEvents='all'; }
    }
}

function closeLBOnboarding() {
    var m = document.getElementById('lb-onboarding');
    m.style.opacity='0'; m.style.pointerEvents='none';
    localStorage.setItem('dkz-leadership-builder-onboarded', '1');
}

function renderAll() { renderLeadershipList(); renderOrgChart(); renderLeadershipProps(); }
function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function toast(m) { var t = document.getElementById('toast'); if (!t) return; document.getElementById('tt').textContent = m; t.classList.add('show'); setTimeout(function() { t.classList.remove('show'); }, 3000); }

document.addEventListener('DOMContentLoaded', initLeadership);
