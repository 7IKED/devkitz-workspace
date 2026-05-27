# DkZ™ Power+ Orchestrator

> Entry-Point für `/power+`, `/+` und unspezifische Anfragen
> Automatische Workflow-Erstellung wenn kein Skill angegeben

---

## 🎯 Trigger-Regeln

| Eingabe | Aktion |
|:--------|:-------|
| `/power+` | Power+ Modus aktivieren → Skill-Builder starten |
| `/+` | Kurzform → gleich wie `/power+` |
| Kein Skill angegeben | Automatisch Workflow für Anfrage erstellen |
| Skill angegeben | Direkt ausführen |

---

## 🔄 Orchestrierungs-Flow

```
USER ANFRAGE
     │
     ▼
┌─────────────────────┐
│  1. SKILL DISCOVERY  │ → Bestehende Skills scannen
│     (Builder prüft)  │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │  Match?   │
     └─────┬─────┘
       JA  │  NEIN
       │   │
       ▼   ▼
   ┌──────┐ ┌───────────────┐
   │NUTZEN│ │ WORKFLOW BAUEN │
   └──────┘ │ → Skills      │
            │ → Patterns    │
            │ → Checkliste  │
            │ → Trigger     │
            └───────┬───────┘
                    │
                    ▼
            ┌──────────────┐
            │  AUSFÜHREN    │
            │  Ralph-Loop   │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │  BEWERTEN     │
            │  + SPEICHERN  │
            └──────────────┘
```

---

## 📋 Standard-Checkliste (jeder Workflow)

- [ ] Bestehende Skills geprüft?
- [ ] Workflow-Schritte definiert?
- [ ] Alle Abhängigkeiten aufgelöst?
- [ ] Ralph-Loop Phase zugewiesen?
- [ ] Output-Qualität bewertet?
- [ ] Als Vorlage speichern?
- [ ] Snippets extrahiert?
- [ ] Git committed?

---

## 🧠 Ralph-Loop Mapping

| Phase | Orchestrator-Schritt |
|:------|:--------------------|
| LESEN | Skills scannen, Kontext laden |
| SPAWN | Passenden Agent/Workflow starten |
| EXECUTE | Skill ausführen |
| VERIFY | Output prüfen, Checkliste abarbeiten |
| COMMIT | Speichern, Git, Metadaten |
| LOOP | Nächster Schritt oder fertig |

---

## ⚡ Power+ Erweiterungen

Wenn Power+ aktiv:
1. **BMAD Agenten** werden zugewiesen (PM, Architekt, Developer, etc.)
2. **Swarm Mode** kann aktiviert werden (parallele Execution)
3. **Deep Research** wird vor Execution gestartet
4. **Alle Outputs** werden dreifach verankert (Iceberg, Hub, Copilot)

---

*Dieser Orchestrator wird von `/power+` und `/+` Commands aufgerufen.*
