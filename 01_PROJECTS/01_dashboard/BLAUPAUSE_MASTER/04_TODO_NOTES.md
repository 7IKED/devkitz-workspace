# 📝 TODO & NOTES FUER UNS

> **Fokus:** Was noch zu tun ist (basierend auf den aktuellen Entwicklungs-Sitzungen).
> **Status:** "Nichts machen, nur dokumentieren."

---

## 📱 1. DkZ™ Mobile App Werkzeuge (Die 25 Tools)

*   **Implementierung der 25 Mobile Tools:** Der Prompt fuer die 25 DkZ™ Handy-Apps (AiAi Kirk Clipper, MD-Forge, etc.) ist geschrieben. Die eigentliche Entwicklung (z.B. in Go/Fyne, Tauri Mobile oder React Native als Fallback) muss noch gestartet werden.
*   **Terminal im Terminal (Smart View):** Die Mobile-Ansicht fuer das *DkZ™ SSH-Terminal Mini* und den *DkZ™ API-Pinger* muss das "Terminal in Terminal" Konzept umsetzen (smartes, klickbares Menue anstatt reiner Texteingabe).
*   **Offline First / Fallbacks:** Wenn Google Stitch / Flow / Bana / Veo nicht verfügbar sind, muessen die Open-Source GitHub Alternativen (wie lokales SQLite, React Native WebViews) greifen.

## 💾 2. DEEPKEEP & Cloud-Sync Automatisierung

*   **Cloud Drive Fallback:** Die automatische Komprimierung und der Upload in Google Drive (bei fehlendem Abo nur komprimiert) muss in das `dkz-sync` / Export-Modul eingebaut werden.
*   **[DEEPKEEP] Ordner Logik:** Der automatische Verschiebe-Mechanismus von Dokumenten, Bildern und Videos in den lokalen `[DEEPKEEP]` Ordner muss finalisiert werden.

## 🤖 3. Copilot & Desktop Core

*   **Unresponsive Handler:** Die neue Logik (`refresh-window` statt Force Quit) wurde in `main.js` fuer den DkZ Copilot Desktop eingebaut. Sie muss unter Windows intensiv getestet werden, um sicherzustellen, dass haengende Module den Guardian/James nicht blockieren.
*   **Ollama / Local LLM Migration:** Der Uebergang von GPU-vLLM zu einem leichtgewichtigen Ollama Backend fuer die ONTHERUN™ Server muss abgeschlossen werden.

## 📖 4. DkZ Ecosystem Cleanup

*   **Graphify Playbook Viewer:** Dieses Modul muss finalisiert werden.
*   **Umlaut-Bereinigung (R31):** Permanente Kontrolle, dass nirgendwo Umlaute (ae, oe, ue, ss) verwendet werden, auch nicht in den neu generierten Mobile-App-Dokus.
*   **WissenHub Sync:** Alle neuen Blaupausen und Architekturdokumente muessen weiterhin strikt dual in `WissenHub (Iceberg)` und das `Research Archive` gespiegelt werden.
