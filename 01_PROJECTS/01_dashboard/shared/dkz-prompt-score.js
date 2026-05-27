/**
 * DkZ Prompt Auto-Score Widget — Live-Bewertung in Prompt-Modulen
 * @DKZ:TAG [SHARED:prompt-score] [CAT:widget] [LANG:js]
 * @DKZ:RULES R95 Prompt-Archivpflicht, R96 Playbook-Bindung, GM-07 Score-Tracking
 * @version v0.01.1_01
 * 
 * Injizierbares Widget für alle Prompt-Module:
 * - Live-Score Anzeige beim Tippen (Debounced)
 * - James-Bewertung + Playbook-Kontext Badge
 * - Automatische Iceberg-Versionierung
 * - Builder-Chain Kategorie-Tags
 * - Compaction-Status Anzeige
 * 
 * Einbinden: <script src="../../shared/dkz-prompt-score.js"></script>
 * Auto-Init: Sucht textarea mit [data-prompt-score] oder id "prompt-input"
 */
const DkzPromptScore = (() => {
    'use strict';

    const VERSION = '1.0.0';
    let _debounceTimer = null;
    let _lastScore = null;
    let _widgetEl = null;
    let _targetTextarea = null;

    // ═══════════════════════════════════════
    // CHAIN PATTERNS (gleich wie in brainDecompose)
    // ═══════════════════════════════════════
    const CHAIN_PATTERNS = {
        actions: { icon: '\u26A1', color: '#fa1e4e', keywords: ['erstelle','generiere','analysiere','optimiere','teste','prüfe','konvertiere','exportiere','deploye','starte','stoppe','update','lösche','baue','fixe','debugge','build','run','create','check'] },
        skills: { icon: '\uD83D\uDD27', color: '#55ACEE', keywords: ['javascript','python','html','css','go','java','php','api','rest','sql','git','docker','seo','llm','prompt','mistral','gpt','claude','gemini','react','node','ocr','nlp','ki','ai','nexuz','james','dkz-theme','responsive'] },
        workflows: { icon: '\uD83D\uDD04', color: '#00ff88', keywords: ['workflow','pipeline','ablauf','prozess','schritt','erst','dann','danach','phase','sequenz','wenn','falls','batch','queue','cron','loop'] },
        agents: { icon: '\uD83E\uDD16', color: '#ec4899', keywords: ['james','copilot','agent','bot','assistant','openclaw','picoclaw','orchestrator','antigravity','gemini','evaluator','analyzer','builder','debugger'] },
        teams: { icon: '\uD83D\uDC65', color: '#FFB800', keywords: ['team','gruppe','rolle','admin','developer','viewer','user','guest','projekt','zugang','berechtigung'] },
        quellen: { icon: '\uD83D\uDCDA', color: '#6366f1', keywords: ['quelle','source','datei','file','url','api','datenbank','localstorage','iceberg','json','wiki','docs','readme','playbook','blaupause','github','registry','archiv'] }
    };

    // ═══════════════════════════════════════
    // WIDGET CREATION
    // ═══════════════════════════════════════
    function createWidget() {
        var widget = document.createElement('div');
        widget.id = 'dkz-prompt-score-widget';
        widget.innerHTML = `
            <div class="psw-header">
                <span class="psw-logo">James</span>
                <span class="psw-score" id="psw-score">—</span>
                <span class="psw-grade" id="psw-grade">?</span>
                <span class="psw-cats" id="psw-cats"></span>
                <span class="psw-ctx" id="psw-ctx" title="Playbook-Sektionen"></span>
                <button class="psw-save" id="psw-save" onclick="DkzPromptScore.saveToIceberg()" title="In Iceberg speichern">💾</button>
                <button class="psw-toggle" onclick="DkzPromptScore.toggleExpand()">▼</button>
            </div>
            <div class="psw-body" id="psw-body" style="display:none">
                <div class="psw-issues" id="psw-issues"></div>
                <div class="psw-playbook" id="psw-playbook"></div>
                <div class="psw-version" id="psw-version"></div>
            </div>
        `;

        // Inject styles
        if (!document.getElementById('psw-styles')) {
            var style = document.createElement('style');
            style.id = 'psw-styles';
            style.textContent = `
                #dkz-prompt-score-widget {
                    position: fixed; bottom: 50px; right: 16px; z-index: 9998;
                    background: rgba(14,14,22,.92); backdrop-filter: blur(20px);
                    border: 1px solid rgba(250,30,78,.15); border-radius: 12px;
                    font-family: 'Inter', sans-serif; color: #f6f6f7;
                    min-width: 280px; max-width: 420px;
                    box-shadow: 0 8px 32px rgba(0,0,0,.5);
                    transition: all .3s ease;
                }
                .psw-header {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 12px; cursor: pointer;
                }
                .psw-logo {
                    background: linear-gradient(135deg, #fa1e4e, #ec4899);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    font-weight: 800; font-size: 12px;
                }
                .psw-score {
                    font-size: 18px; font-weight: 800;
                    font-family: 'JetBrains Mono', monospace;
                    min-width: 28px; text-align: center;
                    transition: color .3s;
                }
                .psw-grade {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 22px; height: 22px; border-radius: 6px;
                    font-size: 11px; font-weight: 700;
                    transition: background .3s;
                }
                .psw-cats { font-size: 10px; flex: 1; text-align: right; }
                .psw-ctx { font-size: 8px; color: #8b8bf5; }
                .psw-save {
                    background: none; border: 1px solid rgba(0,255,136,.2); border-radius: 6px;
                    color: #00ff88; cursor: pointer; font-size: 12px; padding: 2px 6px;
                    transition: all .2s;
                }
                .psw-save:hover { background: rgba(0,255,136,.1); }
                .psw-toggle {
                    background: none; border: none; color: var(--muted, #888);
                    cursor: pointer; font-size: 10px; padding: 2px;
                }
                .psw-body { padding: 8px 12px; border-top: 1px solid rgba(255,255,255,.04); }
                .psw-issues { font-size: 9px; max-height: 120px; overflow-y: auto; }
                .psw-issues div { padding: 1px 0; color: #fa6b8a; }
                .psw-issues b { color: #ff6b8a; }
                .psw-playbook { font-size: 8px; color: #8b8bf5; margin-top: 4px; }
                .psw-playbook span { display: inline-block; padding: 1px 5px; margin: 1px; background: rgba(99,102,241,.06); border: 1px solid rgba(99,102,241,.15); border-radius: 3px; }
                .psw-version { font-size: 8px; color: var(--muted, #888); margin-top: 4px; border-top: 1px solid rgba(255,255,255,.03); padding-top: 3px; }
                .psw-cat-tag { display: inline-block; padding: 0 4px; margin: 0 1px; border-radius: 3px; font-size: 8px; font-weight: 600; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(widget);
        _widgetEl = widget;
        return widget;
    }

    // ═══════════════════════════════════════
    // SCORE EVALUATION
    // ═══════════════════════════════════════
    function evaluate(text) {
        if (!text || text.trim().length < 3) {
            updateWidget(null);
            return null;
        }

        var result = { score: 0, grade: '?', issues: [], categories: {}, playbookSections: 0 };
        var textLower = text.toLowerCase();

        // 1. Chain decomposition
        var filled = 0;
        Object.keys(CHAIN_PATTERNS).forEach(function(cat) {
            var p = CHAIN_PATTERNS[cat];
            var found = [];
            p.keywords.forEach(function(kw) {
                if (textLower.indexOf(kw.toLowerCase()) !== -1) found.push(kw);
            });
            result.categories[cat] = { count: found.length, items: found.slice(0, 5), icon: p.icon, color: p.color };
            if (found.length > 0) filled++;
        });
        result.coverage = Math.round(filled / 6 * 100);

        // 2. James evaluation
        if (typeof DkzJames !== 'undefined') {
            var jResult = DkzJames.evaluate(text, 'prompt');
            result.score = jResult.score;
            result.grade = jResult.grade;
            result.issues = jResult.issues || [];
        } else {
            // Fallback basic scoring
            result.score = Math.min(100, filled * 15 + Math.min(text.length / 10, 30));
            result.grade = result.score >= 90 ? 'A' : result.score >= 70 ? 'B' : result.score >= 50 ? 'C' : result.score >= 30 ? 'D' : 'F';
        }

        // 3. Playbook context count
        if (typeof window.getPlaybookContext === 'function') {
            var ctx = window.getPlaybookContext(text);
            result.playbookSections = ctx.relevant.length;
        }

        _lastScore = result;
        updateWidget(result);
        return result;
    }

    function updateWidget(result) {
        if (!_widgetEl) return;

        var scoreEl = document.getElementById('psw-score');
        var gradeEl = document.getElementById('psw-grade');
        var catsEl = document.getElementById('psw-cats');
        var ctxEl = document.getElementById('psw-ctx');

        if (!result) {
            if (scoreEl) scoreEl.textContent = '—';
            if (gradeEl) { gradeEl.textContent = '?'; gradeEl.style.background = 'rgba(255,255,255,.05)'; gradeEl.style.color = '#888'; }
            if (catsEl) catsEl.innerHTML = '';
            if (ctxEl) ctxEl.textContent = '';
            return;
        }

        // Score color
        var scoreColor = result.score >= 80 ? '#00ff88' : result.score >= 50 ? '#FFB800' : '#fa1e4e';
        if (scoreEl) { scoreEl.textContent = result.score; scoreEl.style.color = scoreColor; }

        // Grade badge
        var gradeColors = { A: '#00ff88', B: '#55ACEE', C: '#FFB800', D: '#fa1e4e', F: '#ff0040' };
        if (gradeEl) {
            gradeEl.textContent = result.grade;
            gradeEl.style.background = (gradeColors[result.grade] || '#888') + '22';
            gradeEl.style.color = gradeColors[result.grade] || '#888';
        }

        // Category tags
        if (catsEl) {
            var catHtml = '';
            Object.keys(result.categories).forEach(function(cat) {
                var c = result.categories[cat];
                if (c.count > 0) {
                    catHtml += '<span class="psw-cat-tag" style="background:' + c.color + '18;color:' + c.color + '">' + c.icon + c.count + '</span>';
                }
            });
            catsEl.innerHTML = catHtml;
        }

        // Playbook context
        if (ctxEl) ctxEl.textContent = result.playbookSections > 0 ? '\uD83D\uDCD6' + result.playbookSections : '';

        // Issues (expanded body)
        var issuesEl = document.getElementById('psw-issues');
        if (issuesEl && result.issues.length > 0) {
            issuesEl.innerHTML = result.issues.map(function(i) {
                return '<div>\u2022 <b>' + (i.rule ? i.rule.id : '?') + '</b> ' + (i.rule ? i.rule.hint : '') + '</div>';
            }).join('');
        } else if (issuesEl) {
            issuesEl.innerHTML = '<div style="color:#00ff88">\u2705 Keine Issues</div>';
        }
    }

    // ═══════════════════════════════════════
    // ICEBERG SAVE (R95: Archivpflicht)
    // ═══════════════════════════════════════
    function getText(el) {
        return (el.value !== undefined && el.value !== '' ? el.value : el.textContent || el.innerText || '').trim();
    }

    function saveToIceberg() {
        if (!_targetTextarea || !_lastScore) return;
        var text = getText(_targetTextarea);
        if (!text) return;

        if (typeof DkzIceberg !== 'undefined') {
            var activeCats = Object.keys(_lastScore.categories).filter(function(c) { return _lastScore.categories[c].count > 0; });
            var result = DkzIceberg.savePrompt(text, {
                score: _lastScore.score,
                grade: _lastScore.grade,
                categories: _lastScore.categories,
                jamesIssues: _lastScore.issues,
                playbookSections: _lastScore.playbookSections,
                category: activeCats[0] || 'general',
                tags: activeCats
            });

            var versionEl = document.getElementById('psw-version');
            if (versionEl) {
                var trend = result.trend === 'up' ? '\u2B06' : result.trend === 'down' ? '\u2B07' : '\u27A1';
                versionEl.innerHTML = '\uD83D\uDDC3 Iceberg: ' + result.id + ' v' + result.version + ' ' + trend + ' | Status: ' + result.status;
            }

            // Toast
            if (typeof showToast === 'function') showToast('\uD83D\uDCBE Prompt in Iceberg gespeichert: ' + result.id);
            else if (typeof toast === 'function') toast('\uD83D\uDCBE Iceberg: ' + result.id + ' v' + result.version);
        }
    }

    // ═══════════════════════════════════════
    // TOGGLE EXPAND
    // ═══════════════════════════════════════
    function toggleExpand() {
        var body = document.getElementById('psw-body');
        if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }

    // ═══════════════════════════════════════
    // AUTO-INIT: Find textareas + attach listener
    // ═══════════════════════════════════════
    function init(targetSelector) {
        // Find target — supports textarea AND div elements
        var target = targetSelector ? document.querySelector(targetSelector) :
            document.querySelector('[data-prompt-score]') ||
            document.querySelector('#prompt-input') ||
            document.querySelector('#brain-prompt-input') ||
            document.querySelector('#previewRaw') ||
            document.querySelector('textarea') ||
            document.querySelector('[contenteditable]');

        if (!target) return false;

        _targetTextarea = target;
        createWidget();

        var isFormElement = (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT');

        if (isFormElement) {
            // Standard textarea input listener
            target.addEventListener('input', function() {
                clearTimeout(_debounceTimer);
                _debounceTimer = setTimeout(function() {
                    evaluate(getText(target));
                }, 600);
            });
        } else {
            // MutationObserver for div/contenteditable elements
            var observer = new MutationObserver(function() {
                clearTimeout(_debounceTimer);
                _debounceTimer = setTimeout(function() {
                    evaluate(getText(target));
                }, 600);
            });
            observer.observe(target, { childList: true, subtree: true, characterData: true });
        }

        // Initial evaluation if element has content
        var initialText = getText(target);
        if (initialText) {
            setTimeout(function() { evaluate(initialText); }, 200);
        }

        return true;
    }

    // Auto-init on DOMContentLoaded
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function() {
            // Only auto-init if any prompt textarea exists
            setTimeout(function() { init(); }, 500);
        });
    }

    // ═══════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════
    return {
        version: VERSION,
        init: init,
        evaluate: evaluate,
        saveToIceberg: saveToIceberg,
        toggleExpand: toggleExpand,
        getLastScore: function() { return _lastScore; }
    };
})();

if (typeof window !== 'undefined') window.DkzPromptScore = DkzPromptScore;
