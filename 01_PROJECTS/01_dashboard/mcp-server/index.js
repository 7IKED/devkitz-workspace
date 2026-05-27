#!/usr/bin/env node

/**
 * ⚡ DKZ MCP SERVER v1.01.1_01
 * ═════════════════════════════
 * Model Context Protocol Server für das DkZ-Ökosystem.
 * 
 * Stellt 22 Tools, Resources und Prompts bereit,
 * die von AI-Clients (Gemini, Claude, Cursor, etc.) genutzt werden.
 * 
 * Kommunikation: stdio (JSON-RPC 2.0)
 * Standard: MCP v1.0
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { registerChatTools } from './tools/chat.js';
import { registerFileTools } from './tools/files.js';
import { registerHealthTools } from './tools/health.js';
import { registerModuleTools } from './tools/modules.js';
import { registerSeoTools } from './tools/seo.js';
import { registerWorkflowTools } from './tools/workflow.js';
import { registerSystemTools } from './tools/system.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

// ═══ SERVER CONFIG ═══
const API_BASE = process.env.DKZ_API_URL || 'http://localhost:3040';
const VERSION = 'v1.01.1_01';

// ═══ CREATE MCP SERVER ═══
const server = new McpServer({
    name: 'dkz-mcp-server',
    version: '1.0.0',
    description: `DkZ MCP Server ${VERSION} — Vollständiges DkZ-Ökosystem via Model Context Protocol`
});

// ═══ SHARED CONTEXT ═══
// Wird an alle Tool-Module übergeben
const ctx = {
    apiBase: API_BASE,
    version: VERSION,
    server,
    // Helper: API call via fetch
    async apiFetch(path, options = {}) {
        const url = `${API_BASE}${path}`;
        try {
            const resp = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`API ${resp.status}: ${text}`);
            }
            return resp.json();
        } catch (err) {
            if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
                throw new Error(`DkZ API Gateway nicht erreichbar (${url}). Starte den Server mit: cd api-gateway && npm start`);
            }
            throw err;
        }
    }
};

// ═══ REGISTER ALL MODULES ═══
registerChatTools(server, ctx);
registerFileTools(server, ctx);
registerHealthTools(server, ctx);
registerModuleTools(server, ctx);
registerSeoTools(server, ctx);
registerWorkflowTools(server, ctx);
registerSystemTools(server, ctx);
registerResources(server, ctx);
registerPrompts(server, ctx);

// ═══ START SERVER ═══
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[DKZ MCP] Server gestartet — ${VERSION}`);
    console.error(`[DKZ MCP] API Gateway: ${API_BASE}`);
    console.error(`[DKZ MCP] Tools, Resources und Prompts registriert.`);
}

main().catch(err => {
    console.error('[DKZ MCP] Fatal Error:', err);
    process.exit(1);
});
