"""
AI Studio - ALLE DATEIEN pro App extrahieren
Klickt im File-Explorer jede Datei an und liest Monaco-Inhalt
"""
import sys, io, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
from pathlib import Path

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def extract_all_files(page, app_id):
    """Oeffne App, klicke alle Dateien, lese Monaco-Inhalt"""
    url = f"https://aistudio.google.com/apps/{app_id}"
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(5)
    
    # 1. Alle Dateien im File-Explorer finden
    file_list = page.evaluate("""
        () => {
            const files = [];
            // Suche nach Datei-Eintraegen im File Explorer
            const selectors = [
                '[class*="file"] [class*="name"]',
                '[class*="file-name"]',
                '[class*="tree-item"]',
                '[class*="explorer"] [role="treeitem"]',
                '[role="treeitem"]',
                '[class*="file-entry"]',
                'button[class*="file"]',
                // data_object ist ein Material Icon fuer Datei
                'mat-icon + span',
            ];
            
            for (const sel of selectors) {
                document.querySelectorAll(sel).forEach(el => {
                    const text = el.textContent.trim();
                    if (text && text.length < 100 && !files.some(f => f.text === text)) {
                        files.push({
                            text: text,
                            selector: sel,
                            tag: el.tagName,
                        });
                    }
                });
            }
            
            // Auch nach bekannten Dateinamen suchen
            const knownFiles = ['index.html', 'main.js', 'script.js', 'style.css', 'app.js', 'index.js'];
            document.querySelectorAll('*').forEach(el => {
                if (el.children.length === 0) {
                    const text = el.textContent.trim();
                    if (knownFiles.some(f => text.includes(f))) {
                        files.push({
                            text: text,
                            selector: 'known-file',
                            tag: el.tagName,
                        });
                    }
                }
            });
            
            return files;
        }
    """)
    
    # 2. Jede Datei anklicken und Monaco lesen
    all_files = {}
    
    # Erst das aktuelle Monaco-Model (metadata.json) lesen
    metadata = page.evaluate("""
        () => {
            if (window.monaco) {
                const models = window.monaco.editor.getModels();
                return models.map(m => ({uri: m.uri.toString(), content: m.getValue()}));
            }
            return [];
        }
    """)
    
    for m in metadata:
        if len(m['content']) > 1:
            all_files[m['uri']] = m['content']
    
    # Dateien im Explorer anklicken
    for file_info in file_list:
        fname = file_info['text']
        if fname in ['metadata.json', 'more_vert', 'chevron_left', 'chevron_right', 'settings', 'data_object']:
            continue
        
        try:
            # Datei anklicken
            clicked = page.evaluate("""
                (fileName) => {
                    // Suche nach dem Element mit diesem Text
                    const els = document.querySelectorAll('*');
                    for (const el of els) {
                        if (el.children.length === 0 && el.textContent.trim() === fileName) {
                            el.click();
                            return true;
                        }
                    }
                    // Auch partial match
                    for (const el of els) {
                        if (el.children.length === 0 && el.textContent.trim().includes(fileName)) {
                            el.click();
                            return true;
                        }
                    }
                    return false;
                }
            """, fname)
            
            if clicked:
                time.sleep(2)
                
                # Monaco models lesen
                models = page.evaluate("""
                    () => {
                        if (window.monaco) {
                            const models = window.monaco.editor.getModels();
                            return models.map(m => ({uri: m.uri.toString(), content: m.getValue()}));
                        }
                        return [];
                    }
                """)
                
                for m in models:
                    if len(m['content']) > 1 and m['uri'] not in all_files:
                        all_files[m['uri']] = m['content']
                        
        except Exception as e:
            pass
    
    return file_list, all_files

def main():
    log("=== AI Studio - Alle Dateien exportieren ===")
    
    # App-Liste laden
    with open(OUTPUT / "export-FINAL.json", "r", encoding="utf-8") as f:
        prev = json.load(f)
    
    apps = prev['apps']
    # Nur Apps mit Content (nicht Gallery-Remixes)
    real_apps = [a for a in apps if (a.get('text_length') or 0) > 1000]
    log(f"Apps mit Content: {len(real_apps)}")
    
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
        
        all_exports = []
        total_code_bytes = 0
        
        for i, app in enumerate(real_apps):
            app_id = app['id']
            title = app.get('page_title', app.get('title', '?')).replace(' | Google AI Studio', '')
            log(f"\n[{i+1}/{len(real_apps)}] {title[:50]}")
            
            try:
                file_list, files = extract_all_files(page, app_id)
                
                code_size = sum(len(v) for v in files.values())
                total_code_bytes += code_size
                
                log(f"  Explorer: {len(file_list)} Eintraege")
                log(f"  Monaco-Dateien: {len(files)}")
                for uri, content in files.items():
                    log(f"    {uri}: {len(content)} Zeichen")
                    log(f"      {content[:80]}")
                
                all_exports.append({
                    "id": app_id,
                    "title": title,
                    "file_explorer": file_list,
                    "files": {uri: content for uri, content in files.items()},
                    "total_code_size": code_size,
                })
                
            except Exception as e:
                log(f"  FEHLER: {e}")
                all_exports.append({
                    "id": app_id, 
                    "title": title, 
                    "error": str(e)
                })
        
        # Speichern
        with open(OUTPUT / "export-ALL-FILES.json", "w", encoding="utf-8") as f:
            json.dump(all_exports, f, indent=2, ensure_ascii=False)
        
        total_kb = total_code_bytes / 1024
        log(f"\n{'='*50}")
        log(f"GESAMT: {len(all_exports)} Apps, {total_code_bytes} Bytes ({total_kb:.1f} KB) Code")
        log(f"Gespeichert: export-ALL-FILES.json")
        log(f"{'='*50}")
        
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
