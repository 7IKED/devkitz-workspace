# 🌐 DEVKiTZ™ HOMEPAGES & BLOG-NETZWERK

> **Fokus:** Uebersicht der offiziellen Homepages, Blogger-Instanzen und deren Datenfluss.

---

## 🏠 1. Offizielle Homepages

| Domain / Pfad | Zweck | Bemerkung |
| :--- | :--- | :--- |
| **devkitz.eu** | Offizielle Landing Page | Zeigt das Oekosystem, bietet Downloads (Chrome Ext, Installer) und Dokumentation an. Nutzt Vanilla HTML/CSS mit DkZ Design System v2. |
| **DkZ™ Hub (Lokal)** | `01_PROJECTS\01_dashboard\hub\index.html` | Das lokale Kontrollzentrum fuer den Entwickler (BAZE²). |
| **Wiki Hub™** | `01_PROJECTS\10_wiki-hub\index.html` | Frontpage fuer die 4.121+ Wiki-Eintraege, durchsuchbar. |

---

## 📝 2. Blogger Blog-Netzwerk

Das DkZ System steuert ein Netzwerk aus Blogger-Instanzen (Google Blogger) fuer automatisiertes SEO, Dokumentation und NLM-Batch-Content.

*   **Workflow:** `/blog-deploy` und `/blog-rebrand`
*   **Design:** Nutzt ein adaptiertes V2.1 DkZ Design (Glassmorphism, Panel-Farben) als Blogger-Theme.
*   **Blogs (Vertikale):**
    *   *AI Research Blog:* Veroeffentlicht NLM-Generates und Whitepapers.
    *   *Tech Demos:* Showcase von neuen Modulen.
    *   *System Logs:* (Teilweise privat) Spiegelung von Daily Notes.

---

## 🔄 3. Datenfluss & Kommando-Struktur

Wie gelangen Inhalte auf die Homepages und Blogs?

1.  **Content-Generierung (NLM Batch):** 
    Agenten (z.B. OpenSwarm Content Creator) erstellen Markdown-Inhalte.
2.  **Iceberg Storage:** 
    Alle Rohtexte werden in `modules/wissen-hub/archive/` abgelegt.
3.  **Deployment (Webhooks/APIs):**
    - Fuer Blogger: n8n Workflow oder ONTHERUN™ Server nutzt Google Blogger API, um den Markdown-Content (via `markdown_converter` Modul in HTML gewandelt) als neuen Post zu pushen.
    - Fuer `devkitz.eu`: GitHub Actions oder Puter Cloud (`DkzPuter.deploy()`) synchronisieren die statischen HTML-Dateien aus dem Repo.
4.  **Kommando-Struktur:**
    - Befehle erfolgen ueber die **ESC-Konsole** oder die **Chatleiste** (Copilot).
    - Z.B.: `> deploy blog-post "Titel"` → Copilot triggert MCP Tool → ONTHERUN™ fuehrt REST Call zu Blogger aus.
