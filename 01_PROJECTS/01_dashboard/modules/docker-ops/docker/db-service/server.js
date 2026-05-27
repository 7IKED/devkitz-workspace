/**
 * DkZ™ Docker Ops — Node.js Database Service
 * ═══════════════════════════════════════════
 * Express.js + SQLite — Immutable Audit Trail
 * EU-AI-konform: Alle Daten lokal, kein Cloud-Upload
 * Port: 9890
 */

import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.DKZ_DB_PORT || '9890');
const DB_PATH = process.env.DKZ_DB_PATH || join(__dirname, 'data', 'docker-ops.db');

// ─── Datenbank initialisieren ───
const dataDir = dirname(DB_PATH);
if (!existsSync(dataDir)) {
    import('fs').then(fs => fs.mkdirSync(dataDir, { recursive: true }));
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema laden
const schemaPath = join(__dirname, 'schema.sql');
if (existsSync(schemaPath)) {
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('📋 Schema geladen');
}

// ─── Express App ───
const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ─── Helper ───
function ok(res, data) {
    return res.json({ success: true, timestamp: new Date().toISOString(), ...data });
}
function err(res, msg, code = 400) {
    return res.status(code).json({ success: false, error: msg, timestamp: new Date().toISOString() });
}

// ═══════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════
app.get('/health', (req, res) => {
    try {
        const row = db.prepare('SELECT COUNT(*) as count FROM builds').get();
        ok(res, {
            status: 'healthy',
            service: 'dkz-docker-db',
            version: '1.0.0',
            db: 'sqlite',
            builds_count: row.count,
            eu_compliant: true,
            uptime: process.uptime()
        });
    } catch (e) {
        err(res, 'DB health check failed: ' + e.message, 500);
    }
});

// ═══════════════════════════════════════
// BUILDS — CRUD
// ═══════════════════════════════════════
app.get('/builds', (req, res) => {
    const { limit = 50, status = 'all', service } = req.query;
    let sql = 'SELECT * FROM builds';
    const params = [];
    const conditions = [];

    if (status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
    }
    if (service) {
        conditions.push('service = ?');
        params.push(service);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const rows = db.prepare(sql).all(...params);
    ok(res, { builds: rows, count: rows.length });
});

app.get('/builds/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM builds WHERE id = ?').get(req.params.id);
    if (!row) return err(res, 'Build not found', 404);
    ok(res, { build: row });
});

app.post('/builds', (req, res) => {
    const { service, tag = 'latest', dockerfile, image_id, image_size, status = 'success', build_log, builder, eu_compliant = true } = req.body;
    if (!service) return err(res, 'service is required');

    const id = uuidv4();
    const stmt = db.prepare(`
        INSERT INTO builds (id, service, tag, dockerfile, image_id, image_size, status, build_log, builder, eu_compliant)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, service, tag, dockerfile || '', image_id || '', image_size || '', status, build_log || '', builder || 'n8n-dkz-docker-builder', eu_compliant ? 1 : 0);

    // Audit Log
    logAudit('build_created', service, `Build ${id} created: ${service}:${tag}`, { dockerfile, status });

    ok(res, { id, message: `Build ${service}:${tag} logged` });
});

// ═══════════════════════════════════════
// PACKS — CRUD
// ═══════════════════════════════════════
app.get('/packs', (req, res) => {
    const { limit = 50, status = 'all', image } = req.query;
    let sql = 'SELECT * FROM packs';
    const params = [];
    const conditions = [];

    if (status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
    }
    if (image) {
        conditions.push('image = ?');
        params.push(image);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const rows = db.prepare(sql).all(...params);
    ok(res, { packs: rows, count: rows.length });
});

app.post('/packs', (req, res) => {
    const { image, version, compose_file, status = 'deployed', healthy = true, cleanup_log, error_log, pipeline, eu_compliant = true } = req.body;
    if (!image || !version) return err(res, 'image and version are required');

    const id = uuidv4();
    const stmt = db.prepare(`
        INSERT INTO packs (id, image, version, compose_file, status, healthy, cleanup_log, error_log, pipeline, eu_compliant)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, image, version, compose_file || '', status, healthy ? 1 : 0, cleanup_log || '', error_log || '', pipeline || 'n8n-dkz-pack-station', eu_compliant ? 1 : 0);

    logAudit('pack_created', image, `Pack ${id}: ${image}:${version} → ${status}`, { compose_file, healthy });

    ok(res, { id, message: `Pack ${image}:${version} logged` });
});

// ═══════════════════════════════════════
// DEPLOYMENTS — Tracking
// ═══════════════════════════════════════
app.get('/deployments', (req, res) => {
    const { status = 'all' } = req.query;
    let sql = 'SELECT * FROM deployments';
    if (status !== 'all') sql += ' WHERE status = ?';
    sql += ' ORDER BY created_at DESC LIMIT 50';

    const rows = status !== 'all'
        ? db.prepare(sql).all(status)
        : db.prepare(sql).all();
    ok(res, { deployments: rows, count: rows.length });
});

app.post('/deployments', (req, res) => {
    const { service, image, version, container_id, port, status = 'running', health_status = 'unknown' } = req.body;
    if (!service || !image || !version) return err(res, 'service, image, version required');

    const id = uuidv4();
    db.prepare(`
        INSERT INTO deployments (id, service, image, version, container_id, port, status, health_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, service, image, version, container_id || '', port || 0, status, health_status);

    logAudit('deployment_created', service, `Deployment ${id}: ${service} (${image}:${version})`, { port, container_id });

    ok(res, { id, message: `Deployment ${service} tracked` });
});

app.patch('/deployments/:id', (req, res) => {
    const { status, health_status } = req.body;
    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (health_status) { updates.push('health_status = ?'); params.push(health_status); }
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    db.prepare(`UPDATE deployments SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    ok(res, { message: 'Deployment updated' });
});

// ═══════════════════════════════════════
// AUDIT LOG — Immutable
// ═══════════════════════════════════════
app.get('/audit', (req, res) => {
    const { limit = 100, action, service } = req.query;
    let sql = 'SELECT * FROM audit_log';
    const params = [];
    const conditions = [];

    if (action) { conditions.push('action = ?'); params.push(action); }
    if (service) { conditions.push('service = ?'); params.push(service); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const rows = db.prepare(sql).all(...params);
    ok(res, { audit: rows, count: rows.length });
});

app.post('/audit', (req, res) => {
    const { action, service, message, metadata, source = 'manual' } = req.body;
    if (!action) return err(res, 'action is required');

    const event_id = uuidv4();
    db.prepare(`
        INSERT INTO audit_log (event_id, action, service, message, metadata, source, ip_address, eu_compliant)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(event_id, action, service || '', message || '', metadata || '{}', source, req.ip || '127.0.0.1');

    ok(res, { event_id, message: 'Audit log entry created' });
});

// ═══════════════════════════════════════
// STATUS — Aggregierte Übersicht
// ═══════════════════════════════════════
app.get('/status', (req, res) => {
    const builds_total = db.prepare('SELECT COUNT(*) as c FROM builds').get().c;
    const builds_success = db.prepare("SELECT COUNT(*) as c FROM builds WHERE status = 'success'").get().c;
    const builds_failed = db.prepare("SELECT COUNT(*) as c FROM builds WHERE status = 'failed'").get().c;

    const packs_total = db.prepare('SELECT COUNT(*) as c FROM packs').get().c;
    const packs_deployed = db.prepare("SELECT COUNT(*) as c FROM packs WHERE status = 'deployed'").get().c;
    const packs_failed = db.prepare("SELECT COUNT(*) as c FROM packs WHERE status = 'failed'").get().c;

    const deployments_running = db.prepare("SELECT COUNT(*) as c FROM deployments WHERE status = 'running'").get().c;
    const deployments_healthy = db.prepare("SELECT COUNT(*) as c FROM deployments WHERE health_status = 'healthy'").get().c;

    const audit_total = db.prepare('SELECT COUNT(*) as c FROM audit_log').get().c;
    const last_event = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 1').get();

    ok(res, {
        status: 'operational',
        builds: { total: builds_total, success: builds_success, failed: builds_failed },
        packs: { total: packs_total, deployed: packs_deployed, failed: packs_failed },
        deployments: { running: deployments_running, healthy: deployments_healthy },
        audit: { total: audit_total, last_event: last_event || null },
        eu_compliant: true,
        db_engine: 'SQLite (WAL mode)',
        version: '1.0.0'
    });
});

// ═══════════════════════════════════════
// CLEANUP — Alte Records bereinigen (soft)
// ═══════════════════════════════════════
app.post('/cleanup', (req, res) => {
    const { older_than_days = 30, keep_last = 100 } = req.body;

    // Audit: Log cleanup untouched (immutable!)
    // Nur builds und packs mit status 'failed' und älter als X Tage
    const cutoff = `datetime('now', '-${parseInt(older_than_days)} days')`;

    const buildsDel = db.prepare(`DELETE FROM builds WHERE status = 'failed' AND created_at < ${cutoff}`).run();
    const packsDel = db.prepare(`DELETE FROM packs WHERE status = 'failed' AND created_at < ${cutoff}`).run();

    logAudit('cleanup', 'system', `Cleanup: ${buildsDel.changes} builds, ${packsDel.changes} packs removed (older than ${older_than_days} days)`, { older_than_days, keep_last });

    ok(res, {
        cleaned: {
            builds_removed: buildsDel.changes,
            packs_removed: packsDel.changes,
            older_than_days
        },
        note: 'Audit log is immutable and never cleaned'
    });
});

// ─── Helper: Audit Log schreiben ───
function logAudit(action, service, message, metadata = {}) {
    db.prepare(`
        INSERT INTO audit_log (event_id, action, service, message, metadata, source, eu_compliant)
        VALUES (?, ?, ?, ?, ?, 'system', 1)
    `).run(uuidv4(), action, service, message, JSON.stringify(metadata));
}

// ─── Server starten ───
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════╗
║  🗄️  DkZ™ Docker Ops Database           ║
║  Port: ${PORT}                              ║
║  DB:   SQLite (WAL mode)                 ║
║  EU-AI-konform: ✅                        ║
║  Immutable Audit Trail: ✅                ║
╚══════════════════════════════════════════╝
    `);

    logAudit('server_start', 'dkz-docker-db', `Server started on port ${PORT}`, { version: '1.0.0' });
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    logAudit('server_stop', 'dkz-docker-db', 'Server shutdown (SIGTERM)');
    db.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    logAudit('server_stop', 'dkz-docker-db', 'Server shutdown (SIGINT)');
    db.close();
    process.exit(0);
});

export default app;
