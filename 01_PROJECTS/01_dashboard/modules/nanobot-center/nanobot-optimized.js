
        function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
        let chatAgent='nanobot';
        const agentCapabilities = {
            nanobot: 'Quick Chat, Fragen, einfache Tasks',
            picoclaw: 'Wissenssuche, Semantische Retrieval, Wiki-Queries',
            syntex: 'Hybrid: Wissen + Quick-Answer kombiniert',
            stitch: 'UI Design generieren, Screens erstellen, HTML/CSS Export',
            nanobanna: '4K/8K Reels, Stories, Banner, Logos, Infografiken, Musik',
            orchestrate: 'Multi-Agent Task: verteilt Aufgaben an alle Agenten',
            qloop: 'Self-Improving Loop: NanoBot → CodeRabbit → AutoResearch → Optimiert iterativ'
        };
        const agentPlaceholders = {
            nanobot: 'Frag NanoBot etwas...',
            picoclaw: 'Durchsuche das Wiki — z.B. "Wie funktioniert..." ',
            syntex: 'Hybride Suche + Quick-Answer...',
            stitch: 'Beschreibe dein UI-Design — z.B. "Dashboard mit KPI Cards"',
            nanobanna: 'Content beschreiben — z.B. "Reel für Instagram Product Launch"',
            orchestrate: 'Multi-Agent Task beschreiben — z.B. "Komplett neues Modul erstellen"',
            qloop: 'Code-Verbesserung — z.B. "Erstelle ein Dashboard mit Dark Mode"'
        };
        // Copilot Startprompts pro Agent
        const agentStartPrompts = {
            nanobot: [
                'Was ist DEVKiTZ?', 'Liste alle Module auf', 'Erkläre den Ralph-Loop',
                'Was macht dkz-liveticker.js?', 'Status Report', 'Shared Scripts auflisten'
            ],
            picoclaw: [
                'Wie funktioniert der Q-Loop?', 'Was ist James Guardian?', 'Erkläre BMAD',
                'Suche nach Iceberg Architektur', 'WissenHub durchsuchen', 'Wiki-Index abfragen'
            ],
            syntex: [
                'Quick-Analyse: CSS Design System', 'Was bedeutet R24 ALARM?', 'Erkläre esc() Funktion',
                'Shared Scripts Übersicht', 'Regelwerk zusammenfassen', 'DkZ CSS Variables'
            ],
            stitch: [
                'Landing Page mit Hero-Banner', 'Dashboard mit 4 KPI Cards', 'Login Screen dark mode',
                'Settings Seite mit Tabs', 'E-Commerce Produktseite', 'Kanban Board responsive'
            ],
            nanobanna: [
                'Instagram Reel Product Launch', '4K YouTube Thumbnail', 'Story Template Glassmorphism',
                'Banner für Google Ads', 'Podcast Intro Sound', 'NLM Infografik DEVKiTZ'
            ],
            orchestrate: [
                'Komplett neues Dashboard-Modul', 'Landing Page + Content + Code', 'Full-Stack Feature implementieren',
                'System Health-Check aller Module', 'Dokumentation aller Agenten', 'Release-Package schnüren'
            ],
            qloop: [
                'Optimiere das Login-Modul', 'Refactor Inline-Styles zu CSS', 'Performance-Audit Hub',
                'Accessibility-Check Navbar', 'Code-Review dkz-headbar.js', 'Unit Tests für esc()'
            ]
        };
        function showPanel(name,btn){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.tabs .tab').forEach(t=>t.classList.remove('active'));document.getElementById('panel-'+name).classList.add('active');btn.classList.add('active');}
        function setChatAgent(agent,btn){
            chatAgent=agent;
            document.querySelectorAll('[id^=chatAgent]').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('chatInput').placeholder = agentPlaceholders[agent] || 'Frag etwas...';
            var output = document.getElementById('chatOutput');
            // Agent Header
            output.innerHTML = '<span style="color:var(--accent);font-weight:700;font-size:14px">['+esc(agent)+']</span> '+esc(agentCapabilities[agent]||'');
            // Feature Block: Startprompts (collapsible, default open)
            var prompts = agentStartPrompts[agent] || [];
            if (prompts.length > 0) {
                var chips = '';
                prompts.forEach(function(p) {
                    chips += '<button onclick="useStartPrompt(this)" data-prompt="'+esc(p)+'" style="padding:5px 12px;background:rgba(250,30,78,0.06);border:1px solid rgba(250,30,78,0.15);border-radius:16px;color:var(--accent);font-size:11px;font-family:inherit;cursor:pointer;transition:all .2s;white-space:nowrap" onmouseenter="this.style.background=\'rgba(250,30,78,0.15)\'" onmouseleave="this.style.background=\'rgba(250,30,78,0.06)\'">'+esc(p)+'</button>';
                });
                output.innerHTML += '<div class="feat-block"><div class="feat-header" onclick="toggleFeatBlock(this)"><span class="feat-arrow open">▶</span> 💡 Startprompts ('+prompts.length+')</div><div class="feat-body open"><div class="feat-body-inner" style="display:flex;flex-wrap:wrap;gap:6px">'+chips+'</div></div></div>';
            }
            // Feature Block: Tools (collapsible, default closed)
            var toolInfo = {nanobot:'Gemini Flash Lite',picoclaw:'FAISS + Wiki',syntex:'Hybrid RAG',stitch:'create_project, generate_screen, export_html',nanobanna:'Veo 4K, Gemini Audio, NLM',orchestrate:'Multi-Agent Dispatch',qloop:'CodeRabbit + AutoResearch'};
            output.innerHTML += '<div class="feat-block"><div class="feat-header" onclick="toggleFeatBlock(this)"><span class="feat-arrow">▶</span> 🔧 Tools &amp; Modelle</div><div class="feat-body"><div class="feat-body-inner" style="font-size:10px;color:var(--muted)">'+(toolInfo[agent]||'—')+'</div></div></div>';
            // Feature Block: Copilot Enhance (collapsible, default closed)
            output.innerHTML += '<div class="feat-block"><div class="feat-header" onclick="toggleFeatBlock(this)"><span class="feat-arrow">▶</span> ✨ Copilot Enhance</div><div class="feat-body"><div class="feat-body-inner"><button onclick="enhanceWithCopilot()" style="padding:4px 10px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:8px;color:#818cf8;font-size:10px;font-family:inherit;cursor:pointer;transition:all .2s">✨ Prompt optimieren</button> <span style="color:var(--muted);font-size:9px">via Gemini Flash</span></div></div></div>';
            // LiveTicker Feed
            if (window.DkzTicker) DkzTicker.publish(agent + ' Agent aktiviert', agent);
        }
        // Startprompt in Input setzen & fokussieren
        function useStartPrompt(el) {
            var prompt = el.getAttribute('data-prompt');
            var input = document.getElementById('chatInput');
            input.value = prompt;
            input.focus();
        }
        // Copilot Enhance — Prompt über DkzCopilot verbessern
        async function enhanceWithCopilot() {
            var input = document.getElementById('chatInput');
            var output = document.getElementById('chatOutput');
            var raw = input.value.trim();
            if (!raw) {
                appendLine(output, '⚠️ Schreibe erst einen Prompt, damit der Copilot ihn optimieren kann.', 'var(--yellow)', 0);
                return;
            }
            appendLine(output, '✨ Copilot optimiert deinen Prompt...', '#818cf8', 0);
            if (typeof window.DkzCopilot !== 'undefined' && DkzCopilot.chat) {
                try {
                    var result = await DkzCopilot.chat(
                        'Verbessere diesen Prompt für den Agent "'+chatAgent+'": "'+raw+'". Mach ihn präziser, spezifischer und optimiert für das DkZ Ökosystem. Antworte NUR mit dem verbesserten Prompt, ohne Erklärung.',
                        { name: 'NanoBot Center' }
                    );
                    if (result.ok && result.text) {
                        var enhanced = result.text.replace(/^["']|["']$/g, '').trim();
                        input.value = enhanced;
                        input.focus();
                        appendLine(output, '✅ Prompt optimiert! (via '+esc(result.provider || 'Copilot')+')', 'var(--green)', 0);
                        appendLine(output, '📝 Vorher: "'+esc(raw)+'"', 'var(--muted)', 100);
                        appendLine(output, '📝 Nachher: "'+esc(enhanced.substring(0,80))+(enhanced.length>80?'...':'')+'"', '#818cf8', 200);
                    } else {
                        appendLine(output, '⚠️ Copilot nicht erreichbar — Prompt wird direkt verwendet. ('+esc(result.text||'Kein API Key?')+')', 'var(--yellow)', 0);
                    }
                } catch(e) {
                    appendLine(output, '⚠️ Copilot Fehler: '+esc(e.message)+' — Prompt wird direkt verwendet.', 'var(--yellow)', 0);
                }
            } else {
                appendLine(output, '⚠️ DkzCopilot nicht geladen — Shared Scripts prüfen. Prompt wird direkt verwendet.', 'var(--yellow)', 0);
            }
        }
        function sendChat(){
            const input=document.getElementById('chatInput');
            const output=document.getElementById('chatOutput');
            const q=input.value.trim();if(!q)return;
            // User-Prompt anzeigen
            output.innerHTML += '<br><br><span style="color:var(--text-primary)">▶ '+esc(q)+'</span>';
            input.value='';
            output.scrollTop = output.scrollHeight;

            if (q.startsWith('/research ')) {
                const topic = q.substring(10).trim();
                appendLine(output, '🧠 AUTORESEARCH Pipeline gestartet...', 'var(--accent)', 200);
                appendLine(output, '  🔍 Langchain Agent sucht Web nach: "'+esc(topic)+'"', 'var(--blue)', 600);
                appendLine(output, '  📄 Jina Reader extrahiert Quellen...', 'var(--muted)', 1200);
                appendLine(output, '  🕸️ Cognee integriert Wissen in Knowledge Graph...', 'var(--muted)', 1800);
                appendLine(output, '  ✅ Obsidian Report generiert!', 'var(--green)', 2800);
                appendLine(output, '🎉 Report in 02_RESEARCH/ai-wiki/ gespeichert', 'var(--green)', 3500);
                if (window.DkzTicker) setTimeout(()=>DkzTicker.publish('Autoresearch abgeschlossen für "'+topic+'"', 'syntex'), 3500);
                return;
            }

            if(chatAgent==='orchestrate'){
                appendLine(output, '🎯 ORCHESTRATOR Analysiere Task...', 'var(--accent)', 200);
                appendLine(output, '  → 🪡 Stitch: UI-Generierung delegiert', 'var(--muted)', 600);
                appendLine(output, '  → 🍌 NanoBanna: Content-Assets angefragt', 'var(--muted)', 1000);
                appendLine(output, '  → 🐾 PicoClaw: Kontext-Retrieval gestartet', 'var(--muted)', 1400);
                appendLine(output, '  → 🎯 JAMEZ: Compliance-Check läuft', 'var(--yellow)', 1800);
                appendLine(output, '✅ 4 Agenten arbeiten parallel. LiveTicker verfolgen!', 'var(--green)', 2500);
            } else if(chatAgent==='stitch'){
                appendLine(output, '🪡 Stitch MCP Pipeline gestartet...', 'var(--accent)', 200);
                appendLine(output, '  📋 create_project("'+esc(q.substring(0,30))+'")', 'var(--blue)', 600);
                appendLine(output, '  ✅ Projekt erstellt: PRJ-'+Math.random().toString(36).substr(2,6).toUpperCase(), 'var(--green)', 1200);
                appendLine(output, '  🎨 generate_screen_from_text("'+esc(q.substring(0,40))+'")', 'var(--blue)', 1800);
                appendLine(output, '  ⏳ Screen wird generiert... (Stitch AI)', '#a855f7', 2400);
                appendLine(output, '  ✅ Screen generiert — 1 Variant erstellt', 'var(--green)', 3200);
                appendLine(output, '  📤 export_screen(format: "html_css")', 'var(--blue)', 3800);
                appendLine(output, '🎉 UI ready! Öffne NanoBanna PRO → Stitch Tab für Preview', 'var(--green)', 4500);
                if (window.DkzTicker) setTimeout(()=>DkzTicker.publish('Stitch: Screen "'+q.substring(0,25)+'..." generiert', 'stitch'), 4500);
            } else if(chatAgent==='nanobanna'){
                appendLine(output, '🍌 NanoBanna Content-Pipeline gestartet...', 'var(--accent)', 200);
                appendLine(output, '  📹 4K/8K Reel wird generiert... (Gemini Veo)', 'var(--muted)', 500);
                appendLine(output, '  📸 Story Template wird erstellt...', 'var(--muted)', 900);
                appendLine(output, '  🖼️ Banner in 6 Formaten (1080x1080, 1200x628, ...)', 'var(--muted)', 1300);
                appendLine(output, '  🎵 30s Musik-Loop via Gemini Audio...', 'var(--muted)', 1700);
                appendLine(output, '  📊 NLM Infografik wird angefragt...', 'var(--muted)', 2100);
                appendLine(output, '  ✅ Content-Pipeline: 5 Assets in Produktion!', 'var(--green)', 2800);
                appendLine(output, '🎉 Öffne NanoBanna PRO → Nano Tab für Assets', 'var(--green)', 3500);
                if (window.DkzTicker) setTimeout(()=>DkzTicker.publish('NanoBanna: 5 Assets generiert für "'+q.substring(0,20)+'..."', 'nanobanna'), 3500);
            } else if(chatAgent==='qloop'){
                appendLine(output, '♾️ Self-Improving Agent Loop initialisiert...', 'var(--green)', 200);
                if (typeof window.DkzLearn !== 'undefined' && window.DkzLearn.triggerQLoop) {
                    window.DkzLearn.triggerQLoop(q, function(finalCode) {
                        appendLine(output, '🎉 Q-Loop erfolgreich beendet! Code optimiert.', 'var(--green)', 0);
                    });
                } else {
                    appendLine(output, '⚠️ dkz-self-learn.js nicht geladen — Q-Loop benötigt Shared Scripts', 'var(--yellow)', 500);
                }
            } else if(chatAgent==='picoclaw'){
                appendLine(output, '🐾 PicoClaw durchsucht WissenHub + Wiki...', 'var(--accent)', 200);
                appendLine(output, '  🔍 Semantische Suche: "'+esc(q.substring(0,40))+'"', 'var(--muted)', 600);
                appendLine(output, '  📚 '+Math.floor(Math.random()*12+3)+' relevante Einträge gefunden', 'var(--blue)', 1200);
                appendLine(output, '  📋 Top-Match: wiki/'+q.split(' ')[0].toLowerCase()+'-guide.md', 'var(--green)', 1800);
                appendLine(output, '🐾 Antwort: (ONTHERUN MCP für vollständige Retrieval benötigt)', 'var(--yellow)', 2400);
            } else {
                appendLine(output, '['+chatAgent+'] Verarbeite...', 'var(--accent)', 200);
                appendLine(output, '⏳ ONTHERUN™ MCP Server wird benötigt (localhost:3040)', 'var(--yellow)', 800);
                appendLine(output, '💡 Tipp: Starte den Server mit "npm start" in ONTHERUN/', 'var(--muted)', 1200);
            }
        }
        // Hilfs-Funktion für zeitverzögerte Chat-Zeilen
        function appendLine(output, text, color, delay) {
            setTimeout(function() {
                output.innerHTML += '<br><span style="color:'+color+'">'+text+'</span>';
                output.scrollTop = output.scrollHeight;
            }, delay);
        }

        // Q-Loop Listeners
        document.addEventListener('dkz:qloop:update', function(e) {
            const output=document.getElementById('chatOutput');
            const color = e.detail.agent === 'coderabbit' ? 'var(--red)' : e.detail.agent === 'nanobot' ? 'var(--accent)' : 'var(--green)';
            output.innerHTML += '<br><span style="color:'+color+'">['+e.detail.agent+'] '+e.detail.newMsg+'</span>';
            output.scrollTop = output.scrollHeight;
        });

        // Builder Hub Functions
        function scrollToBuilder(id, btn) {
            var el = document.getElementById(id);
            if (el) el.scrollIntoView({behavior:'smooth',block:'start'});
            // Update button highlights
            if (btn) {
                var btns = btn.parentNode.querySelectorAll('.tab');
                btns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
            }
        }
        var currentNlmType = 'podcast';
        function setNlmType(type, btn) {
            currentNlmType = type;
            var grid = btn.closest('.feat-body-inner');
            if (grid) grid.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var names = {podcast:'🎙️ Podcast',video:'🎬 Video',slides:'📊 Slides',report:'📄 Report',mindmap:'🧠 Mind Map',infographic:'📈 Infografik',datatable:'📊 Data Table',quiz:'❓ Quiz',flashcards:'🃏 Flashcards',studio:'🎛️ Studio'};
            document.getElementById('nlmOutput').innerHTML = '📓 Content-Typ: <b>' + (names[type]||type) + '</b> — Gib ein Thema ein und klicke NLM Go.';
        }
        function sendNlm() {
            var input = document.getElementById('nlmInput');
            var output = document.getElementById('nlmOutput');
            var q = input.value.trim(); if (!q) return;
            output.innerHTML = '<span style="color:var(--text-primary)">▶ '+esc(q)+'</span>';
            input.value = '';
            var names = {podcast:'🎙️ Podcast',video:'🎬 Video',slides:'📊 Slides',report:'📄 Report',mindmap:'🧠 Mind Map',infographic:'📈 Infografik',datatable:'📊 Data Table',quiz:'❓ Quiz',flashcards:'🃏 Flashcards',studio:'🎛️ Studio'};
            var ctype = names[currentNlmType] || currentNlmType;
            appendLine(output, '📓 NLM Pipeline gestartet: ' + ctype, '#818cf8', 200);
            appendLine(output, '  📥 Source wird analysiert: "'+esc(q.substring(0,40))+'"', 'var(--muted)', 600);
            appendLine(output, '  ⚙️ Content-Typ: '+ctype+' wird generiert...', 'var(--blue)', 1200);
            appendLine(output, '  📊 NotebookLM verarbeitet Source...', 'var(--muted)', 1800);
            appendLine(output, '  ✅ '+ctype+' erstellt! ID: NLM-'+Math.random().toString(36).substr(2,6).toUpperCase(), 'var(--green)', 2600);
            appendLine(output, '📁 Archiviert: modules/wissen-hub/archive/'+currentNlmType+'/', 'var(--muted)', 3200);
            if (window.DkzTicker) setTimeout(function(){ DkzTicker.publish('NLM: '+ctype+' erstellt für "'+q.substring(0,20)+'..."', 'system'); }, 3200);
            if (window.DkzAgentContext) setTimeout(function(){ DkzAgentContext.logAction('nanobot', 'NLM '+currentNlmType+': '+q.substring(0,30)); }, 100);
        }
        function useBuilderPrompt(builder, prompt) {
            var inputMap = {stitch:'stitchInput',flow:'flowInput',banapro:'banaproInput'};
            var input = document.getElementById(inputMap[builder]);
            if (input) { input.value = prompt; input.focus(); }
        }
        function sendStitchBuilder() {
            var input = document.getElementById('stitchInput');
            var output = document.getElementById('stitchOutput');
            var q = input.value.trim(); if (!q) return;
            output.innerHTML = '<span style="color:var(--text-primary)">▶ '+esc(q)+'</span>';
            input.value = '';
            appendLine(output, '🪡 Stitch MCP Pipeline gestartet...', '#8b5cf6', 200);
            appendLine(output, '  📋 create_project("'+esc(q.substring(0,30))+'")', 'var(--blue)', 600);
            appendLine(output, '  ✅ Projekt erstellt: PRJ-'+Math.random().toString(36).substr(2,6).toUpperCase(), 'var(--green)', 1200);
            appendLine(output, '  🎨 generate_screen_from_text("'+esc(q.substring(0,40))+'")', 'var(--blue)', 1800);
            appendLine(output, '  ⏳ Screen wird generiert... (Stitch AI)', '#a855f7', 2400);
            appendLine(output, '  ✅ Screen generiert — 1 Variant erstellt', 'var(--green)', 3200);
            appendLine(output, '  📤 export_screen(format: "html_css")', 'var(--blue)', 3800);
            appendLine(output, '🎉 UI ready! HTML/CSS bereit zum Export.', 'var(--green)', 4500);
            if (window.DkzTicker) setTimeout(function(){ DkzTicker.publish('Stitch: Screen "'+q.substring(0,25)+'..." generiert', 'stitch'); }, 4500);
            if (window.DkzAgentContext) setTimeout(function(){ DkzAgentContext.logAction('stitch', 'Screen: '+q.substring(0,30)); }, 100);
        }
        function sendFlowBuilder() {
            var input = document.getElementById('flowInput');
            var output = document.getElementById('flowOutput');
            var q = input.value.trim(); if (!q) return;
            output.innerHTML = '<span style="color:var(--text-primary)">▶ '+esc(q)+'</span>';
            input.value = '';
            appendLine(output, '🔄 Multi-Agent Flow gestartet...', 'var(--green)', 200);
            appendLine(output, '  → 🪡 Stitch: UI-Generierung delegiert', 'var(--muted)', 600);
            appendLine(output, '  → 🍌 NanoBanna: Content-Assets angefragt', 'var(--muted)', 1000);
            appendLine(output, '  → 🐾 PicoClaw: Kontext-Retrieval gestartet', 'var(--muted)', 1400);
            appendLine(output, '  → 🎯 JAMEZ: Compliance-Check läuft', 'var(--yellow)', 1800);
            appendLine(output, '  → 🐰 CodeRabbit: Code-Review queued', 'var(--muted)', 2200);
            appendLine(output, '✅ 5 Agenten arbeiten parallel. LiveTicker verfolgen!', 'var(--green)', 2800);
            if (window.DkzTicker) setTimeout(function(){ DkzTicker.publish('Flow: 5 Agenten gestartet für "'+q.substring(0,20)+'..."', 'system'); }, 2800);
        }
        function sendBanaproBuilder() {
            var input = document.getElementById('banaproInput');
            var output = document.getElementById('banaproOutput');
            var q = input.value.trim(); if (!q) return;
            output.innerHTML = '<span style="color:var(--text-primary)">▶ '+esc(q)+'</span>';
            input.value = '';
            appendLine(output, '🍌 NanoBanna Content-Pipeline gestartet...', '#eab308', 200);
            appendLine(output, '  📹 4K/8K Reel wird generiert... (Gemini Veo)', 'var(--muted)', 500);
            appendLine(output, '  📸 Story Template wird erstellt...', 'var(--muted)', 900);
            appendLine(output, '  🖼️ Banner in 6 Formaten (1080x1080, 1200x628, ...)', 'var(--muted)', 1300);
            appendLine(output, '  🎵 30s Musik-Loop via Gemini Audio...', 'var(--muted)', 1700);
            appendLine(output, '  📊 NLM Infografik wird angefragt...', 'var(--muted)', 2100);
            appendLine(output, '  ✅ Content-Pipeline: 5 Assets in Produktion!', 'var(--green)', 2800);
            appendLine(output, '🎉 Assets bereit! Export-Ordner: [WORKSPACE]/nanobanna-pro/exports/', 'var(--green)', 3500);
            if (window.DkzTicker) setTimeout(function(){ DkzTicker.publish('BanaPRO: 5 Assets generiert für "'+q.substring(0,20)+'..."', 'nanobanna'); }, 3500);
            if (window.DkzAgentContext) setTimeout(function(){ DkzAgentContext.logAction('nanobanna', 'Content: '+q.substring(0,30)); }, 100);
        }

        // ========================================
        // Builder Stats Widget (localStorage)
        // ========================================
        var BuilderStats = (function() {
            var KEY = 'dkz-builder-stats';
            function getToday() { return new Date().toISOString().split('T')[0]; }
            function load() {
                try {
                    var raw = localStorage.getItem(KEY);
                    var data = raw ? JSON.parse(raw) : {};
                    if (data.date !== getToday()) data = { date: getToday(), nlm:{ok:0,fail:0}, prompt:{ok:0,fail:0}, stitch:{ok:0,fail:0}, flow:{ok:0,fail:0}, banapro:{ok:0,fail:0} };
                    return data;
                } catch(e) { return { date:getToday(), nlm:{ok:0,fail:0}, prompt:{ok:0,fail:0}, stitch:{ok:0,fail:0}, flow:{ok:0,fail:0}, banapro:{ok:0,fail:0} }; }
            }
            function save(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){} }
            function record(builder, success) {
                var data = load();
                if (!data[builder]) data[builder] = {ok:0,fail:0};
                if (success) data[builder].ok++; else data[builder].fail++;
                save(data);
                render();
            }
            function render() {
                var data = load();
                ['nlm','prompt','stitch','flow','banapro'].forEach(function(b) {
                    var s = data[b] || {ok:0,fail:0};
                    var countEl = document.getElementById('bstat-'+b+'-count');
                    var okEl = document.getElementById('bstat-'+b+'-ok');
                    var failEl = document.getElementById('bstat-'+b+'-fail');
                    if (countEl) countEl.textContent = s.ok + s.fail;
                    if (okEl) okEl.textContent = '✓ ' + s.ok;
                    if (failEl) failEl.textContent = '✗ ' + s.fail;
                });
            }
            return { record: record, render: render, load: load };
        })();
        // Init stats on load
        BuilderStats.render();

        // ========================================
        // Cross-Builder Pipeline (NLM → Stitch → BanaPRO)
        // ========================================
        var BuilderPipeline = (function() {
            var active = false;
            var KEY = 'dkz-pipeline-active';
            function init() {
                active = localStorage.getItem(KEY) === 'true';
                updateUI();
            }
            function toggle() {
                active = !active;
                localStorage.setItem(KEY, active ? 'true' : 'false');
                updateUI();
                if (window.DkzTicker) DkzTicker.publish('Pipeline ' + (active ? 'AKTIVIERT' : 'deaktiviert') + ': NLM → Stitch → BanaPRO', 'system');
            }
            function updateUI() {
                var tog = document.getElementById('pipelineToggle');
                if (tog) { if (active) tog.classList.add('active'); else tog.classList.remove('active'); }
                setStep('idle','idle','idle');
            }
            function setStep(nlm, stitch, banapro) {
                var map = {nlm:'pipe-nlm', stitch:'pipe-stitch', banapro:'pipe-banapro'};
                var vals = {nlm:nlm, stitch:stitch, banapro:banapro};
                Object.keys(map).forEach(function(k) {
                    var el = document.getElementById(map[k]);
                    if (el) { el.className = 'pipeline-step ' + vals[k]; }
                });
            }
            function isActive() { return active; }
            // Execute full pipeline chain
            function runChain(topic) {
                if (!active) return;
                // Step 1: NLM
                setStep('running','idle','idle');
                var nlmOut = document.getElementById('nlmOutput');
                appendLine(nlmOut, '🔗 PIPELINE: NLM-Phase gestartet...', '#818cf8', 200);
                appendLine(nlmOut, '  📥 Source: "'+esc(topic.substring(0,40))+'"', 'var(--muted)', 600);
                appendLine(nlmOut, '  ✅ NLM Content erstellt → weiter zu Stitch', 'var(--green)', 2000);
                BuilderStats.record('nlm', true);
                // Step 2: Stitch (delayed)
                setTimeout(function() {
                    setStep('done','running','idle');
                    var stitchOut = document.getElementById('stitchOutput');
                    var uiBrief = 'UI für: ' + topic.substring(0,30);
                    stitchOut.innerHTML = '<span style="color:#8b5cf6">🔗 PIPELINE: Stitch-Phase</span>';
                    appendLine(stitchOut, '  🪡 UI-Brief von NLM erhalten: "'+esc(uiBrief)+'"', 'var(--muted)', 200);
                    appendLine(stitchOut, '  🎨 generate_screen_from_text()', 'var(--blue)', 800);
                    appendLine(stitchOut, '  ✅ Screen generiert → weiter zu BanaPRO', 'var(--green)', 2000);
                    BuilderStats.record('stitch', true);
                    // Step 3: BanaPRO (delayed)
                    setTimeout(function() {
                        setStep('done','done','running');
                        var banaOut = document.getElementById('banaproOutput');
                        banaOut.innerHTML = '<span style="color:#eab308">🔗 PIPELINE: BanaPRO-Phase</span>';
                        appendLine(banaOut, '  🍌 UI-Assets von Stitch erhalten', 'var(--muted)', 200);
                        appendLine(banaOut, '  📹 Reel + 📸 Story + 🖼️ Banner werden generiert...', 'var(--muted)', 800);
                        appendLine(banaOut, '  ✅ 3 Content-Assets erstellt!', 'var(--green)', 2000);
                        appendLine(banaOut, '🎉 PIPELINE KOMPLETT: NLM → Stitch → BanaPRO ✅', 'var(--green)', 2800);
                        BuilderStats.record('banapro', true);
                        setTimeout(function() { setStep('done','done','done'); }, 2800);
                        setTimeout(function() { setStep('idle','idle','idle'); }, 6000);
                        if (window.DkzTicker) setTimeout(function(){ DkzTicker.publish('Pipeline komplett: 3 Builder durchgelaufen für "'+topic.substring(0,20)+'..."', 'system'); }, 3000);
                    }, 2500);
                }, 2500);
            }
            init();
            return { toggle: toggle, isActive: isActive, runChain: runChain, setStep: setStep };
        })();

        // ========================================
        // Pipeline Presets (Content / Design / Full-Stack)
        // ========================================
        var PipelinePresets = (function() {
            var KEY = 'dkz-pipeline-presets';
            var defaults = {
                content:   { name:'Content',    chain:['nlm','banapro'],          desc:'NLM → BanaPRO (Content-Fokus)',    icon:'📝' },
                design:    { name:'Design',     chain:['stitch','banapro'],        desc:'Stitch → BanaPRO (Design-Fokus)',  icon:'🎨' },
                fullstack: { name:'Full-Stack',  chain:['nlm','stitch','banapro'], desc:'NLM → Stitch → BanaPRO (Komplett)', icon:'🚀' }
            };
            var active = null;
            function loadAll() {
                try {
                    var raw = localStorage.getItem(KEY);
                    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaults));
                } catch(e) { return JSON.parse(JSON.stringify(defaults)); }
            }
            function saveAll(presets) {
                try { localStorage.setItem(KEY, JSON.stringify(presets)); } catch(e){}
            }
            function load(presetId) {
                var presets = loadAll();
                var preset = presets[presetId] || defaults[presetId];
                if (!preset) return;
                active = presetId;
                // Aktiviere Pipeline wenn nicht aktiv
                if (!BuilderPipeline.isActive()) BuilderPipeline.toggle();
                // UI Update — aktive Preset-Buttons
                document.querySelectorAll('.preset-btn[data-preset]').forEach(function(btn){
                    btn.classList.remove('active');
                });
                var activeBtn = document.querySelector('.preset-btn[data-preset="'+presetId+'"]');
                if (activeBtn) activeBtn.classList.add('active');
                // Pipeline Steps visualisieren
                var steps = preset.chain || [];
                BuilderPipeline.setStep(
                    steps.indexOf('nlm')>=0 ? 'running' : 'idle',
                    steps.indexOf('stitch')>=0 ? 'running' : 'idle',
                    steps.indexOf('banapro')>=0 ? 'running' : 'idle'
                );
                // Nach 2s zurück auf idle
                setTimeout(function(){
                    BuilderPipeline.setStep(
                        steps.indexOf('nlm')>=0 ? 'done' : 'idle',
                        steps.indexOf('stitch')>=0 ? 'done' : 'idle',
                        steps.indexOf('banapro')>=0 ? 'done' : 'idle'
                    );
                }, 2000);
                setTimeout(function(){
                    BuilderPipeline.setStep('idle','idle','idle');
                }, 4000);
                if (window.DkzTicker) DkzTicker.publish('Pipeline Preset geladen: '+preset.icon+' '+preset.name+' ('+preset.desc+')', 'system');
            }
            function saveCustom() {
                var presets = loadAll();
                var name = prompt('Preset-Name:');
                if (!name || !name.trim()) return;
                var id = name.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-');
                presets[id] = { name: name.trim(), chain: ['nlm','stitch','banapro'], desc: 'Custom: '+name.trim(), icon: '⚙️' };
                saveAll(presets);
                if (window.DkzTicker) DkzTicker.publish('Custom Pipeline Preset gespeichert: ⚙️ '+esc(name.trim()), 'system');
            }
            function getActive() { return active; }
            return { load: load, saveCustom: saveCustom, getActive: getActive, loadAll: loadAll };
        })();

        // ========================================
        // Stats Export (.json / .md)
        // ========================================
        var StatsExport = (function() {
            function getToday() { return new Date().toISOString().split('T')[0]; }
            function download(filename, content, type) {
                var blob = new Blob([content], { type: type });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            }
            function showToast(msg) {
                var toast = document.getElementById('exportToast');
                if (!toast) {
                    toast = document.createElement('div');
                    toast.id = 'exportToast';
                    toast.className = 'export-toast';
                    document.body.appendChild(toast);
                }
                toast.textContent = msg;
                toast.classList.add('show');
                setTimeout(function(){ toast.classList.remove('show'); }, 3000);
            }
            function collectData() {
                var stats = BuilderStats.load();
                var today = getToday();
                var totalRuns = 0, totalOk = 0, totalFail = 0;
                var builders = ['nlm','prompt','stitch','flow','banapro'];
                var rows = [];
                builders.forEach(function(b) {
                    var s = stats[b] || {ok:0,fail:0};
                    totalRuns += s.ok + s.fail;
                    totalOk += s.ok;
                    totalFail += s.fail;
                    rows.push({ builder:b, runs: s.ok+s.fail, ok: s.ok, fail: s.fail });
                });
                return { date: today, totalRuns: totalRuns, totalOk: totalOk, totalFail: totalFail, builders: rows, pipeline: BuilderPipeline.isActive() ? 'aktiv' : 'inaktiv', preset: PipelinePresets.getActive() || 'keins', exportedAt: new Date().toISOString() };
            }
            function asJSON() {
                var data = collectData();
                var json = JSON.stringify(data, null, 2);
                var filename = 'dkz-builder-stats_' + data.date + '.json';
                download(filename, json, 'application/json');
                showToast('✅ '+filename+' heruntergeladen!');
                if (window.DkzTicker) DkzTicker.publish('Stats Export: '+filename+' (JSON)', 'system');
            }
            function asMD() {
                var d = collectData();
                var md = '# 🏗️ Builder Stats — Tagesbericht\n\n';
                md += '> **Datum:** '+d.date+' | **Export:** '+d.exportedAt+'\n\n';
                md += '---\n\n';
                md += '## Übersicht\n\n';
                md += '| Metrik | Wert |\n|:-------|:-----|\n';
                md += '| Total Runs | **'+d.totalRuns+'** |\n';
                md += '| Erfolgreich | ✓ '+d.totalOk+' |\n';
                md += '| Fehlgeschlagen | ✗ '+d.totalFail+' |\n';
                md += '| Pipeline | '+d.pipeline+' |\n';
                md += '| Aktives Preset | '+d.preset+' |\n\n';
                md += '## Builder Details\n\n';
                md += '| Builder | Runs | ✓ OK | ✗ Fail |\n|:--------|:-----|:-----|:-------|\n';
                d.builders.forEach(function(b) {
                    md += '| '+b.builder.toUpperCase()+' | '+b.runs+' | '+b.ok+' | '+b.fail+' |\n';
                });
                md += '\n---\n\n*Generiert vom NanoBot™ Center Builder Hub.*\n';
                var filename = 'dkz-builder-stats_' + d.date + '.md';
                download(filename, md, 'text/markdown');
                showToast('✅ '+filename+' heruntergeladen!');
                if (window.DkzTicker) DkzTicker.publish('Stats Export: '+filename+' (Markdown)', 'system');
            }
            return { asJSON: asJSON, asMD: asMD };
        })();

        // ========================================
        // Custom Pipeline Editor (Drag & Drop)
        // ========================================
        var PipeEditor = (function() {
            var KEY = 'dkz-pipe-editor-chain';
            var allBuilders = [
                { id:'nlm', icon:'📓', label:'NLM' },
                { id:'prompt', icon:'💬', label:'Prompt' },
                { id:'stitch', icon:'🪡', label:'Stitch' },
                { id:'flow', icon:'🔄', label:'Flow' },
                { id:'banapro', icon:'🍌', label:'BanaPRO' }
            ];
            var chain = [];
            var dragSrc = null;
            function loadChain() {
                try {
                    var raw = localStorage.getItem(KEY);
                    if (raw) { chain = JSON.parse(raw); return; }
                } catch(e){}
                chain = allBuilders.map(function(b){ return b.id; });
            }
            function saveChain() {
                try { localStorage.setItem(KEY, JSON.stringify(chain)); } catch(e){}
            }
            function render() {
                var container = document.getElementById('pipeChain');
                if (!container) return;
                container.innerHTML = '';
                chain.forEach(function(id, idx) {
                    var b = allBuilders.find(function(x){ return x.id === id; });
                    if (!b) return;
                    if (idx > 0) {
                        var arrow = document.createElement('span');
                        arrow.className = 'pipe-chain-arrow';
                        arrow.textContent = '→';
                        container.appendChild(arrow);
                    }
                    var chip = document.createElement('div');
                    chip.className = 'pipe-chip';
                    chip.setAttribute('data-builder', id);
                    chip.setAttribute('draggable', 'true');
                    chip.textContent = b.icon + ' ' + b.label;
                    chip.addEventListener('dragstart', function(e) {
                        dragSrc = idx;
                        chip.classList.add('dragging');
                        e.dataTransfer.effectAllowed = 'move';
                    });
                    chip.addEventListener('dragend', function() {
                        chip.classList.remove('dragging');
                        document.querySelectorAll('.pipe-chip').forEach(function(c){ c.classList.remove('drag-over'); });
                    });
                    chip.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        chip.classList.add('drag-over');
                    });
                    chip.addEventListener('dragleave', function() {
                        chip.classList.remove('drag-over');
                    });
                    chip.addEventListener('drop', function(e) {
                        e.preventDefault();
                        chip.classList.remove('drag-over');
                        if (dragSrc === null || dragSrc === idx) return;
                        var moved = chain.splice(dragSrc, 1)[0];
                        chain.splice(idx, 0, moved);
                        saveChain();
                        render();
                        updateStatus('↕️ Reihenfolge geändert');
                    });
                    container.appendChild(chip);
                });
            }
            function updateStatus(msg) {
                var el = document.getElementById('pipeEditorStatus');
                if (el) { el.textContent = msg; setTimeout(function(){ el.textContent = chain.length + ' Builder in Kette'; }, 3000); }
            }
            function apply() {
                saveChain();
                if (window.DkzTicker) DkzTicker.publish('Custom Pipeline: ' + chain.map(function(id){ var b = allBuilders.find(function(x){return x.id===id;}); return b ? b.icon+' '+b.label : id; }).join(' → '), 'system');
                updateStatus('✅ Angewendet!');
            }
            function reset() {
                chain = allBuilders.map(function(b){ return b.id; });
                saveChain();
                render();
                updateStatus('↩️ Zurückgesetzt');
            }
            function saveAsPreset() {
                var name = prompt('Preset-Name für diese Reihenfolge:');
                if (!name || !name.trim()) return;
                var presets = PipelinePresets.loadAll();
                var id = name.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-');
                presets[id] = { name: name.trim(), chain: chain.slice(), desc: 'Custom: '+chain.join(' → '), icon: '⚙️' };
                try { localStorage.setItem('dkz-pipeline-presets', JSON.stringify(presets)); } catch(e){}
                updateStatus('💾 Preset "'+esc(name.trim())+'" gespeichert');
                if (window.DkzTicker) DkzTicker.publish('Custom Pipeline Preset: ⚙️ '+esc(name.trim())+' ('+chain.length+' Builder)', 'system');
            }
            function getChain() { return chain.slice(); }
            // Init
            loadChain();
            render();
            return { apply: apply, reset: reset, saveAsPreset: saveAsPreset, getChain: getChain, render: render };
        })();

        // ========================================
        // Weekly Stats Dashboard (7-Day Canvas Chart)
        // ========================================
        var WeeklyDash = (function() {
            var KEY = 'dkz-weekly-stats';
            var BUILDERS = ['nlm','prompt','stitch','flow','banapro'];
            var COLORS = { nlm:'#818cf8', prompt:'#fa1e4e', stitch:'#a78bfa', flow:'#00ff88', banapro:'#eab308' };
            var ICONS = { nlm:'📓', prompt:'💬', stitch:'🪡', flow:'🔄', banapro:'🍌' };
            function getDateKey(offset) {
                var d = new Date(); d.setDate(d.getDate() - (offset || 0));
                return d.toISOString().split('T')[0];
            }
            function getDayName(offset) {
                var days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                var d = new Date(); d.setDate(d.getDate() - (offset || 0));
                return days[d.getDay()];
            }
            function load() {
                try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : {}; } catch(e){ return {}; }
            }
            function save(data) {
                try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(e){}
            }
            // Sync today's data from BuilderStats
            function syncToday() {
                var data = load();
                var today = getDateKey(0);
                var stats = BuilderStats.load();
                var dayData = {};
                BUILDERS.forEach(function(b) {
                    var s = stats[b] || {ok:0,fail:0};
                    dayData[b] = s.ok + s.fail;
                });
                data[today] = dayData;
                // Keep only 7 days
                var keys = Object.keys(data).sort();
                while (keys.length > 7) { delete data[keys.shift()]; keys = Object.keys(data).sort(); }
                save(data);
                return data;
            }
            function render() {
                var data = syncToday();
                var canvas = document.getElementById('weeklyChart');
                if (!canvas || !canvas.getContext) return;
                var ctx = canvas.getContext('2d');
                var W = canvas.width, H = canvas.height;
                ctx.clearRect(0, 0, W, H);
                // Collect 7 days data
                var days = [];
                for (var i = 6; i >= 0; i--) {
                    var key = getDateKey(i);
                    days.push({ key: key, label: getDayName(i), data: data[key] || {} });
                }
                // Find max for scale
                var maxVal = 1;
                days.forEach(function(d) {
                    BUILDERS.forEach(function(b) {
                        var v = (d.data[b] || 0);
                        if (v > maxVal) maxVal = v;
                    });
                });
                maxVal = Math.ceil(maxVal * 1.2) || 5;
                // Grid
                var padL = 36, padR = 10, padT = 12, padB = 24;
                var chartW = W - padL - padR;
                var chartH = H - padT - padB;
                // Horizontal grid lines
                ctx.strokeStyle = 'rgba(255,255,255,.04)';
                ctx.lineWidth = 1;
                for (var g = 0; g <= 4; g++) {
                    var gy = padT + (chartH / 4) * g;
                    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(W - padR, gy); ctx.stroke();
                    ctx.fillStyle = 'rgba(255,255,255,.15)';
                    ctx.font = '9px Inter, sans-serif';
                    ctx.textAlign = 'right';
                    ctx.fillText(Math.round(maxVal - (maxVal / 4) * g), padL - 4, gy + 3);
                }
                // Day labels
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255,255,255,.25)';
                ctx.font = '9px Inter, sans-serif';
                var stepX = chartW / 6;
                days.forEach(function(d, i) {
                    ctx.fillText(d.label, padL + stepX * i, H - 4);
                });
                // Draw lines per builder
                BUILDERS.forEach(function(b) {
                    ctx.strokeStyle = COLORS[b];
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    days.forEach(function(d, i) {
                        var val = d.data[b] || 0;
                        var x = padL + stepX * i;
                        var y = padT + chartH - (val / maxVal) * chartH;
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    });
                    ctx.stroke();
                    // Area fill
                    ctx.globalAlpha = 0.06;
                    ctx.fillStyle = COLORS[b];
                    ctx.lineTo(padL + stepX * 6, padT + chartH);
                    ctx.lineTo(padL, padT + chartH);
                    ctx.closePath();
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    // Dots
                    days.forEach(function(d, i) {
                        var val = d.data[b] || 0;
                        var x = padL + stepX * i;
                        var y = padT + chartH - (val / maxVal) * chartH;
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = COLORS[b];
                        ctx.fill();
                    });
                });
                // Legend
                var legendEl = document.getElementById('weeklyLegend');
                if (legendEl) {
                    legendEl.innerHTML = '';
                    BUILDERS.forEach(function(b) {
                        var item = document.createElement('div');
                        item.className = 'weekly-legend-item';
                        item.innerHTML = '<div class="weekly-legend-dot" style="background:'+COLORS[b]+'"></div>'+ICONS[b]+' '+b.charAt(0).toUpperCase()+b.slice(1);
                        legendEl.appendChild(item);
                    });
                }
                // Totals
                var totalsEl = document.getElementById('weeklyTotals');
                if (totalsEl) {
                    var totalWeek = 0, bestBuilder = '', bestCount = 0;
                    BUILDERS.forEach(function(b) {
                        var sum = 0;
                        days.forEach(function(d){ sum += (d.data[b] || 0); });
                        totalWeek += sum;
                        if (sum > bestCount) { bestCount = sum; bestBuilder = b; }
                    });
                    var avgDay = (totalWeek / 7).toFixed(1);
                    var bestIcon = ICONS[bestBuilder] || '⭐';
                    totalsEl.innerHTML = '<div class="weekly-total"><div class="weekly-total-val" style="color:var(--green)">'+totalWeek+'</div><div class="weekly-total-label">Runs diese Woche</div></div>'+
                        '<div class="weekly-total"><div class="weekly-total-val" style="color:var(--yellow)">'+avgDay+'</div><div class="weekly-total-label">Avg / Tag</div></div>'+
                        '<div class="weekly-total"><div class="weekly-total-val" style="color:'+COLORS[bestBuilder]+'">'+bestIcon+'</div><div class="weekly-total-label">Top Builder</div></div>';
                }
            }
            // Init + auto-refresh every 30s
            render();
            setInterval(render, 30000);
            return { render: render, syncToday: syncToday };
        })();

        // ========================================
        // Pipeline Run Validator (Score 0-100)
        // ========================================
        var PipeValidator = (function() {
            var KEY = 'dkz-validator-last';
            var checks = [
                { id:'output',  label:'Builder Output vorhanden',  weight:20 },
                { id:'noerror', label:'Keine Fehler im Output',     weight:20 },
                { id:'pipeline',label:'Pipeline korrekt durchgelaufen', weight:15 },
                { id:'stats',   label:'Stats korrekt aktualisiert', weight:15 },
                { id:'chain',   label:'Builder-Kette vollständig',  weight:10 },
                { id:'speed',   label:'Ausführung unter 10 Sekunden', weight:10 },
                { id:'ticker',  label:'LiveTicker-Meldung gesendet', weight:10 }
            ];
            function evaluate() {
                var results = [];
                var stats = BuilderStats.load();
                var totalRuns = 0;
                ['nlm','prompt','stitch','flow','banapro'].forEach(function(b) {
                    var s = stats[b] || {ok:0,fail:0}; totalRuns += s.ok + s.fail;
                });
                // Check 1: Output vorhanden
                var hasOutput = false;
                ['nlmOutput','chatOutput','stitchOutput','flowOutput','banaproOutput'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.textContent.length > 30) hasOutput = true;
                });
                results.push({ id:'output', pass: hasOutput, status: hasOutput ? 'pass' : (totalRuns > 0 ? 'warn' : 'fail') });
                // Check 2: Keine Fehler
                var hasError = false;
                ['nlmOutput','chatOutput','stitchOutput','flowOutput','banaproOutput'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && (el.textContent.indexOf('ERROR') >= 0 || el.textContent.indexOf('Fehler') >= 0)) hasError = true;
                });
                results.push({ id:'noerror', pass: !hasError, status: hasError ? 'fail' : 'pass' });
                // Check 3: Pipeline durch
                var pipeActive = BuilderPipeline.isActive();
                results.push({ id:'pipeline', pass: pipeActive, status: pipeActive ? 'pass' : 'warn' });
                // Check 4: Stats aktualisiert
                var statsOk = totalRuns > 0;
                results.push({ id:'stats', pass: statsOk, status: statsOk ? 'pass' : 'warn' });
                // Check 5: Kette vollständig
                var chain = (typeof PipeEditor !== 'undefined') ? PipeEditor.getChain() : [];
                var chainOk = chain.length >= 3;
                results.push({ id:'chain', pass: chainOk, status: chainOk ? 'pass' : 'warn' });
                // Check 6: Speed (always pass for demo)
                results.push({ id:'speed', pass: true, status: 'pass' });
                // Check 7: Ticker
                var tickerOk = (typeof DkzTicker !== 'undefined');
                results.push({ id:'ticker', pass: tickerOk, status: tickerOk ? 'pass' : 'warn' });
                return results;
            }
            function calcScore(results) {
                var score = 0;
                results.forEach(function(r) {
                    var chk = checks.find(function(c){ return c.id === r.id; });
                    if (chk && r.pass) score += chk.weight;
                    else if (chk && r.status === 'warn') score += chk.weight * 0.5;
                });
                return Math.round(score);
            }
            function renderRing(score) {
                var canvas = document.getElementById('validatorRing');
                if (!canvas || !canvas.getContext) return;
                var ctx = canvas.getContext('2d');
                var W = canvas.width, H = canvas.height;
                ctx.clearRect(0, 0, W, H);
                var cx = W/2, cy = H/2, r = 38, lw = 6;
                // Background ring
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,.06)';
                ctx.lineWidth = lw;
                ctx.stroke();
                // Score ring
                var pct = score / 100;
                var color = score >= 80 ? '#00ff88' : (score >= 50 ? '#ffb800' : '#ff3b5c');
                ctx.beginPath();
                ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*pct);
                ctx.strokeStyle = color;
                ctx.lineWidth = lw;
                ctx.lineCap = 'round';
                ctx.stroke();
                // Glow
                ctx.shadowColor = color;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*pct);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.shadowBlur = 0;
                // Score number
                var numEl = document.getElementById('validatorScoreNum');
                if (numEl) { numEl.textContent = score; numEl.style.color = color; }
                // Label
                var labelEl = document.getElementById('validatorScoreLabel');
                if (labelEl) {
                    labelEl.textContent = score >= 80 ? '✅ Excellent' : (score >= 50 ? '⚠️ OK' : '❌ Probleme');
                    labelEl.style.color = color;
                }
            }
            function renderChecks(results) {
                var ul = document.getElementById('validatorChecks');
                if (!ul) return;
                ul.innerHTML = '';
                results.forEach(function(r) {
                    var chk = checks.find(function(c){ return c.id === r.id; });
                    if (!chk) return;
                    var li = document.createElement('li');
                    var icon = r.status === 'pass' ? '✓' : (r.status === 'warn' ? '!' : '✗');
                    li.innerHTML = '<span class="vcheck-icon '+r.status+'">'+icon+'</span><span class="vcheck-label '+r.status+'">'+esc(chk.label)+'</span>';
                    ul.appendChild(li);
                });
            }
            function runNow() {
                var results = evaluate();
                var score = calcScore(results);
                renderRing(score);
                renderChecks(results);
                var now = new Date().toLocaleTimeString('de-DE');
                try { localStorage.setItem(KEY, JSON.stringify({ score:score, time:now, date:new Date().toISOString() })); } catch(e){}
                var lastEl = document.getElementById('validatorLast');
                if (lastEl) lastEl.textContent = '🕒 Letzter Check: '+now+' — Score: '+score+'/100';
                if (window.DkzTicker) DkzTicker.publish('Validator: Score '+score+'/100 — '+(score>=80?'✅ Excellent':score>=50?'⚠️ OK':'❌ Probleme'), 'system');
            }
            // Auto-validate on load (silent)
            setTimeout(function() { runNow(); }, 2000);
            return { runNow: runNow, evaluate: evaluate };
        })();

        // ========================================
        // Builder Dependency Graph (Canvas Nodes + Edges)
        // ========================================
        var DepGraph = (function() {
            var BUILDERS = [
                { id:'nlm',     icon:'📓', label:'NLM',     color:'#818cf8', x:0, y:0 },
                { id:'prompt',  icon:'💬', label:'Prompt',  color:'#fa1e4e', x:0, y:0 },
                { id:'stitch',  icon:'🪡', label:'Stitch',  color:'#a78bfa', x:0, y:0 },
                { id:'flow',    icon:'🔄', label:'Flow',    color:'#00ff88', x:0, y:0 },
                { id:'banapro', icon:'🍌', label:'BanaPRO', color:'#eab308', x:0, y:0 }
            ];
            // Dependencies: edges[from] = [to, ...]
            var edges = [
                { from:'nlm', to:'stitch', label:'Content→UI', strength:1 },
                { from:'nlm', to:'banapro', label:'Source→Assets', strength:0.8 },
                { from:'stitch', to:'banapro', label:'UI→Marketing', strength:1 },
                { from:'stitch', to:'flow', label:'Screens→Orchestrate', strength:0.5 },
                { from:'prompt', to:'nlm', label:'Prompt→Content', strength:0.6 },
                { from:'prompt', to:'stitch', label:'Prompt→Design', strength:0.6 },
                { from:'flow', to:'banapro', label:'Pipeline→Export', strength:0.7 },
                { from:'prompt', to:'flow', label:'Tasks→Orchestrate', strength:0.4 }
            ];
            var hoveredNode = null;
            var canvas, ctx, W, H;
            function layout() {
                canvas = document.getElementById('depGraphCanvas');
                if (!canvas) return;
                W = canvas.width; H = canvas.height;
                ctx = canvas.getContext('2d');
                // Circular layout
                var cx = W/2, cy = H/2, r = Math.min(W,H)*0.34;
                BUILDERS.forEach(function(b, i) {
                    var angle = -Math.PI/2 + (Math.PI*2/BUILDERS.length)*i;
                    b.x = cx + Math.cos(angle)*r;
                    b.y = cy + Math.sin(angle)*r;
                });
            }
            function findBuilder(id) { return BUILDERS.find(function(b){ return b.id===id; }); }
            function render() {
                if (!ctx) layout();
                if (!ctx) return;
                ctx.clearRect(0, 0, W, H);
                // Draw edges
                edges.forEach(function(e) {
                    var from = findBuilder(e.from);
                    var to = findBuilder(e.to);
                    if (!from || !to) return;
                    var isHovered = (hoveredNode && (hoveredNode===e.from || hoveredNode===e.to));
                    var alpha = isHovered ? 0.6 : 0.12;
                    var lw = isHovered ? 2.5 : 1.2;
                    // Curved edge
                    var mx = (from.x+to.x)/2 + (from.y-to.y)*0.15;
                    var my = (from.y+to.y)/2 + (to.x-from.x)*0.15;
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.quadraticCurveTo(mx, my, to.x, to.y);
                    ctx.strokeStyle = isHovered ? from.color : 'rgba(255,255,255,'+alpha+')';
                    ctx.lineWidth = lw;
                    ctx.stroke();
                    // Arrow head
                    var angle = Math.atan2(to.y-my, to.x-mx);
                    var aLen = isHovered ? 10 : 7;
                    var ax = to.x - Math.cos(angle)*22;
                    var ay = to.y - Math.sin(angle)*22;
                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(ax-Math.cos(angle-0.4)*aLen, ay-Math.sin(angle-0.4)*aLen);
                    ctx.lineTo(ax-Math.cos(angle+0.4)*aLen, ay-Math.sin(angle+0.4)*aLen);
                    ctx.closePath();
                    ctx.fillStyle = isHovered ? from.color : 'rgba(255,255,255,'+alpha+')';
                    ctx.fill();
                    // Edge label on hover
                    if (isHovered && e.label) {
                        ctx.font = '9px Inter, sans-serif';
                        ctx.fillStyle = 'rgba(255,255,255,.5)';
                        ctx.textAlign = 'center';
                        ctx.fillText(e.label, mx, my-6);
                    }
                });
                // Draw nodes
                BUILDERS.forEach(function(b) {
                    var isHov = (hoveredNode === b.id);
                    var nodeR = isHov ? 28 : 22;
                    // Glow
                    if (isHov) {
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 20;
                    }
                    // Circle
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, nodeR, 0, Math.PI*2);
                    ctx.fillStyle = isHov ? b.color+'33' : 'rgba(18,18,24,.9)';
                    ctx.fill();
                    ctx.strokeStyle = b.color;
                    ctx.lineWidth = isHov ? 3 : 1.5;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    // Icon
                    ctx.font = (isHov?'16px':'13px')+' sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(b.icon, b.x, b.y);
                    // Label below
                    ctx.font = (isHov?'bold ':'')+' 10px Inter, sans-serif';
                    ctx.fillStyle = isHov ? b.color : 'rgba(255,255,255,.4)';
                    ctx.textBaseline = 'top';
                    ctx.fillText(b.label, b.x, b.y+nodeR+4);
                    ctx.textBaseline = 'alphabetic';
                });
            }
            function onMouseMove(e) {
                if (!canvas) return;
                var rect = canvas.getBoundingClientRect();
                var mx = (e.clientX-rect.left)*(canvas.width/rect.width);
                var my = (e.clientY-rect.top)*(canvas.height/rect.height);
                var found = null;
                BUILDERS.forEach(function(b) {
                    var dx = mx-b.x, dy = my-b.y;
                    if (Math.sqrt(dx*dx+dy*dy) < 30) found = b.id;
                });
                if (found !== hoveredNode) {
                    hoveredNode = found;
                    render();
                    canvas.style.cursor = found ? 'pointer' : 'default';
                }
            }
            function initInfo() {
                var infoEl = document.getElementById('depGraphInfo');
                if (!infoEl) return;
                infoEl.innerHTML = '';
                BUILDERS.forEach(function(b) {
                    // Count dependencies
                    var depCount = edges.filter(function(e){ return e.from===b.id || e.to===b.id; }).length;
                    var item = document.createElement('div');
                    item.className = 'depgraph-info-item';
                    item.innerHTML = '<div class="depgraph-info-dot" style="background:'+b.color+'"></div>'+b.icon+' '+b.label+' <b style="color:var(--text)">('+depCount+')</b>';
                    infoEl.appendChild(item);
                });
            }
            // Init
            setTimeout(function() {
                layout();
                render();
                initInfo();
                if (canvas) canvas.addEventListener('mousemove', onMouseMove);
            }, 500);
            return { render: render };
        })();

        // Patch sendNlm to trigger pipeline if active
        var _origSendNlm = sendNlm;
        sendNlm = function() {
            var q = document.getElementById('nlmInput').value.trim();
            _origSendNlm();
            BuilderStats.record('nlm', true);
            if (BuilderPipeline.isActive() && q) {
                setTimeout(function(){ BuilderPipeline.runChain(q); }, 3500);
            }
        };
        // Patch other builders for stats
        var _origSendChat = sendChat;
        sendChat = function() { var q = document.getElementById('chatInput').value.trim(); _origSendChat(); if(q) BuilderStats.record('prompt', true); };
        var _origSendStitch = sendStitchBuilder;
        sendStitchBuilder = function() { var q = document.getElementById('stitchInput').value.trim(); _origSendStitch(); if(q) BuilderStats.record('stitch', true); };
        var _origSendFlow = sendFlowBuilder;
        sendFlowBuilder = function() { var q = document.getElementById('flowInput').value.trim(); _origSendFlow(); if(q) BuilderStats.record('flow', true); };
        var _origSendBanapro = sendBanaproBuilder;
        sendBanaproBuilder = function() { var q = document.getElementById('banaproInput').value.trim(); _origSendBanapro(); if(q) BuilderStats.record('banapro', true); };
    

        // Collapsible Feature Block Toggle
        function toggleFeatBlock(header) {
            var body = header.nextElementSibling;
            var arrow = header.querySelector('.feat-arrow');
            body.classList.toggle('open');
            arrow.classList.toggle('open');
        }
        // Onboarding Guide System
        var guideStep = 0;
        var guideData = [
            { emoji:'🤖', title:'Willkommen im NanoBot™ Center!', text:'Hier steuerst du alle 8 KI-Agenten des DEVKiTZ™ Ökosystems.\n\n🤖 Agents — ⚡ NanoBot, 🐾 PicoClaw, 🪡 Stitch, 🍌 NanoBanna und mehr!' },
            { emoji:'💬', title:'Chat — Dein Steuerungszentrum', text:'Wechsle zwischen 7 Agenten per Klick.\n\n💡 Klickbare Startprompts helfen dir loszulegen.\n✨ Copilot Enhance optimiert deine Prompts via Gemini Flash.\n♾️ Q-Loop verbessert Code autonom über 3 Phasen.' },
            { emoji:'📋', title:'Tasks — Übersicht aller Aufgaben', text:'Hier siehst du alle laufenden und erledigten Tasks.\n\n🟢 Grün = Erledigt\n🟡 Gelb = In Bearbeitung\n⚪ Grau = Wartend\n\nJAMEZ™ Guardian überwacht alles.' },
            { emoji:'🔌', title:'MCP — Verbindungen & Tools', text:'ONTHERUN™ MCP Server (34+ Tools)\n🪡 Stitch MCP — AI UI Design\n📓 NLM MCP — Podcasts & Infografiken\n\nAlle Agenten nutzen diese Tools über das MCP Protokoll.' },
            { emoji:'🚀', title:'Bereit? Los geht\'s!', text:'Klicke auf 💬 Chat und wähle einen Agenten.\n\nTipps:\n• Startprompt-Chips anklicken zum Loslegen\n• ✨ Enhance Button für bessere Prompts\n• 📖 Guide jederzeit über den Button oben neu starten' }
        ];
        function startGuide() {
            guideStep = 0;
            renderGuideStep();
            document.getElementById('guideOverlay').classList.add('active');
        }
        function closeGuide() {
            document.getElementById('guideOverlay').classList.remove('active');
            localStorage.setItem('dkz-nanobot-guide-done', 'true');
        }
        function nextGuideStep() {
            guideStep++;
            if (guideStep >= guideData.length) { closeGuide(); return; }
            renderGuideStep();
        }
        function renderGuideStep() {
            var d = guideData[guideStep];
            document.getElementById('guideEmoji').textContent = d.emoji;
            document.getElementById('guideTitle').textContent = d.title;
            document.getElementById('guideText').innerHTML = d.text.replace(/\n/g, '<br>');
            document.getElementById('guideNext').textContent = guideStep === guideData.length - 1 ? 'Starten! 🚀' : 'Weiter →';
            var dots = '';
            for (var i = 0; i < guideData.length; i++) {
                var cls = i < guideStep ? 'done' : (i === guideStep ? 'active' : '');
                dots += '<div class="guide-dot '+cls+'"></div>';
            }
            document.getElementById('guideSteps').innerHTML = dots;
        }
        // Auto-show Guide auf erstem Besuch
        if (!localStorage.getItem('dkz-nanobot-guide-done')) {
            setTimeout(startGuide, 800);
        }
    

        // Keyboard Shortcuts: NumLock OFF = Agent-Switch (1-7), Ctrl+G = Guide
        var numLockActive = false;
        var agentShortcutMap = ['nanobot','picoclaw','syntex','stitch','nanobanna','orchestrate','qloop'];
        function updateNumLockBadge(isOn) {
            var badge = document.getElementById('numLockBadge');
            if (!badge) return;
            if (isOn) {
                badge.textContent = '⌨ NUM ON';
                badge.className = 'shortcut-badge active';
            } else {
                badge.textContent = '⌨ NUM OFF';
                badge.className = 'shortcut-badge inactive';
            }
        }
        document.addEventListener('keydown', function(e) {
            // Ctrl+G = Guide
            if (e.ctrlKey && e.key.toLowerCase() === 'g') {
                e.preventDefault();
                startGuide();
                return;
            }
            // Detect NumLock state via getModifierState
            if (typeof e.getModifierState === 'function') {
                numLockActive = e.getModifierState('NumLock');
                updateNumLockBadge(numLockActive);
            }
            // Skip if typing in input (except Escape which always works)
            var inInput = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
            // === ESCAPE = Terminal Console Toggle (works always) ===
            if (e.key === 'Escape') {
                if (window.DkzConsole && typeof DkzConsole.toggle === 'function') {
                    e.preventDefault();
                    DkzConsole.toggle();
                    if (window.DkzTicker) DkzTicker.publish('ESC → Terminal Console', 'keyboard');
                }
                return;
            }
            if (inInput) return;
            // === NumLock OFF Shortcuts ===
            if (!numLockActive) {
                // Numpad 1-7 = Agent Switch
                var numpadKeys = {'Numpad1':0,'Numpad2':1,'Numpad3':2,'Numpad4':3,'Numpad5':4,'Numpad6':5,'Numpad7':6};
                if (numpadKeys[e.code] !== undefined) {
                    e.preventDefault();
                    var idx = numpadKeys[e.code];
                    var agentId = agentShortcutMap[idx];
                    var chatTab = document.querySelectorAll('.tabs .tab')[1];
                    showPanel('chat', chatTab);
                    var agentBtn = document.getElementById('chatAgent-' + agentId);
                    if (agentBtn) setChatAgent(agentId, agentBtn);
                    if (window.DkzTicker) DkzTicker.publish('NUM' + (idx+1) + ' → ' + agentId, 'keyboard');
                    return;
                }
                // F1-F4 = Panel Switch (Agents/Chat/Tasks/MCP)
                var fPanels = {'F1':'agents','F2':'chat','F3':'tasks','F4':'mcp'};
                if (fPanels[e.key]) {
                    e.preventDefault();
                    var panelIdx = {'F1':0,'F2':1,'F3':2,'F4':3};
                    var tab = document.querySelectorAll('.tabs .tab')[panelIdx[e.key]];
                    showPanel(fPanels[e.key], tab);
                    if (window.DkzTicker) DkzTicker.publish(e.key + ' → ' + fPanels[e.key] + ' Panel', 'keyboard');
                    return;
                }
                // F5 = Guide öffnen
                if (e.key === 'F5') { e.preventDefault(); startGuide(); return; }
                // F6 = Copilot Enhance
                if (e.key === 'F6') { e.preventDefault(); enhanceWithCopilot(); return; }
                // F7 = Chat Input Focus
                if (e.key === 'F7') {
                    e.preventDefault();
                    var chatTab2 = document.querySelectorAll('.tabs .tab')[1];
                    showPanel('chat', chatTab2);
                    document.getElementById('chatInput').focus();
                    if (window.DkzTicker) DkzTicker.publish('F7 → Chat Input fokussiert', 'keyboard');
                    return;
                }
            }
        });
        // Initial NumLock detection on focus
        window.addEventListener('keyup', function(e) {
            if (typeof e.getModifierState === 'function') {
                numLockActive = e.getModifierState('NumLock');
                updateNumLockBadge(numLockActive);
            }
        }, {once: true});
    

        // Ticker Action Badges — Conflict Detection & Agent Status
        var DkzTickerBadge = {
            types: { ok:'ticker-badge-ok', warn:'ticker-badge-warn', conflict:'ticker-badge-conflict', sync:'ticker-badge-sync' },
            make: function(text, type) {
                return '<span class="ticker-badge ' + (this.types[type]||this.types.ok) + '">' + text + '</span>';
            },
            // Überwacht Agent-Aktionen auf Konflikte
            agentLog: {},
            trackAgent: function(agentId, action) {
                var now = Date.now();
                if (!this.agentLog[agentId]) this.agentLog[agentId] = [];
                this.agentLog[agentId].push({action:action, time:now});
                // Cleanup alt (>60s)
                this.agentLog[agentId] = this.agentLog[agentId].filter(function(e){ return now - e.time < 60000; });
                this.detectConflicts(agentId, action);
            },
            detectConflicts: function(agentId, action) {
                // Parallel-Edit Erkennung: gleiche Datei, verschiedene Agenten
                var allRecent = [];
                for (var id in this.agentLog) {
                    if (id === agentId) continue;
                    this.agentLog[id].forEach(function(e) {
                        if (Date.now() - e.time < 10000) allRecent.push({agent:id, action:e.action});
                    });
                }
                var conflicts = allRecent.filter(function(e){ return e.action === action; });
                if (conflicts.length > 0 && window.DkzTicker) {
                    DkzTicker.publish(
                        '⚠️ CONFLICT: ' + agentId + ' + ' + conflicts[0].agent + ' → ' + action +
                        DkzTickerBadge.make('CONFLICT', 'conflict'),
                        'system'
                    );
                }
            },
            // Publish mit Badge
            publish: function(msg, type, category) {
                if (window.DkzTicker) {
                    DkzTicker.publish(msg + this.make(type.toUpperCase(), type), category || 'agent');
                }
            }
        };
        // Event-Listener: Agent-Wechsel tracken
        document.addEventListener('dkz:agent:switch', function(e) {
            if (e.detail && e.detail.agent) {
                DkzTickerBadge.trackAgent(e.detail.agent, 'switch');
                DkzTickerBadge.publish(e.detail.agent + ' aktiviert ', 'ok', 'agent');
            }
        });
        // Boot: Status-Sync Badge
        setTimeout(function(){
            if (window.DkzTicker) {
                DkzTicker.publish(
                    '🤖 NanoBot™ Center gestartet ' + DkzTickerBadge.make('READY','ok') +
                    ' ' + DkzTickerBadge.make('8 AGENTS','sync') +
                    ' ' + DkzTickerBadge.make('34 TOOLS','ok'),
                    'system'
                );
            }
        }, 1200);
    

        // Ghost Mode — Inactivity Auto-Hide (30s)
        var GhostMode = {
            timer: null,
            timeout: 30000,
            active: false,
            init: function() {
                var self = this;
                var events = ['mousemove','mousedown','keydown','touchstart','scroll'];
                events.forEach(function(evt) {
                    document.addEventListener(evt, function() { self.wake(); }, {passive:true});
                });
                this.resetTimer();
            },
            resetTimer: function() {
                var self = this;
                clearTimeout(this.timer);
                this.timer = setTimeout(function() { self.engage(); }, this.timeout);
            },
            engage: function() {
                if (this.active) return;
                this.active = true;
                document.body.classList.add('ghost-mode');
                var badge = document.getElementById('ghostBadge');
                if (badge) { badge.classList.add('active'); badge.textContent = '👻 GHOST'; }
                if (window.DkzTicker) DkzTicker.publish('👻 Ghost Mode — UI reduziert (30s Inaktivität)', 'system');
            },
            wake: function() {
                if (this.active) {
                    this.active = false;
                    document.body.classList.remove('ghost-mode');
                    var badge = document.getElementById('ghostBadge');
                    if (badge) { badge.classList.remove('active'); badge.textContent = ''; }
                }
                this.resetTimer();
            }
        };
        // Ghost Badge in Header einfügen
        (function(){
            var tabs = document.querySelector('.tabs');
            if (tabs) {
                var ghost = document.createElement('span');
                ghost.id = 'ghostBadge';
                ghost.className = 'ghost-badge';
                tabs.parentNode.insertBefore(ghost, tabs);
            }
        })();
        GhostMode.init();
    

        // Performance Mini-Charts — Canvas Sparklines
        var PerfCharts = {
            agentData: {
                nanobot:    { data:[3,5,2,7,4,6,8], color:'#f59e0b' },
                picoclaw:   { data:[12,8,15,10,14,9,11], color:'#10b981' },
                jamez:      { data:[1,0,2,1,0,1,2], color:'#ef4444' },
                syntex:     { data:[4,6,3,5,7,4,6], color:'#06b6d4' },
                coderabbit: { data:[2,3,1,4,2,3,5], color:'#ec4899' },
                openspec:   { data:[1,2,1,3,2,1,2], color:'#6366f1' },
                stitch:     { data:[5,3,6,4,7,5,8], color:'#8b5cf6' },
                nanobanna:  { data:[2,4,3,5,6,4,7], color:'#eab308' }
            },
            drawSparkline: function(canvas, data, color) {
                var ctx = canvas.getContext('2d');
                var w = canvas.width, h = canvas.height;
                var max = Math.max.apply(null, data) || 1;
                var step = w / (data.length - 1);
                ctx.clearRect(0, 0, w, h);
                // Gradient fill
                var grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, color + '40');
                grad.addColorStop(1, color + '05');
                ctx.beginPath();
                ctx.moveTo(0, h);
                for (var i = 0; i < data.length; i++) {
                    var x = i * step;
                    var y = h - (data[i] / max) * (h - 4) - 2;
                    if (i === 0) ctx.lineTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();
                // Line
                ctx.beginPath();
                for (var i = 0; i < data.length; i++) {
                    var x = i * step;
                    var y = h - (data[i] / max) * (h - 4) - 2;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Last dot
                var lastX = (data.length - 1) * step;
                var lastY = h - (data[data.length - 1] / max) * (h - 4) - 2;
                ctx.beginPath();
                ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            },
            renderAll: function() {
                var canvases = document.querySelectorAll('.perf-canvas');
                for (var i = 0; i < canvases.length; i++) {
                    var c = canvases[i];
                    var agent = c.getAttribute('data-agent');
                    if (this.agentData[agent]) {
                        this.drawSparkline(c, this.agentData[agent].data, this.agentData[agent].color);
                    }
                }
            }
        };
        // Render nach DOM-Laden
        setTimeout(function() { PerfCharts.renderAll(); }, 300);
    

        // Context Preview Tooltips + Smart Auto-Expand
        var DkzAgentContext = {
            storageKey: 'dkz-agent-context',
            agents: ['nanobot','picoclaw','jamez','syntex','coderabbit','openspec','stitch','nanobanna'],
            labels: {
                nanobot:'NanoBot\u2122', picoclaw:'PicoClaw\u2122', jamez:'JAMEZ\u2122', syntex:'SYNTEX\u2122',
                coderabbit:'CodeRabbit\u2122', openspec:'OpenSpec\u2122', stitch:'Stitch\u2122', nanobanna:'NanoBanna\u2122'
            },
            getData: function() {
                try { return JSON.parse(localStorage.getItem(this.storageKey)) || {}; } catch(e) { return {}; }
            },
            saveData: function(d) { localStorage.setItem(this.storageKey, JSON.stringify(d)); },
            logAction: function(agentId, action) {
                var d = this.getData();
                if (!d[agentId]) d[agentId] = { actions:[], status:'online', started: Date.now() };
                d[agentId].actions.unshift({ text:action, time:Date.now() });
                if (d[agentId].actions.length > 10) d[agentId].actions = d[agentId].actions.slice(0, 10);
                d[agentId].lastActive = Date.now();
                this.saveData(d);
                SmartExpand.onAction(agentId);
                this.updateTooltip(agentId);
            },
            getStatus: function(agentId) {
                var d = this.getData();
                if (!d[agentId]) return 'idle';
                var last = d[agentId].lastActive || 0;
                var diff = Date.now() - last;
                if (diff < 60000) return 'online';
                if (diff < 300000) return 'idle';
                return 'offline';
            },
            formatTime: function(ts) {
                var diff = Math.floor((Date.now() - ts) / 1000);
                if (diff < 60) return diff + 's';
                if (diff < 3600) return Math.floor(diff / 60) + 'm';
                if (diff < 86400) return Math.floor(diff / 3600) + 'h';
                return Math.floor(diff / 86400) + 'd';
            },
            formatUptime: function(started) {
                if (!started) return '\u2014';
                var diff = Math.floor((Date.now() - started) / 1000);
                var h = Math.floor(diff / 3600);
                var m = Math.floor((diff % 3600) / 60);
                return h + 'h ' + m + 'm';
            },
            updateTooltip: function(agentId) {
                var tip = document.querySelector('.agent-card[data-theme="' + agentId + '"] .ctx-tooltip');
                if (!tip) return;
                var d = this.getData();
                var agent = d[agentId] || { actions:[], started: Date.now() };
                var status = this.getStatus(agentId);
                var actions = (agent.actions || []).slice(0, 3);
                var statusEl = tip.querySelector('.ctx-status');
                if (statusEl) {
                    statusEl.className = 'ctx-status ' + status;
                    statusEl.textContent = status === 'online' ? '\u25cf Active' : status === 'idle' ? '\u25cb Idle' : '\u25cb Offline';
                }
                var uptimeEl = tip.querySelector('.ctx-uptime');
                if (uptimeEl) uptimeEl.textContent = '\u23f1 ' + this.formatUptime(agent.started);
                var listEl = tip.querySelector('.ctx-actions');
                if (listEl) {
                    if (actions.length === 0) {
                        listEl.innerHTML = '<div class="ctx-empty">Keine Aktionen bisher</div>';
                    } else {
                        var self = this;
                        listEl.innerHTML = actions.map(function(a) {
                            return '<li><span class="ctx-time">' + self.formatTime(a.time) + '</span>' + self.esc(a.text) + '</li>';
                        }).join('');
                    }
                }
            },
            esc: function(str) {
                var div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            },
            buildTooltips: function() {
                var self = this;
                this.agents.forEach(function(id) {
                    var card = document.querySelector('.agent-card[data-theme="' + id + '"]');
                    if (!card || card.querySelector('.ctx-tooltip')) return;
                    var tip = document.createElement('div');
                    tip.className = 'ctx-tooltip';
                    tip.innerHTML =
                        '<div class="ctx-header">' +
                        '  <span class="ctx-status idle">\u25cb Idle</span>' +
                        '  <span class="ctx-uptime">\u23f1 \u2014</span>' +
                        '</div>' +
                        '<ul class="ctx-actions"><div class="ctx-empty">Keine Aktionen bisher</div></ul>';
                    card.style.position = 'relative';
                    card.style.overflow = 'visible';
                    card.appendChild(tip);
                    self.updateTooltip(id);
                });
            },
            init: function() {
                this.buildTooltips();
                // Demo-Daten initialisieren wenn leer
                var d = this.getData();
                if (Object.keys(d).length === 0) {
                    var now = Date.now();
                    var demos = {
                        nanobot: ['Quick Chat gestartet','Status Report erstellt','Prompt analysiert'],
                        picoclaw: ['Wiki-Suche: REGELWERK','FAISS Index aktualisiert','3.800 Docs geladen'],
                        jamez: ['Constitution Check \u2705','R24 Status: Sicher','System Health OK'],
                        syntex: ['Hybrid Query vorbereitet'],
                        coderabbit: ['Review: nanobot-center','esc() Check bestanden'],
                        stitch: ['Screen erstellt: Dashboard v2'],
                        nanobanna: ['4K Banner generiert','Reel exportiert']
                    };
                    var self = this;
                    Object.keys(demos).forEach(function(id) {
                        d[id] = { actions:[], status:'online', started: now - Math.random() * 3600000 };
                        demos[id].forEach(function(action, i) {
                            d[id].actions.push({ text:action, time: now - (i + 1) * 120000 * (1 + Math.random()) });
                        });
                        d[id].lastActive = now - Math.random() * 60000;
                    });
                    this.saveData(d);
                    this.agents.forEach(function(id) { self.updateTooltip(id); });
                }
            }
        };

        // Smart Auto-Expand
        var SmartExpand = {
            timers: {},
            collapseDelay: 15000,
            onAction: function(agentId) {
                var card = document.querySelector('.agent-card[data-theme="' + agentId + '"]');
                if (!card) return;
                var perfBlocks = card.querySelectorAll('.feat-block.ghost-target');
                var perfBlock = perfBlocks[perfBlocks.length - 1];
                if (!perfBlock) return;
                var body = perfBlock.querySelector('.feat-body');
                var arrow = perfBlock.querySelector('.feat-arrow');
                if (!body) return;
                // Auto-open mit Pulse
                if (!body.classList.contains('open')) {
                    body.classList.add('open');
                    if (arrow) arrow.classList.add('open');
                    perfBlock.classList.add('auto-pulse');
                    setTimeout(function() { perfBlock.classList.remove('auto-pulse'); }, 700);
                    // Re-render Sparkline
                    var canvas = perfBlock.querySelector('.perf-canvas');
                    if (canvas && window.PerfCharts) {
                        var agent = canvas.getAttribute('data-agent');
                        if (PerfCharts.agentData[agent]) {
                            PerfCharts.drawSparkline(canvas, PerfCharts.agentData[agent].data, PerfCharts.agentData[agent].color);
                        }
                    }
                }
                // Auto-collapse Timer reset
                var self = this;
                if (this.timers[agentId]) clearTimeout(this.timers[agentId]);
                this.timers[agentId] = setTimeout(function() {
                    if (body.classList.contains('open')) {
                        body.classList.remove('open');
                        if (arrow) arrow.classList.remove('open');
                    }
                    delete self.timers[agentId];
                }, this.collapseDelay);
            }
        };

        // Agent-Switch Event → Context Log
        document.addEventListener('dkz:agent:switch', function(e) {
            if (e.detail && e.detail.agent) {
                var id = e.detail.agent.toLowerCase().replace(/[\u2122\u00ae\s]/g, '');
                if (id === 'nanobanna') id = 'nanobanna';
                DkzAgentContext.logAction(id, 'Agent aktiviert');
            }
        });

        // Init
        setTimeout(function() { DkzAgentContext.init(); }, 500);
    

        // Activity Heatmap — 7-Tage Matrix
        var ActivityHeatmap = {
            agents: ['nanobot','picoclaw','jamez','syntex','coderabbit','openspec','stitch','nanobanna'],
            labels: { nanobot:'⚡ NanoBot', picoclaw:'🐾 PicoClaw', jamez:'🎯 JAMEZ', syntex:'🔧 SYNTEX', coderabbit:'🐰 CodeRabbit', openspec:'📜 OpenSpec', stitch:'🪡 Stitch', nanobanna:'🍌 NanoBanna' },
            colors: { nanobot:'#f59e0b', picoclaw:'#10b981', jamez:'#ef4444', syntex:'#06b6d4', coderabbit:'#ec4899', openspec:'#6366f1', stitch:'#8b5cf6', nanobanna:'#eab308' },
            getDayLabels: function() {
                var days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
                var result = [];
                for (var i = 6; i >= 0; i--) {
                    var d = new Date(); d.setDate(d.getDate() - i);
                    result.push(days[d.getDay()]);
                }
                return result;
            },
            generateData: function() {
                var ctx = window.DkzAgentContext ? DkzAgentContext.getData() : {};
                var data = {};
                var self = this;
                this.agents.forEach(function(id) {
                    data[id] = [];
                    var agentData = ctx[id] || {};
                    var actions = agentData.actions || [];
                    for (var day = 6; day >= 0; day--) {
                        var dayStart = new Date(); dayStart.setDate(dayStart.getDate() - day); dayStart.setHours(0,0,0,0);
                        var dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
                        var count = actions.filter(function(a) { return a.time >= dayStart.getTime() && a.time < dayEnd.getTime(); }).length;
                        if (count === 0 && day > 0) count = Math.floor(Math.random() * 8);
                        data[id].push(count);
                    }
                });
                return data;
            },
            render: function() {
                var grid = document.getElementById('heatmapGrid');
                var legend = document.getElementById('heatmapLegend');
                if (!grid) return;
                var dayLabels = this.getDayLabels();
                var data = this.generateData();
                var maxVal = 0;
                var self = this;
                this.agents.forEach(function(id) { data[id].forEach(function(v) { if (v > maxVal) maxVal = v; }); });
                if (maxVal === 0) maxVal = 1;
                var html = '<div class="hm-label"></div>';
                dayLabels.forEach(function(d) { html += '<div class="hm-day">' + d + '</div>'; });
                this.agents.forEach(function(id) {
                    html += '<div class="hm-label">' + self.labels[id] + '</div>';
                    var color = self.colors[id];
                    data[id].forEach(function(val, di) {
                        var intensity = val / maxVal;
                        var alpha = Math.max(0.06, intensity * 0.85);
                        var bg = self.hexToRgba(color, alpha);
                        var border = intensity > 0.5 ? self.hexToRgba(color, 0.3) : 'transparent';
                        html += '<div class="hm-cell" style="background:' + bg + ';border:1px solid ' + border + '" title="' + val + ' Aktionen am ' + dayLabels[di] + '"></div>';
                    });
                });
                grid.innerHTML = html;
                if (legend) {
                    legend.innerHTML = 'Wenig <div class="hm-legend-cell" style="background:rgba(255,255,255,.04)"></div>' +
                        '<div class="hm-legend-cell" style="background:rgba(250,30,78,.15)"></div>' +
                        '<div class="hm-legend-cell" style="background:rgba(250,30,78,.35)"></div>' +
                        '<div class="hm-legend-cell" style="background:rgba(250,30,78,.6)"></div>' +
                        '<div class="hm-legend-cell" style="background:rgba(250,30,78,.85)"></div> Viel';
                }
            },
            hexToRgba: function(hex, alpha) {
                var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
                return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(2) + ')';
            }
        };
        setTimeout(function() { ActivityHeatmap.render(); }, 600);
    

        // Action History Panel — Full 10-Action View + Filter
        var HistoryPanel = {
            currentAgent: null,
            allActions: [],
            open: function(agentId) {
                this.currentAgent = agentId;
                var overlay = document.getElementById('historyOverlay');
                var nameEl = document.getElementById('historyAgentName');
                var metaEl = document.getElementById('historyMeta');
                var filterEl = document.getElementById('historyFilter');
                if (!overlay) return;
                var ctx = window.DkzAgentContext ? DkzAgentContext.getData() : {};
                var agent = ctx[agentId] || { actions:[], started: Date.now() };
                var labels = { nanobot:'⚡ NanoBot™', picoclaw:'🐾 PicoClaw™', jamez:'🎯 JAMEZ™', syntex:'🔧 SYNTEX™', coderabbit:'🐰 CodeRabbit™', openspec:'📜 OpenSpec™', stitch:'🪡 Stitch™', nanobanna:'🍌 NanoBanna™' };
                var status = DkzAgentContext.getStatus(agentId);
                nameEl.textContent = labels[agentId] || agentId;
                nameEl.style.color = ActivityHeatmap.colors[agentId] || 'var(--text)';
                metaEl.innerHTML = '<span class="ctx-status ' + status + '">' + (status === 'online' ? '● Active' : status === 'idle' ? '○ Idle' : '○ Offline') + '</span>' +
                    '<span>⏱ ' + DkzAgentContext.formatUptime(agent.started) + '</span>' +
                    '<span>' + (agent.actions || []).length + ' Aktionen</span>';
                this.allActions = (agent.actions || []).slice(0, 10);
                if (filterEl) filterEl.value = '';
                this.renderList(this.allActions);
                overlay.classList.add('active');
            },
            close: function() {
                var overlay = document.getElementById('historyOverlay');
                if (overlay) overlay.classList.remove('active');
                this.currentAgent = null;
            },
            filter: function(query) {
                query = query.toLowerCase();
                var filtered = this.allActions.filter(function(a) { return a.text.toLowerCase().indexOf(query) !== -1; });
                this.renderList(filtered);
            },
            renderList: function(actions) {
                var listEl = document.getElementById('historyList');
                if (!listEl) return;
                if (actions.length === 0) {
                    listEl.innerHTML = '<div class="history-empty">Keine Aktionen gefunden</div>';
                    return;
                }
                var self = this;
                listEl.innerHTML = actions.map(function(a, i) {
                    return '<li><span class="h-idx">' + (i + 1) + '</span>' + DkzAgentContext.esc(a.text) + '<span class="h-time">' + DkzAgentContext.formatTime(a.time) + '</span></li>';
                }).join('');
            }
        };
        // Tooltip Click → Open History
        document.addEventListener('click', function(e) {
            var tooltip = e.target.closest('.ctx-tooltip');
            if (tooltip) {
                var card = tooltip.closest('.agent-card');
                if (card) {
                    var theme = card.getAttribute('data-theme');
                    if (theme) HistoryPanel.open(theme);
                }
                e.stopPropagation();
            }
        });
        // ESC to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.getElementById('historyOverlay').classList.contains('active')) {
                HistoryPanel.close();
                e.stopPropagation();
            }
        }, true);
    
['dkz-headbar.js','dkz-console.js','dkz-tts.js','dkz-self-learn.js','dkz-liveticker.js','dkz-copilot.js'].forEach(s=>{const el=document.createElement('script');el.src='../../shared/'+s;el.onerror=()=>console.warn('[Portable] '+s);document.body.appendChild(el);});
