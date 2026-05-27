const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');
require('dotenv').config();

const app = express();
const port = 3040;

// Middleware
app.use(cors()); // Allow UI to call this API
app.use(express.json({ limit: '50mb' }));

// 1. API Endpoint to trigger Git Sync
app.post('/api/sync', (req, res) => {
    console.log('Sync request received. Executing git commands...');

    const repoPath = path.resolve(__dirname);
    const gitCommand = `git add . && git commit -m "Auto-sync from UI: ${new Date().toISOString()}"`;

    exec(gitCommand, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
                console.log('Git Sync: Nothing new to commit.');
                return res.status(200).json({ success: true, message: 'Up to date. No new changes to commit.', log: stdout });
            }
            console.error(`Git Sync Error: ${error.message}`);
            return res.status(500).json({ success: false, error: 'Git commit failed.', log: stderr || error.message });
        }
        res.status(200).json({ success: true, message: 'Successfully committed changes to local repo.', log: stdout });
    });
});

// 2. Mock Endpoint: Analyzer (Resume)
app.post('/api/analyze', (req, res) => {
    const { content, context } = req.body;
    // Simulate AI processing delay
    setTimeout(() => {
        const mockMarkdown = `# Resume Analysis Results\n\n**Match Score:** 85%\n\n### Strengths\n- Strong background in React and NodeJS.\n- Good understanding of UI principles.\n\n### Weaknesses\n- Missing cloud deployment experience.\n\n### Required Actions\n- Add AWS/GCP keywords to your skills section.`;
        res.json({ success: true, result: mockMarkdown });
    }, 2000);
});

// Initialize Mistral Client
// Use your API key here or make sure it's in the .env file as MISTRAL_API_KEY
const apiKey = process.env.MISTRAL_API_KEY || '';
const mistralClient = new Mistral({ apiKey: apiKey });

// 2b. Native Endpoint: Chat V1 (Standard - Core Chat)
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    try {
        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'MISTRAL_API_KEY is not set in environment or server configuration.' });
        }

        // Format history for Mistral
        // Ensure system prompt is first, then the rest. Mistral requires clean role mapping ('system', 'user', 'assistant')
        let formattedMessages = [];
        if (history && Array.isArray(history)) {
            formattedMessages = history.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        } else {
            formattedMessages = [
                { role: 'system', content: 'You are a helpful AI assistant operating within the DkZ Ecosystem.' },
                { role: 'user', content: message }
            ];
        }

        const chatResponse = await mistralClient.chat.complete({
            model: 'open-mistral-nemo', // Excellent fast/small model
            messages: formattedMessages,
            temperature: 0.7,
        });

        res.json({ success: true, reply: chatResponse.choices[0].message.content });

    } catch (error) {
        console.error('Mistral API Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Error communicating with Mistral AI.' });
    }
});

// 2c. Native Endpoint: Chat V2 (Multi-Model)
app.post('/api/chat-multimodel', async (req, res) => {
    const { message, model, history } = req.body;

    try {
        if (!apiKey) {
            return res.status(400).json({ success: false, error: 'MISTRAL_API_KEY is not set in environment or server configuration.' });
        }

        // We will default to Mistral models even if the UI asks for gpt/claude, 
        // to ensure it actually works locally without needing 3 different provider SDKs.
        // We map the requested UI model names to their closest Mistral equivalents.
        let mistralModel = 'open-mistral-nemo'; // Default fallback (fast/capable)

        if (model === 'gpt-4o-mini') mistralModel = 'open-mistral-nemo'; // Fast
        if (model === 'claude-3-haiku') mistralModel = 'mistral-small-latest'; // Small/Smart
        if (model === 'llama-3') mistralModel = 'mistral-large-latest'; // Large/Complex

        let formattedMessages = [];
        if (history && Array.isArray(history)) {
            formattedMessages = history.map(msg => ({
                role: msg.role === 'system' ? 'system' : msg.role, // Mistral expects standard roles
                content: msg.content
            }));
        } else {
            formattedMessages = [
                { role: 'system', content: 'You are a helpful AI assistant operating within the DkZ Ecosystem Multi-Model platform.' },
                { role: 'user', content: message }
            ];
        }

        const chatResponse = await mistralClient.chat.complete({
            model: mistralModel,
            messages: formattedMessages,
            temperature: 0.7,
        });

        res.json({ success: true, reply: chatResponse.choices[0].message.content });

    } catch (error) {
        console.error('Mistral API Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Error communicating with Mistral AI.' });
    }
});

// 3. Mock Endpoint: Code Converter
app.post('/api/convert', (req, res) => {
    const { code, target } = req.body;
    setTimeout(() => {
        const mockMarkdown = `### Converted Code (Mocked by Local Node Server)\n\nTarget Language: ${target || 'Unknown'}\n\n\`\`\`javascript\n// This is simulated converted code\nfunction newComponent() {\n  return <div>Converted!</div>;\n}\n\`\`\``;
        res.json({ success: true, result: mockMarkdown });
    }, 2000);
});

// 4. Mock Endpoint: Speech to Text (Simulation)
app.post('/api/speech-to-text', (req, res) => {
    // In a real app, req.body would contain base64 audio data to be sent to Whisper API
    setTimeout(() => {
        const mockTranscript = "Dies ist eine simulierte Transkription vom lokalen NodeJS Server. In einem echten System würde hier das Whisper-Modell greifen.";
        res.json({ success: true, transcript: mockTranscript });
    }, 2500);
});

// 4b. Mock Endpoint: Text to Speech (Simulation)
app.post('/api/text-to-speech', (req, res) => {
    const { text } = req.body;
    setTimeout(() => {
        res.json({
            success: true,
            message: "Simulated audio generated.",
            // Simulating a dummy audio source (empty object URL pattern for frontend)
            audioUrl: "simulated_audio_ready"
        });
    }, 2000);
});

// 5. Mock Endpoint: Text Summary
app.post('/api/summarize', (req, res) => {
    const { text } = req.body;
    setTimeout(() => {
        const mockSummary = `### Zusammenfassung\n\nDas Dokument enthält ${Math.ceil(text.length / 5)} Wörter. Als Kernpunkte wurden identifiziert:\n1. Reibungslose Systemintegration.\n2. Keine Abhängigkeit mehr von Cloud APIs (Puter.js).\n3. Sicherheit durch lokales Backup.`;
        res.json({ success: true, summary: mockSummary });
    }, 1500);
});


app.listen(port, () => {
    console.log(`[DkZ API & Sync Server] running at http://localhost:${port}`);
    console.log(`Monitoring directory: ${__dirname}`);
    console.log(`Endpoints Initialized: /api/sync, /api/analyze, /api/convert, /api/speech-to-text, /api/summarize`);
});
