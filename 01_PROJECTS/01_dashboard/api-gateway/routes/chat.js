/**
 * ⚡ DKZ API — Chat Routes
 * ═════════════════════════
 * AI Chat, Summarize, Translate, CodeGen
 */

import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const router = Router();

// Lazy-load Mistral
let mistralClient = null;
async function getMistral() {
    if (!mistralClient) {
        try {
            const { Mistral } = await import('@mistralai/mistralai');
            const apiKey = process.env.MISTRAL_API_KEY || '';
            if (apiKey) {
                mistralClient = new Mistral({ apiKey });
            }
        } catch { /* Mistral not available */ }
    }
    return mistralClient;
}

// Model mapping
const MODEL_MAP = {
    auto: 'open-mistral-nemo',
    fast: 'open-mistral-nemo',
    smart: 'mistral-small-latest',
    large: 'mistral-large-latest'
};

// ─── POST /chat ───
router.post('/chat', async (req, res) => {
    const { message, model, systemPrompt, history } = req.body;

    if (!message && (!history || !history.length)) {
        return res.status(400).json({ error: 'message oder history erforderlich' });
    }

    const client = await getMistral();
    if (!client) {
        // Fallback: Echo-Modus wenn kein API Key
        return res.json({
            reply: `[DkZ Echo] Kein LLM-Provider konfiguriert. Nachricht empfangen: "${message}"\n\nSetze MISTRAL_API_KEY in .env für echte AI-Antworten.`,
            model: 'echo',
            fallback: true
        });
    }

    try {
        const mistralModel = MODEL_MAP[model] || MODEL_MAP.auto;

        let messages = [];
        if (history && Array.isArray(history)) {
            messages = history.map(m => ({ role: m.role, content: m.content }));
        } else {
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            } else {
                messages.push({ role: 'system', content: 'Du bist ein hilfreicher AI-Assistent im DkZ-Ökosystem.' });
            }
            messages.push({ role: 'user', content: message });
        }

        const chatResponse = await client.chat.complete({
            model: mistralModel,
            messages,
            temperature: 0.7
        });

        res.json({
            reply: chatResponse.choices[0].message.content,
            model: mistralModel,
            usage: chatResponse.usage || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /summarize ───
router.post('/summarize', async (req, res) => {
    const { text, depth, language } = req.body;
    if (!text) return res.status(400).json({ error: 'text erforderlich' });

    const client = await getMistral();
    const depthMap = { kurz: '2-3 Sätze', mittel: '1 Absatz', detailliert: '3-5 Absätze' };

    if (!client) {
        // Smart fallback: basic extraction
        const words = text.split(/\s+/);
        const summary = words.length > 50
            ? words.slice(0, 50).join(' ') + '...\n\n[Zusammenfassung durch Textextraktion — für AI-Summarization MISTRAL_API_KEY setzen]'
            : text;
        return res.json({ summary });
    }

    try {
        const response = await client.chat.complete({
            model: 'open-mistral-nemo',
            messages: [
                { role: 'system', content: `Fasse den folgenden Text in ${depthMap[depth] || depthMap.mittel} zusammen. Sprache: ${language || 'auto'}.` },
                { role: 'user', content: text }
            ],
            temperature: 0.3
        });
        res.json({ summary: response.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /translate ───
router.post('/translate', async (req, res) => {
    const { text, targetLang, sourceLang } = req.body;
    if (!text || !targetLang) return res.status(400).json({ error: 'text und targetLang erforderlich' });

    const client = await getMistral();
    if (!client) {
        return res.json({ translation: `[Translation nicht verfügbar — MISTRAL_API_KEY setzen]\n\nOriginal: ${text}` });
    }

    try {
        const response = await client.chat.complete({
            model: 'open-mistral-nemo',
            messages: [
                { role: 'system', content: `Übersetze den folgenden Text${sourceLang !== 'auto' ? ` von ${sourceLang}` : ''} nach ${targetLang}. Gib nur die Übersetzung aus, keine Erklärung.` },
                { role: 'user', content: text }
            ],
            temperature: 0.2
        });
        res.json({ translation: response.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /codegen ───
router.post('/codegen', async (req, res) => {
    const { prompt, language, sourceCode, mode } = req.body;
    if (!prompt && !sourceCode) return res.status(400).json({ error: 'prompt oder sourceCode erforderlich' });

    const client = await getMistral();
    if (!client) {
        return res.json({
            code: `// [CodeGen nicht verfügbar — MISTRAL_API_KEY setzen]\n// Prompt: ${prompt || 'N/A'}\n// Language: ${language || 'javascript'}`,
            explanation: 'LLM-Provider nicht konfiguriert.'
        });
    }

    const modePrompts = {
        generate: `Generiere ${language || 'JavaScript'} Code für: ${prompt}. Gib nur den Code aus.`,
        convert: `Konvertiere den folgenden Code nach ${language || 'JavaScript'}:\n${sourceCode}`,
        improve: `Verbessere den folgenden ${language || ''} Code (Performance, Lesbarkeit, Best Practices):\n${sourceCode}`,
        explain: `Erkläre den folgenden ${language || ''} Code detailliert:\n${sourceCode}`
    };

    try {
        const response = await client.chat.complete({
            model: 'mistral-small-latest',
            messages: [
                { role: 'system', content: 'Du bist ein erfahrener Programmierer. Antworte präzise und klar.' },
                { role: 'user', content: modePrompts[mode] || modePrompts.generate }
            ],
            temperature: 0.3
        });

        const output = response.choices[0].message.content;
        res.json({
            code: mode === 'explain' ? undefined : output,
            explanation: mode === 'explain' ? output : undefined
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export { router as chatRoutes };
