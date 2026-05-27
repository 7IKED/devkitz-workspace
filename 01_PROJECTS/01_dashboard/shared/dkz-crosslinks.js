/**
 * DkZ CrossLinks v2 — Smart Cross-Module Navigation
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:crosslinks] [CAT:shared] [LANG:js]
 * @version v2.0.0
 *
 * Features v2:
 * - Tote Links → grau + disabled (link-check)
 * - Nächster Schritt → Neon-Pulsing
 * - KERN²-Badge → weiß leuchtend
 */
const DkzCrossLinks = (() => {
    'use strict';
    const VERSION = 'v2.0.0';

    // KERN²-Komponenten die das Ökosystem zusammenhalten
    const KERN2 = ['wissen-hub', 'research-archive', 'system-check', 'loop-dashboard', 'ecosystem-analyzer', 'wiki-viewer'];

    // ═══ Module Relationship Map ═══
    const MODULES = {
        // ─── Code & Dev Tools ───
        'json-formatter': { icon: '📋', label: 'JSON Tools', related: ['api-tester', 'code-differ', 'converter', 'snippet-manager'] },
        'api-tester': { icon: '🚀', label: 'API Tester', related: ['json-formatter', 'auth-center', 'ip-tools'] },
        'code-differ': { icon: '📊', label: 'Code Differ', related: ['json-formatter', 'snippet-manager', 'changelog-builder'] },
        'snippet-manager': { icon: '📦', label: 'Snippets', related: ['code-differ', 'json-formatter', 'prompter'] },
        'regex-tester': { icon: '🔍', label: 'Regex', related: ['json-formatter', 'snippet-manager', 'converter'] },
        'css-generator': { icon: '🎨', label: 'CSS Generator', related: ['color-picker', 'favicon-gen', 'html_viewer'] },
        'html_viewer': { icon: '🌐', label: 'HTML Viewer', related: ['css-generator', 'converter', 'markdown_converter'] },

        // ─── Text & Content ───
        'markdown-gen': { icon: '📝', label: 'Markdown Gen', related: ['markdown_converter', 'blog-designer', 'changelog-builder', 'noter'] },
        'markdown_converter': { icon: '🔄', label: 'MD Converter', related: ['markdown-gen', 'converter', 'html_viewer'] },
        'lorem-generator': { icon: '📝', label: 'Lorem', related: ['markdown-gen', 'blog-designer', 'text_summary'] },
        'text_summary': { icon: '📊', label: 'Zusammenfassung', related: ['analyser', 'markdown-gen', 'seo-toolkit'] },
        'blog-designer': { icon: '📝', label: 'Blog Designer', related: ['markdown-gen', 'seo-toolkit', 'lorem-generator'] },
        'seo-toolkit': { icon: '🔍', label: 'SEO Toolkit', related: ['meta-tag-gen', 'blog-designer', 'analyser'] },
        'meta-tag-gen': { icon: '🏷️', label: 'Meta Tags', related: ['seo-toolkit', 'qr-generator', 'favicon-gen'] },
        'changelog-builder': { icon: '📋', label: 'Changelog', related: ['markdown-gen', 'snippet-manager', 'code-differ'] },

        // ─── KI & Prompts ───
        'prompt-generator': { icon: '🎯', label: 'Prompt Gen', related: ['prompter', 'prompt-viewer', 'ai_chat', 'iceberg'] },
        'prompter': { icon: '💬', label: 'Prompter', related: ['prompt-generator', 'prompt-viewer', 'ai_chat'] },
        'prompt-viewer': { icon: '👁️', label: 'Prompt Viewer', related: ['prompt-generator', 'prompter', 'playbook-archiv'] },
        'ai_chat': { icon: '🤖', label: 'AI Chat', related: ['prompt-generator', 'llm-cost-board', 'iceberg'] },
        'ki-lernplattform': { icon: '🎓', label: 'KI Lernen', related: ['prompt-generator', 'playbook-archiv', 'iceberg'] },
        'iceberg': { icon: '🧊', label: 'Iceberg', related: ['prompt-generator', 'ai_chat', 'ki-lernplattform'] },
        'llm-cost-board': { icon: '💰', label: 'LLM Kosten', related: ['ai_chat', 'prompt-generator', 'iceberg'] },

        // ─── Utilities ───
        'color-picker': { icon: '🎨', label: 'Farben', related: ['css-generator', 'favicon-gen', 'qr-generator'] },
        'password-gen': { icon: '🔐', label: 'Passwort', related: ['hash-generator', 'base64-tools', 'auth-center'] },
        'hash-generator': { icon: '🔒', label: 'Hash Gen', related: ['password-gen', 'base64-tools', 'ip-tools'] },
        'base64-tools': { icon: '🔐', label: 'Base64', related: ['hash-generator', 'converter', 'password-gen'] },
        'unit-converter': { icon: '🔄', label: 'Einheiten', related: ['converter', 'ip-tools', 'timer-tools'] },
        'converter': { icon: '🔄', label: 'Converter', related: ['unit-converter', 'json-formatter', 'markdown_converter'] },
        'timer-tools': { icon: '⏱️', label: 'Timer', related: ['cron-builder', 'unit-converter'] },
        'cron-builder': { icon: '⏰', label: 'Cron', related: ['timer-tools', 'loop-dashboard'] },
        'ip-tools': { icon: '🌐', label: 'IP Tools', related: ['api-tester', 'hash-generator', 'domain-control'] },
        'emoji-picker': { icon: '😊', label: 'Emojis', related: ['ascii-tool', 'lorem-generator'] },
        'ascii-tool': { icon: '🔤', label: 'ASCII', related: ['emoji-picker', 'converter', 'base64-tools'] },
        'qr-generator': { icon: '📱', label: 'QR Code', related: ['link-generator', 'meta-tag-gen', 'favicon-gen'] },
        'favicon-gen': { icon: '🖼️', label: 'Favicon', related: ['color-picker', 'qr-generator', 'css-generator'] },
        'link-generator': { icon: '🔗', label: 'Link Gen', related: ['qr-generator', 'meta-tag-gen', 'seo-toolkit'] },

        // ─── Productivity ───
        'clipboard': { icon: '📋', label: 'Clipboard', related: ['noter', 'devnotes', 'tasker'] },
        'noter': { icon: '📝', label: 'Noter', related: ['clipboard', 'devnotes', 'markdown-gen'] },
        'devnotes': { icon: '📓', label: 'DevNotes', related: ['noter', 'clipboard', 'changelog-builder'] },
        'tasker': { icon: '✅', label: 'Tasker', related: ['devnotes', 'noter', 'loop-dashboard'] },
        'analyser': { icon: '📊', label: 'Analyser', related: ['text_summary', 'seo-toolkit', 'converter'] },
        'research': { icon: '🔍', label: 'Research', related: ['split-browser', 'analyser', 'seo-toolkit'] },
        'split-browser': { icon: '🖥️', label: 'Split Browser', related: ['research', 'html_viewer'] },

        // ─── Media & Special ───
        'speech_to_text': { icon: '🎤', label: 'Speech→Text', related: ['text_to_speech', 'text_summary', 'noter'] },
        'text_to_speech': { icon: '🔊', label: 'Text→Speech', related: ['speech_to_text', 'lorem-generator'] },
        'suno-ai': { icon: '🎵', label: 'Suno AI', related: ['prompt-generator', 'ai_chat'] },
        'ttl-visualizer': { icon: '🕸️', label: 'TTL Visualizer', related: ['ip-tools', 'api-tester'] },
        'gallery': { icon: '🎨', label: 'Gallery', related: ['css-generator', 'color-picker', 'favicon-gen'] },
        'playbook-archiv': { icon: '📖', label: 'Playbook', related: ['ki-lernplattform', 'prompt-generator', 'iceberg'] },
        'project-registry': { icon: '🗂️', label: 'Projekte', related: ['tasker', 'devnotes', 'doc-engine'] },
        'doc-engine': { icon: '📚', label: 'Doc Engine', related: ['markdown-gen', 'project-registry', 'blog-designer'] },
        'domain-control': { icon: '🌍', label: 'Domains', related: ['ip-tools', 'seo-toolkit', 'link-generator'] },
        'ruleboard': { icon: '📜', label: 'Regelwerk', related: ['playbook-archiv', 'doc-engine', 'project-registry'] },

        // ─── Gaming & Misc ───
        'sportwetten': { icon: '⚽', label: 'Sportwetten', related: ['rating-system', 'analyser'] },
        'cs2-config': { icon: '🎮', label: 'CS2 Config', related: ['sportwetten', 'rating-system'] },
        'rating-system': { icon: '⭐', label: 'Rating', related: ['analyser', 'sportwetten', 'social-dashboard'] },
        'social-dashboard': { icon: '📱', label: 'Social', related: ['rating-system', 'seo-toolkit', 'blog-designer'] },
        'system-check': { icon: '🔍', label: 'System Check', related: ['iceberg', 'loop-dashboard', 'project-registry', 'ecosystem-analyzer'] },
        'loop-dashboard': { icon: '🔄', label: 'Loops', related: ['cron-builder', 'prompt-generator', 'system-check', 'workflow-builder'] },

        // ─── Builder Suite ───
        'action-builder': { icon: '🧩', label: 'Action Builder', related: ['skill-builder', 'workflow-builder', 'agent-builder'] },
        'skill-builder': { icon: '🎯', label: 'Skill Builder', related: ['action-builder', 'workflow-builder', 'agent-builder'] },
        'workflow-builder': { icon: '🔀', label: 'Workflow Builder', related: ['action-builder', 'skill-builder', 'agent-builder', 'loop-dashboard'] },
        'agent-builder': { icon: '🤖', label: 'Agent Builder', related: ['skill-builder', 'workflow-builder', 'team-builder', 'app-builder'] },
        'team-builder': { icon: '👥', label: 'Team Builder', related: ['agent-builder', 'botnet-admin', 'workflow-builder'] },
        'app-builder': { icon: '📱', label: 'App Builder', related: ['agent-builder', 'settings', 'ai_chat'] },

        // ─── System & Admin ───
        'botnet-admin': { icon: '🤝', label: 'BotNet Admin', related: ['team-builder', 'agent-builder', 'ecosystem-analyzer'] },
        'ecosystem-analyzer': { icon: '🏗️', label: 'Ecosystem', related: ['system-check', 'botnet-admin', 'project-registry', 'ruleboard'] },
        'icon-creator': { icon: '🎨', label: 'Icon Creator', related: ['favicon-gen', 'color-picker', 'gallery'] },
        'settings': { icon: '⚙️', label: 'Settings', related: ['app-builder', 'llm-cost-board', 'source-registry'] },
        'source-registry': { icon: '📡', label: 'Quellen', related: ['settings', 'api-tester', 'ecosystem-analyzer'] },

        // ─── Notes & Voice ───
        'notes-manager': { icon: '📝', label: 'Notizen', related: ['noter', 'speech_to_text', 'tasker', 'devnotes'] },
        'workflow-viewer': { icon: '🔄', label: 'Workflow Viewer', related: ['workflow-builder', 'loop-dashboard', 'agent-builder', 'system-check'] },
        'wiki-viewer': { icon: '📚', label: 'Wiki Viewer', related: ['doc-engine', 'playbook-archiv', 'ruleboard', 'notes-manager', 'wissen-hub', 'research-archive'] },

        // ─── Wissen & Archive ───
        'wissen-hub': { icon: '📝', label: 'WissenHub', related: ['wiki-viewer', 'research-archive', 'iceberg', 'playbook-archiv', 'doc-engine'] },
        'research-archive': { icon: '🔬', label: 'Research Archiv', related: ['wissen-hub', 'wiki-viewer', 'iceberg', 'playbook-archiv'] },

        // ─── Cloud & Panels (v2.1) ───
        'whisper-tts': { icon: '🎧', label: 'Whisper TTS', related: ['speech_to_text', 'text_to_speech', 'ai_chat', 'nanobot-center'] },
        'cloud-control': { icon: '☁️', label: 'Cloud Control', related: ['claudia-cloud', 'domain-control', 'settings', 'ip-tools'] },
        'claudia-cloud': { icon: '🏰', label: 'CL0UDiA™', related: ['cloud-control', 'wissen-hub', 'research-archive', 'doc-engine'] },
        'nanobot-center': { icon: '🤖', label: 'NanoBot Center', related: ['ai_chat', 'coderabbit-panel', 'whisper-tts', 'loop-dashboard', 'agent-builder'] },
        'coderabbit-panel': { icon: '🐰', label: 'CodeRabbit', related: ['nanobot-center', 'system-check', 'ecosystem-analyzer', 'ruleboard'] },
        'qr-launcher': { icon: '📱', label: 'QR Launcher', related: ['qr-generator', 'settings', 'nanobot-center'] },
    };

    // ═══ Detect Current Module ═══
    function _detectModule() {
        const path = window.location.pathname;
        const match = path.match(/modules\/([^/]+)\//);
        return match ? match[1] : null;
    }

    // ═══ Build relative path ═══
    function _modulePath(from, to) {
        // Both in modules/ → simple relative path
        return `../${to}/index.html`;
    }

    // ═══ Check if module exists ═══
    async function _checkLink(moduleName) {
        try {
            const resp = await fetch(`../${moduleName}/index.html`, { method: 'HEAD', mode: 'same-origin' });
            return resp.ok;
        } catch { return false; }
    }

    // ═══ Render Link Bar ═══
    async function _render() {
        const current = _detectModule();
        if (!current || !MODULES[current]) return;

        const mod = MODULES[current];
        const related = mod.related.filter(r => MODULES[r]);
        if (!related.length) return;

        const bar = document.createElement('div');
        bar.className = 'dkz-crosslinks';
        bar.innerHTML = `
            <span class="dkz-cl-label">🔗 Verwandte Module:</span>
            ${related.map((r, i) => {
            const m = MODULES[r];
            const isKern = KERN2.includes(r);
            const isNext = i === 0;
            const cls = ['dkz-cl-link'];
            if (isKern) cls.push('dkz-cl-kern');
            if (isNext) cls.push('dkz-cl-next');
            return `<a href="${_modulePath(current, r)}" class="${cls.join(' ')}" data-module="${r}" title="${m.label}">${m.icon} ${m.label}${isKern ? ' ⬡' : ''}</a>`;
        }).join('')}
        `;

        // Inject after header
        const header = document.querySelector('.header, .dkz-header');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(bar, header.nextSibling);
        }

        _injectStyles();

        // Async: Check dead links and grey them out
        bar.querySelectorAll('.dkz-cl-link').forEach(async (link) => {
            const modName = link.getAttribute('data-module');
            if (modName) {
                const exists = await _checkLink(modName);
                if (!exists) {
                    link.classList.add('dkz-cl-dead');
                    link.title = `${link.title} (nicht erreichbar)`;
                    link.addEventListener('click', e => e.preventDefault());
                }
            }
        });
    }

    // ═══ Styles ═══
    function _injectStyles() {
        if (document.getElementById('dkz-crosslinks-css')) return;
        const css = document.createElement('style');
        css.id = 'dkz-crosslinks-css';
        css.textContent = `
.dkz-crosslinks {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 28px; background: rgba(14,14,22,.5);
    border-bottom: 1px solid rgba(255,255,255,.04);
    overflow-x: auto; flex-wrap: nowrap;
    -ms-overflow-style: none; scrollbar-width: none;
}
.dkz-crosslinks::-webkit-scrollbar { display: none; }
.dkz-cl-label {
    font-size: 9px; color: rgba(255,255,255,.3);
    font-family: var(--mono, 'JetBrains Mono', monospace);
    white-space: nowrap; flex-shrink: 0;
}
.dkz-cl-link {
    padding: 3px 10px; border-radius: 20px;
    background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
    color: rgba(255,255,255,.55); font-size: 10px;
    text-decoration: none; white-space: nowrap;
    transition: all .3s ease; flex-shrink: 0;
    font-family: var(--font, 'Inter', sans-serif);
}
.dkz-cl-link:hover {
    background: rgba(250,30,78,.08); border-color: rgba(250,30,78,.25);
    color: #fa1e4e; transform: translateY(-1px);
}
/* ═══ TOTE LINKS → Grau + Disabled ═══ */
.dkz-cl-dead {
    opacity: 0.3; color: rgba(138,138,154,.4) !important;
    border-color: rgba(138,138,154,.1) !important;
    pointer-events: none; cursor: not-allowed;
    text-decoration: line-through;
}
/* ═══ KERN² Badge → Weiß leuchtend ═══ */
.dkz-cl-kern {
    border-color: rgba(255,255,255,.15);
    color: rgba(255,255,255,.8);
    background: rgba(255,255,255,.05);
    font-weight: 500;
    text-shadow: 0 0 8px rgba(255,255,255,.2);
}
.dkz-cl-kern:hover {
    background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.3);
    color: #fff; text-shadow: 0 0 12px rgba(255,255,255,.4);
}
/* ═══ Nächster Schritt → Neon-Pulsing ═══ */
.dkz-cl-next {
    border-color: rgba(0,255,136,.3);
    color: rgba(0,255,136,.8);
    animation: dkz-neon-pulse 2s ease-in-out infinite;
}
@keyframes dkz-neon-pulse {
    0%, 100% { box-shadow: 0 0 4px rgba(0,255,136,.2); border-color: rgba(0,255,136,.2); }
    50% { box-shadow: 0 0 12px rgba(0,255,136,.5), 0 0 20px rgba(0,255,136,.15); border-color: rgba(0,255,136,.5); }
}
.dkz-cl-next:hover {
    background: rgba(0,255,136,.1); color: #00ff88;
    box-shadow: 0 0 16px rgba(0,255,136,.4);
}
@media (max-width: 768px) {
    .dkz-crosslinks { padding: 6px 14px; gap: 4px; }
    .dkz-cl-label { display: none; }
    .dkz-cl-link { font-size: 9px; padding: 2px 8px; }
}
`;
        document.head.appendChild(css);
    }

    // ═══ Init ═══
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _render);
    } else {
        _render();
    }

    return { MODULES, VERSION };
})();

if (typeof module !== 'undefined') module.exports = DkzCrossLinks;
