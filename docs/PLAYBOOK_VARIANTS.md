# 📚 DKZ PLAYBOOK — Varianten-Übersicht

> Wähle die passende Playbook-Version für deinen Kontext.

---

## 🗂️ 4 Varianten

| Variante | Datei | Umfang | Für wen |
|:---------|:------|:-------|:--------|
| **ZERO** | [DKZ_PLAYBOOK_ZERO.md](./DKZ_PLAYBOOK_ZERO.md) | ~100 Zeilen | Quick Reference, Cheat Sheet |
| **V1 Classic** | [DKZ_PLAYBOOK_V1.md](./DKZ_PLAYBOOK_V1.md) | ~250 Zeilen | Grundlagen, Einsteiger, neue Agenten |
| **V2 Standard** | [DKZ_PLAYBOOK_V2.md](./DKZ_PLAYBOOK_V2.md) | ~400 Zeilen | Tägliche Arbeit, BMAD, Workflows |
| **V3 Next Gen** | [DKZ_PLAYBOOK_V3.md](./DKZ_PLAYBOOK_V3.md) | ~600 Zeilen | Full Stack, A2A, LLM, CI/CD |
| **Master** | [DKZ_PLAYBOOK.md](../04_SYSTEM/DKZ_PLAYBOOK.md) | ~2600 Zeilen | Vollständige Referenz (alle §1-§47) |

---

## 🔄 Vererbungshierarchie

```
ZERO (Essential)
  └── V1 Classic (+ Output, Design, Coding, Module)
       └── V2 Standard (+ BMAD, Ralph-Loop, Workflows, §17-§35)
            └── V3 Next Gen (+ A2A, LLM, NanoBot, CI/CD, §46-§47)
                 └── Master (Vollständige 2600-Zeilen Referenz)
```

---

## ⚡ Wann welche Version?

| Situation | Empfohlene Version |
|:----------|:-------------------|
| Schnelle Frage zu einer Regel | **ZERO** |
| Neues Modul erstellen | **V1** |
| Feature nach BMAD planen | **V2** |
| Agent-Integration bauen | **V3** |
| Unklare Edge-Cases nachschlagen | **Master** |
| LLM-Context-Injection | **ZERO** oder **V1** (Token-effizient) |
| Onboarding neuer Agent | **V1** → **V2** |
| Vollständige System-Docs | **Master** |

---

## 📊 Vergleich

| Feature | ZERO | V1 | V2 | V3 | Master |
|:--------|:----:|:--:|:--:|:--:|:------:|
| 10 Goldene Regeln | ✅ | ✅ | ✅ | ✅ | ✅ |
| Design System | ✅ | ✅ | ✅ | ✅ | ✅ |
| Coding-Regeln | — | ✅ | ✅ | ✅ | ✅ |
| Modul-Standard | — | ✅ | ✅ | ✅ | ✅ |
| BMAD 7 Agenten | — | — | ✅ | ✅ | ✅ |
| Ralph-Loop | — | — | ✅ | ✅ | ✅ |
| Prompt-Hub | — | — | ✅ | ✅ | ✅ |
| Workflows/Skills | — | — | ✅ | ✅ | ✅ |
| A2A Protokoll | — | — | — | ✅ | ✅ |
| LLM 15+ Provider | — | — | — | ✅ | ✅ |
| NanoBot/NanoChat | — | — | — | ✅ | ✅ |
| CI/CD Pipeline | — | — | — | ✅ | ✅ |
| Syntax Patterns | — | — | — | ✅ | ✅ |
| §1-§47 komplett | — | — | — | — | ✅ |

---

> **✨ DkZ devkitz** — „Vorausschauend. Direkt. Klar. Innovativ."
