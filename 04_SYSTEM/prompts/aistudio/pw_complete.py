"""
AI Studio - ALLE Apps + Prompts komplett exportieren
Scrollt die Apps-Seite komplett durch
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
    log("=== AI Studio - KOMPLETT Export ===")
    
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(OUTPUT / "pw-profile"),
            channel="chrome",
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
            no_viewport=True,
        )
        log("Chrome gestartet (Session aktiv)")
        page = context.pages[0] if context.pages else context.new_page()
        
        # === APPS (User's eigene) ===
        log("\n=== APPS EXPORTIEREN ===")
        page.goto("https://aistudio.google.com/apps?source=user", wait_until="networkidle", timeout=60000)
        time.sleep(5)
        
        # Aggressiv scrollen fuer lazy loading
        log("Scrolle intensiv...")
        prev_count = 0
        for round_num in range(20):
            # Seite scrollen
            for i in range(20):
                page.evaluate("window.scrollBy(0, 800)")
                time.sleep(0.2)
            time.sleep(3)
            
            # Zaehle aktuelle Apps
            count = page.evaluate("""
                () => document.querySelectorAll('a[href*="/apps/"]').length
            """)
            log(f"  Runde {round_num+1}: {count} App-Links")
            
            if count == prev_count and round_num > 3:
                log(f"  Keine neuen Apps mehr nach Runde {round_num+1}")
                break
            prev_count = count
            
            # Zurueck nach oben und nochmal
            page.evaluate("window.scrollTo(0, 0)")
            time.sleep(1)
        
        # Alle App-Links sammeln
        apps = page.evaluate("""
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
        
        log(f"\n=== APPS GEFUNDEN: {len(apps)} ===")
        for i, app in enumerate(apps):
            log(f"  {i+1:3d}. {app['title'][:70]}")
        
        with open(OUTPUT / "export-all-apps.json", "w", encoding="utf-8") as f:
            json.dump(apps, f, indent=2, ensure_ascii=False)
        
        page.screenshot(path=str(OUTPUT / "pw-all-apps.png"), full_page=True)
        
        # === PROMPTS (Sidebar) ===
        log("\n=== PROMPTS EXPORTIEREN ===")
        page.goto("https://aistudio.google.com/library", wait_until="networkidle", timeout=60000)
        time.sleep(5)
        
        prompts = page.evaluate("""
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
                            id: href.split('/prompts/')[1] || '',
                        });
                    }
                });
                return items;
            }
        """)
        
        log(f"\n=== PROMPTS GEFUNDEN: {len(prompts)} ===")
        for i, pr in enumerate(prompts):
            log(f"  {i+1:3d}. {pr['title'][:70]}")
        
        with open(OUTPUT / "export-all-prompts.json", "w", encoding="utf-8") as f:
            json.dump(prompts, f, indent=2, ensure_ascii=False)
        
        # === GESAMTLISTE ===
        total = len(apps) + len(prompts)
        log(f"\n{'='*50}")
        log(f"GESAMT: {total} Items ({len(apps)} Apps + {len(prompts)} Prompts)")
        log(f"{'='*50}")
        
        summary = {
            "total": total,
            "apps_count": len(apps),
            "prompts_count": len(prompts),
            "apps": apps,
            "prompts": prompts,
        }
        with open(OUTPUT / "export-complete.json", "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        log(f"\nGespeichert: export-complete.json")
        
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
