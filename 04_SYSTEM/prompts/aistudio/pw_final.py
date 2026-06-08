"""
AI Studio - Alle Tabs + Inhalte exportieren
Phase 1: Alle Tabs durchsuchen (By you, Recents, By others)
Phase 2: Jeden einzelnen App-Inhalt extrahieren
"""
import sys, io, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
from pathlib import Path

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def collect_apps(page):
    """Alle App-Links auf der aktuellen Seite sammeln"""
    return page.evaluate("""
        () => {
            const apps = [];
            const seen = new Set();
            document.querySelectorAll('a[href*="/apps/"]').forEach(a => {
                const href = a.href.split('?')[0];
                if (!seen.has(href) && href.includes('/apps/') && !href.endsWith('/apps/') && !href.endsWith('/apps')) {
                    seen.add(href);
                    const id = href.split('/apps/')[1] || '';
                    if (id && id.length > 5) {
                        apps.push({
                            title: a.textContent.trim().substring(0, 200),
                            href: href,
                            id: id,
                        });
                    }
                }
            });
            return apps;
        }
    """)

def main():
    log("=== AI Studio - FINAL Export ===")
    
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
        
        all_apps = {}
        
        # === PHASE 1: Alle Tabs durchsuchen ===
        tabs_to_check = ["By you", "Recents", "By others"]
        
        for tab_name in tabs_to_check:
            log(f"\n=== Tab: {tab_name} ===")
            page.goto("https://aistudio.google.com/apps?source=user", wait_until="networkidle", timeout=60000)
            time.sleep(3)
            
            # Tab klicken
            try:
                tab_btn = page.locator(f'button:has-text("{tab_name}")').first
                if tab_btn.is_visible():
                    tab_btn.click()
                    log(f"  Tab '{tab_name}' geklickt")
                    time.sleep(5)
                else:
                    log(f"  Tab '{tab_name}' nicht sichtbar")
                    continue
            except Exception as e:
                log(f"  Tab Fehler: {e}")
                continue
            
            # Scrollen
            for i in range(20):
                page.evaluate("window.scrollBy(0, 800)")
                time.sleep(0.3)
            time.sleep(3)
            
            apps = collect_apps(page)
            log(f"  Apps in '{tab_name}': {len(apps)}")
            for app in apps[:10]:
                log(f"    > {app['title'][:60]}")
            
            for app in apps:
                if app['id'] not in all_apps:
                    all_apps[app['id']] = app
                    all_apps[app['id']]['source_tab'] = tab_name
        
        log(f"\n=== ALLE UNIQUE APPS: {len(all_apps)} ===")
        
        # === PHASE 2: Jeden App-Inhalt extrahieren ===
        log("\n=== PHASE 2: App-Inhalte exportieren ===")
        app_details = []
        
        for i, (app_id, app_info) in enumerate(all_apps.items()):
            log(f"\n[{i+1}/{len(all_apps)}] {app_info['title'][:50]}...")
            
            try:
                url = f"https://aistudio.google.com/apps/{app_id}"
                page.goto(url, wait_until="networkidle", timeout=30000)
                time.sleep(3)
                
                # App-Details extrahieren
                details = page.evaluate("""
                    () => {
                        const text = document.body.innerText;
                        // System-Prompt/Instructions suchen
                        const textareas = [];
                        document.querySelectorAll('textarea, [contenteditable="true"], [class*="editor"], [class*="prompt"], [class*="instruction"]').forEach(el => {
                            textareas.push(el.textContent || el.value || el.innerText || '');
                        });
                        // Code-Bloecke
                        const codeBlocks = [];
                        document.querySelectorAll('code, pre, [class*="code"]').forEach(el => {
                            codeBlocks.push(el.textContent.trim());
                        });
                        return {
                            title: document.title,
                            text: text.substring(0, 5000),
                            textareas: textareas,
                            codeBlocks: codeBlocks.slice(0, 10),
                        };
                    }
                """)
                
                app_details.append({
                    "id": app_id,
                    "title": app_info['title'],
                    "href": app_info['href'],
                    "source_tab": app_info.get('source_tab', ''),
                    "page_title": details['title'],
                    "text_length": len(details['text']),
                    "text_preview": details['text'][:500],
                    "textareas": details['textareas'],
                    "code_blocks": details['codeBlocks'],
                })
                
                log(f"  Title: {details['title'][:60]}")
                log(f"  Text: {len(details['text'])} Zeichen")
                if details['textareas']:
                    log(f"  Textareas: {len(details['textareas'])}")
                
            except Exception as e:
                log(f"  FEHLER: {e}")
                app_details.append({
                    "id": app_id,
                    "title": app_info['title'],
                    "error": str(e),
                })
        
        # === PHASE 3: Prompt-Inhalte ===
        log("\n=== PHASE 3: Prompt-Inhalte ===")
        prompt_ids = [
            ("Effizientes Prompt-Management", "1mOGbwZ01OA7jjMAEp8CbnnU9ovRoBw66"),
            ("Agentic Orchestration", "1K95cLrneWL9ZSpKMyl6UI0GbCFjJBidi"),
            ("Exploring Future AI", "1_9BwY_NzCiy5Qndu4lQmUWmWjaItDQqz"),
            ("Drive Access Denied", "1ri-aQqfddna-x16J0pBR0i2-wjLU19Iu"),
        ]
        
        prompt_details = []
        for title, pid in prompt_ids:
            log(f"\n  Prompt: {title}")
            try:
                page.goto(f"https://aistudio.google.com/prompts/{pid}", wait_until="networkidle", timeout=30000)
                time.sleep(3)
                text = page.evaluate("document.body.innerText")
                prompt_details.append({
                    "id": pid,
                    "title": title,
                    "text": text[:5000],
                    "text_length": len(text),
                })
                log(f"    {len(text)} Zeichen")
            except Exception as e:
                log(f"    FEHLER: {e}")
        
        # === SPEICHERN ===
        final = {
            "export_date": time.strftime("%Y-%m-%d %H:%M"),
            "total_apps": len(all_apps),
            "total_prompts": len(prompt_details),
            "apps": app_details,
            "prompts": prompt_details,
        }
        
        with open(OUTPUT / "export-FINAL.json", "w", encoding="utf-8") as f:
            json.dump(final, f, indent=2, ensure_ascii=False)
        
        log(f"\n{'='*50}")
        log(f"FINAL: {len(app_details)} Apps + {len(prompt_details)} Prompts")
        log(f"Gespeichert: export-FINAL.json")
        log(f"{'='*50}")
        
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
