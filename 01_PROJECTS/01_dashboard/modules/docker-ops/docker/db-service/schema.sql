-- DkZ™ Docker Ops — SQLite Schema
-- Immutable Audit Trail für Builds, Packs, Deployments
-- EU-AI-konform: Alle Daten lokal, kein Cloud-Upload

-- ═══════════════════════════════════════
-- Builds — Docker Image Build Records
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS builds (
    id          TEXT PRIMARY KEY,
    service     TEXT NOT NULL,
    tag         TEXT NOT NULL DEFAULT 'latest',
    dockerfile  TEXT NOT NULL,
    image_id    TEXT,
    image_size  TEXT,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','building','success','failed')),
    build_log   TEXT,
    builder     TEXT DEFAULT 'n8n-dkz-docker-builder',
    eu_compliant INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════
-- Packs — Docker Pack/Deploy Records
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS packs (
    id            TEXT PRIMARY KEY,
    image         TEXT NOT NULL,
    version       TEXT NOT NULL,
    compose_file  TEXT,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','deploying','deployed','failed','rolled_back')),
    healthy       INTEGER DEFAULT 0,
    cleanup_log   TEXT,
    error_log     TEXT,
    pipeline      TEXT DEFAULT 'n8n-dkz-pack-station',
    eu_compliant  INTEGER DEFAULT 1,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════
-- Deployments — Active Deployment Tracking
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS deployments (
    id              TEXT PRIMARY KEY,
    service         TEXT NOT NULL,
    image           TEXT NOT NULL,
    version         TEXT NOT NULL,
    container_id    TEXT,
    port            INTEGER,
    status          TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running','stopped','crashed','removed')),
    health_status   TEXT DEFAULT 'unknown' CHECK(health_status IN ('healthy','unhealthy','unknown')),
    last_health_check TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);

-- ═══════════════════════════════════════
-- Audit Log — Immutable Event Trail
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id    TEXT NOT NULL,
    action      TEXT NOT NULL,
    service     TEXT,
    message     TEXT,
    metadata    TEXT,  -- JSON string
    source      TEXT DEFAULT 'system',
    ip_address  TEXT,
    eu_compliant INTEGER DEFAULT 1,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_builds_service ON builds(service);
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_created ON builds(created_at);
CREATE INDEX IF NOT EXISTS idx_packs_image ON packs(image);
CREATE INDEX IF NOT EXISTS idx_packs_status ON packs(status);
CREATE INDEX IF NOT EXISTS idx_deployments_service ON deployments(service);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_service ON audit_log(service);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
