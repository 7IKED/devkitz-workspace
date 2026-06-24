/**
 * DEVKiTZ™ Global Context Menu (Rechtsklick)
 * Integriert Obsidian, GitNexus, Graphify, OpenHumans, OpenHands, Copilot & Explorer
 */

(function() {
    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        #dkz-context-menu {
            position: fixed;
            z-index: 100000;
            background: rgba(14, 14, 16, 0.85);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 6px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
            display: none;
            flex-direction: column;
            gap: 2px;
            min-width: 220px;
            color: #ececf1;
            font-family: 'Inter', sans-serif;
            font-size: 0.8rem;
        }
        #dkz-context-menu.visible {
            display: flex;
            animation: dkz-cm-fade 0.15s ease-out forwards;
        }
        @keyframes dkz-cm-fade {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .dkz-cm-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 6px;
            transition: background 0.2s, color 0.2s;
        }
        .dkz-cm-item:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        .dkz-cm-item .icon { font-size: 1.1rem; }
        .dkz-cm-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 4px 0;
        }
        .dkz-cm-header {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: rgba(255, 255, 255, 0.4);
            padding: 4px 12px;
            margin-top: 4px;
        }
    `;
    document.head.appendChild(style);

    // Create DOM Element
    const menu = document.createElement('div');
    menu.id = 'dkz-context-menu';
    document.body.appendChild(menu);

    let activeContextText = '';

    // Action Handlers
    const actions = {
        copilot: () => {
            if (window.CopilotUI && window.CopilotUI.open) {
                window.CopilotUI.open(activeContextText ? `Erkläre mir: ${activeContextText}` : '');
            } else {
                alert('Copilot nicht geladen.');
            }
        },
        obsidian: async () => {
            try {
                const res = await fetch('http://localhost:3040/api/v1/second-brain/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: activeContextText || 'Leere Notiz', title: 'Schnellnotiz' })
                });
                const data = await res.json();
                if (data.success) alert('✅ In Obsidian gespeichert.');
                else alert('❌ Fehler beim Speichern: ' + data.error);
            } catch (e) {
                alert('Netzwerkfehler: Backend erreichbar?');
            }
        },
        gitnexus: () => {
            window.location.href = '/modules/gitnexus-explorer/index.html';
        },
        graphify: () => {
            if (activeContextText) localStorage.setItem('graphify-input', activeContextText);
            window.location.href = '/modules/graphify/index.html';
        },
        openhands: () => {
            if (activeContextText) localStorage.setItem('openhands-input', activeContextText);
            window.location.href = '/modules/openhands-hub/index.html';
        },
        openhumans: () => {
            window.location.href = '/modules/openhumans-hub/index.html';
        },
        explorer: () => {
            window.location.href = '/modules/wissen-hub/index.html'; // Assuming explorer logic
        },
        paperclip: () => {
            if (activeContextText) localStorage.setItem('paperclip-input', activeContextText);
            window.location.href = '/modules/paperclip/index.html';
        },
        paperless: () => {
            if (activeContextText) localStorage.setItem('paperless-input', activeContextText);
            window.location.href = '/modules/paperless/index.html';
        }
    };

    function renderMenu() {
        menu.innerHTML = `
            <div class="dkz-cm-header">Autonomie-Tools</div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('copilot')">
                <span class="icon">🤖</span> An Copilot senden
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('obsidian')">
                <span class="icon">🧠</span> In Obsidian speichern
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('paperclip')">
                <span class="icon">📎</span> Mit Paperclip anheften
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('paperless')">
                <span class="icon">📄</span> An Paperless senden
            </div>
            <div class="dkz-cm-divider"></div>
            <div class="dkz-cm-header">Modul-Navigation</div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('gitnexus')">
                <span class="icon">🐙</span> GitNexus Explorer
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('graphify')">
                <span class="icon">📊</span> Graphify Analyse
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('openhands')">
                <span class="icon">💻</span> An OpenHands delegieren
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('openhumans')">
                <span class="icon">👥</span> OpenHumans Hub
            </div>
            <div class="dkz-cm-item" onclick="dkzContextMenuAction('explorer')">
                <span class="icon">📂</span> DkZ Explorer öffnen
            </div>
        `;
    }

    window.dkzContextMenuAction = function(action) {
        menu.classList.remove('visible');
        if (actions[action]) actions[action]();
    };

    // Event Listeners
    document.addEventListener('contextmenu', (e) => {
        // Prevent default context menu
        e.preventDefault();

        // Get selected text if any
        activeContextText = window.getSelection().toString().trim();

        renderMenu();

        // Position menu
        let x = e.clientX;
        let y = e.clientY;
        const rect = menu.getBoundingClientRect();
        
        // Overflow protection
        if (x + 220 > window.innerWidth) x = window.innerWidth - 230;
        if (y + 300 > window.innerHeight) y = window.innerHeight - 310;

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('visible');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
            menu.classList.remove('visible');
        }
    });

    // Escape to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') menu.classList.remove('visible');
    });

})();
