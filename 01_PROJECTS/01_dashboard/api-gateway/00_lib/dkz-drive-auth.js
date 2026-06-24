import { createHash } from 'crypto';

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

export { getAccessToken, uploadToDrive, credentialsAvailable };
