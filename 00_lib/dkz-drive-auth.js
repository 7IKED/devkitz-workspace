const { createHash } = require('crypto');
const path = require('path');
const fs = require('fs');

const REQUIRED_ENV = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
const DRIVE_API = 'https://www.googleapis.com';

function credentialsAvailable() {
    return REQUIRED_ENV.every(k => process.env[k] && !process.env[k].startsWith('HIER'));
}

async function getAccessToken() {
    if (!credentialsAvailable()) return null;
    const resp = await fetch(`${DRIVE_API}/oauth2/v4/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });
    if (!resp.ok) throw new Error(`Token refresh failed: ${resp.status}`);
    const data = await resp.json();
    return data.access_token;
}

async function uploadToDrive(fileName, mimeType, fileBuffer) {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;
    const parentId = process.env.DRIVE_PARENT_ID || 'root';
    const metadata = JSON.stringify({ name: fileName, parents: [parentId] });
    const body = [
        `--dkz_boundary\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}`,
        `\r\n--dkz_boundary\r\nContent-Type: ${mimeType}\r\n\r\n${fileBuffer.toString('base64')}`,
        `\r\n--dkz_boundary--`
    ].join('');
    const resp = await fetch(`${DRIVE_API}/upload/drive/v3/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/related; boundary=dkz_boundary'
        },
        body
    });
    if (!resp.ok) throw new Error(`Drive upload failed: ${resp.status}`);
    return await resp.json();
}

const DEEPKEEP_DIR = path.resolve(__dirname, '..', 'DEEPKEEP', 'data');

function sha256(content) {
    return createHash('sha256').update(content, 'utf8').digest('hex');
}

function storeDeepKeep(payload) {
    if (!payload || !payload.content) return null;
    const hash = sha256(payload.content);
    const ext = payload.filename ? path.extname(payload.filename) : '.json';
    const filename = hash + ext;
    const dest = path.join(DEEPKEEP_DIR, filename);
    const exists = fs.existsSync(dest);
    if (!exists) {
        const meta = {
            hash,
            filename: payload.filename || filename,
            mimeType: payload.mimeType || 'text/plain',
            storedAt: new Date().toISOString(),
            size: Buffer.byteLength(payload.content, 'utf8')
        };
        fs.writeFileSync(dest, payload.content, 'utf8');
        const metaDest = path.join(DEEPKEEP_DIR, hash + '.meta.json');
        fs.writeFileSync(metaDest, JSON.stringify(meta, null, 2), 'utf8');
    }
    return { hash, filename, exists };
}

function listDeepKeep() {
    if (!fs.existsSync(DEEPKEEP_DIR)) return [];
    return fs.readdirSync(DEEPKEEP_DIR)
        .filter(f => f.endsWith('.meta.json'))
        .map(f => {
            try {
                return JSON.parse(fs.readFileSync(path.join(DEEPKEEP_DIR, f), 'utf8'));
            } catch { return null; }
        })
        .filter(Boolean);
}

function retrieveDeepKeep(hash) {
    if (!fs.existsSync(DEEPKEEP_DIR)) return null;
    const files = fs.readdirSync(DEEPKEEP_DIR).filter(f => f.startsWith(hash) && !f.endsWith('.meta.json'));
    if (files.length === 0) return null;
    const content = fs.readFileSync(path.join(DEEPKEEP_DIR, files[0]), 'utf8');
    const metaPath = path.join(DEEPKEEP_DIR, hash + '.meta.json');
    const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
    return { content, meta };
}

module.exports = { getAccessToken, uploadToDrive, credentialsAvailable, sha256, storeDeepKeep, listDeepKeep, retrieveDeepKeep };
