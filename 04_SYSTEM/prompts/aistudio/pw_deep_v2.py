"""
AI Studio - DEEP Content Extraction v2
Extrahiert den ECHTEN App-Code aus CodeMirror/Monaco Editoren
+ System-Prompts + vollstaendigen Quellcode
"""
import sys, io, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
from pathlib import Path

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def extract_app_deep(page, app_id, app_title):
    """Tiefen-Extraktion: Code-Editor, System-Prompt, Quellcode"""
    url = f"https://aistudio.google.com/apps/{app_id}"
    page.goto(url, wait_until="networkidle", timeout=30000)
    time.sleep(5)
    
    # Tiefen-Extraktion via JavaScript
    content = page.evaluate("""
        () => {
            const result = {
                title: document.title,
                url: location.href,
                
                // 1. CodeMirror Inhalt
                codemirror: [],
                
                // 2. Monaco Editor
                monaco: [],
                
                // 3. Alle versteckten Textareas + Inputs
                hiddenFields: [],
                
                // 4. Alle pre/code Bloecke
                codeBlocks: [],
                
                // 5. Shadow DOM durchsuchen
                shadowContent: [],
                
                // 6. Alle iframes
                iframeUrls: [],
                
                // 7. Content-editable Bereiche
                editables: [],
                
                // 8. App-spezifische Daten
                appData: null,
            };
            
            // CodeMirror v5/v6
            document.querySelectorAll('.CodeMirror, .cm-editor, [class*="codemirror"], [class*="CodeMirror"]').forEach(el => {
                // v5: el.CodeMirror?.getValue()
                if (el.CodeMirror) {
                    result.codemirror.push(el.CodeMirror.getValue());
                }
                // v6: Textinhalt
                const content = el.querySelector('.cm-content');
                if (content) {
                    result.codemirror.push(content.textContent);
                }
                // Fallback
                if (!el.CodeMirror && !content) {
                    result.codemirror.push(el.textContent);
                }
            });
            
            // Monaco Editor
            if (window.monaco) {
                const models = window.monaco.editor.getModels();
                models.forEach(m => result.monaco.push(m.getValue()));
            }
            // Auch Monaco container suchen
            document.querySelectorAll('.monaco-editor, [class*="monaco"]').forEach(el => {
                const lines = el.querySelectorAll('.view-line');
                if (lines.length > 0) {
                    const text = Array.from(lines).map(l => l.textContent).join('\\n');
                    result.monaco.push(text);
                }
            });
            
            // Versteckte Felder
            document.querySelectorAll('textarea, input[type="hidden"]').forEach(el => {
                const val = el.value || el.textContent || '';
                if (val.length > 10) {
                    result.hiddenFields.push({
                        tag: el.tagName,
                        name: el.name || el.id || el.className.substring(0, 50),
                        value: val.substring(0, 50000),
                    });
                }
            });
            
            // Code-Bloecke
            document.querySelectorAll('pre, code, [class*="source"], [class*="code-"]').forEach(el => {
                const text = el.textContent.trim();
                if (text.length > 20) {
                    result.codeBlocks.push(text.substring(0, 50000));
                }
            });
            
            // Shadow DOM
            function searchShadow(root, depth) {
                if (depth > 5) return;
                root.querySelectorAll('*').forEach(el => {
                    if (el.shadowRoot) {
                        const text = el.shadowRoot.textContent;
                        if (text && text.length > 50) {
                            result.shadowContent.push(text.substring(0, 10000));
                        }
                        searchShadow(el.shadowRoot, depth + 1);
                    }
                });
            }
            searchShadow(document, 0);
            
            // Iframes
            document.querySelectorAll('iframe').forEach(iframe => {
                result.iframeUrls.push(iframe.src || '(no src)');
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    if (doc) {
                        result.iframeUrls.push('CONTENT: ' + doc.documentElement.outerHTML.substring(0, 50000));
                    }
                } catch(e) {
                    result.iframeUrls.push('CROSS-ORIGIN: ' + e.message);
                }
            });
            
            // Content-editable
            document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                const text = el.textContent || el.innerHTML;
                if (text.length > 10) {
                    result.editables.push(text.substring(0, 50000));
                }
            });
            
            // App-Daten aus globalen Variablen
            try {
                if (window.__APP_DATA__) result.appData = JSON.stringify(window.__APP_DATA__).substring(0, 50000);
                if (window.__NEXT_DATA__) result.appData = JSON.stringify(window.__NEXT_DATA__).substring(0, 50000);
            } catch(e) {}
            
            return result;
        }
    """)
    
    return content

def main():
    log("=== AI Studio DEEP Content Export v2 ===")
    
    # Vorherige App-Liste laden
    with open(OUTPUT / "export-FINAL.json", "r", encoding="utf-8") as f:
        prev = json.load(f)
    
    apps = prev['apps']
    log(f"Exportiere {len(apps)} Apps mit Tiefen-Extraktion")
    
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
        
        deep_results = []
        
        # Erst 5 Stichproben fuer Struktur-Analyse
        log("\n=== STICHPROBE (5 Apps) ===")
        sample_apps = [a for a in apps if (a.get('text_length') or 0) > 2000][:5]
        
        for i, app in enumerate(sample_apps):
            app_id = app['id']
            title = app.get('page_title', app.get('title', '?'))
            log(f"\n[{i+1}/5] {title[:50]}...")
            
            try:
                content = extract_app_deep(page, app_id, title)
                
                log(f"  CodeMirror: {len(content['codemirror'])} Editoren")
                for j, cm in enumerate(content['codemirror']):
                    log(f"    CM[{j}]: {len(cm)} Zeichen")
                    if cm:
                        log(f"      {cm[:100]}")
                
                log(f"  Monaco: {len(content['monaco'])} Editoren")
                for j, m in enumerate(content['monaco']):
                    log(f"    M[{j}]: {len(m)} Zeichen")
                
                log(f"  Hidden: {len(content['hiddenFields'])} Felder")
                for hf in content['hiddenFields']:
                    log(f"    {hf['name']}: {len(hf['value'])} Zeichen")
                
                log(f"  Code: {len(content['codeBlocks'])} Bloecke")
                for j, cb in enumerate(content['codeBlocks'][:3]):
                    log(f"    [{j}]: {len(cb)} Zeichen - {cb[:80]}")
                
                log(f"  Shadow: {len(content['shadowContent'])} Elemente")
                log(f"  Iframes: {len(content['iframeUrls'])}")
                for iframe_info in content['iframeUrls']:
                    log(f"    {iframe_info[:150]}")
                
                log(f"  Editables: {len(content['editables'])}")
                for ed in content['editables'][:3]:
                    log(f"    {len(ed)} Zeichen: {ed[:100]}")
                
                deep_results.append({
                    "id": app_id,
                    "title": title,
                    "content": content,
                })
                
            except Exception as e:
                log(f"  FEHLER: {e}")
        
        # Speichern
        with open(OUTPUT / "export-DEEP-sample.json", "w", encoding="utf-8") as f:
            json.dump(deep_results, f, indent=2, ensure_ascii=False)
        
        log(f"\nStichprobe gespeichert: export-DEEP-sample.json")
        
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
