/**
 * ⚡ DKZ MCP — Prompts
 * ═════════════════════
 * Vordefinierte Prompt-Templates für AI-Clients
 */

import { z } from 'zod';

export function registerPrompts(server, ctx) {

    // ─── DkZ System Prompt ───
    server.prompt(
        'dkz-system',
        'Standard DkZ-System-Prompt mit Ökosystem-Kontext',
        {},
        async () => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Du bist ein AI-Assistent im DkZ-Ökosystem (DevKitZ). 
                    
Das DkZ-Ökosystem ist ein modulares, EU-souveränes System mit folgenden Komponenten:
- NEXUZ² Command Center (Backend-Orchestrierung)
- 6 Backends: VPS KVM8, LLM Dedicated, GAS/Drive, Apache, Cloudflare Worker, Nextcloud
- 7 Frontend-Plattformen: Web PWA, Android, iOS, macOS, Windows 10/11, Linux
- Module: AI Chat, File Manager, SEO Dashboard, Workflow Board, Knowledge Hub
- Design: Cyberclean Dark Theme mit Crimson (#fa1e4e) und Neon-Akzenten

Versionierung: v[Major].[Minor].[Patch]_[Session]
Sprache: Deutsch bevorzugt, Englisch bei technischen Begriffen
Standards: EU AI Act, DSGVO, AGPL-3.0`
                }
            }]
        })
    );

    // ─── Code Review Prompt ───
    server.prompt(
        'dkz-code-review',
        'Code Review mit DkZ-Standards',
        {
            code: z.string().describe('Der zu reviewende Code'),
            language: z.string().optional().describe('Programmiersprache')
        },
        async ({ code, language }) => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Bitte reviewe den folgenden ${language || ''} Code nach DkZ-Standards:

Prüfkriterien:
1. DkZ Naming Conventions (Kebab-Case für Dateien, CamelCase für Klassen)
2. Error Handling (try/catch, Fallbacks)
3. Performance (keine Memory Leaks, effiziente Loops)
4. Sicherheit (Input Validation, keine Secrets im Code)
5. EU AI Act Compliance (wenn AI-bezogen)
6. Modularität (single responsibility)

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Gib ein Review mit:
- ✅ Was gut ist
- ⚠️ Warnungen
- ❌ Kritische Probleme
- 💡 Verbesserungsvorschläge`
                }
            }]
        })
    );

    // ─── SEO Content Prompt ───
    server.prompt(
        'dkz-seo-content',
        'SEO-optimierten Content erstellen',
        {
            topic: z.string().describe('Thema des Contents'),
            keywords: z.string().optional().describe('Komma-separierte Keywords'),
            contentType: z.string().optional().describe('Typ: blog, landing, product')
        },
        async ({ topic, keywords, contentType }) => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Erstelle SEO-optimierten ${contentType || 'blog'}-Content zum Thema: "${topic}"

${keywords ? `Ziel-Keywords: ${keywords}` : ''}

Anforderungen:
- H1 mit Haupt-Keyword
- Meta Description (max 160 Zeichen)
- Strukturierte H2/H3 Headings
- Keyword-Density 1-2%
- Internal Linking Vorschläge
- Schema.org Markup Empfehlung
- Readability Score Ziel: 60+`
                }
            }]
        })
    );

    // ─── Incident Report Prompt ───
    server.prompt(
        'dkz-incident-report',
        'Incident Report erstellen',
        {
            incident: z.string().describe('Beschreibung des Incidents'),
            severity: z.string().optional().describe('Schweregrad: low, medium, high, critical')
        },
        async ({ incident, severity }) => ({
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Erstelle einen DkZ Incident Report:

Incident: ${incident}
Schweregrad: ${severity || 'medium'}

Format:
## 🚨 Incident Report
- **ID:** IR-[AUTO]
- **Schweregrad:** ${severity || 'medium'}
- **Zeitpunkt:** [JETZT]
- **Beschreibung:** ${incident}

### Root Cause Analysis
[Analysiere mögliche Ursachen]

### Impact Assessment  
[Bewerte den Einfluss auf das System]

### Resolution Steps
[Schritte zur Behebung]

### Prevention
[Maßnahmen zur Vermeidung in Zukunft]`
                }
            }]
        })
    );
}
