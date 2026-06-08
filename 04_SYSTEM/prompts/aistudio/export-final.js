#!/usr/bin/env node
/**
 * AI Studio Builder Tools Exporter — Final Version
 * Nutzt Playwright Chromium mit persistentem Profil
 * User loggt sich einmal ein, danach automatische Extraktion
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:\\DEVKiTZ\\04_SYSTEM\\prompts\\aistudio';
const PROFILE_DIR = path.join(OUTPUT_DIR, '.playwright-profile');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const delay = ms => new Promise(r => setTimeout(r, ms));

async function scrollToBottom(page) {
  let prev = 0;
  for (let i = 0; i < 20; i++) {
    const height = await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
      return document.body.scrollHeight;
    });
    if (height === prev) break;
    prev = height;
    await delay(1000);
  }
}

async function main() {
  console.log('🚀 AI Studio Exporter v3 — Playwright Chromium\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    // 1. Navigiere zu AI Studio
    console.log('📄 Navigiere zu AI Studio...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(5000);

    // 2. Login check
    const currentUrl = page.url();
    console.log('URL:', currentUrl);

    if (currentUrl.includes('accounts.google.com') || currentUrl.includes('signin')) {
      console.log('\n🔐 LOGIN ERFORDERLICH!');
      console.log('   Bitte im geoeffneten Browser einloggen...');
      console.log('   Warte bis zu 3 Minuten...\n');

      try {
        await page.waitForURL('**/aistudio.google.com/**', { timeout: 180000 });
        console.log('✅ Login erfolgreich!');
        await delay(5000);
      } catch (e) {
        console.log('❌ Login Timeout — speichere was da ist...');
      }
    } else {
      console.log('✅ Bereits eingeloggt!');
    }

    // 3. Screenshot der Startseite
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'home.png'), fullPage: true });

    // 4. Alle sichtbaren Seiten-Abschnitte sammeln
    console.log('\n📋 Sammle alle Seiten...');
    
    const pages_to_visit = [
      'https://aistudio.google.com/prompts',
      'https://aistudio.google.com/app',
      'https://aistudio.google.com/apps', 
      'https://aistudio.google.com/library',
      'https://aistudio.google.com/build',
      'https://aistudio.google.com/applets',
    ];

    const allData = {};

    for (const url of pages_to_visit) {
      const name = url.split('/').pop();
      try {
        console.log(`\n🔍 ${name}: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await delay(4000);
        
        // Scroll to load all content
        await scrollToBottom(page);
        await delay(2000);
        
        const finalUrl = page.url();
        const content = await page.evaluate(() => document.body.innerText);
        const html = await page.evaluate(() => document.body.innerHTML);
        
        // Karten/Items extrahieren
        const items = await page.evaluate(() => {
          const results = [];
          // Generische Selektoren
          const selectors = [
            '[class*="card"]', '[class*="Card"]',
            '[class*="item"]', '[class*="Item"]', 
            '[class*="tile"]', '[class*="Tile"]',
            '[class*="applet"]', '[class*="Applet"]',
            '[class*="prompt"]', '[class*="Prompt"]',
            '[role="listitem"]', '[role="row"]',
            'mat-card', '.mat-mdc-card'
          ];
          
          for (const sel of selectors) {
            const els = document.querySelectorAll(sel);
            if (els.length > 3) {
              els.forEach(el => {
                const text = el.textContent.trim().substring(0, 300);
                if (text.length > 5) {
                  results.push({
                    selector: sel,
                    text: text,
                    tag: el.tagName,
                    classes: el.className.substring(0, 100)
                  });
                }
              });
              break; // Use first selector that finds items
            }
          }
          return results;
        });

        allData[name] = {
          url: finalUrl,
          contentLength: content.length,
          itemCount: items.length,
          items: items
        };

        // Dateien speichern
        fs.writeFileSync(path.join(OUTPUT_DIR, `page-${name}.txt`), 
          `URL: ${finalUrl}\nItems: ${items.length}\n\n${content}`);
        
        if (items.length > 0) {
          fs.writeFileSync(path.join(OUTPUT_DIR, `items-${name}.json`),
            JSON.stringify(items, null, 2));
        }
        
        await page.screenshot({ path: path.join(OUTPUT_DIR, `screenshot-${name}.png`), fullPage: true });
        
        console.log(`  ✅ URL: ${finalUrl}`);
        console.log(`  📄 ${content.length} Zeichen`);
        console.log(`  📦 ${items.length} Items gefunden`);
        
      } catch (e) {
        console.log(`  ❌ ${e.message.substring(0, 80)}`);
      }
    }

    // 5. Navigation/Sidebar Links finden
    console.log('\n🔗 Sammle Navigation-Links...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(3000);
    
    const navLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => ({ text: a.textContent.trim(), href: a.href }))
        .filter(l => l.text && l.href.includes('aistudio'))
        .reduce((acc, cur) => {
          if (!acc.find(x => x.href === cur.href)) acc.push(cur);
          return acc;
        }, []);
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'nav-links.json'), JSON.stringify(navLinks, null, 2));
    console.log(`  ✅ ${navLinks.length} unique Links`);

    // 6. Zusammenfassung
    console.log('\n============================================');
    console.log('📊 ZUSAMMENFASSUNG');
    console.log('============================================');
    for (const [name, data] of Object.entries(allData)) {
      console.log(`  ${name}: ${data.itemCount} Items, ${data.contentLength} chars (${data.url})`);
    }

    // Alle Dateien auflisten
    console.log('\n📁 Gespeicherte Dateien:');
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => !f.startsWith('.') && !f.startsWith('node_'));
    files.forEach(f => {
      const size = Math.round(fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024);
      console.log(`  ${f} (${size}KB)`);
    });

    // Gesamt-Export
    fs.writeFileSync(path.join(OUTPUT_DIR, 'export-summary.json'), JSON.stringify({
      timestamp: new Date().toISOString(),
      pages: allData,
      navLinks: navLinks,
      totalItems: Object.values(allData).reduce((sum, d) => sum + d.itemCount, 0)
    }, null, 2));

    console.log('\n✅ EXPORT ABGESCHLOSSEN!');

  } catch (error) {
    console.error('\n❌ Fehler:', error.message);
    try {
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'error.png') });
      const content = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'error-dump.txt'), content);
    } catch(e) {}
  } finally {
    console.log('\nBrowser wird in 5 Sekunden geschlossen...');
    await delay(5000);
    await context.close();
  }
}

main().catch(e => console.error('Fatal:', e));
