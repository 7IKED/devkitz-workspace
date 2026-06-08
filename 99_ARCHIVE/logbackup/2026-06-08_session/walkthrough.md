# Nexus Copilot — Architecture Walkthrough

Das Framework für den **Nexus Copilot** wurde komplett in eine **Decoupled Offline-First Architektur** umgebaut. Das System besteht nun aus zwei völlig unabhängigen Hälften, die beide überleben können, wenn die andere ausfällt, und direkt in die **DEVKiTZ Runtime** integriert sind.

---

## 1. Die neue Struktur

Das Projekt befindet sich nun unter `01_PROJECTS/nexus-copilot/` und ist in zwei Bereiche getrennt:

### 🖥️ Das Frontend (`/frontend`)
Dieses Modul ist das "geschlossene System", das auf dem Desktop als `.exe` und auf dem Handy als PWA (Progressive Web App) läuft.
- **Electron Shell (`main.js`):** Verpackt das UI in ein transparentes, Always-on-Top Fenster mit System-Tray-Icon und dem globalen Hotkey `Ctrl+Space`.
- **UI & Design:** Nutzt das DkZ Design System v2 (Glassmorphism, `--accent: #fa1e4e`) komplett ohne Frameworks.
- **PWA & Mobile:** Durch `manifest.json` und `sw.js` kann die Web-Ansicht (`ui/index.html`) auf dem Handy auf den Homescreen hinzugefügt werden.

### ☁️ Das Backend (`/backend`)
Der Core-Server, der auf deinem Hostinger VPS (oder lokalem PS) läuft.
- **API-Gateway:** Ein Express.js Server (`server.js`), der Requests an OpenAI oder RAG/Vektor-Datenbanken weiterleiten kann.
- **Sync-Endpoint:** Ein `/api/sync` Endpoint, der die asynchronen Queues der Clients (Handys/Desktop) verarbeitet.

---

## 2. Integration in die Workspace Runtime

Die **DEVKiTZ Runtime** (`C:\DEVKiTZ\runtime\main.js`) wurde aktualisiert:
1. **Auto-Start:** Sobald die Runtime lädt, triggert sie im Hintergrund automatisch den `nexus-copilot` via `npx electron .`. Damit ist der Copilot sofort für dich bereit (per Hotkey).
2. **Issue-Connection:** Die Runtime lädt jetzt beim Start standardmäßig das neue **GitHub Kanban Modul** (`modules/github-kanban`), damit du sofort mit deinen VPS-Issues und PRs verbunden bist.

> [!TIP]
> **Ausführen:** Gehe in `C:\DEVKiTZ\runtime` und starte `npm run start`. Das Dashboard öffnet sich und der Nexus Copilot lädt sich unsichtbar in den Hintergrund (erkennbar am "N" Icon rechts unten im System Tray).

---

## 3. "Unabhängiges Überleben" (Offline-First)

Das Herzstück des Frontends ist der **`nexus-client.js`**. 
Wenn das Backend auf dem VPS ausfällt, passiert folgendes:

1. Der Client merkt das beim Health-Check (alle 5 Sekunden). Die Ampel oben links springt von **Grün auf Rot**.
2. Wenn du eine Nachricht tippst, stürzt die App nicht ab. Sie schiebt die Nachricht in eine lokale `localStorage` **Offline-Queue** (sichtbar am Footer "1 Nachricht(en) in der Offline-Queue").
3. Sobald das Backend wieder erreichbar ist, schießt das Frontend alle angestauten Nachrichten per Bulk an den Sync-Endpoint des Backends und das System arbeitet ganz normal weiter.

---

## 4. Nächste Schritte

- **Build für Windows:** Du kannst jederzeit im Ordner `frontend/` den Befehl `npm run build:win` ausführen, um eine portable `.exe` zu generieren.
- **Handy-Zugriff:** Sobald das Frontend (der `ui` Ordner) über eine Domain (z.B. Hostinger VPS / Nginx) per HTTPS erreichbar ist, kannst du es auf dem iPhone in Safari öffnen und "Zum Home-Bildschirm hinzufügen" wählen.
- **Backend-Logik:** Die API im Backend liefert im Moment statische Placeholder-Antworten. Hier können wir im nächsten Schritt die tatsächlichen RAG- / GitHub-APIs anbinden.
