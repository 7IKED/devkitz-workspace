/**
 * DkZ Copilot UI Tuner
 * Injects an intelligent input bar overlay with navi & gsh integration into OpenCode Web UI.
 */

(function () {
    if (window._dkzTunerInitialized) return;
    window._dkzTunerInitialized = true;

    console.log("%c[DkZ] Copilot UI Tuner initialized.", "color: #fa1e4e; font-weight: bold;");

    // DkZ Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .dkz-overlay {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 800px;
            background: rgba(14, 14, 16, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(250, 30, 78, 0.3);
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 0 30px rgba(250, 30, 78, 0.15);
            z-index: 9999;
            display: none;
            pointer-events: none;
            color: #e8e8ef;
            font-family: 'JetBrains Mono', monospace;
        }

        .dkz-overlay.active {
            display: block;
            pointer-events: auto;
            animation: slideUp 0.3s ease-out;
        }

        .dkz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 8px;
            margin-bottom: 12px;
        }

        .dkz-title {
            color: #fa1e4e;
            font-weight: 800;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .dkz-options {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 16px;
        }

        .dkz-option {
            background: rgba(255, 255, 255, 0.03);
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .dkz-option:hover {
            border-color: #fa1e4e;
            background: rgba(250, 30, 78, 0.1);
        }

        .dkz-navi-results {
            max-height: 150px;
            overflow-y: auto;
            border-top: 1px dashed rgba(255, 255, 255, 0.1);
            padding-top: 8px;
        }

        .dkz-navi-item {
            padding: 6px 8px;
            font-size: 0.8rem;
            cursor: pointer;
            border-radius: 4px;
        }
        .dkz-navi-item:hover {
            background: rgba(57, 255, 20, 0.15);
            color: #39ff14;
        }

        .dkz-navi-cmd {
            color: #a855f7;
            font-weight: bold;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
    `;
    document.head.appendChild(style);

    // Create Panel
    const panel = document.createElement('div');
    panel.className = 'dkz-overlay';
    panel.innerHTML = `
        <div class="dkz-header">
            <span class="dkz-title">🔌 DkZ Advanced Options & Navi</span>
            <span style="font-size: 0.7rem; color: #8a8a9a;">Mode: AUTO</span>
        </div>
        <div class="dkz-options">
            <div class="dkz-option">🌡 Temp: 0.7</div>
            <div class="dkz-option">🧠 Context: 128K</div>
            <div class="dkz-option">🛠 Tools: gsh, navi</div>
        </div>
        <div class="dkz-navi-results" id="dkzNaviResults">
            <!-- Results injected here -->
        </div>
    `;
    document.body.appendChild(panel);

    const naviCheatsheets = [
        { desc: "Git Commit & Push", cmd: "git add . && git commit -m 'update' && git push" },
        { desc: "Docker Compose Up", cmd: "docker-compose up -d --build" },
        { desc: "Kill Port 4096", cmd: "npx kill-port 4096" },
        { desc: "Find Logs", cmd: "find . -name '*.log' -type f" }
    ];

    function renderNavi(query) {
        const resultsBox = document.getElementById('dkzNaviResults');
        resultsBox.innerHTML = '';
        
        const filtered = naviCheatsheets.filter(c => c.desc.toLowerCase().includes(query) || c.cmd.toLowerCase().includes(query));
        
        if (filtered.length === 0) {
            resultsBox.innerHTML = '<div class="dkz-navi-item" style="color:#8a8a9a">No navi matches... Press $ to use GSH directly.</div>';
            return;
        }

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'dkz-navi-item';
            div.innerHTML = `<span>${item.desc}</span> <span class="dkz-navi-cmd">➜ ${item.cmd}</span>`;
            div.onclick = () => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                    textarea.value = item.cmd;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    panel.classList.remove('active');
                }
            };
            resultsBox.appendChild(div);
        });
    }

    // Input Interception
    setInterval(() => {
        const input = document.querySelector('textarea');
        if (!input || input.dataset.dkzBound) return;
        
        input.dataset.dkzBound = "true";
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.startsWith('/')) {
                panel.classList.add('active');
                renderNavi(val.substring(1).toLowerCase());
            } else if (val.startsWith('$')) {
                panel.classList.add('active');
                document.getElementById('dkzNaviResults').innerHTML = '<div class="dkz-navi-item" style="color:#f59e0b">GSH Mode Active ➜ Command will be routed to Git Shell</div>';
            } else {
                panel.classList.remove('active');
            }
        });
    }, 1000);
})();
