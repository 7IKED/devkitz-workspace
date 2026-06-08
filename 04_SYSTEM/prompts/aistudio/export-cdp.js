#!/usr/bin/env node
/**
 * AI Studio Exporter - CDP (Chrome DevTools Protocol)
 * Verbindet sich mit der LAUFENDEN Chrome-Instanz ueber DevTools Protocol
 * Der User muss Chrome mit --remote-debugging-port=9222 starten
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:\\DEVKiTZ\\04_SYSTEM\\prompts\\aistudio';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function exportViaCDP() {
  console.log('🔌 Verbinde mit laufendem Chrome via CDP...');
  
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ Verbunden!');
    
    const contexts = browser.contexts();
    console.log(`📂 ${contexts.length} Browser-Kontexte gefunden`);
    
    if (contexts.length === 0) {
      console.log('❌ Keine Kontexte! Chrome laeuft nicht mit --remote-debugging-port');
      return;
    }
    
    const context = contexts[0];
    const pages = context.pages();
    console.log(`📄 ${pages.length} Tabs offen`);
    
    // Suche nach AI Studio Tab
    let aiStudioPage = null;
    for (const p of pages) {
      const url = p.url();
      console.log(`  Tab: ${url.substring(0, 80)}`);
      if (url.includes('aistudio.google.com')) {
        aiStudioPage = p;
      }
    }
    
    if (!aiStudioPage) {
      console.log('\n🔄 Kein AI Studio Tab gefunden — oeffne neuen...');
      aiStudioPage = await context.newPage();
      await aiStudioPage.goto('https://aistudio.google.com/prompts', { waitUntil: 'networkidle', timeout: 30000 });
      await delay(5000);
    }
    
    console.log(`\n📋 Extrahiere von: ${aiStudioPage.url()}`);
    
    // Inhalt extrahieren
    const content = await aiStudioPage.evaluate(() => document.body.innerText);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'cdp-content.txt'), content);
    console.log(`✅ ${content.length} Zeichen extrahiert`);
    
    // Screenshot
    await aiStudioPage.screenshot({ path: path.join(OUTPUT_DIR, 'cdp-screenshot.png'), fullPage: true });
    console.log('📸 Screenshot gespeichert');
    
    // Verschiedene Seiten besuchen
    const urls = [
      'https://aistudio.google.com/prompts',
      'https://aistudio.google.com/app',
      'https://aistudio.google.com/library'
    ];
    
    for (const url of urls) {
      try {
        await aiStudioPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await delay(3000);
        const text = await aiStudioPage.evaluate(() => document.body.innerText);
        const name = url.split('/').pop();
        fs.writeFileSync(path.join(OUTPUT_DIR, `cdp-${name}.txt`), `URL: ${aiStudioPage.url()}\n\n${text}`);
        await aiStudioPage.screenshot({ path: path.join(OUTPUT_DIR, `cdp-${name}.png`), fullPage: true });
        console.log(`✅ ${name}: ${text.length} Zeichen`);
      } catch (e) {
        console.log(`❌ ${url}: ${e.message.substring(0, 60)}`);
      }
    }
    
    console.log('\n✅ CDP Export fertig!');
    
  } catch (e) {
    if (e.message.includes('ECONNREFUSED')) {
      console.log('❌ Chrome laeuft nicht mit CDP! Starte Chrome neu mit:');
      console.log('   chrome.exe --remote-debugging-port=9222');
    } else {
      console.log('❌ Fehler:', e.message);
    }
  }
}

exportViaCDP().catch(console.error);
