"""Extraktion v3 - mit korrektem Fensterfokus per HWND"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import pyautogui, subprocess, time, ctypes
from ctypes import wintypes
from pathlib import Path

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.3
OUTPUT = Path(r"C:\DEVKiTZ\04_SYSTEM\prompts\aistudio")
user32 = ctypes.windll.user32

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)

def get_clipboard():
    try:
        r = subprocess.run(["powershell", "-Command", "Get-Clipboard"], capture_output=True, timeout=5)
        if r.stdout:
            return r.stdout.decode("utf-8", errors="replace").strip()
    except:
        pass
    return ""

def set_clip(val):
    subprocess.run(["powershell", "-Command", f"Set-Clipboard -Value '{val}'"], capture_output=True)

def find_windows():
    """Finde alle Chrome_WidgetWin_1 Fenster"""
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)
    results = []
    def cb(hwnd, lp):
        if user32.IsWindowVisible(hwnd):
            cls = ctypes.create_unicode_buffer(256)
            user32.GetClassNameW(hwnd, cls, 256)
            if cls.value == "Chrome_WidgetWin_1":
                l = user32.GetWindowTextLengthW(hwnd)
                buf = ctypes.create_unicode_buffer(l + 1)
                user32.GetWindowTextW(hwnd, buf, l + 1)
                results.append((hwnd, buf.value))
        return True
    user32.EnumWindows(WNDENUMPROC(cb), 0)
    return results

def focus_hwnd(hwnd):
    user32.ShowWindow(hwnd, 9)  # SW_RESTORE
    time.sleep(0.3)
    user32.SetForegroundWindow(hwnd)
    time.sleep(1)

log("=== AI Studio Extraktion v3 ===")

# 1. Alle Chrome-Fenster finden
windows = find_windows()
log(f"Chrome-Fenster gefunden: {len(windows)}")
for hwnd, title in windows:
    log(f"  [{hwnd}] {title}")

# 2. "Seiten wiederherstellen" Dialog schliessen
for hwnd, title in windows:
    if "wiederherstellen" in title.lower():
        log(f"Schliesse Dialog: {title}")
        WM_CLOSE = 0x0010
        user32.PostMessageW(hwnd, WM_CLOSE, 0, 0)
        time.sleep(2)

# 3. Das richtige Chrome-Fenster finden (NICHT Antigravity)
chrome_hwnd = None
for hwnd, title in find_windows():
    if "Antigravity" not in title and "Chrome_WidgetWin_1" != "":
        chrome_hwnd = hwnd
        log(f"Chrome Browser: [{hwnd}] {title}")
        break

if not chrome_hwnd:
    log("FEHLER: Kein Chrome-Fenster gefunden!")
    sys.exit(1)

# 4. Chrome fokussieren
focus_hwnd(chrome_hwnd)
log("Chrome fokussiert!")
time.sleep(2)

# 5. Screenshot
pyautogui.screenshot(str(OUTPUT / "v3-01-focused.png"))

# 6. Extraktion
pages = [
    ("prompts", "https://aistudio.google.com/prompts"),
    ("app", "https://aistudio.google.com/app"),
]

for name, url in pages:
    log(f"\n--- {name} ---")
    
    # Nochmal sicher Chrome fokussieren
    focus_hwnd(chrome_hwnd)
    time.sleep(0.5)
    
    # URL navigieren
    pyautogui.hotkey("ctrl", "l")
    time.sleep(0.8)
    set_clip(url)
    time.sleep(0.3)
    pyautogui.hotkey("ctrl", "v")
    time.sleep(0.5)
    pyautogui.press("enter")
    log(f"  Navigation: {url}")
    time.sleep(15)
    
    # Nochmal fokussieren nach Laden
    focus_hwnd(chrome_hwnd)
    time.sleep(1)
    
    pyautogui.screenshot(str(OUTPUT / f"v3-02-{name}-loaded.png"))
    
    # In Seite klicken
    pyautogui.click(700, 500)
    time.sleep(0.5)
    
    # Scrollen fuer lazy-loading
    log("  Scrolle...")
    for i in range(50):
        pyautogui.scroll(-5)
        time.sleep(0.25)
    time.sleep(2)
    
    pyautogui.screenshot(str(OUTPUT / f"v3-03-{name}-scrolled.png"))
    
    # Zurueck nach oben
    pyautogui.hotkey("ctrl", "Home")
    time.sleep(1)
    
    # Text kopieren
    set_clip("")
    time.sleep(0.3)
    pyautogui.hotkey("ctrl", "a")
    time.sleep(0.8)
    pyautogui.hotkey("ctrl", "c")
    time.sleep(1.5)
    
    text = get_clipboard()
    log(f"  {name}: {len(text)} Zeichen")
    
    # Speichern
    with open(OUTPUT / f"export-{name}.txt", "w", encoding="utf-8") as f:
        f.write(text)
    
    if text:
        lines = [l for l in text.split("\n") if l.strip()]
        log(f"  {len(lines)} Zeilen")
        for l in lines[:20]:
            log(f"    > {l[:120]}")
    
    pyautogui.screenshot(str(OUTPUT / f"v3-04-{name}-done.png"))

log("\n=== FERTIG! ===")
