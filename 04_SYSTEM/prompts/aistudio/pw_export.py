"""
AI Studio Export via Playwright - AUTO-LOGIN
Loggt sich automatisch ein und extrahiert dann alles.
"""
import sys, io, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright
from pathlib import Path

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def auto_login(page, email, password):
    """Google Login automatisch ausfuellen"""
    log("Auto-Login starte...")
    
    # Email eingeben
    try:
        email_input = page.locator('input[type="email"]')
        email_input.wait_for(timeout=10000)
        email_input.fill(email)
        log("  Email eingegeben")
        time.sleep(1)
        
        # Weiter-Button
        page.locator('#identifierNext, button:has-text("Weiter"), button:has-text("Next")').first.click()
        log("  Weiter geklickt")
        time.sleep(5)
        
        page.screenshot(path=str(OUTPUT / "pw-login-01.png"))
        
        # Passwort eingeben
        pw_input = page.locator('input[type="password"]')
        pw_input.wait_for(timeout=15000)
        pw_input.fill(password)
        log("  Passwort eingegeben")
        time.sleep(1)
        
        # Anmelden-Button
        page.locator('#passwordNext, button:has-text("Weiter"), button:has-text("Next")').first.click()
        log("  Anmelden geklickt")
        time.sleep(10)
        
        page.screenshot(path=str(OUTPUT / "pw-login-02.png"))
        
        # Warte auf Redirect
        for i in range(30):
            current = page.url
            if "aistudio" in current:
                log(f"  Login erfolgreich! {current}")
                return True
            if "challenge" in current or "signin/challenge" in current:
                log(f"  2FA noetig! Bitte am Handy bestaetigen...")
                # Warte auf 2FA
                for j in range(60):
                    time.sleep(2)
                    if "aistudio" in page.url:
                        log(f"  2FA bestaetigt!")
                        return True
                    if j % 10 == 0:
                        log(f"  Warte auf 2FA... ({j*2}s)")
                break
            time.sleep(2)
        
        return "aistudio" in page.url
        
    except Exception as e:
        log(f"  Login Fehler: {e}")
        page.screenshot(path=str(OUTPUT / "pw-login-error.png"))
        return False

def main():
    log("=== AI Studio Export via Playwright (Auto-Login) ===")
    
    with sync_playwright() as p:
        temp_profile = str(OUTPUT / "pw-profile")
        log(f"Profil: {temp_profile}")
        
        context = p.chromium.launch_persistent_context(
            user_data_dir=temp_profile,
            channel="chrome",
            headless=False,
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
            no_viewport=True,
        )
        log("Chrome gestartet!")
        
        page = context.pages[0] if context.pages else context.new_page()
        
        # Zu AI Studio
        log("Navigiere zu AI Studio...")
        page.goto("https://aistudio.google.com/prompts", wait_until="networkidle", timeout=60000)
        time.sleep(3)
        
        url = page.url
        log(f"URL: {url}")
        
        # Auto-Login falls noetig
        if "accounts.google" in url:
            success = auto_login(page, "likedeazy@gmail.com", "Marlyundich1337")
            if not success:
                log("Login fehlgeschlagen!")
                context.close()
                return
            time.sleep(5)
        
        # Jetzt eingeloggt - Prompts extrahieren
        log("\n=== EXTRAKTION ===")
        page.goto("https://aistudio.google.com/prompts", wait_until="networkidle", timeout=60000)
        time.sleep(5)
        
        page.screenshot(path=str(OUTPUT / "pw-03-prompts.png"))
        
        # Scrollen
        log("Scrolle...")
        prev_height = 0
        for i in range(50):
            page.evaluate("window.scrollBy(0, 500)")
            time.sleep(0.3)
            height = page.evaluate("document.body.scrollHeight")
            if height == prev_height and i > 10:
                log(f"  Scrollende bei {i}")
                break
            prev_height = height
        time.sleep(3)
        
        # DOM-Text
        text = page.evaluate("document.body.innerText")
        log(f"Text: {len(text)} Zeichen")
        with open(OUTPUT / "export-prompts-dom.txt", "w", encoding="utf-8") as f:
            f.write(text)
        
        # HTML
        html = page.content()
        with open(OUTPUT / "export-prompts.html", "w", encoding="utf-8") as f:
            f.write(html)
        log(f"HTML: {len(html)} Zeichen")
        
        # Prompt-Elemente
        prompts = page.evaluate("""
            () => {
                const items = [];
                document.querySelectorAll('a, [role="link"], [role="listitem"], [role="row"], [class*="card"], [class*="prompt"], [class*="item"]').forEach(el => {
                    const text = el.textContent.trim();
                    const href = el.href || el.getAttribute('href') || '';
                    if (text && text.length > 2 && text.length < 500) {
                        items.push({ text: text.substring(0, 300), href: href, tag: el.tagName, cls: el.className.substring(0, 100) });
                    }
                });
                return items;
            }
        """)
        log(f"Elemente: {len(prompts)}")
        with open(OUTPUT / "export-prompts-elements.json", "w", encoding="utf-8") as f:
            json.dump(prompts, f, indent=2, ensure_ascii=False)
        
        # Zeilen
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        log(f"\n{len(lines)} Zeilen:")
        for l in lines[:30]:
            log(f"  > {l[:120]}")
        
        page.screenshot(path=str(OUTPUT / "pw-04-done.png"), full_page=True)
        context.close()
    
    log("\n=== FERTIG! ===")

if __name__ == "__main__":
    main()
