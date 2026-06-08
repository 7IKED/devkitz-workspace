import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import asyncio, os, json
from pathlib import Path

# === PYDANTIC GLOBAL PATCH fuer Python 3.14 Kompatibilitaet ===
import pydantic

# __setattr__ patchen: Erlaube beliebige Attribute
_orig_setattr = pydantic.BaseModel.__setattr__
def _patched_setattr(self, name, value):
    try:
        _orig_setattr(self, name, value)
    except (ValueError, AttributeError):
        object.__setattr__(self, name, value)
pydantic.BaseModel.__setattr__ = _patched_setattr

# __getattr__ patchen: Fallback auf object.__getattribute__
_orig_getattr = pydantic.BaseModel.__getattr__
def _patched_getattr(self, name):
    try:
        return _orig_getattr(self, name)
    except AttributeError:
        # Versuche aus __dict__ zu lesen (fuer monkey-patched Attribute)
        try:
            return object.__getattribute__(self, name)
        except AttributeError:
            raise AttributeError(f"'{type(self).__name__}' has no attribute '{name}'")
pydantic.BaseModel.__getattr__ = _patched_getattr
# === END PATCH ===

from langchain_openai import ChatOpenAI
from browser_use.browser import BrowserProfile
from browser_use.agent.service import Agent

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")

async def main():
    print("AI Studio Exporter - browser-use + Gemini")
    
    llm = ChatOpenAI(
        model="gemini-2.5-flash",
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=os.environ["GEMINI_API_KEY"],
    )
    # browser-use erwartet diese Attribute
    object.__setattr__(llm, "provider", "openai")
    object.__setattr__(llm, "model", "gemini-2.5-flash")
    
    profile = BrowserProfile(
        headless=False,
        executable_path=r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        disable_security=True,
        keep_alive=False,
        viewport={"width": 1400, "height": 900},
        args=["--disable-blink-features=AutomationControlled", "--no-first-run"],
        minimum_wait_page_load_time=3,
        wait_for_network_idle_page_load_time=3,
    )
    
    task = """
    ZIEL: Exportiere alle gespeicherten Prompts und Builder-Tools aus Google AI Studio.
    
    SCHRITT 1 - LOGIN:
    - Gehe zu https://aistudio.google.com/prompts
    - Wenn Login-Seite: Gib x_email in Email-Feld ein, klick Weiter
    - Gib x_password in Passwort-Feld ein, klick Weiter  
    - Warte 30 Sekunden falls 2FA kommt (User bestaetigt am Handy)
    
    SCHRITT 2 - PROMPTS:
    - Auf der Prompts-Seite: scrolle ganz nach unten (mehrmals!) um ALLE zu laden
    - Notiere JEDEN Prompt-Namen den du siehst
    - Extrahiere den gesamten sichtbaren Text
    
    SCHRITT 3 - APPS:
    - Navigiere zu https://aistudio.google.com/app
    - Scrolle ganz nach unten (mehrmals!)
    - Notiere JEDEN App/Tool-Namen
    
    ERGEBNIS: Komplette Liste aller Prompts und Tools.
    Format: "Nr. | Name | Typ (Prompt/App)"
    Am Ende: Gesamtzahl
    """
    
    agent = Agent(
        task=task,
        llm=llm,
        browser_profile=profile,
        sensitive_data={"x_email": "likedeazy@gmail.com", "x_password": "Marlyundich1337"},
        max_actions_per_step=5,
        use_vision=True,
        max_failures=5,
    )
    
    print("Agent startet... Falls 2FA: Am Handy bestaetigen!")
    
    try:
        result = await agent.run(max_steps=30)
        result_text = str(result) if result else "Kein Ergebnis"
        print("\n" + "="*60)
        print("ERGEBNIS:")
        print("="*60)
        print(result_text[:3000])
        
        with open(OUTPUT / "browser-use-result.txt", "w", encoding="utf-8") as f:
            f.write(result_text)
        print(f"\nGespeichert ({len(result_text)} Zeichen)")
    except Exception as e:
        print(f"Fehler: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import subprocess
    r = subprocess.run(
        ["powershell", "-Command", '[System.Environment]::GetEnvironmentVariable("GEMINI_API_KEY", "User")'],
        capture_output=True, text=True
    )
    key = r.stdout.strip()
    if key:
        os.environ["GEMINI_API_KEY"] = key
        os.environ["GOOGLE_API_KEY"] = key
    print(f"API Key: {'OK' if os.environ.get('GEMINI_API_KEY') else 'FEHLT'}")
    asyncio.run(main())
