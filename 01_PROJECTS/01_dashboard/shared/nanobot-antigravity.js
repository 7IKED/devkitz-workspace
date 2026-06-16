/**
 * DkZ NanoBot — Antigravity Agent
 * @DKZ:RULES → R21 Shared Scripts, R15 esc()
 * @DKZ:TAG → [SYS:nanobot] [AGENT:antigravity]
 */
const AntigravityBot = (() => {
    'use strict';
    const NAME = 'Antigravity';
    const WS_URL = 'ws://localhost:3040/ws';
    let ws = null;

    function init() {
        if (typeof window !== 'undefined') {
            connect();
        }
    }

    function connect() {
        if (ws) return;
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            console.log(`[NanoBot] ${NAME} connected to NanoChat Bridge`);
            ws.send(JSON.stringify({ type: 'hello', from: NAME, text: 'Agent Antigravity online.' }));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'broadcast' && msg.data && msg.data.text) {
                    const text = msg.data.text.toLowerCase();
                    if (text.includes('@antigravity') && msg.data.from !== NAME) {
                        handleMention(msg.data);
                    }
                }
            } catch(e) {}
        };

        ws.onclose = () => {
            ws = null;
            setTimeout(connect, 5000);
        };
    }

    async function handleMention(data) {
        console.log(`[NanoBot] ${NAME} heard mention from ${data.from}: ${data.text}`);
        
        // Simple logic for responding
        const prompt = data.text.replace(/@antigravity/gi, '').trim();
        
        let reply = `Hallo ${data.from}, ich bin Antigravity. `;
        if (prompt) {
            reply += `Du hast gefragt: "${prompt}". Das werde ich analysieren.`;
        } else {
            reply += `Wie kann ich helfen?`;
        }
        
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'chat',
                from: NAME,
                text: reply,
                to: data.from
            }));
        }
    }

    init();

    return {
        name: NAME,
        send: (text) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'chat', from: NAME, text }));
            }
        }
    };
})();

if (typeof window !== 'undefined') window.AntigravityBot = AntigravityBot;
