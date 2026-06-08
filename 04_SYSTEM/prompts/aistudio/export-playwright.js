#!/usr/bin/env node
/**
 * AI Studio Builder Tools Exporter — Playwright Version
 * Nutzt bestehendes Chrome-Profil (bereits bei Google eingeloggt)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:\\DEVKiTZ\\04_SYSTEM\\prompts\\aistudio';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// Sicherstellen dass Output-Dir existiert
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function exportTools() {
  console.log('🚀 AI Studio Exporter (Playwright) gestartet...\n');

  // Chrome mit bestehendem Profil starten
  const userDataDir = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
  
  // Temporaeres Profil-Verzeichnis um Lock-Konflikte zu vermeiden
  const tempProfile = path.join(process.env.TEMP, 'playwright-chrome-profile');
  
  const context = await chromium.launchPersistentContext(tempProfile, {
    executablePath: CHROME_PATH,
    headless: false,
    channel: 'chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run'
    ],
    viewport: { width: 1920, height: 1080 }
  });

  const page = context.pages()[0] || await context.newPage();
  const allTools = [];

  try {
    // Schritt 1: Haupt-Seite laden
    console.log('📄 [1/6] Lade AI Studio Hauptseite...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'networkidle', timeout: 30000 });
    await delay(5000);

    // Login-Status pruefen
    const pageUrl = page.url();
    console.log(`  URL: ${pageUrl}`);
    
    if (pageUrl.includes('accounts.google.com') || pageUrl.includes('signin')) {
      console.log('  ⚠️ Nicht eingeloggt! Warte 60s auf manuellen Login...');
      await page.waitForURL('**/aistudio.google.com/**', { timeout: 120000 });
      console.log('  ✅ Login erkannt!');
    }

    // Screenshot
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'screenshot-home.png'), fullPage: true });

    // Schritt 2: Alle sichtbaren Links/Sections sammeln
    console.log('\n🔗 [2/6] Sammle Navigation...');
    const navData = await page.evaluate(() => {
      const items = [];
      // Alle Links
      document.querySelectorAll('a[href]').forEach(a => {
        items.push({ type: 'link', text: a.textContent.trim().substring(0, 100), href: a.href });
      });
      // Alle Buttons
      document.querySelectorAll('button').forEach(b => {
        items.push({ type: 'button', text: b.textContent.trim().substring(0, 100) });
      });
      return items;
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'navigation.json'), JSON.stringify(navData, null, 2));
    console.log(`  ✅ ${navData.length} Nav-Items gefunden`);

    // Schritt 3: Prompts Seite
    console.log('\n📋 [3/6] Lade Prompts...');
    await page.goto('https://aistudio.google.com/prompts', { waitUntil: 'networkidle', timeout: 30000 });
    await delay(5000);
    
    const promptsContent = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'prompts-page.txt'), promptsContent);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'screenshot-prompts.png'), fullPage: true });
    console.log(`  ✅ Prompts: ${promptsContent.length} Zeichen`);

    // Schritt 4: Verschiedene Seiten testen
    console.log('\n🔍 [4/6] Suche Builder Tools...');
    const pagesToCheck = [
      { url: 'https://aistudio.google.com/app', name: 'app' },
      { url: 'https://aistudio.google.com/apps', name: 'apps' },
      { url: 'https://aistudio.google.com/library', name: 'library' },
      { url: 'https://aistudio.google.com/build', name: 'build' },
      { url: 'https://aistudio.google.com/applets', name: 'applets' },
      { url: 'https://aistudio.google.com/saved', name: 'saved' },
      { url: 'https://aistudio.google.com/gallery', name: 'gallery' }
    ];

    for (const p of pagesToCheck) {
      try {
        console.log(`  Teste: ${p.url}`);
        await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
        await delay(3000);
        
        const content = await page.evaluate(() => document.body.innerText);
        const finalUrl = page.url();
        
        if (content.length > 200) {
          fs.writeFileSync(
            path.join(OUTPUT_DIR, `page-${p.name}.txt`),
            `Final URL: ${finalUrl}\nOriginal: ${p.url}\n\n${content}`
          );
          await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${p.name}.png`), fullPage: true });
          console.log(`    ✅ ${p.name}: ${content.length} Zeichen (→ ${finalUrl})`);

          // Karten/Items zaehlen
          const itemCount = await page.evaluate(() => {
            const selectors = ['[class*="card"]', '[class*="item"]', '[class*="tile"]', '[class*="applet"]', 'tr', 'li'];
            let max = 0;
            for (const s of selectors) {
              const count = document.querySelectorAll(s).length;
              if (count > max) max = count;
            }
            return max;
          });
          if (itemCount > 5) {
            console.log(`    📦 ~${itemCount} Items auf der Seite`);
          }
        }
      } catch (e) {
        console.log(`    ❌ ${p.name}: ${e.message.substring(0, 80)}`);
      }
    }

    // Schritt 5: Sidebar erkunden
    console.log('\n📂 [5/6] Erkunde Sidebar/Menue...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'networkidle', timeout: 20000 });
    await delay(3000);

    // Suche nach Sidebar-Toggle
    const sidebarButtons = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('button, [role="button"], [role="tab"], [role="menuitem"]').forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 0 && text.length < 50) {
          results.push({
            text,
            tag: el.tagName,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            classes: el.className.substring(0, 100)
          });
        }
      });
      return results;
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'ui-buttons.json'), JSON.stringify(sidebarButtons, null, 2));
    console.log(`  ✅ ${sidebarButtons.length} Buttons/Tabs gefunden`);

    // Schritt 6: Gesamter Seitenbaum (DOM-Analyse)
    console.log('\n🌲 [6/6] DOM-Analyse...');
    const domSummary = await page.evaluate(() => {
      const walk = (el, depth = 0) => {
        if (depth > 5) return '';
        let result = '';
        const text = el.textContent?.trim().substring(0, 50) || '';
        if (text && el.children.length < 3 && text.length > 2) {
          result += '  '.repeat(depth) + `<${el.tagName.toLowerCase()}> ${text}\n`;
        }
        for (const child of el.children) {
          result += walk(child, depth + 1);
        }
        return result;
      };
      return walk(document.body);
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'dom-tree.txt'), domSummary);
    console.log(`  ✅ DOM-Baum: ${domSummary.length} Zeichen`);

    // Ergebnis zusammenfassen
    console.log('\n============================================');
    console.log('✅ EXPORT ABGESCHLOSSEN!');
    console.log(`📁 Dateien in: ${OUTPUT_DIR}`);
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(f => {
      const stats = fs.statSync(path.join(OUTPUT_DIR, f));
      console.log(`  ${f} (${Math.round(stats.size/1024)}KB)`);
    });

  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
    try {
      const content = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'error-dump.txt'), content);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'error-screenshot.png') });
    } catch(e) {}
  } finally {
    await context.close();
  }
}

exportTools().catch(e => console.error('Fatal:', e));
