"""
AI Studio Export v2 - fixierte Version
- Schliesst Google Drive Fenster zuerst
- Findet das richtige Chrome-Fenster
- Nutzt PowerShell fuer Clipboard statt ctypes
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import pyautogui
import subprocess
import time
import ctypes
from ctypes import wintypes
from pathlib import Path

OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.3

user32 = ctypes.windll.user32

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def screenshot(name):
    path = str(OUTPUT / f"v2-{name}.png")
    pyautogui.screenshot(path)
    return path

def get_clipboard():
    """Clipboard via PowerShell lesen - encoding-sicher"""
    try:
        r = subprocess.run(
            ["powershell", "-Command", "Get-Clipboard"],
            capture_output=True, timeout=5
        )
        if r.stdout:
            return r.stdout.decode('utf-8', errors='replace').strip()
    except Exception as e:
        log(f"Clipboard Fehler: {e}")
    return ""

def set_clipboard(text):
    subprocess.run(["powershell", "-Command", f"Set-Clipboard -Value ''"], 
                   capture_output=True)

def find_and_focus_window(title_contains):
    """Finde Fenster nach Titel und fokussiere es"""
    EnumWindows = user32.EnumWindows
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
    
    found = None
    def callback(hwnd, lParam):
        nonlocal found
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buf = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buf, length + 1)
                title = buf.value
                if title_contains.lower() in title.lower():
                    found = (hwnd, title)
                    return False
        return True
    
    EnumWindows(WNDENUMPROC(callback), 0)
    
    if found:
        hwnd, title = found
        user32.ShowWindow(hwnd, 9)
        time.sleep(0.3)
        user32.SetForegroundWindow(hwnd)
        time.sleep(0.5)
        log(f"Fenster fokussiert: '{title}'")
        return True
    return False

def close_window(title_contains):
    """Fenster schliessen"""
    EnumWindows = user32.EnumWindows
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
    
    def callback(hwnd, lParam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buf = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buf, length + 1)
                if title_contains.lower() in buf.value.lower():
                    WM_CLOSE = 0x0010
                    user32.PostMessageW(hwnd, WM_CLOSE, 0, 0)
                    log(f"Fenster geschlossen: '{buf.value}'")
                    return False
        return True
    
    EnumWindows(WNDENUMPROC(callback), 0)

def list_windows():
    """Alle sichtbaren Fenster auflisten"""
    EnumWindows = user32.EnumWindows
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
    
    windows = []
    def callback(hwnd, lParam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buf = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buf, length + 1)
                windows.append(buf.value)
        return True
    
    EnumWindows(WNDENUMPROC(callback), 0)
    return windows

def main():
    log("=== AI Studio Export v2 ===")
    
    # 1. Google Drive schliessen
    log("Schliesse Google Drive...")
    close_window("Google Drive")
    time.sleep(2)
    
    # 2. Alle sichtbaren Fenster listen
    windows = list_windows()
    log(f"Offene Fenster ({len(windows)}):")
    for w in windows[:15]:
        log(f"  > {w}")
    
    # 3. Chrome oeffnen mit AI Studio
    log("\nOeffne Chrome mit AI Studio...")
    subprocess.Popen([
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "--new-window",
        "https://aistudio.google.com/prompts"
    ])
    time.sleep(10)
    
    # 4. Fenster nochmal listen
    windows2 = list_windows()
    log(f"Fenster nach Chrome-Start ({len(windows2)}):")
    for w in windows2[:15]:
        log(f"  > {w}")
    
    # 5. Chrome/AI Studio Fenster fokussieren
    found = False
    for search in ["AI Studio", "Google AI", "aistudio", "Gemini", "- Google Chrome"]:
        if find_and_focus_window(search):
            found = True
            break
    
    if not found:
        log("Chrome-Fenster nicht gefunden, versuche generisch...")
        find_and_focus_window("Chrome")
    
    time.sleep(3)
    screenshot("01-chrome-focused")
    
    # 6. Sicherheitshalber nochmal zur URL navigieren
    pyautogui.hotkey('ctrl', 'l')
    time.sleep(0.5)
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.2)
    # typewrite kann nur ASCII, nutze pyperclip via clipboard
    subprocess.run(["powershell", "-Command", 
                     "Set-Clipboard -Value 'https://aistudio.google.com/prompts'"],
                   capture_output=True)
    pyautogui.hotkey('ctrl', 'v')
    time.sleep(0.5)
    pyautogui.press('enter')
    log("URL eingefuegt und Enter gedrueckt")
    time.sleep(12)
    
    screenshot("02-after-navigate")
    
    # 7. Text kopieren
    set_clipboard("")
    # In Seitenbereich klicken
    pyautogui.press('tab')
    time.sleep(0.3)
    pyautogui.hotkey('ctrl', 'a')
    time.sleep(0.5)
    pyautogui.hotkey('ctrl', 'c')
    time.sleep(1)
    
    text = get_clipboard()
    log(f"Seitentext: {len(text)} Zeichen")
    
    if len(text) > 50:
        log(f"Erste 200 Zeichen: {text[:200]}")
    
    # Login check
    if "Anmeldung" in text or "Sign in" in text or len(text) < 50:
        log("Login noetig oder Seite leer!")
        screenshot("03-login-needed")
        
        # Speichere was wir haben
        with open(OUTPUT / "export-status.txt", "w", encoding="utf-8") as f:
            f.write(f"Status: Login noetig\nText: {text}\n")
    else:
        log("Seite hat Inhalt!")
        
        # Scrollen und extrahieren
        pages = {
            "prompts": "https://aistudio.google.com/prompts",
            "app": "https://aistudio.google.com/app",
        }
        
        for name, url in pages.items():
            log(f"\n--- {name} ---")
            # URL setzen
            pyautogui.hotkey('ctrl', 'l')
            time.sleep(0.5)
            subprocess.run(["powershell", "-Command", f"Set-Clipboard -Value '{url}'"],
                          capture_output=True)
            pyautogui.hotkey('ctrl', 'v')
            time.sleep(0.3)
            pyautogui.press('enter')
            time.sleep(12)
            
            # Scrollen
            for i in range(25):
                pyautogui.scroll(-5)
                time.sleep(0.4)
            time.sleep(2)
            
            # Text kopieren
            set_clipboard("")
            pyautogui.hotkey('ctrl', 'a')
            time.sleep(0.5)
            pyautogui.hotkey('ctrl', 'c')
            time.sleep(1)
            
            page_text = get_clipboard()
            log(f"{name}: {len(page_text)} Zeichen")
            
            with open(OUTPUT / f"export-{name}.txt", "w", encoding="utf-8") as f:
                f.write(f"URL: {url}\n\n{page_text}")
            
            screenshot(f"04-{name}")
    
    log("\nFERTIG!")

if __name__ == "__main__":
    main()
