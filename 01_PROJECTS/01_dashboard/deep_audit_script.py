import os
import re

ROOT_DIR = r"c:\DEVKiTZ\01_PROJECTS\01_dashboard"
MODULES_DIR = os.path.join(ROOT_DIR, "modules")
DASHBOARDS = ["hub", "community", "knowledge-hub", "action-deck", "agenten_dashboard", "auth-center", "blogger-dashboard", "cicd-pipeline", "ecosystem-datasight", "eu-cloud", "landing-pages", "mainboard", "messenger"]

def perform_deep_audit():
    targets = []
    
    # Collect all modules
    if os.path.exists(MODULES_DIR):
        for d in os.listdir(MODULES_DIR):
            path = os.path.join(MODULES_DIR, d)
            if os.path.isdir(path):
                targets.append(("Modul", d, path))
                
    # Collect all dashboards
    for d in DASHBOARDS:
        path = os.path.join(ROOT_DIR, d)
        if os.path.isdir(path):
            targets.append(("Dashboard", d, path))
            
    report_lines = []
    report_lines.append("# 🔬 Deep Semantic Quality Audit — DkZ Standards")
    report_lines.append("> Überprüfung aller Settings-Panels, Info-Panels, Funktionen und DkZ-Qualitätsstandards.")
    report_lines.append("")
    
    missing_standards = []

    for t_type, name, path in targets:
        index_file = os.path.join(path, "index.html")
        panel_file = os.path.join(path, "index_panel.html")
        
        files_to_check = []
        if os.path.exists(index_file): files_to_check.append(index_file)
        if os.path.exists(panel_file): files_to_check.append(panel_file)
        
        if not files_to_check:
            continue
            
        report_lines.append(f"## {t_type}: `{name}`")
        
        for file_path in files_to_check:
            filename = os.path.basename(file_path)
            report_lines.append(f"### Datei: `{filename}`")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(file_path, "r", encoding="cp1252", errors="replace") as f:
                    content = f.read()
                
            # --- TESTS ---
            
            # 1. UI & Panels
            has_settings = re.search(r'id=["\']settings|class=["\'][^"\']*settings', content, re.IGNORECASE)
            has_info = re.search(r'id=["\']info|class=["\'][^"\']*info', content, re.IGNORECASE)
            has_hub_btn = '← Hub' in content or 'Hub' in content or 'hub/index.html' in content
            has_version = re.search(r'v0\.\d+', content)
            
            # 2. Styling (DkZ Standard)
            has_glass = 'glass' in content or 'backdrop-filter: blur' in content
            has_blob = 'blob' in content or 'radial-gradient' in content
            has_css_vars = 'var(--' in content
            
            # 3. JavaScript Logic & Quality
            has_toast = 'showToast' in content or 'notification' in content.lower()
            has_storage = 'localStorage' in content
            has_copy = 'clipboard.writeText' in content or 'execCommand(\'copy\')' in content
            has_xss_esc = 'function esc' in content or 'replace(/</g' in content
            has_try_catch = 'try {' in content or 'try{' in content
            
            # Formatiere Ergebnisse
            def check(condition, yes, no):
                return f"✅ {yes}" if condition else f"🔴 {no}"
                
            report_lines.append("**UI & Navigation Structure:**")
            report_lines.append(f"- {check(has_settings, 'Settings-Panel/Config vorhanden', 'FEHLT: Kein Settings-Panel gefunden')}")
            report_lines.append(f"- {check(has_info, 'Info/Help-Panel vorhanden', 'FEHLT: Kein Info-Panel gefunden')}")
            report_lines.append(f"- {check(has_hub_btn, 'Hub Navigation vorhanden', 'FEHLT: Kein Zurück-zum-Hub Button')}")
            report_lines.append(f"- {check(has_version, 'Versionsnummer (vX.XX) im Header', 'FEHLT: Keine Versionsnummer angegeben')}")
            
            report_lines.append("**DkZ Design System:**")
            report_lines.append(f"- {check(has_glass, 'Glassmorphism (Blur) aktiv', 'FEHLT: Kein Glassmorphism Effekt')}")
            report_lines.append(f"- {check(has_blob, 'Background Blobs / Gradients aktiv', 'FEHLT: Keine Background Blobs')}")
            report_lines.append(f"- {check(has_css_vars, 'CSS Variablen genutzt', 'FEHLT: Keine dynamischen CSS Variablen')}")
            
            report_lines.append("**JavaScript Quality & Features:**")
            report_lines.append(f"- {check(has_toast, 'Toast-Benachrichtigungen', 'FEHLT: Keine visuellen Toasts')}")
            report_lines.append(f"- {check(has_storage, 'localStorage Persistenz', 'FEHLT: Speichert keine Daten lokal')}")
            report_lines.append(f"- {check(has_copy, 'Copy-to-Clipboard API', 'FEHLT: Keine Kopier-Funktion')}")
            report_lines.append(f"- {check(has_xss_esc, 'XSS Protection (esc function)', 'FEHLT: Fehlersicherer Output (XSS Gefahr)')}")
            report_lines.append(f"- {check(has_try_catch, 'Error Handling (try/catch)', 'FEHLT: Kein robustes Error-Handling')}")
            
            report_lines.append("\n---\n")
            
            # Sammle fehlende Dinge für die Zusammenfassung
            issues = []
            if not has_settings: issues.append("Settings")
            if not has_info: issues.append("Info-Panel")
            if not has_toast: issues.append("Toasts")
            if not has_storage: issues.append("localStorage")
            if not has_xss_esc: issues.append("XSS-Schutz")
            if not has_hub_btn: issues.append("Hub-Link")
            
            if issues:
                missing_standards.append(f"- **`{name}`**: Fehlt {', '.join(issues)}")

    report_lines.insert(3, "## 🚨 DkZ Standard-Verstöße Übersicht")
    report_lines.insert(4, "> Schnelle Übersicht der Module, denen kritische DkZ Kern-Features fehlen.\n")
    if missing_standards:
        for m in missing_standards:
            report_lines.insert(5, m)
        report_lines.insert(5 + len(missing_standards), "\n---\n")
    else:
        report_lines.insert(5, "✅ Alles perfekt! Keine Abweichungen.\n---\n")

    with open(os.path.join(ROOT_DIR, "DEEP_QUALITY_AUDIT.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
        
    print("Deep audit generated successfully.")

if __name__ == "__main__":
    perform_deep_audit()
