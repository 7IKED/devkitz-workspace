---
name: mcp-builder
description: MCP (Model Context Protocol) Server erstellen — Python oder TypeScript, Tools definieren, testen und deployen
---

# MCP Builder Skill

Erstellt hochwertige MCP-Server für das DkZ™ Ökosystem.

## Wann nutzen
- Neuen MCP-Server für ein externes API erstellen
- Bestehenden ONTHERUN™ Server erweitern
- Tools für Agenten-Integration definieren
- MCP-Protokoll implementieren

## Anweisungen

### 1. MCP-Server Grundstruktur (TypeScript)
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "dkz-[service-name]",
  version: "1.0.0"
});

// Tool definieren
server.tool("tool-name", "Beschreibung", {
  param1: { type: "string", description: "..." }
}, async (args) => {
  // Tool-Logik
  return { content: [{ type: "text", text: "Ergebnis" }] };
});

// Server starten
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2. Naming Convention
- Server: `dkz-[service].js`
- Tools: `verb-noun` Format (z.B. `get-status`, `create-record`)
- Beschreibungen: Deutsch, klar und präzise

### 3. Testen
```bash
npx @modelcontextprotocol/inspector node server/index.js
```

### 4. In ONTHERUN™ registrieren
- Tool in Tool-Registry eintragen
- Dokumentation in README.md
- features.json aktualisieren

## Referenz
- ONTHERUN™ Server: `C:\DEVKiTZ\ONTHERUN\server\`
- MCP SDK: `@modelcontextprotocol/sdk`
- 34+ bestehende Tools als Vorlage
