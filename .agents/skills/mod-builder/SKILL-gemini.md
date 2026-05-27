# 🤖 META-SKILL: Mod-Builder Bot

**ID:** `skill-ai-mod-builder`
**Alias:** `modbot`, `builder`, `mod`
**Version:** 1.1
**Author:** Gemini

**Beschreibung (für LLMs):**
Dies ist ein Meta-Skill, der den Workflow für einen KI-Agenten (den "Mod-Builder Bot") beschreibt. Seine Aufgabe ist es, neue Module, Panels, Boards und UI-Komponenten für die DkZ™ Web App V2 zu erstellen, zu verwalten, zu optimieren und zu integrieren. Der Bot nimmt eine natürlichsprachliche Anforderung entgegen und generiert daraus lauffähigen, in die App integrierten Code, der allen DkZ-Patterns folgt.

---

### Workflow des Mod-Builder Bots

**Input:** Ein Hyper-Prompt vom Benutzer, z.B. `DkZ-Builder™ > ERSTELLE Modul 'Wetter-Widget' MIT anzeige=temperatur,standort`.

---

### Erweiterte 7-Schritt Pipeline für den Bot

1.  **DEKONSTRUIERE ANFORDERUNG:**
    - **Ziel:** Ein neues Modul namens `Wetter-Widget` erstellen.
    - **Features:** Muss Temperatur und Standort anzeigen.
    - **Implizite Annahmen:** Benötigt eine externe API (z.B. OpenWeatherMap), muss im Dashboard als `g-card` angezeigt werden, benötigt einen `btn3d` zum Aktualisieren.

2.  **FINDE SKILLS (Nanobot-Suche):**
    - Suche nach "API abrufen", "UI-Karte", "Daten anzeigen".
    - **Ergebnis:** `skill-network-fetch`, `glassmorphism-3d`, `panel-system`.

3.  **ERSTELLE IMPLEMENTIERUNGSPLAN:**
    - **Neue Dateien:** `modules/weather.js`.
    - **Änderungen an `index.html`:** Neuer Anker `<div id="v-weather" class="view"></div>` und neuer Nav-Tab `<button class="tab btn3d btn3d-ghost" ...>`.
    - **Änderungen an `core/config.js`:** Neuer Eintrag in der Management-Tabelle für das `weather`-Modul.
    - **API-Schlüssel:** Platzhalter für einen API-Schlüssel in `config.js` vorsehen.

4.  **GENERIERE CODE:** Schreibe den vollständigen Code für alle neuen und zu ändernden Dateien gemäß dem Plan und den gefundenen Skills.

5.  **OPTIMIERE & VERWALTE (Neue Fähigkeit):**
    - **Analyse:** Analysiere bestehenden Code auf Performance-Engpässe oder Abweichungen von den DkZ-Patterns.
    - **Refactoring:** Schlage Refactorings vor, um die Code-Qualität zu verbessern (z.B. Ersetzen eines normalen `div` durch eine `g-card`).
    - **Verwaltung:** Biete an, Module/Boards über die `core/config.js` zu aktivieren, deaktivieren oder neu anzuordnen.

6.  **ERSTELLE INTEGRATIONSANLEITUNG:** Generiere eine Markdown-Anleitung für den Benutzer, die beschreibt, wie der neue Code in das bestehende Projekt eingefügt wird (oder führe die Änderungen direkt durch, wenn du die Berechtigung hast).

7.  **LOGGE & BESTÄTIGE:** Protokolliere die Erstellung/Änderung des Moduls im `Action Log System` und präsentiere dem Benutzer den generierten Code und die Anleitung.