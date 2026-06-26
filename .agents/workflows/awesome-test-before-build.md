# 🧠 Awesome Test Before Build (TDD & Konzept)

> **Regel R99-A:** Bevor auch nur eine Zeile Code geschrieben wird, MUSS dieser Workflow abgearbeitet werden. Er dient der architektonischen Validierung (Test-Driven Development im weiteren Sinne) und der Konzept-Sicherung.

## 1. 🏗️ Architektur- & Konzept-Test
- [ ] **Problemraum verstanden:** Ist das eigentliche Problem klar, oder docken wir nur Symptom-Lösungen an?
- [ ] **DkZ-Ökosystem Fit:** Passt das Feature in die bestehende Architektur (Glassmorphism, Vanilla JS, Modular)? Werden bestehende Komponenten (z.B. `dkz-auth.js`, `dkz-navbar.js`) wiederverwendet statt neu geschrieben?
- [ ] **Daten-Flow (TDD im Kopf):** Wie fließen die Daten von A nach B? Sind die States (Loading, Error, Success) definiert?
- [ ] **Offline-First:** Ist die Lösung kompatibel mit der `localStorage`-Philosophie, falls der VPS offline ist?

## 2. 🧪 Use-Case & Edge-Case Evaluierung
- [ ] **Der "Dau-Test" (Dümmster anzunehmender User):** Was passiert, wenn der User wild herumklickt oder Formulare leer absendet?
- [ ] **Netzwerk-Abbrüche:** Was passiert, wenn die Verbindung zum Hub oder zum VPS exakt während der Ausführung abbricht?
- [ ] **Sicherheit:** Sind alle User-Inputs via `esc()` gegen XSS abgesichert (Eiserne Regel 1)?

## 3. 📐 Prototyping
- [ ] **Minimal Viable Build:** Bevor das riesige Feature gebaut wird, baue einen kleinen Prototypen, um die technische Machbarkeit (z.B. API-Limits) zu validieren.
- [ ] **Feedback Loop:** Hole User-Feedback oder Agenten-Review ein, bevor die finale Ausarbeitung beginnt.
