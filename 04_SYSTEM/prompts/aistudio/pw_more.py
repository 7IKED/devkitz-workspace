"""
AI Studio - PAGINATION + History durchsuchen
50 Apps gefunden, suche die restlichen 60
"""
import sys, io, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
from pathlib import Path

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def main():
    log("=== Suche die restlichen Items ===")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(OUTPUT / "pw-profile"),
            channel="chrome",
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
            no_viewport=True,
        )
        log("Chrome gestartet")
        page = context.pages[0] if context.pages else context.new_page()
        
        # 1. Apps-Seite: "Load More" / Pagination suchen
        log("\n=== 1. APPS - Pagination suchen ===")
        page.goto("https://aistudio.google.com/apps?source=user", wait_until="networkidle", timeout=60000)
        time.sleep(5)
        
        # Nach Pagination-Elementen suchen
        pagination = page.evaluate("""
            () => {
                const items = [];
                // Load More / Show More / Mehr laden Buttons
                const btns = document.querySelectorAll('button, [role="button"]');
                btns.forEach(b => {
                    const text = b.textContent.trim().toLowerCase();
                    if (text.includes('more') || text.includes('load') || text.includes('next') || 
                        text.includes('mehr') || text.includes('laden') || text.includes('weiter') ||
                        text.includes('show') || text.includes('page')) {
                        items.push({type: 'button', text: b.textContent.trim(), visible: b.offsetParent !== null});
                    }
                });
                // Pagination links
                document.querySelectorAll('a[href*="page"], [class*="pagination"], [class*="pager"]').forEach(el => {
                    items.push({type: 'pagination', text: el.textContent.trim(), href: el.href || ''});
                });
                // Alle Buttons auflisten
                const allBtns = [];
                btns.forEach(b => {
                    if (b.textContent.trim().length > 0 && b.textContent.trim().length < 50 && b.offsetParent !== null) {
                        allBtns.push(b.textContent.trim());
                    }
                });
                return {pagination: items, allButtons: allBtns};
            }
        """)
        log(f"Pagination-Elemente: {len(pagination['pagination'])}")
        for p_item in pagination['pagination']:
            log(f"  {p_item}")
        log(f"Alle sichtbaren Buttons: {pagination['allButtons']}")
        
        # Versuche ganz nach unten zu scrollen und "Load More" zu klicken
        for attempt in range(5):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            
            # Suche und klicke "Load More" o.ae.
            try:
                more_btn = page.locator('button:has-text("More"), button:has-text("Load"), button:has-text("Show"), button:has-text("Mehr")').first
                if more_btn.is_visible():
                    more_btn.click()
                    log(f"  'More' Button geklickt (Versuch {attempt+1})")
                    time.sleep(5)
            except:
                pass
        
        # Apps nochmal zaehlen
        apps_count = page.evaluate("document.querySelectorAll('a[href*=\"/apps/\"]').length")
        log(f"Apps nach Pagination-Versuch: {apps_count}")
        
        # 2. HISTORY durchsuchen (Hauptbereich, nicht nur Sidebar)
        log("\n=== 2. HISTORY - Hauptbereich ===")
        page.goto("https://aistudio.google.com/library", wait_until="networkidle", timeout=60000)
        time.sleep(5)
        
        # Den gesamten Seiteninhalt analysieren
        page_analysis = page.evaluate("""
            () => {
                const body = document.body;
                const mainContent = document.querySelector('main, [role="main"], [class*="main"], [class*="content"]');
                
                // Alle interaktiven Elemente im Hauptbereich
                const elements = [];
                (mainContent || body).querySelectorAll('*').forEach(el => {
                    if (el.children.length === 0 && el.textContent.trim().length > 0) {
                        elements.push({
                            tag: el.tagName,
                            text: el.textContent.trim().substring(0, 100),
                            class: el.className ? el.className.toString().substring(0, 80) : '',
                        });
                    }
                });
                
                // Alle Links
                const links = [];
                (mainContent || body).querySelectorAll('a[href]').forEach(a => {
                    links.push({
                        text: a.textContent.trim().substring(0, 100),
                        href: a.href,
                    });
                });
                
                return {
                    mainExists: !!mainContent,
                    mainTag: mainContent ? mainContent.tagName : 'none',
                    mainClass: mainContent ? (mainContent.className || '').toString().substring(0, 100) : 'none',
                    elementsCount: elements.length,
                    firstElements: elements.slice(0, 30),
                    linksCount: links.length,
                    links: links,
                };
            }
        """)
        
        log(f"Main-Element: {page_analysis['mainExists']} ({page_analysis['mainTag']} class={page_analysis['mainClass']})")
        log(f"Elemente: {page_analysis['elementsCount']}")
        log(f"Links: {page_analysis['linksCount']}")
        
        log("\nErste Elemente:")
        for el in page_analysis['firstElements']:
            log(f"  <{el['tag']}> {el['text'][:80]}")
        
        log("\nAlle Links:")
        for link in page_analysis['links']:
            log(f"  {link['text'][:50]} -> {link['href'][:80]}")
        
        # 3. History-Tab/Bereich klicken
        log("\n=== 3. History-Tabs suchen ===")
        tabs = page.evaluate("""
            () => {
                const tabs = [];
                document.querySelectorAll('[role="tab"], [class*="tab"], .mat-tab-label').forEach(el => {
                    tabs.push({
                        text: el.textContent.trim(),
                        selected: el.getAttribute('aria-selected') || '',
                        class: el.className.toString().substring(0, 80),
                    });
                });
                return tabs;
            }
        """)
        log(f"Tabs: {len(tabs)}")
        for t in tabs:
            log(f"  {t['text']} (selected={t['selected']})")
        
        # 4. Playground/Chat History
        log("\n=== 4. Chat History ===")
        page.goto("https://aistudio.google.com/prompts", wait_until="load", timeout=60000)
        time.sleep(10)
        
        log(f"URL: {page.url}")
        log(f"Title: {page.title()}")
        
        history_links = page.evaluate("""
            () => {
                const items = [];
                const seen = new Set();
                document.querySelectorAll('a[href*="/prompts/"]').forEach(a => {
                    const href = a.href;
                    if (!seen.has(href) && !href.includes('new_chat')) {
                        seen.add(href);
                        items.push({
                            title: a.textContent.trim().substring(0, 200),
                            href: href,
                        });
                    }
                });
                return items;
            }
        """)
        log(f"Prompt-Links: {len(history_links)}")
        for hl in history_links[:20]:
            log(f"  {hl['title'][:60]} -> {hl['href'][:60]}")
        
        page.screenshot(path=str(OUTPUT / "pw-history.png"))
        
        # Save alles
        with open(OUTPUT / "export-page-analysis.json", "w", encoding="utf-8") as f:
            json.dump(page_analysis, f, indent=2, ensure_ascii=False)
        with open(OUTPUT / "export-history-links.json", "w", encoding="utf-8") as f:
            json.dump(history_links, f, indent=2, ensure_ascii=False)
        
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
