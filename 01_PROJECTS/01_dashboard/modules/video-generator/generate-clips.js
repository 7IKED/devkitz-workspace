#!/usr/bin/env node
/**
 * DEVKiTZ™ Kurzfilm-Clip Generator
 * ─────────────────────────────────
 * Generiert cineastische Short-Clips über Gemini Veo 3.1 API
 * Stil: IT-Praxis Dr. Bauer / Die Chroniken des IT-Wikingers
 *
 * Nutzung:
 *   set GEMINI_API_KEY=dein-api-key
 *   node generate-clips.js             ← Alle 5 Clips generieren
 *   node generate-clips.js --dry-run   ← Nur Prompts anzeigen
 *   node generate-clips.js --clip 2    ← Nur Clip 2 generieren
 *   node generate-clips.js --fast      ← Veo 3.1 Fast (schneller, günstiger)
 */

import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Pfade ──────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROMPTS_PATH = join(__dirname, 'prompts.json');
const OUTPUT_DIR = join(__dirname, 'output');

// ── Konfiguration ──────────────────────────────────────────────
const CONFIG = {
    MODEL_STANDARD: 'veo-3.1-generate-preview',
    MODEL_FAST: 'veo-3.1-fast-generate-preview',
    POLL_INTERVAL_MS: 10_000,  // 10 Sekunden
    MAX_POLL_ATTEMPTS: 60,     // Max 10 Minuten warten
};

// ── Farben für Terminal-Output ─────────────────────────────────
const C = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
};

// ── CLI Arguments ──────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const USE_FAST = args.includes('--fast');
const CLIP_INDEX = args.includes('--clip')
    ? parseInt(args[args.indexOf('--clip') + 1], 10)
    : null;

// ── Hilfsfunktionen ────────────────────────────────────────────

function log(icon, msg) {
    const time = new Date().toLocaleTimeString('de-DE');
    console.log(`${C.dim}[${time}]${C.reset} ${icon} ${msg}`);
}

function banner() {
    console.log(`
${C.magenta}${C.bold}╔══════════════════════════════════════════════════╗
║  DEVKiTZ™ Kurzfilm-Clip Generator                ║
║  Veo 3.1 API · Spielfilm-Qualität                ║
╚══════════════════════════════════════════════════╝${C.reset}
`);
}

function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ── Prompts laden ──────────────────────────────────────────────

function loadPrompts() {
    if (!existsSync(PROMPTS_PATH)) {
        log('❌', `${C.red}prompts.json nicht gefunden: ${PROMPTS_PATH}${C.reset}`);
        process.exit(1);
    }
    const data = JSON.parse(readFileSync(PROMPTS_PATH, 'utf-8'));
    return data;
}

// ── Video generieren ───────────────────────────────────────────

async function generateClip(ai, clip, meta) {
    const model = USE_FAST ? CONFIG.MODEL_FAST : CONFIG.MODEL_STANDARD;

    log('🎬', `${C.bold}Starte Generierung:${C.reset} ${C.cyan}${clip.title}${C.reset}`);
    log('📝', `${C.dim}Prompt: ${clip.prompt.substring(0, 100)}...${C.reset}`);
    log('⚙️', `${C.dim}Model: ${model} | ${meta.resolution} | ${meta.aspectRatio} | ${meta.durationSeconds}s${C.reset}`);

    const startTime = Date.now();

    // Veo 3.1 API Call
    let operation = await ai.models.generateVideos({
        model: model,
        prompt: clip.prompt,
        config: {
            aspectRatio: meta.aspectRatio,
            durationSeconds: meta.durationSeconds,
            resolution: meta.resolution,
            personGeneration: meta.personGeneration,
        },
    });

    // Polling bis fertig
    let attempts = 0;
    while (!operation.done) {
        attempts++;
        if (attempts > CONFIG.MAX_POLL_ATTEMPTS) {
            log('❌', `${C.red}Timeout nach ${CONFIG.MAX_POLL_ATTEMPTS} Versuchen!${C.reset}`);
            return null;
        }

        const elapsed = formatDuration(Date.now() - startTime);
        log('⏳', `${C.yellow}Warte auf Video... (${elapsed} vergangen, Versuch ${attempts}/${CONFIG.MAX_POLL_ATTEMPTS})${C.reset}`);

        await new Promise(resolve => setTimeout(resolve, CONFIG.POLL_INTERVAL_MS));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    // Video herunterladen
    const outputPath = join(OUTPUT_DIR, clip.filename);

    await ai.files.download({
        file: operation.response.generatedVideos[0].video,
        downloadPath: outputPath,
    });

    const elapsed = formatDuration(Date.now() - startTime);
    log('✅', `${C.green}${C.bold}Fertig:${C.reset} ${C.green}${clip.filename}${C.reset} (${elapsed})`);

    return outputPath;
}

// ── Dry Run ────────────────────────────────────────────────────

function dryRun(data) {
    log('🔍', `${C.yellow}DRY RUN — Keine API-Calls${C.reset}`);
    console.log('');

    const clips = CLIP_INDEX
        ? [data.clips[CLIP_INDEX - 1]].filter(Boolean)
        : data.clips;

    clips.forEach((clip, i) => {
        console.log(`${C.cyan}${C.bold}── Clip ${i + 1}: ${clip.title} ──${C.reset}`);
        console.log(`${C.dim}ID:       ${clip.id}${C.reset}`);
        console.log(`${C.dim}Datei:    ${clip.filename}${C.reset}`);
        console.log(`${C.dim}Prompt:${C.reset}`);
        console.log(`  ${clip.prompt}`);
        console.log('');
    });

    console.log(`${C.green}✓ ${clips.length} Prompts geladen, JSON valide.${C.reset}`);
    console.log(`${C.dim}Model: ${USE_FAST ? CONFIG.MODEL_FAST : CONFIG.MODEL_STANDARD}${C.reset}`);
    console.log(`${C.dim}Resolution: ${data.meta.resolution} | Ratio: ${data.meta.aspectRatio} | Duration: ${data.meta.durationSeconds}s${C.reset}`);
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
    banner();

    // Prompts laden
    const data = loadPrompts();
    log('📂', `${data.clips.length} Clips geladen aus prompts.json`);

    // Dry Run?
    if (DRY_RUN) {
        dryRun(data);
        return;
    }

    // API Key prüfen
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        log('❌', `${C.red}GEMINI_API_KEY nicht gesetzt!${C.reset}`);
        console.log(`\n  ${C.yellow}Setze den Key:${C.reset}`);
        console.log(`  ${C.dim}set GEMINI_API_KEY=dein-api-key${C.reset}`);
        console.log(`  ${C.dim}node generate-clips.js${C.reset}\n`);
        process.exit(1);
    }

    // Output-Ordner sicherstellen
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Gemini Client initialisieren
    const ai = new GoogleGenAI({ apiKey });

    // Welche Clips generieren?
    const clips = CLIP_INDEX
        ? [data.clips[CLIP_INDEX - 1]].filter(Boolean)
        : data.clips;

    if (clips.length === 0) {
        log('❌', `${C.red}Clip ${CLIP_INDEX} nicht gefunden!${C.reset}`);
        process.exit(1);
    }

    log('🎯', `${C.bold}${clips.length} Clip(s) werden generiert${C.reset}`);
    console.log('');

    // Sequenziell generieren (API Rate-Limits respektieren)
    const results = [];
    for (let i = 0; i < clips.length; i++) {
        console.log(`${C.magenta}━━━ [${i + 1}/${clips.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);

        try {
            const path = await generateClip(ai, clips[i], data.meta);
            results.push({ clip: clips[i], path, success: true });
        } catch (err) {
            log('❌', `${C.red}Fehler bei ${clips[i].title}: ${err.message}${C.reset}`);
            results.push({ clip: clips[i], path: null, success: false, error: err.message });
        }

        console.log('');
    }

    // Zusammenfassung
    console.log(`${C.magenta}${C.bold}━━━ ERGEBNIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    const ok = results.filter(r => r.success).length;
    const fail = results.filter(r => !r.success).length;

    results.forEach(r => {
        const icon = r.success ? `${C.green}✅` : `${C.red}❌`;
        const info = r.success ? r.path : r.error;
        console.log(`  ${icon} ${r.clip.title}${C.reset} → ${C.dim}${info}${C.reset}`);
    });

    console.log('');
    log('🏁', `${C.bold}${ok}/${results.length} erfolgreich${C.reset}${fail > 0 ? ` | ${C.red}${fail} fehlgeschlagen${C.reset}` : ''}`);
    console.log(`${C.dim}Output: ${OUTPUT_DIR}${C.reset}`);
}

main().catch(err => {
    log('💥', `${C.red}${C.bold}Kritischer Fehler: ${err.message}${C.reset}`);
    console.error(err);
    process.exit(1);
});
