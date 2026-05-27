/**
 * DkZ Navbar — Unified Hamburger Menu, Notes, Panel Activation & App-IDs
 * @DKZ:RULES → R21, R12, R100
 * @DKZ:TAG → [SYS:navbar] [CAT:shared] [LANG:js]
 * @version v0.05
 *
 * ═══════════════════════════════════════════════════════════════
 * LLM-ANWEISUNG:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  NAVBAR v0.04: Hamburger (☰) + Seitenmenü + Notes + Review │
 * │  NEU: Panel-Aktivierungs-System (DkzPanelManager)          │
 * │  - Jedes Panel hat eine App-ID (data-app-id)               │
 * │  - Inaktive Panels = transparent/grau (50% opacity)        │
 * │  - Klick auf inaktiv → Dialog: "Aktivieren? [Ja] [Nein]"  │
 * │  - Status in localStorage: dkz-panel-states                │
 * │  - Pfadunabhängig: Dynamische Base-Path-Erkennung          │
 * │                                                              │
 * │  APIs: DkzNotes, DkzReview, DkzPanelManager                │
 * │  Einbindung: <script src="../../shared/dkz-navbar.js">     │
 * │  (vor </body>, nach dkz-theme.css)                         │
 * └─────────────────────────────────────────────────────────────┘
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
'use strict';

// ═══ MODULE REGISTRY ═══
const GROUPS = [
    {
        label: 'Wissen & Daten', icon: '📚',
        items: [
            { name: 'Knowledge Hub', icon: '📝', path: 'wissen-hub', appId: 'DKZ-WIS-001', defaultActive: true },
            { name: 'ICEberg™', icon: '🧊', path: 'iceberg', appId: 'DKZ-WIS-002', defaultActive: true },
            { name: 'KI-Lernplattform', icon: '🎓', path: 'ki-lernplattform', appId: 'DKZ-WIS-003', defaultActive: false },
            { name: 'AI Chat', icon: '🤖', path: 'ai_chat', appId: 'DKZ-WIS-004', defaultActive: true },
        ]
    },
    {
        label: 'KI-Agenten & NLM', icon: '🤖',
        items: [
            { name: 'NanoBot™ Center', icon: '⚡', path: 'nanobot-center', appId: 'DKZ-AGT-001', defaultActive: true },
            { name: 'CodeRabbit™ Panel', icon: '🐰', path: 'coderabbit-panel', appId: 'DKZ-AGT-002', defaultActive: true },
            { name: 'Cloud Control', icon: '☁️', path: 'cloud-control', appId: 'DKZ-AGT-003', defaultActive: true },
            { name: 'CL0UDiA™', icon: '🌐', path: 'claudia-cloud', appId: 'DKZ-AGT-004', defaultActive: false },
            { name: 'QR Launcher', icon: '📱', path: 'qr-launcher', appId: 'DKZ-AGT-005', defaultActive: true },
            { name: 'Whisper TTS', icon: '🗣️', path: 'whisper-tts', appId: 'DKZ-AGT-006', defaultActive: false },
        ]
    },
    {
        label: 'Prompts & Archive', icon: '✏️',
        items: [
            { name: 'Prompt Archiv', icon: '📖', path: 'prompt-viewer', appId: 'DKZ-PRM-001', defaultActive: true },
            { name: 'Prompter', icon: '✏️', path: 'prompter', appId: 'DKZ-PRM-002', defaultActive: true },
            { name: 'Prompt Generator', icon: '⚙️', path: 'prompt-generator', appId: 'DKZ-PRM-003', defaultActive: true },
            { name: 'Loop Dashboard', icon: '🔄', path: 'loop-dashboard', appId: 'DKZ-PRM-004', defaultActive: true },
        ]
    },
    {
        label: 'Builder Chain', icon: '🔧',
        items: [
            { name: 'Action Builder', icon: '🧩', path: 'action-builder', appId: 'DKZ-BLD-001', defaultActive: true },
            { name: 'Skill Builder', icon: '🎯', path: 'skill-builder', appId: 'DKZ-BLD-002', defaultActive: true },
            { name: 'Agent Builder', icon: '🤖', path: 'agent-builder', appId: 'DKZ-BLD-003', defaultActive: true },
            { name: 'Workflow Builder', icon: '🔀', path: 'workflow-builder', appId: 'DKZ-BLD-004', defaultActive: true },
            { name: 'Team Builder', icon: '👥', path: 'team-builder', appId: 'DKZ-BLD-005', defaultActive: false },
            { name: 'TEN0R Builder', icon: '🎸', path: 'tenor-builder', appId: 'DKZ-BLD-006', defaultActive: false },
            { name: 'BLACK8 Builder', icon: '⚡', path: 'black8-builder', appId: 'DKZ-BLD-007', defaultActive: false },
            { name: 'H00D Builder', icon: '🐳', path: 'hood-builder', appId: 'DKZ-BLD-008', defaultActive: false },
        ]
    },
    {
        label: 'Design & Content', icon: '🎨',
        items: [
            { name: 'Image Forge', icon: '🖼️', path: 'image-forge', appId: 'DKZ-DSG-001', defaultActive: true },
            { name: 'Icon Creator', icon: '🎯', path: 'icon-creator', appId: 'DKZ-DSG-002', defaultActive: false },
            { name: 'Galerie', icon: '🎨', path: 'gallery', appId: 'DKZ-DSG-003', defaultActive: true },
            { name: 'Blog Designer', icon: '📰', path: 'blog-designer', appId: 'DKZ-DSG-004', defaultActive: false },
            { name: 'Markdown Editor', icon: '📝', path: 'markdown-gen', appId: 'DKZ-DSG-005', defaultActive: true },
            { name: 'Suno AI', icon: '🎵', path: 'suno-ai', appId: 'DKZ-DSG-006', defaultActive: false },
            { name: 'Flyer Engine', icon: '🖨️', path: '_flyer_', href: '../../04_flyer_engine/index.html', appId: 'DKZ-DSG-007', defaultActive: true },
        ]
    },
    {
        label: 'System & Tools', icon: '🔨',
        items: [
            { name: 'Hub (alle Module)', icon: '🚀', path: '_hub_', href: '../hub/index.html', appId: 'DKZ-SYS-001', defaultActive: true },
            { name: 'Mainboard™', icon: '🖥️', path: '_mainboard_', href: '../mainboard/index.html', appId: 'DKZ-SYS-002', defaultActive: true },
            { name: 'Command Center', icon: '⚡', path: '_dashboard_', href: '../landing-pages/dashboard.html', appId: 'DKZ-SYS-003', defaultActive: true },
            { name: 'Kostenrechner', icon: '💰', path: 'llm-cost-board', appId: 'DKZ-SYS-004', defaultActive: true },
            { name: 'SEO Toolkit', icon: '🔍', path: 'seo-toolkit', appId: 'DKZ-SYS-005', defaultActive: false },
            { name: 'JSON Formatter', icon: '📋', path: 'json-formatter', appId: 'DKZ-SYS-006', defaultActive: true },
            { name: 'Settings', icon: '⚙️', path: 'settings', appId: 'DKZ-SYS-007', defaultActive: true },
        ]
    },
    {
        label: 'Wiki & Docs', icon: '📖',
        items: [
            { name: 'Wiki Hub', icon: '📚', path: '_wiki_', href: '../../10_wiki-hub/index.html', appId: 'DKZ-DOC-001', defaultActive: true },
            { name: 'Use-Case Hub', icon: '📐', path: '_usecase_', href: '../../[WORKSPACE]/[USE-CASE]/index.html', appId: 'DKZ-DOC-002', defaultActive: false },
            { name: 'Research Archive', icon: '🔬', path: 'research-archive', appId: 'DKZ-DOC-003', defaultActive: true },
            { name: 'Automation Guide', icon: '⚙️', path: '_wiki_auto_', href: '../../08_aiaikirk/wiki/dashboards/automation-guide.html', appId: 'DKZ-DOC-004', defaultActive: false },
            { name: 'Skills Matrix', icon: '🎯', path: '_wiki_skills_', href: '../../08_aiaikirk/wiki/dashboards/skills-matrix.html', appId: 'DKZ-DOC-005', defaultActive: false },
            { name: 'LM Notebooks', icon: '📓', path: '_wiki_lm_', href: '../../08_aiaikirk/wiki/dashboards/lm-notebooks.html', appId: 'DKZ-DOC-006', defaultActive: false },
            { name: 'NotebookLM Panel', icon: '🔮', path: '_wiki_nlm_', href: '../../08_aiaikirk/wiki/dashboards/notebooklm-panel.html', appId: 'DKZ-DOC-007', defaultActive: false },
            { name: 'System Overview', icon: '🏗️', path: '_wiki_sys_', href: '../../08_aiaikirk/wiki/dashboards/system-overview.html', appId: 'DKZ-DOC-008', defaultActive: false },
            { name: 'Dateimanagement', icon: '📁', path: '_wiki_files_', href: '../../08_aiaikirk/wiki/dashboards/dateimanagement.html', appId: 'DKZ-DOC-009', defaultActive: false },
        ]
    },
    {
        label: 'AutoPilot & Pipeline', icon: '🤖',
        items: [
            { name: 'AutoPilot Hub', icon: '🎮', path: '_autopilot_', href: '../../09_autopilot/dashboard/index.html', appId: 'DKZ-AUT-001', defaultActive: true },
            { name: 'NLM Batch Generator', icon: '📓', path: '_nlm_batch_', href: 'javascript:void(0)', appId: 'DKZ-AUT-002', defaultActive: true },
            { name: 'Design.md Generator', icon: '🎨', path: '_design_gen_', href: 'javascript:void(0)', appId: 'DKZ-AUT-003', defaultActive: true },
            { name: 'Blog Upload Pipeline', icon: '📤', path: '_blog_pipeline_', href: 'javascript:void(0)', appId: 'DKZ-AUT-004', defaultActive: true },
        ]
    }
];

// ═══ PATH DETECTION ═══
function detectBasePath() {
    const path = window.location.pathname;
    // modules/xyz/index.html → ../../shared/
    if (path.includes('/modules/')) return '../';
    // landing-pages/, hub/, mainboard/ → ../modules/
    if (path.includes('/landing-pages/') || path.includes('/hub/') || path.includes('/mainboard/')) return '../modules/';
    // wiki dashboards (08_aiaikirk/wiki/dashboards/) → deeper path
    if (path.includes('/08_aiaikirk/wiki/dashboards/')) return '../../../../01_dashboard/modules/';
    // wiki root (08_aiaikirk/wiki/)
    if (path.includes('/08_aiaikirk/wiki/')) return '../../../01_dashboard/modules/';
    // autopilot dashboard (09_autopilot/dashboard/)
    if (path.includes('/09_autopilot/dashboard/')) return '../../../01_dashboard/modules/';
    // autopilot root (09_autopilot/)
    if (path.includes('/09_autopilot/')) return '../../01_dashboard/modules/';
    // wiki-hub standalone (10_wiki-hub/)
    if (path.includes('/10_wiki-hub/')) return '../01_dashboard/modules/';
    // flyer-engine (04_flyer_engine/)
    if (path.includes('/04_flyer_engine/')) return '../01_dashboard/modules/';
    // Use-Case Hub ([WORKSPACE]/[USE-CASE]/)
    if (path.includes('/USE-CASE') || path.includes('%5BUSE-CASE%5D')) return '../../01_PROJECTS/01_dashboard/modules/';
    return '../modules/';
}

function getHref(item) {
    const path = window.location.pathname;
    const inModules = path.includes('/modules/');
    const inHub = path.includes('/hub/');
    const inMainboard = path.includes('/mainboard/');
    const inLanding = path.includes('/landing-pages/');
    const inWikiDashboards = path.includes('/08_aiaikirk/wiki/dashboards/');
    const inWikiRoot = !inWikiDashboards && path.includes('/08_aiaikirk/wiki/');
    const inAutopilotDash = path.includes('/09_autopilot/dashboard/');
    const inAutopilotRoot = !inAutopilotDash && path.includes('/09_autopilot/');
    const inWikiHub = path.includes('/10_wiki-hub/');
    const inFlyer = path.includes('/04_flyer_engine/');
    const inUseCase = path.includes('/USE-CASE') || path.includes('%5BUSE-CASE%5D');
    const inExternal = inWikiDashboards || inWikiRoot || inAutopilotDash || inAutopilotRoot || inWikiHub || inFlyer || inUseCase;

    // Special hrefs (Hub, Mainboard, Command Center, Wiki, AutoPilot)
    if (item.href) {
        // Von /modules/xyz/ aus: ../../hub/, ../../mainboard/, etc.
        if (inModules) return '../../' + item.href.replace(/^\.\.\//, '');
        // Von /hub/ oder /mainboard/ oder /landing-pages/ aus: ../ prefix
        if (inHub || inMainboard || inLanding) return '../' + item.href.replace(/^\.\.\//, '');
        // Von Wiki Dashboards (08_aiaikirk/wiki/dashboards/) aus
        if (inWikiDashboards) return '../../../../01_dashboard/' + item.href.replace(/^\.\.\//, '');
        // Von Wiki Root (08_aiaikirk/wiki/) aus
        if (inWikiRoot) return '../../../01_dashboard/' + item.href.replace(/^\.\.\//, '');
        // Von AutoPilot Dashboard aus
        if (inAutopilotDash) return '../../../01_dashboard/' + item.href.replace(/^\.\.\//, '');
        if (inAutopilotRoot) return '../../01_dashboard/' + item.href.replace(/^\.\.\//, '');
        if (inWikiHub) return '../01_dashboard/' + item.href.replace(/^\.\.\//, '');
        if (inFlyer) return '../01_dashboard/' + item.href.replace(/^\.\.\//, '');
        // Von Use-Case Hub aus
        if (inUseCase) return '../../01_PROJECTS/01_dashboard/' + item.href.replace(/^\.\.\//, '');
        return item.href;
    }
    // Standard module: /modules/[path]/index.html
    if (inModules) return '../' + item.path + '/index.html';
    if (inHub || inMainboard || inLanding) return '../modules/' + item.path + '/index.html';
    // Von externen Seiten zurück zu modules/
    if (inWikiDashboards) return '../../../../01_dashboard/modules/' + item.path + '/index.html';
    if (inWikiRoot) return '../../../01_dashboard/modules/' + item.path + '/index.html';
    if (inAutopilotDash) return '../../../01_dashboard/modules/' + item.path + '/index.html';
    if (inAutopilotRoot) return '../../01_dashboard/modules/' + item.path + '/index.html';
    if (inWikiHub) return '../01_dashboard/modules/' + item.path + '/index.html';
    if (inFlyer) return '../01_dashboard/modules/' + item.path + '/index.html';
    if (inUseCase) return '../../01_PROJECTS/01_dashboard/modules/' + item.path + '/index.html';
    return '../modules/' + item.path + '/index.html';
}

function getCurrentModule() {
    const path = window.location.pathname;
    const m = path.match(/modules\/([^/]+)\//);
    return m ? m[1] : null;
}

// ═══ INJECT STYLES ═══
function injectStyles() {
    const s = document.createElement('style');
    s.id = 'dkz-navbar-styles';
    s.textContent = `
/* DkZ Navbar Hamburger — Premium DkZ-Rot */
/* Wenn Headbar vorhanden: position wird per JS auf static gesetzt */
#dkz-hamburger {
    position:fixed;top:8px;left:8px;z-index:10001;
    width:34px;height:34px;border:none;background:rgba(14,14,22,.8);
    backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    border-radius:8px;cursor:pointer;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:4px;padding:0;
    border:1px solid rgba(250,30,78,.15);transition:all .4s cubic-bezier(.4,0,.2,1);
    box-shadow:0 2px 12px rgba(0,0,0,.3);
}
/* Headbar-integrierter Modus */
.dkz-hb-hamburger-slot #dkz-hamburger {
    position:static !important;
    z-index:auto !important;
    box-shadow:none;
}
#dkz-hamburger:hover{border-color:rgba(250,30,78,.5);background:rgba(250,30,78,.1);
    box-shadow:0 2px 20px rgba(250,30,78,.15)}
#dkz-hamburger span{display:block;width:17px;height:1.5px;background:#fa1e4e;
    border-radius:2px;transition:all .4s cubic-bezier(.68,-.55,.27,1.55);
    box-shadow:0 0 4px rgba(250,30,78,.2)}
#dkz-hamburger.open{background:rgba(250,30,78,.12);border-color:rgba(250,30,78,.5);
    box-shadow:0 0 24px rgba(250,30,78,.2)}
#dkz-hamburger.open span{background:#fa1e4e;box-shadow:0 0 8px rgba(250,30,78,.4)}
#dkz-hamburger.open span:nth-child(1){transform:rotate(45deg) translate(4.5px,4.5px)}
#dkz-hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
#dkz-hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(4.5px,-4.5px)}

/* Slide-in Panel — Premium Animation */
#dkz-nav-panel {
    position:fixed;top:0;left:-320px;width:300px;height:100vh;z-index:10000;
    background:rgba(10,10,14,.97);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
    border-right:1px solid rgba(250,30,78,.08);
    transition:left .45s cubic-bezier(.4,0,.15,1);
    overflow-y:auto;overflow-x:hidden;padding:56px 0 20px;
    font-family:'Inter',sans-serif;
    scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.04) transparent;
}
#dkz-nav-panel.open{left:0;box-shadow:12px 0 60px rgba(0,0,0,.6),0 0 40px rgba(250,30,78,.03)}

#dkz-nav-overlay {
    position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);
    opacity:0;pointer-events:none;transition:opacity .4s ease;
    backdrop-filter:blur(2px);
}
#dkz-nav-overlay.open{opacity:1;pointer-events:all}

/* Nav Content */
.dkz-nav-header{padding:0 16px 12px;font-size:12px;font-weight:800;letter-spacing:2px;
    font-family:'JetBrains Mono',monospace;color:rgba(250,30,78,.6);
    border-bottom:1px solid rgba(250,30,78,.06);margin-bottom:4px;
    display:flex;align-items:center;justify-content:space-between}
.dkz-nav-header b{color:rgba(250,30,78,.9)}
.dkz-nav-header .dkz-ampel-legend{font-size:7px;letter-spacing:1px;color:rgba(161,161,170,.3)}
.dkz-nav-group{padding:8px 0}
.dkz-nav-group-title{padding:4px 16px;font-size:8px;letter-spacing:2px;
    text-transform:uppercase;color:rgba(161,161,170,.35);display:flex;align-items:center;gap:6px}
.dkz-nav-group-title::after{content:'';flex:1;height:1px;background:rgba(51,51,56,.25)}

/* Nav Items — Animated entrance */
.dkz-nav-item{display:flex;align-items:center;gap:10px;padding:7px 16px;
    text-decoration:none;color:#a1a1aa;font-size:12px;font-weight:500;
    transition:all .25s cubic-bezier(.4,0,.2,1);border-left:2px solid transparent;position:relative;
    opacity:0;transform:translateX(-12px)}
.dkz-nav-item.slide-in{opacity:1;transform:translateX(0)}
.dkz-nav-item:hover{background:rgba(250,30,78,.05);color:#f6f6f7;border-left-color:rgba(250,30,78,.5);
    padding-left:20px}
.dkz-nav-item.active{background:rgba(250,30,78,.07);color:#f6f6f7;border-left-color:#fa1e4e}
.dkz-nav-icon{font-size:14px;width:20px;text-align:center;flex-shrink:0}
.dkz-nav-label{flex:1}
.dkz-nav-badge{font-size:7px;letter-spacing:1px;padding:1px 5px;border-radius:3px;
    font-family:'JetBrains Mono',monospace}
.dkz-nav-badge.review{background:rgba(255,184,0,.1);color:rgba(255,184,0,.7);border:1px solid rgba(255,184,0,.15)}
.dkz-nav-badge.live{background:rgba(0,255,136,.06);color:rgba(0,255,136,.5);border:1px solid rgba(0,255,136,.1)}

/* Inactive Panel — Transparent/Grau */
.dkz-nav-item.inactive{opacity:.45;filter:grayscale(70%);pointer-events:auto}
.dkz-nav-item.inactive:hover{opacity:.65;filter:grayscale(40%)}
.dkz-nav-item.inactive .dkz-nav-label{color:rgba(120,120,130,.6)}
.dkz-nav-item.inactive .dkz-nav-icon{opacity:.5}
.dkz-nav-badge.inactive-tag{background:rgba(100,100,110,.1);color:rgba(120,120,130,.5);border:1px solid rgba(100,100,110,.15);font-size:6px}

/* Activation Dialog */
#dkz-activate-dialog{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.9);
    z-index:10010;background:rgba(10,10,14,.98);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
    border:1px solid rgba(250,30,78,.2);border-radius:16px;padding:24px 32px;
    min-width:280px;text-align:center;font-family:'Inter',sans-serif;
    opacity:0;pointer-events:none;transition:all .3s cubic-bezier(.4,0,.2,1);
    box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(250,30,78,.05)}
#dkz-activate-dialog.show{opacity:1;pointer-events:all;transform:translate(-50%,-50%) scale(1)}
#dkz-activate-dialog .dialog-icon{font-size:32px;margin-bottom:8px}
#dkz-activate-dialog .dialog-title{font-size:14px;font-weight:700;color:#f6f6f7;margin-bottom:4px}
#dkz-activate-dialog .dialog-sub{font-size:10px;color:rgba(161,161,170,.6);margin-bottom:16px;
    font-family:'JetBrains Mono',monospace;letter-spacing:.5px}
#dkz-activate-dialog .dialog-btns{display:flex;gap:12px;justify-content:center}
#dkz-activate-dialog .btn-yes{background:rgba(0,255,136,.1);border:1px solid rgba(0,255,136,.3);
    color:#00ff88;padding:8px 24px;border-radius:8px;cursor:pointer;font-size:12px;
    font-weight:600;transition:all .2s;font-family:'Inter',sans-serif}
#dkz-activate-dialog .btn-yes:hover{background:rgba(0,255,136,.2);box-shadow:0 0 20px rgba(0,255,136,.15)}
#dkz-activate-dialog .btn-no{background:rgba(255,59,92,.06);border:1px solid rgba(255,59,92,.2);
    color:rgba(255,59,92,.7);padding:8px 24px;border-radius:8px;cursor:pointer;font-size:12px;
    font-weight:600;transition:all .2s;font-family:'Inter',sans-serif}
#dkz-activate-dialog .btn-no:hover{background:rgba(255,59,92,.12)}
#dkz-activate-overlay{position:fixed;inset:0;z-index:10009;background:rgba(0,0,0,.6);
    opacity:0;pointer-events:none;transition:opacity .3s}
#dkz-activate-overlay.show{opacity:1;pointer-events:all}

/* Ampel Health Dots */
.dkz-ampel-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;transition:all .3s}
.dkz-ampel-dot.green{background:#00ff88;box-shadow:0 0 6px rgba(0,255,136,.4)}
.dkz-ampel-dot.yellow{background:#ffb800;box-shadow:0 0 6px rgba(255,184,0,.4)}
.dkz-ampel-dot.red{background:#ff3b5c;box-shadow:0 0 6px rgba(255,59,92,.4)}
.dkz-ampel-dot.checking{background:#3b82f6;box-shadow:0 0 6px rgba(59,130,246,.4);animation:ampelPulse 1s ease-in-out infinite}
@keyframes ampelPulse{0%,100%{opacity:1}50%{opacity:.3}}

/* Notes Indicator */
.dkz-notes-dot{width:5px;height:5px;border-radius:50%;background:rgba(85,172,238,.5);flex-shrink:0}

/* Notes Panel */
.dkz-note{padding:6px 10px;margin:4px 16px;background:rgba(85,172,238,.04);
    border-left:2px solid rgba(85,172,238,.3);border-radius:0 4px 4px 0;font-size:10px;color:rgba(161,161,170,.7);line-height:1.5}
.dkz-note .dkz-note-author{font-size:7px;letter-spacing:1px;color:rgba(85,172,238,.4);text-transform:uppercase;font-family:'JetBrains Mono',monospace}
.dkz-note .dkz-note-time{font-size:7px;color:rgba(80,80,80,.4);font-family:'JetBrains Mono',monospace;margin-left:8px}
.dkz-note.system{border-left-color:rgba(250,30,78,.3);background:rgba(250,30,78,.03)}
.dkz-note.system .dkz-note-author{color:rgba(250,30,78,.4)}

/* Notes Input */
.dkz-note-input-wrap{padding:4px 16px 8px;display:none}
.dkz-note-input-wrap.open{display:block}
.dkz-note-input{width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(51,51,56,.4);
    color:#f6f6f7;padding:6px 8px;font-size:10px;font-family:'Inter',sans-serif;
    border-radius:6px;outline:none;resize:none;min-height:32px;transition:border .2s}
.dkz-note-input:focus{border-color:rgba(250,30,78,.3)}
.dkz-note-send{background:rgba(250,30,78,.08);border:1px solid rgba(250,30,78,.15);
    color:rgba(250,30,78,.6);padding:4px 12px;font-size:8px;letter-spacing:1px;
    border-radius:4px;cursor:pointer;margin-top:4px;font-family:'JetBrains Mono',monospace;
    transition:all .2s}
.dkz-note-send:hover{background:rgba(250,30,78,.15);color:#fa1e4e}

/* Copilot QuickAccess Button */
.dkz-copilot-quick{display:flex;align-items:center;gap:10px;padding:10px 16px;margin:8px 12px;
    background:linear-gradient(135deg,rgba(139,92,246,.08),rgba(59,130,246,.08));
    border:1px solid rgba(139,92,246,.2);border-radius:10px;cursor:pointer;
    text-decoration:none;transition:all .3s cubic-bezier(.4,0,.2,1);
    position:relative;overflow:hidden}
.dkz-copilot-quick::before{content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(139,92,246,.05),rgba(59,130,246,.05));
    opacity:0;transition:opacity .3s}
.dkz-copilot-quick:hover{border-color:rgba(139,92,246,.4);
    box-shadow:0 4px 20px rgba(139,92,246,.15);transform:translateY(-1px)}
.dkz-copilot-quick:hover::before{opacity:1}
.dkz-copilot-quick .cq-icon{font-size:18px;flex-shrink:0;
    animation:copilotPulse 3s ease-in-out infinite}
.dkz-copilot-quick .cq-text{display:flex;flex-direction:column;gap:1px}
.dkz-copilot-quick .cq-title{font-size:11px;font-weight:600;color:#e8e8ec}
.dkz-copilot-quick .cq-sub{font-size:7px;letter-spacing:1px;color:rgba(139,92,246,.6);
    font-family:'JetBrains Mono',monospace;text-transform:uppercase}
@keyframes copilotPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
`;
    document.head.appendChild(s);
}

// ═══ PANEL MANAGER (Activation States) ═══
const DkzPanelManager = {
    KEY: 'dkz-panel-states',

    _load() {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
        catch { return {}; }
    },

    _save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    // Panel ist aktiv? Wenn noch kein State → defaultActive aus Registry
    isActive(appId, defaultActive = true) {
        const data = this._load();
        if (data[appId] !== undefined) return data[appId];
        return defaultActive;
    },

    // Panel aktivieren
    activate(appId) {
        const data = this._load();
        data[appId] = true;
        this._save(data);
    },

    // Panel deaktivieren
    deactivate(appId) {
        const data = this._load();
        data[appId] = false;
        this._save(data);
    },

    // Toggle
    toggle(appId, defaultActive) {
        if (this.isActive(appId, defaultActive)) this.deactivate(appId);
        else this.activate(appId);
    },

    // Alle aktiven Panels
    getActiveCount() {
        let count = 0;
        GROUPS.forEach(g => g.items.forEach(i => { if (this.isActive(i.appId, i.defaultActive)) count++; }));
        return count;
    },

    // Alle Panel-IDs auflisten
    getAllPanels() {
        const panels = [];
        GROUPS.forEach(g => g.items.forEach(i => panels.push({ appId: i.appId, name: i.name, active: this.isActive(i.appId, i.defaultActive) })));
        return panels;
    }
};

// ═══ NOTES SYSTEM ═══
const DkzNotes = {
    KEY: 'dkz-notes',
    
    _load() {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
        catch { return {}; }
    },
    
    _save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },
    
    add(elementId, text, author = 'user') {
        const data = this._load();
        if (!data[elementId]) data[elementId] = [];
        data[elementId].push({
            text, author,
            time: new Date().toISOString(),
            id: 'n-' + Date.now()
        });
        this._save(data);
        return data[elementId];
    },
    
    getAll(elementId) {
        const data = this._load();
        return data[elementId] || [];
    },
    
    getCount(elementId) {
        return this.getAll(elementId).length;
    },
    
    remove(elementId, noteId) {
        const data = this._load();
        if (data[elementId]) {
            data[elementId] = data[elementId].filter(n => n.id !== noteId);
            this._save(data);
        }
    },
    
    getAllModulesWithNotes() {
        const data = this._load();
        return Object.keys(data).filter(k => data[k].length > 0);
    }
};

// ═══ REVIEW STATUS ═══
const DkzReview = {
    KEY: 'dkz-review-status',
    
    _load() {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
        catch { return {}; }
    },
    
    _save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },
    
    setStatus(moduleId, status) {
        // status: 'active' | 'review' | 'draft' | 'archived'
        const data = this._load();
        data[moduleId] = { status, updated: new Date().toISOString() };
        this._save(data);
    },
    
    getStatus(moduleId) {
        const data = this._load();
        return data[moduleId]?.status || 'active';
    },
    
    getNeedsReview() {
        const data = this._load();
        return Object.entries(data).filter(([k,v]) => v.status === 'review').map(([k]) => k);
    }
};

// ═══ BUILD NAVBAR ═══
function buildNavbar() {
    const currentModule = getCurrentModule();
    
    // Hamburger Button
    const burger = document.createElement('button');
    burger.id = 'dkz-hamburger';
    burger.title = 'DkZ Navigation';
    burger.innerHTML = '<span></span><span></span><span></span>';
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'dkz-nav-overlay';
    
    // Panel
    const panel = document.createElement('div');
    panel.id = 'dkz-nav-panel';
    
    // Panel Header
    let html = '<div class="dkz-nav-header">DEVKiTZ<b>\u2122</b><span class="dkz-ampel-legend">\u26ab AMPEL</span></div>';
    
    // Build groups
    GROUPS.forEach(group => {
        html += '<div class="dkz-nav-group">';
        html += `<div class="dkz-nav-group-title">${group.icon} ${group.label}</div>`;
        
        group.items.forEach(item => {
            const isCurrent = currentModule === item.path;
            const href = getHref(item);
            const reviewStatus = DkzReview.getStatus(item.path);
            const noteCount = DkzNotes.getCount(item.path);
            const panelActive = DkzPanelManager.isActive(item.appId, item.defaultActive);
            
            let badge = '';
            if (!panelActive) {
                badge = '<span class="dkz-nav-badge inactive-tag">INAKTIV</span>';
            } else if (reviewStatus === 'review') {
                badge = '<span class="dkz-nav-badge review">REVIEW</span>';
            }
            
            let notesDot = '';
            if (noteCount > 0) {
                notesDot = '<span class="dkz-notes-dot" title="' + noteCount + ' Notiz(en)"></span>';
            }
            
            const inactiveClass = panelActive ? '' : ' inactive';
            
            html += `<a class="dkz-nav-item${isCurrent ? ' active' : ''}${inactiveClass}" href="${panelActive ? href : '#'}" data-module="${item.path}" data-app-id="${item.appId}" data-panel-active="${panelActive}" data-default-active="${item.defaultActive}">
                <span class="dkz-nav-icon">${item.icon}</span>
                <span class="dkz-nav-label">${item.name}</span>
                ${notesDot}${badge}
                <span class="dkz-ampel-dot${panelActive ? ' checking' : ' yellow'}" data-ampel="${item.path}" title="${panelActive ? 'Prüfe...' : 'Inaktiv'}"></span>
            </a>`;
            
            // Show notes if any
            if (noteCount > 0) {
                DkzNotes.getAll(item.path).slice(-3).forEach(note => {
                    const cls = note.author === 'system' ? ' system' : '';
                    const t = new Date(note.time).toLocaleDateString('de-DE', {day:'2-digit',month:'2-digit'});
                    html += `<div class="dkz-note${cls}"><span class="dkz-note-author">${note.author}</span><span class="dkz-note-time">${t}</span><br>${note.text}</div>`;
                });
            }
        });
        
        html += '</div>';
    });
    
    // Notes add section (for current module)
    if (currentModule) {
        html += `<div class="dkz-nav-group" style="border-top:1px solid rgba(51,51,56,.3);padding-top:12px">
            <div class="dkz-nav-group-title">📌 Notiz hinzufügen</div>
            <div class="dkz-note-input-wrap open">
                <textarea class="dkz-note-input" id="dkzNoteInput" placeholder="Notiz für ${currentModule}..." rows="2"></textarea>
                <button class="dkz-note-send" onclick="DkzNotes.add('${currentModule}', document.getElementById('dkzNoteInput').value); document.getElementById('dkzNoteInput').value=''; location.reload();">↵ Senden</button>
            </div>
        </div>`;
    }
    
    // Copilot QuickAccess Button
    html += `<div class="dkz-nav-group" style="border-top:1px solid rgba(51,51,56,.3);padding-top:8px">
        <a class="dkz-copilot-quick" href="#" onclick="event.preventDefault(); if(window.DkzCopilot) DkzCopilot.toggle(); else alert('Copilot wird geladen...');" title="DkZ Copilot öffnen">
            <span class="cq-icon">🧠</span>
            <span class="cq-text">
                <span class="cq-title">DkZ Copilot™</span>
                <span class="cq-sub">KI-Assistent + NotebookLM + MCP</span>
            </span>
        </a>
        <!-- Inline Quick-Chat -->
        <div id="dkz-nav-quickchat" style="margin:6px 0 0 0;padding:8px;background:rgba(10,10,15,0.6);border-radius:10px;border:1px solid rgba(99,102,241,0.12)">
            <div id="dkz-nav-qc-msgs" style="max-height:90px;overflow-y:auto;margin-bottom:6px;font-size:.68rem;color:#a1a1aa;font-family:'Inter',sans-serif;line-height:1.4">
                <div style="color:#52525b;font-size:.6rem;text-align:center">💬 Quick-Chat · Frag mich was...</div>
            </div>
            <div style="display:flex;gap:4px">
                <input id="dkz-nav-qc-input" type="text" placeholder="Schnellfrage..." style="flex:1;background:#0e0e10;border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:5px 8px;color:#f0f0f2;font-size:.7rem;outline:none;font-family:inherit" onkeydown="if(event.key==='Enter')DkzNavbar._qcSend()">
                <button onclick="DkzNavbar._qcSend()" style="background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.65rem;font-weight:700">📨</button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                <span id="dkz-nav-qc-gw" style="font-size:.55rem;color:${window.DkzCopilot?.gatewayOnline ? '#00ff88' : '#52525b'}">${window.DkzCopilot?.gatewayOnline ? '🟢 Gateway' : '⚫ Gateway offline'}</span>
                <a href="#" onclick="event.preventDefault(); if(window.DkzCopilot) DkzCopilot.toggle();" style="font-size:.55rem;color:#818cf8;text-decoration:none">Vollbild ↗</a>
            </div>
        </div>
    </div>`;

    // Footer mit Panel-Statistik
    const activeCount = DkzPanelManager.getActiveCount();
    const totalCount = GROUPS.reduce((s, g) => s + g.items.length, 0);
    html += `<div style="padding:16px;font-size:7px;letter-spacing:1px;color:rgba(80,80,80,.3);font-family:'JetBrains Mono',monospace;text-align:center;border-top:1px solid rgba(51,51,56,.2);margin-top:8px">
        DEVKiTZ\u2122 \u00b7 v0.04 \u00b7 ${activeCount}/${totalCount} aktiv \u00b7 ${new Date().toLocaleDateString('de-DE')}
    </div>`;
    
    panel.innerHTML = html;
    
    // Keyboard: Escape closes (yield to DkzConsole if open)
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            // Wenn ESC-Console offen ist, nicht eingreifen
            var escConsole = document.getElementById('dkz-esc-console');
            if (escConsole && escConsole.classList.contains('open')) return;
            panel.classList.remove('open');
            overlay.classList.remove('open');
            burger.classList.remove('open');
            panel.querySelectorAll('.dkz-nav-item').forEach(i => i.classList.remove('slide-in'));
        }
    });
    
    // Activation Dialog
    const activateOverlay = document.createElement('div');
    activateOverlay.id = 'dkz-activate-overlay';
    const activateDialog = document.createElement('div');
    activateDialog.id = 'dkz-activate-dialog';
    activateDialog.innerHTML = `
        <div class="dialog-icon"></div>
        <div class="dialog-title"></div>
        <div class="dialog-sub"></div>
        <div class="dialog-btns">
            <button class="btn-yes">\u2714 Ja, aktivieren</button>
            <button class="btn-no">\u2718 Nein</button>
        </div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    document.body.appendChild(burger);
    document.body.appendChild(activateOverlay);
    document.body.appendChild(activateDialog);

    // ═══ ACTIVATION DIALOG LOGIC ═══
    let pendingActivation = null;

    function showActivateDialog(item) {
        pendingActivation = item;
        activateDialog.querySelector('.dialog-icon').textContent = item.icon || '📦';
        activateDialog.querySelector('.dialog-title').textContent = item.name + ' aktivieren?';
        activateDialog.querySelector('.dialog-sub').textContent = item.appId;
        activateOverlay.classList.add('show');
        activateDialog.classList.add('show');
    }

    function hideActivateDialog() {
        activateOverlay.classList.remove('show');
        activateDialog.classList.remove('show');
        pendingActivation = null;
    }

    activateDialog.querySelector('.btn-yes').addEventListener('click', () => {
        if (pendingActivation) {
            DkzPanelManager.activate(pendingActivation.appId);
            hideActivateDialog();
            // Rebuild navbar to reflect change
            panel.classList.remove('open');
            overlay.classList.remove('open');
            burger.classList.remove('open');
            document.getElementById('dkz-nav-panel').remove();
            document.getElementById('dkz-nav-overlay').remove();
            document.getElementById('dkz-hamburger').remove();
            document.getElementById('dkz-activate-overlay').remove();
            document.getElementById('dkz-activate-dialog').remove();
            buildNavbar();
        }
    });

    activateDialog.querySelector('.btn-no').addEventListener('click', hideActivateDialog);
    activateOverlay.addEventListener('click', hideActivateDialog);

    // Handle clicks on inactive panels
    panel.addEventListener('click', (e) => {
        const navItem = e.target.closest('.dkz-nav-item');
        if (!navItem) return;
        if (navItem.dataset.panelActive === 'false') {
            e.preventDefault();
            e.stopPropagation();
            // Find the item data
            const appId = navItem.dataset.appId;
            let foundItem = null;
            GROUPS.forEach(g => g.items.forEach(i => { if (i.appId === appId) foundItem = i; }));
            if (foundItem) showActivateDialog(foundItem);
        }
    });

    // ═══ STAGGERED SLIDE-IN ANIMATION ═══
    function animateItems() {
        const items = panel.querySelectorAll('.dkz-nav-item');
        items.forEach((item, i) => {
            setTimeout(() => item.classList.add('slide-in'), 50 + i * 30);
        });
    }

    // Toggle with animation
    burger.addEventListener('click', () => {
        const isOpen = panel.classList.contains('open');
        panel.classList.toggle('open');
        overlay.classList.toggle('open');
        burger.classList.toggle('open');
        if (!isOpen) animateItems();
        else panel.querySelectorAll('.dkz-nav-item').forEach(i => i.classList.remove('slide-in'));
    });
    overlay.addEventListener('click', () => {
        panel.classList.remove('open');
        overlay.classList.remove('open');
        burger.classList.remove('open');
        panel.querySelectorAll('.dkz-nav-item').forEach(i => i.classList.remove('slide-in'));
    });

    // ═══ AMPEL HEALTH CHECK ═══
    // Tote Links grau machen — Link disabled + visuell ausgegraut
    function _markDead(dot, navItem) {
        dot.className = 'dkz-ampel-dot red';
        dot.title = 'Nicht erreichbar';
        if (navItem) {
            navItem.style.opacity = '0.35';
            navItem.style.pointerEvents = 'none';
            navItem.style.filter = 'grayscale(80%)';
            navItem.title = 'Nicht erreichbar — Datei fehlt';
        }
    }

    function checkModuleHealth() {
        const dots = panel.querySelectorAll('.dkz-ampel-dot[data-ampel]');
        dots.forEach(dot => {
            const mod = dot.dataset.ampel;
            const link = dot.closest('a');
            if (!link) { dot.className = 'dkz-ampel-dot yellow'; return; }
            const href = link.getAttribute('href');
            if (!href || href === '#') { dot.className = 'dkz-ampel-dot yellow'; return; }
            // For file:// protocol, do a simulated check based on known modules
            if (window.location.protocol === 'file:') {
                const xhr = new XMLHttpRequest();
                xhr.open('HEAD', href, true);
                xhr.timeout = 2000;
                xhr.onload = () => {
                    dot.className = 'dkz-ampel-dot green';
                    dot.title = 'Einwandfrei';
                };
                xhr.onerror = () => { _markDead(dot, link); };
                xhr.ontimeout = () => {
                    dot.className = 'dkz-ampel-dot yellow';
                    dot.title = 'Timeout';
                };
                try { xhr.send(); } catch(e) {
                    dot.className = 'dkz-ampel-dot yellow';
                    dot.title = 'Unbekannt';
                }
            } else {
                fetch(href, { method: 'HEAD', mode: 'no-cors' })
                    .then(() => {
                        dot.className = 'dkz-ampel-dot green';
                        dot.title = 'Einwandfrei';
                    })
                    .catch(() => { _markDead(dot, link); });
            }
        });
    }
    // Run health check after short delay
    setTimeout(checkModuleHealth, 500);
}

// ═══ INIT ═══
function init() {
    if (document.getElementById('dkz-hamburger')) return; // already injected
    injectStyles();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(buildNavbar, 100));
    } else {
        setTimeout(buildNavbar, 100);
    }
}

init();

// ═══ QUICK-CHAT ═══
async function _qcSend() {
    const input = document.getElementById('dkz-nav-qc-input');
    const msgs = document.getElementById('dkz-nav-qc-msgs');
    if (!input || !msgs || !input.value.trim()) return;
    const q = input.value.trim();
    input.value = '';

    // User-Nachricht anzeigen
    msgs.innerHTML += `<div style="text-align:right;margin-bottom:4px"><span style="background:rgba(250,30,78,0.1);padding:3px 8px;border-radius:6px;font-size:.62rem;color:#f0f0f2">${_esc(q)}</span></div>`;
    msgs.scrollTop = msgs.scrollHeight;

    // Lade-Indikator
    const loadId = 'qc-load-' + Date.now();
    msgs.innerHTML += `<div id="${loadId}" style="font-size:.6rem;color:#52525b;text-align:center">⏳ Denke...</div>`;

    // Copilot aufrufen
    if (!window.DkzCopilot) {
        document.getElementById(loadId)?.remove();
        msgs.innerHTML += `<div style="font-size:.6rem;color:#fa1e4e">❌ Copilot nicht geladen</div>`;
        return;
    }

    const result = await window.DkzCopilot.chat(q, { name: 'Quick-Chat' });
    document.getElementById(loadId)?.remove();

    // Antwort anzeigen (max 200 Zeichen im Quick-Chat)
    const shortText = (result.text || '').substring(0, 200);
    const display = result.ok
        ? shortText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        : `❌ ${_esc(result.text || 'Fehler')}`;

    msgs.innerHTML += `<div style="background:rgba(129,140,248,0.06);border-left:2px solid #818cf8;padding:4px 8px;border-radius:0 6px 6px 0;margin-bottom:4px;font-size:.62rem;color:#a1a1aa;line-height:1.3">${display}${(result.text || '').length > 200 ? '<br><span style="color:#818cf8;font-size:.55rem">... → Vollbild für mehr</span>' : ''}</div>`;
    msgs.scrollTop = msgs.scrollHeight;

    // Max 3 Antworten im Quick-Chat (Cleanup alter Nachrichten)
    const allMsgs = msgs.querySelectorAll('div');
    if (allMsgs.length > 7) { // 1 placeholder + 3 Q/A pairs
        allMsgs[0]?.remove();
        allMsgs[1]?.remove();
    }
}

function _esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Expose APIs globally
window.DkzNotes = DkzNotes;
window.DkzReview = DkzReview;
window.DkzPanelManager = DkzPanelManager;
window.DkzNavbar = { _qcSend };

})();
