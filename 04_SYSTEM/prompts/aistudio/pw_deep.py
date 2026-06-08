"""
AI Studio - Alle Prompts aus Sidebar + API extrahieren
Session ist gespeichert - kein Login noetig
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
    log("=== AI Studio - Sidebar Prompt Export ===")
    
    # API Responses sammeln
    api_responses = []
    
    with sync_playwright() as p:
        temp_profile = str(OUTPUT / "pw-profile")
        
        context = p.chromium.launch_persistent_context(
            user_data_dir=temp_profile,
            channel="chrome",
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
            no_viewport=True,
        )
        log("Chrome gestartet")
        
        page = context.pages[0] if context.pages else context.new_page()
        
        # API-Calls abfangen
        def handle_response(response):
            url = response.url
            if any(x in url for x in ["generativelanguage", "aistudio.google.com/api", "proactivebackend", "content", "list"]):
                try:
                    body = response.text()
                    api_responses.append({
                        "url": url,
                        "status": response.status,
                        "body_length": len(body),
                        "body": body[:10000],
                    })
                    log(f"  API: {response.status} {url[:100]} ({len(body)} bytes)")
                except:
                    pass
        
        page.on("response", handle_response)
        
        # History-Seite laden (hier sind die Prompts)
        log("Lade History...")
        page.goto("https://aistudio.google.com/library", wait_until="networkidle", timeout=60000)
        time.sleep(5)
        
        # Sidebar scrollen
        log("Scrolle Sidebar...")
        sidebar_scrolled = page.evaluate("""
            () => {
                // Verschiedene Sidebar-Container finden
                const candidates = [
                    ...document.querySelectorAll('nav'),
                    ...document.querySelectorAll('[class*="sidebar"]'),
                    ...document.querySelectorAll('[class*="sidenav"]'),
                    ...document.querySelectorAll('[class*="drawer"]'),
                    ...document.querySelectorAll('[class*="list"]'),
                    ...document.querySelectorAll('[role="navigation"]'),
                    ...document.querySelectorAll('[role="list"]'),
                    ...document.querySelectorAll('mat-sidenav'),
                    ...document.querySelectorAll('mat-drawer'),
                ];
                const result = [];
                for (const el of candidates) {
                    if (el.scrollHeight > el.clientHeight) {
                        result.push({
                            tag: el.tagName,
                            class: el.className.substring(0, 100),
                            scrollHeight: el.scrollHeight,
                            clientHeight: el.clientHeight,
                        });
                    }
                }
                return result;
            }
        """)
        log(f"Scrollbare Container: {len(sidebar_scrolled)}")
        for c in sidebar_scrolled:
            log(f"  {c['tag']} class={c['class'][:60]} scroll={c['scrollHeight']} client={c['clientHeight']}")
        
        # Alle scrollbaren Container durchscrollen
        page.evaluate("""
            () => {
                const containers = [
                    ...document.querySelectorAll('nav'),
                    ...document.querySelectorAll('[class*="sidebar"]'),
                    ...document.querySelectorAll('[class*="sidenav"]'),
                    ...document.querySelectorAll('[class*="drawer"]'),
                    ...document.querySelectorAll('[role="navigation"]'),
                    ...document.querySelectorAll('mat-sidenav'),
                    ...document.querySelectorAll('mat-drawer'),
                ];
                for (const el of containers) {
                    if (el.scrollHeight > el.clientHeight) {
                        el.scrollTop = el.scrollHeight;
                    }
                }
            }
        """)
        time.sleep(3)
        
        # Mehrmals scrollen fuer lazy loading
        for scroll_round in range(10):
            page.evaluate("""
                () => {
                    const containers = document.querySelectorAll('nav, [class*="sidebar"], [class*="sidenav"], [class*="drawer"], mat-sidenav, mat-drawer');
                    for (const el of containers) {
                        if (el.scrollHeight > el.clientHeight) {
                            el.scrollTop = el.scrollHeight;
                        }
                    }
                }
            """)
            time.sleep(1)
        
        time.sleep(3)
        
        # Alle Prompt-Links sammeln
        log("Sammle Prompt-Links...")
        prompt_links = page.evaluate("""
            () => {
                const prompts = [];
                const seen = new Set();
                document.querySelectorAll('a[href*="/prompts/"]').forEach(a => {
                    const href = a.href;
                    if (!seen.has(href)) {
                        seen.add(href);
                        prompts.push({
                            title: a.textContent.trim().substring(0, 200),
                            href: href,
                            id: href.split('/prompts/')[1] || '',
                        });
                    }
                });
                return prompts;
            }
        """)
        
        log(f"\n=== PROMPTS GEFUNDEN: {len(prompt_links)} ===")
        for i, pl in enumerate(prompt_links):
            log(f"  {i+1}. {pl['title'][:80]} -> {pl['id'][:30]}")
        
        with open(OUTPUT / "export-prompt-links.json", "w", encoding="utf-8") as f:
            json.dump(prompt_links, f, indent=2, ensure_ascii=False)
        
        # Wenn weniger als erwartet, auch Apps-Seite checken
        if len(prompt_links) < 50:
            log("\nZu wenige Prompts - checke auch Apps...")
            page.goto("https://aistudio.google.com/apps?source=user", wait_until="networkidle", timeout=60000)
            time.sleep(5)
            
            # Scrollen
            for i in range(30):
                page.evaluate("window.scrollBy(0, 500)")
                time.sleep(0.3)
            time.sleep(3)
            
            apps_text = page.evaluate("document.body.innerText")
            with open(OUTPUT / "export-apps-user.txt", "w", encoding="utf-8") as f:
                f.write(apps_text)
            
            app_links = page.evaluate("""
                () => {
                    const apps = [];
                    const seen = new Set();
                    document.querySelectorAll('a[href]').forEach(a => {
                        const href = a.href;
                        if (!seen.has(href) && (href.includes('/app/') || href.includes('/apps/'))) {
                            seen.add(href);
                            apps.push({
                                title: a.textContent.trim().substring(0, 200),
                                href: href,
                            });
                        }
                    });
                    return apps;
                }
            """)
            log(f"App-Links: {len(app_links)}")
            for al in app_links[:20]:
                log(f"  {al['title'][:80]} -> {al['href'][:80]}")
            
            with open(OUTPUT / "export-app-links.json", "w", encoding="utf-8") as f:
                json.dump(app_links, f, indent=2, ensure_ascii=False)
            
            page.screenshot(path=str(OUTPUT / "pw-apps-user.png"))
        
        # API Responses speichern
        with open(OUTPUT / "export-api-responses.json", "w", encoding="utf-8") as f:
            json.dump(api_responses, f, indent=2, ensure_ascii=False)
        log(f"\nAPI Responses: {len(api_responses)}")
        
        # Full HTML der Sidebar
        sidebar_html = page.evaluate("""
            () => {
                const nav = document.querySelector('nav, [class*="sidenav"], mat-sidenav, mat-drawer');
                return nav ? nav.innerHTML : 'KEINE SIDEBAR GEFUNDEN';
            }
        """)
        with open(OUTPUT / "export-sidebar.html", "w", encoding="utf-8") as f:
            f.write(sidebar_html)
        log(f"Sidebar HTML: {len(sidebar_html)} Zeichen")
        
        page.screenshot(path=str(OUTPUT / "pw-final.png"), full_page=True)
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
