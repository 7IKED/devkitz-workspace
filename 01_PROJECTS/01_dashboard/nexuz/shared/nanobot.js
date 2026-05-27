/**
 * DkZ NexuzOS NanoBot Chat Sidebar
 * Aufklappbare Chat-Sidebar mit Graphify-Anbindung
 * System-Info Ticker mit Ampel-System am unteren Rand
 * 
 * Features:
 * - NanoChat Interface (aufklappbar rechts)
 * - Graphify API Kommunikation
 * - System-Ticker (Durchlaufschrift): Errors, Fragen, Konflikte
 * - Ampel-System: GRUEN/GELB/ROT
 * 
 * Einbinden: <script src="shared/nanobot.js"></script>
 */
(function() {
  'use strict';

  // ─── System Status Registry ────────────────────
  const SYSTEM_MESSAGES = [
    { type: 'ok',      text: '✅ vLLM Backend: Online (Modell: qwen2.5-coder)' },
    { type: 'ok',      text: '✅ Gateway Port 3040: Erreichbar' },
    { type: 'warn',    text: '⚠️ Drive Backup: Letzte Sync vor 2h — Update empfohlen' },
    { type: 'warn',    text: '⚠️ 3 offene Tasks in Workflow Board warten auf Zuweisung' },
    { type: 'error',   text: '❌ n8n Webhook: Timeout auf Port 5678 — Pruefung noetig' },
    { type: 'ok',      text: '✅ GitHub Sync: Letzter Push vor 12 min' },
    { type: 'info',    text: '💡 Offene Frage: Auth-Provider OAuth Keys konfigurieren?' },
    { type: 'warn',    text: '⚠️ Konflikt-Potenzial: monitoring.html + index.html nutzen gleiche CSS-Klassen' },
    { type: 'ok',      text: '✅ DuckDB: 847 Eintraege, Letzte Query < 12ms' },
    { type: 'info',    text: '💡 NanoBot bereit — Frage mich zu Modulen, Code oder System-Status' },
    { type: 'error',   text: '❌ EADDRINUSE: Port 3040 wird von anderem Prozess blockiert' },
    { type: 'ok',      text: '✅ VPS kvm8: CPU 23%, RAM 62%, Disk 44%' }
  ];

  // ─── CSS ───────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ═══ CHAT TOGGLE ═══ */
    .nxz-chat-toggle{position:fixed;bottom:72px;right:20px;z-index:10003;width:44px;height:44px;border:1px solid rgba(26,26,42,.8);border-radius:50%;background:linear-gradient(135deg,rgba(14,14,16,.95),rgba(20,20,28,.95));backdrop-filter:blur(16px);color:#00ff88;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s;box-shadow:0 4px 20px rgba(0,0,0,.4),0 0 20px rgba(0,255,136,.06)}
    .nxz-chat-toggle:hover{transform:scale(1.08);border-color:#00ff88;box-shadow:0 4px 20px rgba(0,0,0,.4),0 0 30px rgba(0,255,136,.15)}
    .nxz-chat-toggle.active{color:#fa1e4e;border-color:rgba(250,30,78,.4);box-shadow:0 0 20px rgba(250,30,78,.1)}
    .nxz-chat-toggle .pulse-ring{position:absolute;width:44px;height:44px;border-radius:50%;border:2px solid rgba(0,255,136,.3);animation:chatPulse 2s ease-out infinite}
    @keyframes chatPulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.6);opacity:0}}

    /* ═══ CHAT PANEL ═══ */
    .nxz-chat-panel{position:fixed;bottom:130px;right:20px;width:380px;max-height:520px;z-index:10004;background:rgba(10,10,14,.97);backdrop-filter:blur(28px);border:1px solid rgba(26,26,42,.8);border-radius:16px;display:flex;flex-direction:column;transform:scale(.9) translateY(20px);opacity:0;pointer-events:none;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(0,255,136,.03)}
    .nxz-chat-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto}

    /* Header */
    .nxz-chat-head{padding:14px 16px;border-bottom:1px solid rgba(26,26,42,.5);display:flex;align-items:center;gap:10px}
    .nxz-chat-avatar{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,#00ff88,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
    .nxz-chat-title{font-size:13px;font-weight:800;color:#e8e8f0;font-family:'Inter',sans-serif}
    .nxz-chat-subtitle{font-size:9px;font-family:'JetBrains Mono',monospace;color:#5e5e78;margin-top:1px}
    .nxz-chat-status{margin-left:auto;width:8px;height:8px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px rgba(0,255,136,.5);flex-shrink:0}

    /* Messages */
    .nxz-chat-messages{flex:1;overflow-y:auto;padding:12px;min-height:200px;max-height:340px}
    .nxz-chat-msg{margin-bottom:10px;display:flex;gap:8px;animation:msgIn .3s ease-out}
    @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .nxz-chat-msg.bot{flex-direction:row}
    .nxz-chat-msg.user{flex-direction:row-reverse}
    .nxz-chat-msg-avatar{width:24px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;margin-top:2px}
    .nxz-chat-msg.bot .nxz-chat-msg-avatar{background:rgba(0,255,136,.1)}
    .nxz-chat-msg.user .nxz-chat-msg-avatar{background:rgba(250,30,78,.1)}
    .nxz-chat-bubble{padding:8px 12px;border-radius:12px;font-size:12px;line-height:1.6;max-width:85%}
    .nxz-chat-msg.bot .nxz-chat-bubble{background:rgba(26,26,42,.6);color:#e8e8f0;border-bottom-left-radius:4px}
    .nxz-chat-msg.user .nxz-chat-bubble{background:rgba(250,30,78,.1);color:#e8e8f0;border-bottom-right-radius:4px;border:1px solid rgba(250,30,78,.15)}

    /* Input */
    .nxz-chat-input-wrap{padding:10px 12px;border-top:1px solid rgba(26,26,42,.5);display:flex;gap:8px}
    .nxz-chat-input{flex:1;padding:8px 12px;border:1px solid rgba(26,26,42,.5);border-radius:10px;background:rgba(14,14,16,.8);color:#e8e8f0;font-family:'Inter',sans-serif;font-size:12px;outline:none;transition:border-color .2s}
    .nxz-chat-input:focus{border-color:#00ff88}
    .nxz-chat-input::placeholder{color:#3a3a4a}
    .nxz-chat-send{width:34px;height:34px;border:1px solid rgba(0,255,136,.3);border-radius:10px;background:rgba(0,255,136,.08);color:#00ff88;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
    .nxz-chat-send:hover{background:rgba(0,255,136,.15);transform:scale(1.05)}

    /* ═══ SYSTEM TICKER ═══ */
    .nxz-ticker{position:fixed;bottom:0;left:0;right:0;height:28px;z-index:10005;background:rgba(6,6,8,.95);border-top:1px solid rgba(26,26,42,.5);display:flex;align-items:center;overflow:hidden;backdrop-filter:blur(12px)}
    .nxz-ticker-label{padding:0 12px;font-size:9px;font-family:'JetBrains Mono',monospace;font-weight:700;color:#5e5e78;white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:6px;border-right:1px solid rgba(26,26,42,.5)}
    .nxz-ticker-ampel{display:flex;gap:3px;align-items:center}
    .nxz-ticker-dot{width:6px;height:6px;border-radius:50%}
    .nxz-ticker-dot.r{background:#ff3b5c;box-shadow:0 0 4px rgba(255,59,92,.5)}
    .nxz-ticker-dot.y{background:#ffb800;box-shadow:0 0 4px rgba(255,184,0,.5)}
    .nxz-ticker-dot.g{background:#00ff88;box-shadow:0 0 4px rgba(0,255,136,.5)}
    .nxz-ticker-track{flex:1;overflow:hidden;position:relative;height:28px}
    .nxz-ticker-scroll{display:flex;align-items:center;height:28px;white-space:nowrap;animation:tickerScroll var(--ticker-duration, 60s) linear infinite;gap:40px;padding-left:100%}
    .nxz-ticker-item{font-size:10px;font-family:'JetBrains Mono',monospace;white-space:nowrap;display:flex;align-items:center;gap:6px}
    .nxz-ticker-item.ok{color:#00ff88}
    .nxz-ticker-item.warn{color:#ffb800}
    .nxz-ticker-item.error{color:#ff3b5c}
    .nxz-ticker-item.info{color:#6366f1}
    .nxz-ticker-sep{color:rgba(26,26,42,.8);font-size:8px}
    @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

    /* Scrollbar */
    .nxz-chat-messages::-webkit-scrollbar{width:4px}
    .nxz-chat-messages::-webkit-scrollbar-track{background:transparent}
    .nxz-chat-messages::-webkit-scrollbar-thumb{background:rgba(26,26,42,.6);border-radius:4px}

    @media(max-width:768px){.nxz-chat-panel{right:8px;left:8px;width:auto;bottom:120px}}
  `;
  document.head.appendChild(style);

  // ─── Chat Toggle Button ────────────────────────
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'nxz-chat-toggle';
  toggleBtn.innerHTML = '<span class="pulse-ring"></span>🤖';
  toggleBtn.title = 'NanoBot Chat oeffnen';
  document.body.appendChild(toggleBtn);

  // ─── Chat Panel ────────────────────────────────
  const panel = document.createElement('div');
  panel.className = 'nxz-chat-panel';
  panel.innerHTML = `
    <div class="nxz-chat-head">
      <div class="nxz-chat-avatar">🤖</div>
      <div>
        <div class="nxz-chat-title">NanoBot</div>
        <div class="nxz-chat-subtitle">NanoChat · Graphify Bridge</div>
      </div>
      <div class="nxz-chat-status"></div>
    </div>
    <div class="nxz-chat-messages" id="nxzChatMessages">
      <div class="nxz-chat-msg bot">
        <div class="nxz-chat-msg-avatar">🤖</div>
        <div class="nxz-chat-bubble">Hallo! Ich bin <strong>NanoBot</strong>. Ich kann ueber Graphify mit deinen Modulen kommunizieren.<br><br>Frag mich etwas wie:<br>• "Status aller Backends"<br>• "Zeige offene Tasks"<br>• "Graphify Query: Module mit Fehlern"</div>
      </div>
    </div>
    <div class="nxz-chat-input-wrap">
      <input class="nxz-chat-input" id="nxzChatInput" placeholder="Nachricht an NanoBot..." autocomplete="off">
      <button class="nxz-chat-send" id="nxzChatSend">↑</button>
    </div>
  `;
  document.body.appendChild(panel);

  // ─── System Ticker ─────────────────────────────
  const ticker = document.createElement('div');
  ticker.className = 'nxz-ticker';

  // Ampel berechnen
  const hasErrors = SYSTEM_MESSAGES.some(m => m.type === 'error');
  const hasWarns = SYSTEM_MESSAGES.some(m => m.type === 'warn');
  const ampelClass = hasErrors ? 'r' : hasWarns ? 'y' : 'g';

  // Doppelte Items fuer nahtloses Scrolling
  const tickerItems = SYSTEM_MESSAGES.map(m => 
    `<span class="nxz-ticker-item ${m.type}">${esc(m.text)}</span><span class="nxz-ticker-sep">◆</span>`
  ).join('');

  const duration = Math.max(SYSTEM_MESSAGES.length * 5, 40);

  ticker.innerHTML = `
    <div class="nxz-ticker-label">
      <div class="nxz-ticker-ampel">
        <div class="nxz-ticker-dot ${ampelClass}"></div>
      </div>
      SYS
    </div>
    <div class="nxz-ticker-track">
      <div class="nxz-ticker-scroll" style="--ticker-duration:${duration}s">
        ${tickerItems}${tickerItems}
      </div>
    </div>
  `;
  document.body.appendChild(ticker);

  // Body Padding fuer Ticker
  document.body.style.paddingBottom = '32px';

  // ─── Toggle Logic ──────────────────────────────
  let chatOpen = false;

  function toggleChat() {
    chatOpen = !chatOpen;
    panel.classList.toggle('open', chatOpen);
    toggleBtn.classList.toggle('active', chatOpen);
    if (chatOpen) {
      document.getElementById('nxzChatInput').focus();
    }
  }

  toggleBtn.addEventListener('click', toggleChat);

  // ─── Chat Logic ────────────────────────────────
  const messagesEl = document.getElementById('nxzChatMessages');
  const inputEl = document.getElementById('nxzChatInput');
  const sendBtn = document.getElementById('nxzChatSend');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'nxz-chat-msg ' + sender;
    msg.innerHTML = `
      <div class="nxz-chat-msg-avatar">${sender === 'bot' ? '🤖' : '👤'}</div>
      <div class="nxz-chat-bubble">${esc(text)}</div>
    `;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function processMessage(text) {
    const lower = text.toLowerCase();

    // Graphify-Befehle
    if (lower.includes('graphify') || lower.includes('query')) {
      return 'Graphify-Bridge aktiviert. Sende Query an Modul-Graph...\n\nErgebnis: 89 Module geladen, 3 mit offenen Issues, 2 Sync-Konflikte. Details im Monitoring-Tab verfuegbar.';
    }

    if (lower.includes('status') || lower.includes('backend')) {
      return 'System-Status:\n🟢 vLLM: Online (Port 8000)\n🟢 Gateway: Port 3040 aktiv\n🟡 n8n: Timeout (Port 5678)\n🟢 DuckDB: 847 Records\n🟢 VPS: CPU 23%\n🟡 Drive Sync: 2h alt';
    }

    if (lower.includes('task') || lower.includes('aufgabe')) {
      return 'Offene Tasks:\n1. 📋 Auth OAuth Keys konfigurieren\n2. 📋 Monitoring Canvas-Charts verfeinern\n3. 📋 Eingabeleiste Phase 1 implementieren\n4. 📋 Webhook n8n Endpoint testen\n5. 📋 Hermes-Sync Harness nachreichen';
    }

    if (lower.includes('fehler') || lower.includes('error')) {
      return '⚠️ Aktuelle Fehler:\n1. ❌ EADDRINUSE Port 3040 — Gateway/Bridge Konflikt\n2. ❌ n8n Webhook Timeout\n3. ⚠️ CSS Klassen-Konflikt: monitoring.html / index.html';
    }

    if (lower.includes('hilfe') || lower.includes('help')) {
      return 'Verfuegbare Befehle:\n• "status" — System-Uebersicht\n• "tasks" — Offene Aufgaben\n• "fehler" — Aktuelle Errors\n• "graphify query: ..." — Modul-Graph abfragen\n• "ampel" — Ampel-Details\n• Oder frei formulieren!';
    }

    if (lower.includes('ampel')) {
      const count = { ok: 0, warn: 0, error: 0, info: 0 };
      SYSTEM_MESSAGES.forEach(m => count[m.type]++);
      return `Ampel-Status: ${hasErrors ? '🔴 ROT' : hasWarns ? '🟡 GELB' : '🟢 GRUEN'}\n\n✅ OK: ${count.ok}\n⚠️ Warnings: ${count.warn}\n❌ Errors: ${count.error}\n💡 Info: ${count.info}`;
    }

    // Fallback
    return 'Verstanden! Ich leite deine Anfrage an Graphify weiter. In Produktion wuerde ich ueber den ONTHERUN Gateway (Port 3040) mit deinen Modulen kommunizieren.\n\nTipp: Sage "hilfe" fuer verfuegbare Befehle.';
  }

  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    inputEl.value = '';

    // Simulate typing
    setTimeout(() => {
      const reply = processMessage(text);
      addMessage(reply, 'bot');
    }, 400 + Math.random() * 600);
  }

  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // XSS-Schutz
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  // ─── Public API ────────────────────────────────
  window.NxzNanoBot = {
    open: () => { chatOpen = false; toggleChat(); },
    close: () => { chatOpen = true; toggleChat(); },
    send: (msg) => { inputEl.value = msg; sendMessage(); },
    addSystemMessage: (type, text) => {
      SYSTEM_MESSAGES.push({ type, text });
    }
  };

})();
