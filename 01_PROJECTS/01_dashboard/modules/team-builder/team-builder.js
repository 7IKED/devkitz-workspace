/* ═══════════════════════════════════════════════════════════════
   DkZ Team Builder — Core Logic
   Multi-Agenten-Teams nach BMAD-Methodik + OpenClaw-Architektur
   ═══════════════════════════════════════════════════════════════ */

// ── STATE ──
var TB = {
    agents: [],         // alle verfügbaren Agenten (aus Registry + localStorage)
    team: [],           // aktuelle Team-Mitglieder
    teamName: 'Neues Team',
    teamDesc: '',
    bmadVersion: 'custom',
    genre: '',
    tags: [],
    loopMode: 'stateless',
    loopRounds: 5,
    memoryFields: [],
    playbook: [],
    totalCost: 0,
    demoRunning: false,
    demoStep: 0,
    filterText: '',
    filterTag: '',
    groupBy: 'type'
};

var ROLE_COLORS = { leader:'#fa1e4e', worker:'#00D084', reviewer:'#55ACEE', validator:'#f59e0b', specialist:'#a855f7' };
var ROLE_BADGES = { leader:'👑', worker:'⚙️', reviewer:'🔍', validator:'✅', specialist:'🎯' };
var ROLE_NAMES = { leader:'Leader', worker:'Worker', reviewer:'Reviewer', validator:'Validator', specialist:'Specialist' };

// ── COST RATES (from cost-calculator.json) ──
var COST_RATES = {
    'mistral-nemo': { in: 0.00015, out: 0.00015 },
    'claude-sonnet': { in: 0.003, out: 0.015 },
    'gpt-4o': { in: 0.005, out: 0.015 },
    'gemini-2.5-flash': { in: 0.00015, out: 0.0006 },
    'deepseek-r1': { in: 0.0008, out: 0.002 },
    'openrouter-free': { in: 0, out: 0 }
};

// ── INIT ──
function initTeamBuilder() {
    loadAgentsFromRegistry();
    loadAgentsFromLocalStorage();
    loadImportedAgent();
    renderAgentPool();
    renderTeamCanvas();
    renderProperties();
    updateCost();
    checkOnboarding();
}

// ── AGENT LOADING ──
function loadAgentsFromRegistry() {
    // Built-in agents from the DkZ agents-registry
    var builtIn = [
        { id:'openclaw', name:'OpenClaw Orchestrator', icon:'🧠', type:'orchestrator', tags:['#openclaw','#orchestrator','#dispatch'], desc:'Zentraler AI-Orchestrator', tokens:8000, model:'claude-sonnet' },
        { id:'pc-knowledge', name:'PicoClaw Knowledge', icon:'🦀', type:'picoclaw', tags:['#knowledge','#faiss','#search','#rag'], desc:'Semantische Wissenssuche über FAISS', tokens:4000, model:'gemini-2.5-flash' },
        { id:'pc-filemanager', name:'PicoClaw FileManager', icon:'🦀', type:'picoclaw', tags:['#files','#sort','#dedup'], desc:'Intelligente Datei-Operationen', tokens:2000, model:'gemini-2.5-flash' },
        { id:'pc-code-analyzer', name:'PicoClaw CodeAnalyzer', icon:'🦀', type:'picoclaw', tags:['#code','#analyze','#lint','#security'], desc:'Code-Analyse mit Linting und Security', tokens:6000, model:'claude-sonnet' },
        { id:'pc-seo', name:'PicoClaw SEO', icon:'🦀', type:'picoclaw', tags:['#seo','#meta','#keywords','#ranking'], desc:'SEO-Analyse und Keyword-Density', tokens:4000, model:'gemini-2.5-flash' },
        { id:'nb-formatter', name:'NanoBot Formatter', icon:'🤖', type:'nanobot', tags:['#format','#output','#markdown'], desc:'Formatiert Outputs nach DkZ-Standards', tokens:1000, model:'openrouter-free' },
        { id:'nb-validator', name:'NanoBot Validator', icon:'🤖', type:'nanobot', tags:['#validate','#json','#schema'], desc:'Validiert JSON-Schemas und Configs', tokens:1000, model:'openrouter-free' },
        { id:'nb-tagger', name:'NanoBot Tagger', icon:'🤖', type:'nanobot', tags:['#tags','#classify','#auto'], desc:'Auto-Tagging basierend auf Inhalt', tokens:1000, model:'openrouter-free' },
        { id:'nb-notifier', name:'NanoBot Notifier', icon:'🤖', type:'nanobot', tags:['#notify','#alerts','#events'], desc:'Benachrichtigungen bei System-Events', tokens:500, model:'openrouter-free' },
        // BMAD Core Agents
        { id:'james-master', name:'James™ Master', icon:'🎯', type:'bmad', tags:['#bmad','#master','#guardian'], desc:'Master Agent & Guardian', tokens:8000, model:'claude-sonnet' },
        { id:'dkz-pm', name:'DkZ PM™', icon:'📋', type:'bmad', tags:['#bmad','#pm','#requirements'], desc:'Product Manager — Nutzervalue', tokens:4000, model:'gpt-4o' },
        { id:'dkz-architekt', name:'DkZ Architekt™', icon:'🏗️', type:'bmad', tags:['#bmad','#architect','#system'], desc:'Technische Struktur', tokens:6000, model:'claude-sonnet' },
        { id:'dkz-developer', name:'DkZ Developer™', icon:'👨‍💻', type:'bmad', tags:['#bmad','#dev','#code'], desc:'Implementierung nach plan.md', tokens:8000, model:'claude-sonnet' },
        { id:'dkz-reviewer', name:'DkZ Reviewer™', icon:'🔍', type:'bmad', tags:['#bmad','#review','#quality'], desc:'Code Quality & Security', tokens:4000, model:'claude-sonnet' },
        { id:'dkz-tester', name:'DkZ Tester™', icon:'🧪', type:'bmad', tags:['#bmad','#test','#qa'], desc:'Tests und Verifikation', tokens:4000, model:'gemini-2.5-flash' },
        { id:'dkz-dokumentar', name:'DkZ Dokumentar™', icon:'📚', type:'bmad', tags:['#bmad','#docs','#wiki'], desc:'README, Wiki, Blaupausen', tokens:3000, model:'gemini-2.5-flash' }
    ];
    TB.agents = builtIn;
}

function loadAgentsFromLocalStorage() {
    try {
        var keys = Object.keys(localStorage);
        keys.forEach(function(k) {
            if (k.startsWith('dkz-agent-saved-')) {
                var d = JSON.parse(localStorage.getItem(k));
                TB.agents.push({
                    id: 'custom-' + Date.now() + Math.random().toString(36).substr(2,4),
                    name: d.agent || d.name || 'Custom Agent',
                    icon: '🤖', type: 'custom',
                    tags: ['#custom', '#agent-builder'],
                    desc: 'Aus Agent-Builder erstellt',
                    tokens: 4000, model: d.model || 'openrouter-free'
                });
            }
        });
    } catch(e) {}
}

function loadImportedAgent() {
    var imp = localStorage.getItem('dkz-agent-to-team');
    if (imp) {
        try {
            var d = JSON.parse(imp);
            localStorage.removeItem('dkz-agent-to-team');
            var a = {
                id: 'imported-' + Date.now(),
                name: d.agent || 'Importierter Agent',
                icon: '📦', type: 'custom',
                tags: ['#imported', '#agent-builder'],
                desc: 'Aus Agent-Builder importiert',
                tokens: 4000, model: 'openrouter-free'
            };
            TB.agents.push(a);
            addToTeam(a);
            toast('Agent importiert: ' + a.name);
        } catch(e) {}
    }
}

// ── AGENT POOL (Left Sidebar) ──
function renderAgentPool() {
    var pool = document.getElementById('agent-pool');
    if (!pool) return;
    var filtered = TB.agents.filter(function(a) {
        if (TB.filterText && a.name.toLowerCase().indexOf(TB.filterText.toLowerCase()) === -1 &&
            a.desc.toLowerCase().indexOf(TB.filterText.toLowerCase()) === -1) return false;
        if (TB.filterTag && a.tags.indexOf(TB.filterTag) === -1) return false;
        return true;
    });
    // Group by type
    var groups = {};
    filtered.forEach(function(a) {
        var g = TB.groupBy === 'type' ? a.type : (a.tags[0] || 'other');
        if (!groups[g]) groups[g] = [];
        groups[g].push(a);
    });
    var groupLabels = { orchestrator:'🧠 Orchestrator', picoclaw:'🦀 PicoClaws', nanobot:'🤖 NanoBots', bmad:'🎯 BMAD Agenten', custom:'📦 Custom Agenten' };
    var html = '';
    Object.keys(groups).forEach(function(g) {
        html += '<div class="pool-group"><div class="pool-group-title">' + (groupLabels[g] || g) + ' <span class="pool-count">' + groups[g].length + '</span></div>';
        groups[g].forEach(function(a) {
            var inTeam = TB.team.some(function(t) { return t.agent.id === a.id; });
            html += '<div class="pool-agent' + (inTeam ? ' in-team' : '') + '" data-id="' + a.id + '" onclick="addToTeamById(\'' + a.id + '\')">';
            html += '<div class="pool-agent-icon">' + a.icon + '</div>';
            html += '<div class="pool-agent-info"><div class="pool-agent-name">' + esc(a.name) + '</div>';
            html += '<div class="pool-agent-desc">' + esc(a.desc) + '</div>';
            html += '<div class="pool-agent-tags">' + a.tags.map(function(t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>';
            html += '</div></div>';
        });
        html += '</div>';
    });
    pool.innerHTML = html || '<div class="empty-pool">Keine Agenten gefunden</div>';
}

// ── TEAM CANVAS (Center) ──
function renderTeamCanvas() {
    var canvas = document.getElementById('team-canvas');
    if (!canvas) return;
    if (TB.team.length === 0) {
        canvas.innerHTML = '<div class="empty-canvas"><div class="ec-icon">👥</div><div class="ec-title">Team aufbauen</div><div class="ec-text">Wähle Agenten aus dem Pool links aus<br>oder lade ein BMAD-Template</div></div>';
        return;
    }
    var html = '<div class="team-grid">';
    // Find leader first
    var leaders = TB.team.filter(function(t) { return t.role === 'leader'; });
    var others = TB.team.filter(function(t) { return t.role !== 'leader'; });
    if (leaders.length > 0) {
        html += '<div class="team-leader-row">';
        leaders.forEach(function(t) { html += renderTeamNode(t, true); });
        html += '</div>';
        if (others.length > 0) {
            html += '<div class="team-connector"><svg width="2" height="40"><line x1="1" y1="0" x2="1" y2="40" stroke="#2a2a2e" stroke-width="2" stroke-dasharray="4"/></svg></div>';
        }
    }
    if (others.length > 0) {
        html += '<div class="team-members-row">';
        others.forEach(function(t) { html += renderTeamNode(t, false); });
        html += '</div>';
    }
    html += '</div>';
    // Stats bar
    html += '<div class="team-stats-bar">';
    html += '<div class="stat"><span class="stat-label">Agenten</span><span class="stat-value">' + TB.team.length + '</span></div>';
    html += '<div class="stat"><span class="stat-label">Tokens</span><span class="stat-value">' + TB.team.reduce(function(s,t){return s+t.tokens},0).toLocaleString() + '</span></div>';
    html += '<div class="stat"><span class="stat-label">Kosten/Run</span><span class="stat-value cost-pulse">€' + TB.totalCost.toFixed(4) + '</span></div>';
    html += '<div class="stat"><span class="stat-label">Loop</span><span class="stat-value">' + TB.loopMode + ' ×' + TB.loopRounds + '</span></div>';
    html += '</div>';
    canvas.innerHTML = html;
}

function renderTeamNode(t, isLeader) {
    var col = ROLE_COLORS[t.role] || '#808080';
    var badge = ROLE_BADGES[t.role] || '❓';
    var cls = isLeader ? 'team-node leader-node' : 'team-node';
    var h = '<div class="' + cls + '" style="border-color:' + col + '">';
    h += '<div class="tn-header"><span class="tn-icon">' + t.agent.icon + '</span><span class="tn-badge" style="background:' + col + '">' + badge + ' ' + ROLE_NAMES[t.role] + '</span>';
    h += '<button class="tn-remove" onclick="removeFromTeam(\'' + t.agent.id + '\')" title="Entfernen">✕</button></div>';
    h += '<div class="tn-name">' + esc(t.agent.name) + '</div>';
    h += '<div class="tn-tokens">' + t.tokens.toLocaleString() + ' tokens</div>';
    h += '<div class="tn-model">' + esc(t.model) + '</div>';
    // Demo animation overlay
    h += '<div class="tn-status" id="status-' + t.agent.id + '"></div>';
    h += '</div>';
    return h;
}

// ── PROPERTIES PANEL (Right Sidebar) ──
function renderProperties() {
    var p = document.getElementById('props-panel');
    if (!p) return;
    var h = '';
    // Team Properties
    h += '<div class="prop-section"><div class="prop-title">Team Eigenschaften <button class="info-btn" onclick="showInfo(\'team-props\')">ℹ</button></div>';
    h += '<div class="prop-group"><label>Team Name</label><input type="text" class="prop-input" value="' + esc(TB.teamName) + '" onchange="TB.teamName=this.value"></div>';
    h += '<div class="prop-group"><label>Beschreibung</label><textarea class="prop-textarea" onchange="TB.teamDesc=this.value">' + esc(TB.teamDesc) + '</textarea></div>';
    h += '<div class="prop-group"><label>Genre</label><select class="prop-select" onchange="TB.genre=this.value"><option value="">— Wählen —</option>';
    ['Software Development','Marketing & SEO','E-Commerce','DevOps','Social Media','Enterprise & Security','Content Creation','Research','Custom'].forEach(function(g) {
        h += '<option' + (TB.genre === g ? ' selected' : '') + '>' + g + '</option>';
    });
    h += '</select></div>';
    h += '<div class="prop-group"><label>Tags</label><input type="text" class="prop-input" placeholder="#tag1, #tag2..." value="' + TB.tags.join(', ') + '" onchange="TB.tags=this.value.split(\',\').map(function(s){return s.trim()}).filter(Boolean)"></div>';
    h += '</div>';

    // BMAD Version
    h += '<div class="prop-section"><div class="prop-title">BMAD Version <button class="info-btn" onclick="showInfo(\'bmad-version\')">ℹ</button></div>';
    h += '<div class="prop-group"><label>Version</label><select class="prop-select" onchange="TB.bmadVersion=this.value"><option value="custom">Custom</option><option value="v00"' + (TB.bmadVersion==='v00'?' selected':'') + '>v00 — BMAD Original</option></select></div>';
    h += '<div class="template-grid">';
    h += '<div class="tpl-card" onclick="loadTemplate(\'bmad-v00-original\')"><span class="tpl-icon">🎯</span><span class="tpl-name">BMAD v00 Original</span><span class="tpl-genre">Software Dev</span></div>';
    h += '<div class="tpl-card" onclick="loadTemplate(\'seo-content-team\')"><span class="tpl-icon">🔍</span><span class="tpl-name">SEO Content Team</span><span class="tpl-genre">Marketing</span></div>';
    h += '<div class="tpl-card" onclick="loadTemplate(\'ecommerce-team\')"><span class="tpl-icon">🛒</span><span class="tpl-name">E-Commerce Team</span><span class="tpl-genre">E-Commerce</span></div>';
    h += '<div class="tpl-card" onclick="loadTemplate(\'devops-team\')"><span class="tpl-icon">🦀</span><span class="tpl-name">DevOps & QA</span><span class="tpl-genre">DevOps</span></div>';
    h += '<div class="tpl-card" onclick="loadTemplate(\'social-media-team\')"><span class="tpl-icon">📱</span><span class="tpl-name">Social Media</span><span class="tpl-genre">Social</span></div>';
    h += '<div class="tpl-card" onclick="loadTemplate(\'enterprise-security-team\')"><span class="tpl-icon">🛡️</span><span class="tpl-name">Enterprise Security</span><span class="tpl-genre">Security</span></div>';
    h += '</div></div>';

    // Agent Roles & Tokens
    if (TB.team.length > 0) {
        h += '<div class="prop-section"><div class="prop-title">Rollen & Tokens <button class="info-btn" onclick="showInfo(\'roles-tokens\')">ℹ</button></div>';
        TB.team.forEach(function(t, i) {
            h += '<div class="agent-config" style="border-left:3px solid ' + (ROLE_COLORS[t.role]||'#808080') + '">';
            h += '<div class="ac-name">' + t.agent.icon + ' ' + esc(t.agent.name) + '</div>';
            h += '<div class="ac-row"><label>Rolle</label><select class="prop-select" onchange="setRole(' + i + ',this.value)">';
            Object.keys(ROLE_NAMES).forEach(function(r) {
                h += '<option value="' + r + '"' + (t.role===r?' selected':'') + '>' + ROLE_BADGES[r] + ' ' + ROLE_NAMES[r] + '</option>';
            });
            h += '</select></div>';
            h += '<div class="ac-row"><label>Tokens</label><input type="range" min="100" max="32000" step="100" value="' + t.tokens + '" oninput="setTokens(' + i + ',parseInt(this.value));this.nextElementSibling.textContent=this.value"><span class="token-val">' + t.tokens + '</span></div>';
            h += '<div class="ac-row"><label>Model</label><select class="prop-select" onchange="setModel(' + i + ',this.value)">';
            Object.keys(COST_RATES).forEach(function(m) { h += '<option value="' + m + '"' + (t.model===m?' selected':'') + '>' + m + '</option>'; });
            h += '</select></div>';
            h += '</div>';
        });
        h += '</div>';
    }

    // Loop Config
    h += '<div class="prop-section"><div class="prop-title">Loop Konfiguration <button class="info-btn" onclick="showInfo(\'loop-config\')">ℹ</button></div>';
    h += '<div class="prop-group"><label>Modus</label><div class="toggle-group">';
    h += '<button class="toggle-btn' + (TB.loopMode==='stateless'?' active':'') + '" onclick="TB.loopMode=\'stateless\';renderProperties();renderTeamCanvas()">🔄 Stateless</button>';
    h += '<button class="toggle-btn' + (TB.loopMode==='memory'?' active':'') + '" onclick="TB.loopMode=\'memory\';renderProperties();renderTeamCanvas()">🧠 Memory</button>';
    h += '</div></div>';
    h += '<div class="prop-group"><label>Runden</label><input type="number" class="prop-input" value="' + TB.loopRounds + '" min="1" max="100" onchange="TB.loopRounds=parseInt(this.value);renderTeamCanvas()"></div>';
    if (TB.loopMode === 'memory') {
        h += '<div class="prop-group"><label>Gedächtnis-Felder</label><input type="text" class="prop-input" placeholder="decisions, learnings, blockers" value="' + TB.memoryFields.join(', ') + '" onchange="TB.memoryFields=this.value.split(\',\').map(function(s){return s.trim()}).filter(Boolean)"></div>';
    }
    h += '</div>';

    // Mini Playbook Builder
    h += '<div class="prop-section"><div class="prop-title">Mini-Playbook <button class="info-btn" onclick="showInfo(\'playbook\')">ℹ</button></div>';
    h += '<div id="playbook-steps">';
    TB.playbook.forEach(function(s, i) {
        h += '<div class="pb-step"><span class="pb-num">' + (i+1) + '</span><input class="prop-input pb-input" value="' + esc(s) + '" onchange="TB.playbook[' + i + ']=this.value"><button class="pb-del" onclick="TB.playbook.splice(' + i + ',1);renderProperties()">✕</button></div>';
    });
    h += '</div>';
    h += '<button class="btn-sm" onclick="TB.playbook.push(\'Neuer Schritt\');renderProperties()">+ Schritt</button>';
    h += '</div>';

    // Cost Calculator
    h += '<div class="prop-section"><div class="prop-title">Kostenrechner <button class="info-btn" onclick="showInfo(\'costs\')">ℹ</button></div>';
    h += '<div class="cost-display"><div class="cost-main">€' + TB.totalCost.toFixed(4) + '</div><div class="cost-label">pro Durchlauf</div>';
    h += '<div class="cost-total">€' + (TB.totalCost * TB.loopRounds).toFixed(4) + ' für ' + TB.loopRounds + ' Runden</div></div>';
    h += '</div>';

    // Actions
    h += '<div class="prop-section">';
    h += '<button class="btn-primary" onclick="startDemoRun()" style="width:100%;margin-bottom:.5rem">▶️ Demo-Lauf starten</button>';
    h += '<button class="btn-secondary" onclick="exportTeam()" style="width:100%;margin-bottom:.5rem">⬇️ Team exportieren</button>';
    h += '<button class="btn-secondary" onclick="saveTeam()" style="width:100%;margin-bottom:.5rem">💾 Team speichern</button>';
    h += '<a href="../leadership-builder/index.html" class="btn-secondary" style="width:100%;display:block;text-align:center;text-decoration:none;padding:.625rem;border:1px solid #2a2a2e;border-radius:6px;color:#f6f6f7;font-weight:600;font-size:.875rem">🏢 → Leadership Builder</a>';
    h += '</div>';

    // Skills Loop Link
    h += '<div class="prop-section"><div class="prop-title">Skills & Loops <button class="info-btn" onclick="showInfo(\'skills-loops\')">ℹ</button></div>';
    h += '<a href="../skill-builder/index.html" class="btn-sm link-btn">🎯 Neue Skills erstellen</a>';
    h += '<a href="../loop-dashboard/index.html" class="btn-sm link-btn">🔄 Loop Dashboard</a>';
    h += '</div>';

    p.innerHTML = h;
}

// ── TEAM OPERATIONS ──
function addToTeamById(id) {
    var a = TB.agents.find(function(x) { return x.id === id; });
    if (a) addToTeam(a);
}

function addToTeam(agent) {
    if (TB.team.some(function(t) { return t.agent.id === agent.id; })) { toast('Agent bereits im Team'); return; }
    TB.team.push({ agent: agent, role: TB.team.length === 0 ? 'leader' : 'worker', tokens: agent.tokens || 4000, model: agent.model || 'openrouter-free' });
    updateCost(); renderAll(); toast(agent.name + ' hinzugefügt');
}

function removeFromTeam(id) {
    TB.team = TB.team.filter(function(t) { return t.agent.id !== id; });
    updateCost(); renderAll(); toast('Agent entfernt');
}

function setRole(i, role) { TB.team[i].role = role; updateCost(); renderAll(); }
function setTokens(i, val) { TB.team[i].tokens = val; updateCost(); renderTeamCanvas(); }
function setModel(i, val) { TB.team[i].model = val; updateCost(); renderProperties(); }

function updateCost() {
    TB.totalCost = 0;
    TB.team.forEach(function(t) {
        var rate = COST_RATES[t.model] || COST_RATES['openrouter-free'];
        var inCost = (t.tokens / 1000) * (rate.in || 0);
        var outCost = (t.tokens / 1000) * (rate.out || 0);
        TB.totalCost += inCost + outCost;
    });
}

function renderAll() { renderAgentPool(); renderTeamCanvas(); renderProperties(); }

// ── TEMPLATES ──
function loadTemplate(id) {
    var TEMPLATES = {
        'bmad-v00-original': { name:'BMAD v00 — Original', ver:'v00', genre:'Software Development', agents:['james-master','dkz-pm','dkz-architekt','dkz-developer','dkz-reviewer','dkz-tester','dkz-dokumentar'], roles:['leader','specialist','specialist','worker','reviewer','validator','specialist'] },
        'seo-content-team': { name:'SEO Content Team', ver:'v01', genre:'Marketing & SEO', agents:['pc-seo','nb-formatter','nb-tagger'], roles:['specialist','worker','specialist'] },
        'ecommerce-team': { name:'E-Commerce Team', ver:'v01', genre:'E-Commerce', agents:['pc-seo','pc-knowledge','nb-formatter'], roles:['specialist','worker','worker'] },
        'devops-team': { name:'DevOps & QA', ver:'v01', genre:'DevOps', agents:['pc-code-analyzer','nb-validator','nb-notifier'], roles:['specialist','validator','specialist'] },
        'social-media-team': { name:'Social Media Team', ver:'v01', genre:'Social Media', agents:['nb-formatter','nb-tagger','pc-knowledge'], roles:['worker','specialist','worker'] },
        'enterprise-security-team': { name:'Enterprise Security', ver:'v01', genre:'Enterprise & Security', agents:['pc-code-analyzer','nb-validator','james-master'], roles:['specialist','validator','leader'] }
    };
    var tpl = TEMPLATES[id]; if (!tpl) return;
    TB.team = [];
    TB.teamName = tpl.name;
    TB.bmadVersion = tpl.ver;
    TB.genre = tpl.genre;
    tpl.agents.forEach(function(aid, i) {
        var a = TB.agents.find(function(x) { return x.id === aid; });
        if (a) TB.team.push({ agent: a, role: tpl.roles[i] || 'worker', tokens: a.tokens || 4000, model: a.model || 'openrouter-free' });
    });
    updateCost(); renderAll(); toast('Template geladen: ' + tpl.name);
}

// ── DEMO RUN (Durchlauf Analyser) ──
function startDemoRun() {
    if (TB.team.length === 0) { toast('Erst ein Team aufbauen!'); return; }
    if (TB.demoRunning) { stopDemoRun(); return; }
    TB.demoRunning = true; TB.demoStep = 0;
    var modal = document.getElementById('demo-modal');
    modal.style.opacity = '1'; modal.style.pointerEvents = 'all';
    runDemoStep();
}

function stopDemoRun() {
    TB.demoRunning = false;
    var modal = document.getElementById('demo-modal');
    modal.style.opacity = '0'; modal.style.pointerEvents = 'none';
    document.getElementById('demo-log').innerHTML = '';
    document.getElementById('demo-cost').textContent = '€0.0000';
    document.getElementById('demo-round').textContent = '0/' + TB.loopRounds;
}

function runDemoStep() {
    if (!TB.demoRunning) return;
    var log = document.getElementById('demo-log');
    var costEl = document.getElementById('demo-cost');
    var roundEl = document.getElementById('demo-round');
    var round = Math.floor(TB.demoStep / TB.team.length);
    var agentIdx = TB.demoStep % TB.team.length;
    if (round >= TB.loopRounds) { toast('Demo-Lauf abgeschlossen!'); TB.demoRunning = false; return; }
    roundEl.textContent = (round + 1) + '/' + TB.loopRounds;
    var t = TB.team[agentIdx];
    var runCost = TB.totalCost * (TB.demoStep + 1) / TB.team.length;
    costEl.textContent = '€' + runCost.toFixed(4);
    // Animate status
    var statuses = ['⏳ Denkt nach...', '💬 Antwortet...', '✅ Fertig'];
    var statusIdx = 0;
    var badge = ROLE_BADGES[t.role] || '⚙️';
    function animateStatus() {
        if (statusIdx >= statuses.length) {
            log.innerHTML = '<div class="demo-entry"><span class="de-icon">' + t.agent.icon + '</span><span class="de-badge" style="color:' + ROLE_COLORS[t.role] + '">' + badge + '</span><span class="de-name">' + esc(t.agent.name) + '</span><span class="de-msg">Task abgeschlossen (Runde ' + (round+1) + ')</span><span class="de-cost">€' + (TB.totalCost / TB.team.length).toFixed(4) + '</span></div>' + log.innerHTML;
            TB.demoStep++;
            setTimeout(runDemoStep, 600);
            return;
        }
        var el = document.getElementById('status-' + t.agent.id);
        if (el) { el.textContent = statuses[statusIdx]; el.className = 'tn-status active'; }
        statusIdx++;
        setTimeout(animateStatus, 500);
    }
    animateStatus();
}

// ── EXPORT & SAVE ──
function exportTeam() {
    var data = { name: TB.teamName, description: TB.teamDesc, bmadVersion: TB.bmadVersion, genre: TB.genre, tags: TB.tags, loopMode: TB.loopMode, loopRounds: TB.loopRounds, memoryFields: TB.memoryFields, playbook: TB.playbook, agents: TB.team.map(function(t) { return { id: t.agent.id, name: t.agent.name, role: t.role, tokens: t.tokens, model: t.model }; }), totalCost: TB.totalCost };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = TB.teamName.replace(/\s+/g, '_') + '.team.json'; a.click();
    toast('Team exportiert!');
}

function saveTeam() {
    var key = 'dkz-team-' + TB.teamName.replace(/\s+/g, '-').toLowerCase();
    var data = { name: TB.teamName, description: TB.teamDesc, bmadVersion: TB.bmadVersion, genre: TB.genre, tags: TB.tags, loopMode: TB.loopMode, loopRounds: TB.loopRounds, memoryFields: TB.memoryFields, playbook: TB.playbook, agents: TB.team.map(function(t) { return { id: t.agent.id, name: t.agent.name, role: t.role, tokens: t.tokens, model: t.model }; }), totalCost: TB.totalCost, saved: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(data));
    toast('Team gespeichert: ' + TB.teamName);
}

// ── INFO POPUPS ──
var INFO_TEXTS = {
    'team-props': '<h3>Team Eigenschaften</h3><p><strong>Team Name:</strong> Der Name identifiziert dein Team in allen Registries und Exports.</p><p><strong>Beschreibung:</strong> Kurze Zusammenfassung des Team-Zwecks.</p><p><strong>Genre:</strong> Kategorisierung nach Anwendungsbereich (z.B. Software Dev, Marketing).</p><p><strong>Tags:</strong> Eigene Tags für Filterung und Gruppierung. Kommasepariert mit # Prefix.</p>',
    'bmad-version': '<h3>BMAD Version</h3><p><strong>v00 — BMAD Original:</strong> Das Originalteam nach der Breakthrough Method for Agile AI-Driven Development mit 7 Kern-Rollen (James™ Master, PM, Architekt, Developer, Reviewer, Tester, Dokumentar).</p><p><strong>Konfigurierte Varianten:</strong> Angepasste Teams mit spezifischen Genres und Techniken. Jede Variante hat eigene Symbole und Tags.</p><p><strong>Templates:</strong> Klicke auf ein Template um das gesamte Team mit vordefinierten Rollen und Token-Budgets zu laden.</p>',
    'roles-tokens': '<h3>Rollen & Tokens</h3><p><strong>👑 Leader:</strong> Orchestriert das Team, verteilt Aufgaben, trifft Entscheidungen.</p><p><strong>⚙️ Worker:</strong> Führt die Hauptarbeit aus (Code, Content, Analyse).</p><p><strong>🔍 Reviewer:</strong> Prüft die Arbeit anderer Agenten auf Qualität.</p><p><strong>✅ Validator:</strong> Validiert Ergebnisse gegen Akzeptanzkriterien.</p><p><strong>🎯 Specialist:</strong> Experte für spezifische Aufgaben.</p><p><strong>Tokens:</strong> Maximales Token-Budget pro Agent pro Durchlauf. Beeinflusst direkt die Kosten.</p><p><strong>Model:</strong> Das LLM-Modell das der Agent nutzt. Verschiedene Modelle haben verschiedene Kosten pro 1K Tokens.</p>',
    'loop-config': '<h3>Loop Konfiguration</h3><p><strong>🔄 Stateless:</strong> Jede Runde startet frisch — vorherige Ereignisse werden gelöscht. Ideal für unabhängige Tasks.</p><p><strong>🧠 Memory:</strong> Gedächtnis wird zwischen Runden beibehalten. Konfigurierbare Felder (z.B. decisions, learnings, blockers) werden von Runde zu Runde weitergegeben.</p><p><strong>Runden:</strong> Wie oft der komplette Team-Durchlauf wiederholt wird.</p><p><strong>Gedächtnis-Felder:</strong> Im Memory-Modus: Welche Informationen zwischen Runden gespeichert werden (kommasepariert).</p>',
    'playbook': '<h3>Mini-Playbook</h3><p>Definiere die Schritte, die das Team in jedem Durchlauf abarbeitet.</p><p>Jeder Schritt wird sequentiell ausgeführt. Agenten werden basierend auf ihrer Rolle dem passenden Schritt zugewiesen.</p><p><strong>Beispiel:</strong></p><ul><li>1. Leader analysiert die Aufgabe</li><li>2. Workers führen Teilaufgaben aus</li><li>3. Reviewer prüft Ergebnisse</li><li>4. Validator bestätigt Qualität</li></ul>',
    'costs': '<h3>Kostenrechner</h3><p>Berechnet automatisch die Token-Kosten basierend auf:</p><ul><li>Token-Budget pro Agent</li><li>Modell-Raten (Input + Output pro 1K Tokens)</li><li>Anzahl der Loop-Runden</li></ul><p>Die Kosten fließen in die DkZ Statistik ein und werden im Cost Dashboard angezeigt.</p><p><strong>Raten aus:</strong> <code>cost-calculator.json</code></p>',
    'skills-loops': '<h3>Skills & Loops</h3><p><strong>Skills erstellen:</strong> Im Skill-Builder kannst du neue wiederverwendbare Skills definieren, die jedem Agenten zugewiesen werden können.</p><p><strong>Loop Dashboard:</strong> Übersicht aller laufenden und geplanten Loops über alle Teams und Leaderships hinweg.</p><p><strong>Loop-Funktion:</strong> Kann in Teams und Leadership als automatisierbare Funktion eingebunden werden, um Abläufe zu automatisieren.</p>'
};

function showInfo(key) {
    var modal = document.getElementById('info-detail-modal');
    document.getElementById('info-detail-content').innerHTML = INFO_TEXTS[key] || '<p>Info nicht verfügbar.</p>';
    modal.style.opacity = '1'; modal.style.pointerEvents = 'all';
}

function closeInfoDetail() {
    var m = document.getElementById('info-detail-modal');
    m.style.opacity = '0'; m.style.pointerEvents = 'none';
}

// ── MODULE INFO ──
function showModuleInfo() {
    var m = document.getElementById('info-modal');
    m.style.opacity = '1'; m.style.pointerEvents = 'all';
}

// ── ONBOARDING ──
function checkOnboarding() {
    if (!localStorage.getItem('dkz-team-builder-v2-onboarded')) {
        var ob = document.getElementById('onboarding');
        if (ob) { ob.style.opacity = '1'; ob.style.pointerEvents = 'all'; }
    }
}

function closeOnboarding() {
    var m = document.getElementById('onboarding');
    m.style.opacity = '0'; m.style.pointerEvents = 'none';
    localStorage.setItem('dkz-team-builder-v2-onboarded', '1');
}

// ── FILTER ──
function filterPool() {
    TB.filterText = document.getElementById('pool-search').value;
    TB.filterTag = document.getElementById('pool-tag-filter').value;
    renderAgentPool();
}

// ── UTILS ──
function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function toast(m) { var t = document.getElementById('toast'); if (!t) return; document.getElementById('tt').textContent = m; t.classList.add('show'); setTimeout(function() { t.classList.remove('show'); }, 3000); }

// ── BOOT ──
document.addEventListener('DOMContentLoaded', initTeamBuilder);
