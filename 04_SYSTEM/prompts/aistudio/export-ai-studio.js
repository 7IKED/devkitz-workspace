#!/usr/bin/env node
/**
 * AI Studio Builder Tools Exporter
 * Nutzt Puppeteer mit bestehendem Chrome-Profil um die Tools zu exportieren
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA = process.env.LOCALAPPDATA + '\\Google\\Chrome\\User Data';
const OUTPUT_DIR = 'C:\\DEVKiTZ\\04_SYSTEM\\prompts\\aistudio';

async function exportAiStudioTools() {
  console.log('🚀 AI Studio Exporter gestartet...');
  
  // Chrome mit bestehendem Profil starten (bereits eingeloggt!)
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false, // Sichtbar starten
    userDataDir: USER_DATA,
    args: [
      '--profile-directory=Default',
      '--no-first-run',
      '--disable-extensions',
      '--disable-popup-blocking'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // 1. Zur Apps/Builder Seite navigieren
    console.log('📄 Navigiere zu AI Studio...');
    await page.goto('https://aistudio.google.com/prompts', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(3000);

    // 2. Seiteninhalt extrahieren
    console.log('📋 Extrahiere Seiteninhalt...');
    const bodyText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'page-content-prompts.txt'), bodyText, 'utf8');
    console.log(`  ✅ Prompts-Seite: ${bodyText.length} Zeichen`);

    // 3. Zur App Builder Seite
    const appUrls = [
      'https://aistudio.google.com/app',
      'https://aistudio.google.com/apps',
      'https://aistudio.google.com/applets',
      'https://aistudio.google.com/build',
      'https://aistudio.google.com/library',
      'https://aistudio.google.com/saved'
    ];

    for (const url of appUrls) {
      try {
        console.log(`🔍 Teste: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await delay(2000);
        
        const currentUrl = page.url();
        const content = await page.evaluate(() => document.body.innerText);
        
        if (content.length > 500 && !content.includes('not found') && !content.includes('404')) {
          const filename = url.split('/').pop() || 'index';
          fs.writeFileSync(
            path.join(OUTPUT_DIR, `page-content-${filename}.txt`),
            `URL: ${currentUrl}\n\n${content}`,
            'utf8'
          );
          console.log(`  ✅ ${filename}: ${content.length} Zeichen`);
        } else {
          console.log(`  ⏭️ Wenig Content (${content.length} Zeichen) — uebersprungen`);
        }
      } catch (e) {
        console.log(`  ❌ ${url}: ${e.message}`);
      }
    }

    // 4. Sidebar/Navigation Links sammeln
    console.log('🔗 Sammle alle Navigation-Links...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'networkidle2', timeout: 20000 });
    await delay(3000);
    
    const links = await page.evaluate(() => {
      const allLinks = document.querySelectorAll('a[href]');
      return Array.from(allLinks).map(a => ({
        text: a.textContent.trim().substring(0, 100),
        href: a.href
      })).filter(l => l.href.includes('aistudio.google.com'));
    });
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'navigation-links.json'),
      JSON.stringify(links, null, 2),
      'utf8'
    );
    console.log(`  ✅ ${links.length} Links gefunden`);

    // 5. Screenshot machen
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, 'ai-studio-screenshot.png'),
      fullPage: true 
    });
    console.log('📸 Screenshot gespeichert');

    console.log('\n✅ EXPORT ABGESCHLOSSEN!');
    console.log(`Dateien in: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    // Seiteninhalt trotzdem speichern
    try {
      const content = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'emergency-dump.txt'), content, 'utf8');
      console.log('🔧 Emergency Dump gespeichert');
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

exportAiStudioTools().catch(console.error);
