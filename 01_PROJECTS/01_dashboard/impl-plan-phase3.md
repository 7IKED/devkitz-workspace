---
{
  "id": "ART-2026-0623-001",
  "type": "impl-plan",
  "tags": ["ecosystem", "phase3", "convergence"],
  "title": "Masterplan Phase 3: Ecosystem Convergence",
  "conversation": "145fba94-784c-445b-b567-64bf97462bee",
  "date": "2026-06-23",
  "module": "ecosystem-convergence",
  "status": "complete",
  "summary": "Masterplan zur Reintegration aller 157+ Module in das Unified Backend."
}
---

## 🧠 Phase 3: Ecosystem Convergence — Grober Implementierungsplan

### Ziel
Alle 157+ Module, alten Strategien und entkoppelten Subsysteme (DEEPKEEP, CLOUDIA², AiAiKirk, Iceberg, Obsidian) in das Unified Backend `:3040` und den FiveSplitter-Router einbinden.

---

### 🗂 Task 1: DEEPKEEP™ Tresor-Integration
| Schritt | Beschreibung |
|---------|-------------|
| 1.1 | `api/v1/deepkeep/*` Router erstellen (`POST /store`, `GET /retrieve`, `GET /list`) |
| 1.2 | Google Drive Auth-Wrapper (OAuth2 Refresh-Token) in `00_lib/` |
| 1.3 | Write-Once-Logik: SHA256-Hash vor Upload, Duplicate-Prevention |
| 1.4 | EventLog-Einträge für alle Store/Retrieve-Operationen |

### 📂 Task 2: CLOUDIA² Multi-Provider Document Organizer
| Schritt | Beschreibung |
|---------|-------------|
| 2.1 | `api/v1/cloudia/*` Router (`POST /sort`, `GET /providers`, `POST /move`) |
| 2.2 | Provider-Adapter: Google Drive (MVP), Nextcloud, Cloudflare R2 (später) |
| 2.3 | Sortier-Logik: Dateityp → Zielordner → Metadaten-Tags |
| 2.4 | Registry-Eintrag in features.json |

### 🤖 Task 3: AiAiKirk™ Chatbot-Steuermann
| Schritt | Beschreibung |
|---------|-------------|
| 3.1 | `api/v1/aiaikirk/*` Router (`POST /chat`, `GET /status`, `POST /route`) |
| 3.2 | Kirk integriert FiveSplitter-Router statt eigener Provider-Logik |
| 3.3 | Session-Management pro Chat (Memory-Kontext) |
| 3.4 | Integration ins Dashboard als neues Modul `modules/aiaikirk/` |

### 🔌 Task 4: Iceberg Go Backend (:9881) Bridge
| Schritt | Beschreibung |
|---------|-------------|
| 4.1 | Health-Proxy: sync-server pingt `localhost:9881/health` alle 30s |
| 4.2 | `api/v1/iceberg/*` Reverse-Proxy-Router (GET/POST -> :9881) |
| 4.3 | Iceberg-Status im `/api/v1/health` Response inkludieren |

### 📚 Task 5: SecondBrain (Obsidian) Query-Integration
| Schritt | Beschreibung |
|---------|-------------|
| 5.1 | `api/v1/brain/*` Router (`POST /search`, `GET /notes`, `POST /query`) |
| 5.2 | Dateisystem-Scanner für `09_BRAIN²/` und `09_SYSTEM/` |
| 5.3 | Volltext-Suche via `ripgrep` oder einfachem `fs.readdir` + `includes` |

### 📝 Task 6: Blog-Sync Engine
| Schritt | Beschreibung |
|---------|-------------|
| 6.1 | `api/v1/blog/*` Router (`POST /publish`, `GET /drafts`, `POST /sync`) |
| 6.2 | Blogger API v3 Integration (OAuth2) |
| 6.3 | Markdown → HTML Konverter für Blogger-Posts |

### 🔄 Task 7: Strategie-Restaurierung (Auto-Sync, Persist, EventLog)
| Schritt | Beschreibung |
|---------|-------------|
| 7.1 | Auto-Sync-Timer im sync-server: alle 5min `git add + commit` via Cron |
| 7.2 | Persist-Storage: `api/v1/persist/*` für modulübergreifende State-Persistenz |
| 7.3 | EventLog-Health: Endpoint zeigt Log-Statistiken (Einträge/h, Fehlerquote) |

### 🧪 Task 8: Environment & Deployment Stabilisierung
| Schritt | Beschreibung |
|---------|-------------|
| 8.1 | `.env.example` mit allen benötigten Keys (Mistral, OpenRouter, VPS, Google OAuth) |
| 8.2 | `startup-validation.js`: Prüft alle env-Vars beim Start, loggt Warnungen |
| 8.3 | Ollama-Daemon-Health: sync-server prüft `localhost:11434` und loggt Status |

### 🏗 Task 9: Modul-Reintegration (Legacy → Unified API)
| Schritt | Beschreibung |
|---------|-------------|
| 9.1 | Audit: Welche 157 Module nutzen noch alte Endpoints (`/api/chat` statt `/api/v1/router/chat`)? |
| 9.2 | Batch-Update: Alte `fetch`-Aufrufe in Modulen auf `/api/v1/*` umbiegen |
| 9.3 | Legacy-Endpoints knallhart abschalten (Fail Fast) |

### 📊 Task 10: Monitoring & Dashboard-Integration
| Schritt | Beschreibung |
|---------|-------------|
| 10.1 | Ecosystem-Dashboard-Modul (`modules/ecosystem-convergence/`) |
| 10.2 | Visualisiert Status aller 10 Tasks (done/in-progress/pending) |
| 10.3 | Zeigt Live-Health von sync-server, Iceberg, Mistral, Router-Providern |

---

### 🗺 Roadmap-Reihenfolge
Task 8 (Env) → Task 1 (DEEPKEEP) → Task 2 (CLOUDIA²) → Task 3 (AiAiKirk)
→ Task 4 (Iceberg) → Task 5 (SecondBrain) → Task 6 (Blog) → Task 7 (Strategien)
→ Task 9 (Module) → Task 10 (Dashboard)
