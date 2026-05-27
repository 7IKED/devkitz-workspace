# 🤖 DkZ™ AGENT & SKILL FACTORY (BLUEPRINT)

> **Version:** v1.0 | **Stand:** 2026-05-21 | **Fokus:** Automatischer Agenten-, Skill- & Workflow-Builder aus URLs (Git/YouTube)

Diese Blaupause beschreibt die Vision und Architektur fuer ein Modul im DkZ™ Oekosystem, das aus Repository-Links oder YouTube-Videos vollautomatisch voll funktionsfaehige Agenten, Skills und n8n-Workflows baut. Es ist so konzipiert, dass es ohne kostenpflichtige Abos (Free Tier / Lokal-First) laeuft.

---

## 🗺️ 1. Vision & Core Use Cases

Die Kernfunktion ist der **"Fueter-Knopf" (Feeder-Button)**. Der User fuettert das System mit einer URL (GitHub oder YouTube), und das System generiert daraus die operativen Einheiten.

```text
[GitHub Repo URL]   ──┐
                      ├──▶ [FEETER-KNOPF] ──▶ [FLOW ENGINE] ──▶ [AGENTS / SKILLS / n8n JSON]
[YouTube Video URL] ──┘
```

### Die 3 Haupt-Use-Cases:

1.  **Repo-to-Agent (Code-Inferenz):**
    *   **Input:** Link zu einem GitHub-Repository.
    *   **Prozess:** Das System crawlt den Code (via local Node-Scraper), versteht die Logik (via lokales LLM) und baut einen spezialisierten BMAD-Agenten (Config + Prompt), der genau dieses Tool bedienen kann.
2.  **Video-to-Workflow (Workflow-Extraktion):**
    *   **Input:** YouTube-Link zu einem Tutorial (z.B. "Wie man n8n mit Stripe verbindet").
    *   **Prozess:** System laedt die Untertitel (oder nutzt lokales Whisper), extrahiert die logischen Schritte und generiert ein gebrauchsfertiges n8n-Workflow-JSON.
3.  **Snippet-to-Skill (Skill-Kondensierung):**
    *   **Input:** Code-Snippet oder Repo.
    *   **Prozess:** Extrahiert die API-Requests und packt sie in ein standardisiertes DkZ™ Skill-Format (`dkz-[name].js`), registriert es im System.

---

## 🎨 2. Stitch Board & ComfyUI Node-Visualisierung

Die visuelle Darstellung erfolgt ueber eine Kombination aus dem minimalistischen **Google Stitch Board** und einer node-basierten Visualisierung im **ComfyUI-Style**.

*   **Das Canvas:** Ein interaktives HTML5 Canvas-Element (Glassmorphism-Optik).
*   **Nodes (Knotenpunkte):**
    *   *Feeder Node:* Der Einstiegspunkt (URL/Text).
    *   *Processor Node:* Zeigt an, welches LLM/Modell gerade arbeitet.
    *   *Agent Node:* Repraesentiert den generierten Agenten.
    *   *Skill Node:* Zeigt die verfuegbaren Funktionen.
    *   *Output Node:* n8n JSON, Markdown-Dokumentation oder JavaScript-Datei.
*   **Live Progress Map:** Das Board visualisiert in Echtzeit den Zustand ("Wie weit wir sind") durch pulsierende Neon-Linien (DkZ™ Neon-Accent) zwischen den Nodes.

---

## 🎙️ 3. Sprach-Assistent & Smalltalk (Voice Canvas)

Um den Bauplan zu erstellen, interagiert der User mit einem integrierten Sprach-Assistenten.

*   **Smalltalk-Modus:** Der User kann per Stimme locker mit dem Assistenten sprechen (z.B. "Hey James, baue mir mal einen Agenten aus diesem Git-Link, der mir taeglich das Wetter holt").
*   **Technologie:**
    *   **STT (Speech-to-Text):** Web Speech API (kostenlos, browser-nativ) oder lokales Whisper.cpp (ueber ONTHERUN™).
    *   **TTS (Text-to-Speech):** Shared Script `dkz-tts.js` (Web Speech API).
*   **Dynamic Canvas Updates:** Jedes gesprochene Kommando veraendert die Nodes auf dem Stitch Board live. Der Assistent sagt z.B.: "Ich habe den GitHub-Link analysiert. Ich zeichne dir jetzt den Ablauf auf dem Canvas..."

---

## 🔌 4. No-Subscription Stack (Fuer "Keine-Abo-Menschen")

Das System ist vollstaendig ohne bezahlte Abos lauffaehig:

| Komponente | Free/Lokal Alternative | Integration |
| :--- | :--- | :--- |
| **LLM (Gehirn)** | Ollama (lokal) mit `Qwen-2.5-Coder-7B` oder `DeepSeek-R1-Distill-8B` | ONTHERUN™ Server API |
| **Cloud Storage** | Puter SDK (Auth, KV, Static Files kostenlos) | `dkz-puter.js` |
| **Voice Processing** | Browser Web Speech API (STT / TTS nativ) | `dkz-tts.js` |
| **Scraper / Downloader**| Puppeteer (Headless) / Youtube-dl (lokal) | ONTHERUN™ Node-Server |

---

## 📝 5. Markdown Logger

Jeder Ablauf und die finale Struktur des Agenten werden in einem uebersichtlichen Markdown-Protokoll festgehalten, das direkt exportiert werden kann:

```markdown
# [AGENTS] Generierter Agenten-Steckbrief

- **Name:** DkZ™ [Agent-Name]
- **Quelle:** [GitHub URL]
- **Architektur-Layer:** L2 (Operativ)
- **Verknuepfte Skills:** dkz-[skill-name].js

## Ablauf-Diagramm (Flow)
[Generiertes ASCII-Art oder Mermaid Diagramm]
```

---

## 📋 6. TODOs fuer die Implementierung

*   [ ] **MOD-090 (Agent Factory):** Neues Modul `modules/agent-factory/` anlegen.
*   [ ] **ComfyUI-HTML5-Canvas:** Einbau einer leichtgewichtigen JavaScript Node-Engine (ohne externe Frameworks wie React/Tauri) fuer die Stitch-Board Ansicht.
*   [ ] **Feeder Ingest Logik:** Integration von Scrapern in ONTHERUN™ fuer GitHub Scrapes und YouTube Transcript API.
*   [ ] **n8n JSON Generator:** Logik programmieren, um aus textuellen Ablaeufen gueltige n8n-Workflow-JSONs zu generieren.
*   [ ] **Voice-Bridge:** Integration des Mikrofons in das Stitch Board mit Echtzeit-Befehlserkennung.
