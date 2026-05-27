/**
 * ⚡ DKZ API — Sync Routes
 * ══════════════════════════
 * Git Sync, Auto-Commit
 */

import { Router } from 'express';
import { exec } from 'child_process';
import { resolve } from 'path';

const router = Router();
const REPO_PATH = resolve('C:/DEVKiTZ');

// ─── POST /sync ───
router.post('/sync', (req, res) => {
    const { message, push = false } = req.body;
    const commitMsg = message || `Auto-sync: ${new Date().toISOString()}`;

    const gitCommand = `git add . && git commit -m "${commitMsg}"${push ? ' && git push' : ''}`;

    exec(gitCommand, { cwd: REPO_PATH }, (error, stdout, stderr) => {
        if (error) {
            if ((stdout + stderr).includes('nothing to commit')) {
                return res.json({
                    success: true,
                    message: 'Keine Änderungen zum committen.',
                    log: stdout
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Git Sync fehlgeschlagen',
                log: stderr || error.message
            });
        }

        // Broadcast via WebSocket
        if (globalThis.__dkzBroadcast) {
            globalThis.__dkzBroadcast('git:synced', { message: commitMsg });
        }

        res.json({
            success: true,
            message: `Committed: ${commitMsg}`,
            pushed: push,
            log: stdout
        });
    });
});

export { router as syncRoutes };
