/**
 * DkZ™ Google Photos Auto-Backup
 *
 * Sichert gebrandete Medien zu Google Photos.
 * STATUS: PLATZHALTER — Wartet auf OAuth Credentials.
 *
 * VORAUSSETZUNG (Google Cloud Console):
 * 1. Gehe zu https://console.cloud.google.com/
 * 2. Projekt erstellen -> "Photos Library API" aktivieren
 * 3. OAuth-Zustimmungsbildschirm einrichten
 * 4. Anmeldedaten erstellen -> OAuth-Client-ID (Desktop)
 * 5. Client ID und Client Secret generieren
 * 6. Refresh Token via OAuth Playground generieren
 * 7. In .env oder GitHub Secrets eintragen:
 *    - GOOGLE_CLIENT_ID
 *    - GOOGLE_CLIENT_SECRET
 *    - GOOGLE_REFRESH_TOKEN
 *
 * Usage: node google-photos-uploader.js [ordner]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// === CONFIG ===
const SUPPORTED_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov'];
const DEFAULT_DIR = path.join(__dirname, '../../03_MEDIA/images');

// === ENV CHECK ===
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[Google Photos] Fehlende API Secrets — Upload nicht moeglich.');
    console.warn('[Google Photos] Trage GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET und GOOGLE_REFRESH_TOKEN ein.');
    console.warn('[Google Photos] Anleitung: https://console.cloud.google.com/ -> Photos Library API');
    process.exit(0);
}

// === TOKEN REFRESH ===
function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        const postData = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        }).toString();

        const req = https.request({
            hostname: 'oauth2.googleapis.com',
            path: '/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.access_token) resolve(json.access_token);
                    else reject(new Error('Token refresh fehlgeschlagen: ' + data));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// === UPLOAD ===
async function uploadMedia(filePath, accessToken) {
    const fileName = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'photoslibrary.googleapis.com',
            path: '/v1/uploads',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/octet-stream',
                'X-Goog-Upload-File-Name': fileName,
                'X-Goog-Upload-Protocol': 'raw',
                'Content-Length': fileData.length
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data)); // Upload Token
        });
        req.on('error', reject);
        req.write(fileData);
        req.end();
    });
}

async function createMediaItem(uploadToken, accessToken, description) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            newMediaItems: [{
                description: description || 'DkZ Backup',
                simpleMediaItem: { uploadToken }
            }]
        });

        const req = https.request({
            hostname: 'photoslibrary.googleapis.com',
            path: '/v1/mediaItems:batchCreate',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// === MAIN ===
async function main() {
    const targetDir = process.argv[2] || DEFAULT_DIR;

    if (!fs.existsSync(targetDir)) {
        console.warn('[Google Photos] Ordner nicht gefunden: ' + targetDir);
        process.exit(1);
    }

    const files = fs.readdirSync(targetDir)
        .filter(f => SUPPORTED_TYPES.includes(path.extname(f).toLowerCase()))
        .map(f => path.join(targetDir, f));

    if (!files.length) {
        console.warn('[Google Photos] Keine Medien-Dateien gefunden in: ' + targetDir);
        process.exit(0);
    }

    console.warn('[Google Photos] ' + files.length + ' Dateien gefunden. Starte Upload...');

    try {
        const token = await refreshAccessToken();
        let ok = 0, fail = 0;

        for (const file of files) {
            try {
                const uploadToken = await uploadMedia(file, token);
                await createMediaItem(uploadToken, token, 'DkZ Backup — ' + path.basename(file));
                ok++;
            } catch (e) {
                console.warn('[Google Photos] Fehler bei ' + path.basename(file) + ': ' + e.message);
                fail++;
            }
        }

        console.warn('[Google Photos] Fertig: ' + ok + ' OK, ' + fail + ' Fehler');
    } catch (e) {
        console.warn('[Google Photos] Auth fehlgeschlagen: ' + e.message);
        process.exit(1);
    }
}

main();
