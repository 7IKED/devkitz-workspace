# 🐳 Docker Ops™ — DkZ™ Autonomous Pipeline

> Docker Build, Pack & Deploy — 3 n8n Workflow-Einheiten + ONTHERUN™ MCP Connector
> EU-AI-konform · Voll lokal · 100% autonom · MOD-090

---

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    n8n (VPS 1298466)                     │
│                                                         │
│  🔨 Builder  ──→  📦 Pack Station  ──→  🗄️ DB Service  │
│                                                         │
│              🔗 ONTHERUN™ MCP Connector                 │
└─────────────────────────────────────────────────────────┘
```

## 3 Einheiten

| # | Einheit | Webhook | Funktion |
|:--|:--------|:--------|:---------|
| 1 | Docker Builder | `POST /webhook/docker/build` | Images bauen via SSH |
| 2 | Pack Station | `POST /webhook/docker/pack` | Tag, Deploy, Health, Cleanup |
| 3 | Node.js DB | `POST /webhook/docker/db/:action` | Audit Trail (SQLite) |

## Schnellstart

```bash
# DB-Service lokal testen
cd docker/db-service
npm install
node server.js
# → http://localhost:9890/health

# n8n Workflows importieren
# → n8n UI → Import from File → workflows/*.json

# Docker Stack auf VPS starten
docker compose -f docker/docker-compose.dkz.yml up -d
```

## Dateien

```
docker-ops/
├── index.html              ← Dashboard UI (4 Tabs)
├── features.json           ← MOD-090 Registry
├── README.md               ← Diese Datei
├── workflows/
│   ├── dkz-docker-builder.json
│   ├── dkz-docker-packstation.json
│   └── dkz-docker-db.json
└── docker/
    ├── docker-compose.dkz.yml
    ├── Dockerfile.dkz-db
    └── db-service/
        ├── server.js
        ├── schema.sql
        └── package.json
```

## EU-AI Konformität

- ✅ Alle Daten lokal auf VPS (Hostinger EU, Litauen)
- ✅ Kein Cloud-Upload, keine externe Telemetrie
- ✅ Immutable Audit Trail (SQLite)
- ✅ DSGVO-konform — keine personenbezogenen Daten
- ✅ Docker Labels mit EU-Compliance-Flag

---

*DkZ devkitz™ — MOD-090 · v1.0.0 · 2026-04-01*
