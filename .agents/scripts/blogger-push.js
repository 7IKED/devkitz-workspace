/**
 * DkZ™ Blogger-Interceptor
 *
 * Wird von der GitHub Action aufgerufen, wenn sich ein `implementation_plan.md`
 * oder eine `BLAUPAUSE.md` im Commit befindet. Zieht das DkZ Design drueber
 * und pusht den Markdown-Inhalt via Blogger API auf devkitz.blog.
 *
 * Usage: node blogger-push.js
 * Env: BLOGGER_BLOG_ID, BLOGGER_API_KEY
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// === GIT DIFF ===
let changedFiles = [];
try {
    const gitDiff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    changedFiles = gitDiff.split('\n').filter(Boolean);
} catch (e) {
    console.warn('[Blogger] Konnte git diff nicht ausfuehren (initial commit?).');
}

// Suche nach Plaenen oder Blaupausen
const targetFiles = changedFiles.filter(file =>
    file.toLowerCase().includes('implementation_plan.md') ||
    file.toLowerCase().includes('blaupause.md') ||
    file.toLowerCase().includes('walkthrough.md')
);

if (targetFiles.length === 0) {
    console.warn('[Blogger] Kein Plan/Blaupause/Walkthrough im Commit. Skip.');
    process.exit(0);
}

// === BLOGGER API ===
const BLOG_ID = process.env.BLOGGER_BLOG_ID;
const API_KEY = process.env.BLOGGER_API_KEY;

if (!BLOG_ID || !API_KEY) {
    console.warn('[Blogger] Fehlende Credentials (BLOGGER_BLOG_ID / BLOGGER_API_KEY).');
    console.warn('[Blogger] Plaene erkannt aber Upload nicht moeglich.');
    // Fallback: Lokal als HTML speichern
    saveFallback(targetFiles);
    process.exit(0);
}

// === HTML TEMPLATE ===
function markdownToHtml(content, filename) {
    // Einfache Markdown -> HTML Konversion
    let html = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/^### (.*$)/gim, '<h3 style="color:#00ff88">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 style="color:#ffb800">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 style="color:#fa1e4e">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="background:rgba(250,30,78,0.1);padding:2px 6px;border-radius:4px;font-family:JetBrains Mono,monospace">$1</code>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    return '<div style="font-family:Inter,sans-serif;background:#060608;color:#e8e8ec;padding:24px;border-radius:12px;border-left:4px solid #fa1e4e;max-width:800px;margin:0 auto">' +
        '<h2 style="color:#00ff88;margin-bottom:8px">DEVKiTZ™ System Protokoll</h2>' +
        '<p style="color:#8a8a9a;font-size:12px"><strong>Quelle:</strong> <code>' + filename + '</code> | <strong>Generiert:</strong> ' + new Date().toISOString().split('T')[0] + '</p>' +
        '<hr style="border-color:rgba(250,30,78,0.2);margin:16px 0">' +
        '<div style="font-size:14px;line-height:1.7"><p>' + html + '</p></div>' +
        '</div>';
}

// === BLOGGER POST ===
function postToBlogger(title, htmlContent) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            kind: 'blogger#post',
            blog: { id: BLOG_ID },
            title: 'DkZ™ — ' + title,
            content: htmlContent,
            labels: ['devkitz', 'auto-generated', 'system-protokoll']
        });

        const req = https.request({
            hostname: 'www.googleapis.com',
            path: '/blogger/v3/blogs/' + BLOG_ID + '/posts/?key=' + API_KEY,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (e) { resolve(data); }
                } else {
                    reject(new Error('HTTP ' + res.statusCode + ': ' + data));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// === FALLBACK: Lokal speichern ===
function saveFallback(files) {
    const outDir = path.join(__dirname, '../../04_SYSTEM/blogger-drafts');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    files.forEach(file => {
        const filePath = path.join(__dirname, '../../', file);
        if (!fs.existsSync(filePath)) return;
        const content = fs.readFileSync(filePath, 'utf8');
        const title = path.basename(file, '.md');
        const html = markdownToHtml(content, file);
        const outFile = path.join(outDir, title + '-' + Date.now() + '.html');
        fs.writeFileSync(outFile, html, 'utf8');
        console.warn('[Blogger] Fallback gespeichert: ' + outFile);
    });
}

// === MAIN ===
async function main() {
    console.warn('[Blogger] ' + targetFiles.length + ' Dateien gefunden. Starte Push...');
    let ok = 0, fail = 0;

    for (const file of targetFiles) {
        const filePath = path.join(__dirname, '../../', file);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf8');
        const title = path.basename(file, '.md').replace(/_/g, ' ');
        const html = markdownToHtml(content, file);

        try {
            const result = await postToBlogger(title, html);
            console.warn('[Blogger] Veroeffentlicht: ' + file + (result.url ? ' -> ' + result.url : ''));
            ok++;
        } catch (e) {
            console.warn('[Blogger] Fehler bei ' + file + ': ' + e.message);
            // Fallback lokal
            saveFallback([file]);
            fail++;
        }
    }

    console.warn('[Blogger] Fertig: ' + ok + ' OK, ' + fail + ' Fehler (Fallback lokal)');
}

main();
