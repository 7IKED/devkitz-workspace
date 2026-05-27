import os
import glob
import json
import re

ROOT_DIR = r"c:\DEVKiTZ"

def scan_project():
    report = {
        "total_files": 0,
        "html_files": [],
        "css_files": [],
        "js_files": [],
        "json_files": [],
        "md_files": [],
        "graphics": [],
        "licenses": [],
        "errors": [],
        "good": []
    }
    
    for root, dirs, files in os.walk(ROOT_DIR):
        # Modify dirs in-place to skip unwanted directories
        dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', '_logs', '.gemini', '.agents'}]
        for file in files:
            file_path = os.path.join(root, file)
            try:
                rel_path = os.path.relpath(file_path, ROOT_DIR)
            except ValueError:
                continue # ignore mount points like \\.\nul
            
            report["total_files"] += 1
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                # Might be a binary graphic
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp')):
                    report["graphics"].append(rel_path)
                continue
            except Exception as e:
                report["errors"].append(f"[{rel_path}] Lese-Fehler: {str(e)}")
                continue

            # Categorize
            if file.endswith('.html'):
                # Check HTML structure
                if '<!DOCTYPE html>' not in content and '<!doctype html>' not in content.lower():
                    report["errors"].append(f"[{rel_path}] Fehlendes <!DOCTYPE html>")
                else:
                    report["good"].append(f"[{rel_path}] Valides HTML5 DOCTYPE vorhanden")
                
                if '<title>' not in content:
                    report["errors"].append(f"[{rel_path}] Kein <title> Tag")
                else:
                    title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
                    if title_match:
                        report["good"].append(f"[{rel_path}] Title gesetzt: {title_match.group(1)}")
                
                if '©' in content or 'Copyright' in content:
                    report["licenses"].append(f"[{rel_path}] Copyright/Lizenz-Hinweis gefunden")
                else:
                    report["errors"].append(f"[{rel_path}] Fehlender © DEVKiTZ™ Copyright-Hinweis")
                    
                if 'display:none;flex:1;display:none' in content:
                    report["errors"].append(f"[{rel_path}] Doppeltes display:none (CSS Konflikt)")
                    
                if 'innerHTML' in content and 'document.' in content:
                    # check if event/user input might be passed
                    if '`' in content:
                        report["errors"].append(f"[{rel_path}] Warnung: Mögliche XSS Gefahr durch innerHTML mit Template Literals")
                
                # Check for SVGs or images
                if '<svg' in content:
                    report["graphics"].append(f"[{rel_path}] Inline SVG gefunden")
                if '<img' in content:
                    report["graphics"].append(f"[{rel_path}] <img> Tag gefunden")
                    if 'alt=""' in content.replace(" ", "") or 'alt' not in content:
                        report["errors"].append(f"[{rel_path}] <img> Tag ohne alt-Attribut (Accessibility)")
                    else:
                        report["good"].append(f"[{rel_path}] <img> Tag hat alt-Attribut")

                report["html_files"].append(rel_path)
                
            elif file.endswith('.css'):
                if '©' in content or 'Copyright' in content:
                    report["licenses"].append(f"[{rel_path}] CSS Lizenz/Copyright gefunden")
                report["css_files"].append(rel_path)
                
            elif file.endswith('.js'):
                report["js_files"].append(rel_path)
                
            elif file.endswith('.json'):
                try:
                    json.loads(content)
                    report["good"].append(f"[{rel_path}] Valides JSON Format")
                except json.JSONDecodeError as e:
                    report["errors"].append(f"[{rel_path}] Ungültiges JSON: {str(e)}")
                report["json_files"].append(rel_path)
                
            elif file.endswith('.md'):
                report["md_files"].append(rel_path)

            if 'license' in file.lower():
                report["licenses"].append(f"[{rel_path}] Explizite Lizenz-Datei gefunden")

    return report

if __name__ == "__main__":
    rep = scan_project()
    with open(r"c:\DEVKiTZ\01_PROJECTS\01_dashboard\AUDIT_RESULTS.json", "w", encoding="utf-8") as f:
        json.dump(rep, f, indent=2, ensure_ascii=False)
    print("Audit finished, wrote AUDIT_RESULTS.json")
