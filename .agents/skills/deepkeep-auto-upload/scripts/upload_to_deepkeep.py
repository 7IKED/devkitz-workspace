#!/usr/bin/env python3
"""
upload_to_deepkeep.py
=====================
Lädt eine oder mehrere lokale Dateien in [DEEPKEEP]/[SESSION_YYYY-MM]
in Google Drive hoch — thematisch sortiert nach Dateityp.

Verwendung:
  python upload_to_deepkeep.py <datei1> [datei2 ...]
  python upload_to_deepkeep.py --folder <lokaler_ordner>
  python upload_to_deepkeep.py --subfolder "[MEIN_ORDNER]" <datei1> ...

Thematische Zielordner (automatisch nach Dateityp):
  .zip, .tar.gz          → [RELEASES]
  .py, .sh, .ps1, .bat   → [SCRIPTS]
  .html, .js, .css        → [DASHBOARD]
  .gs (Apps Script)       → [APPS_SCRIPT]
  .png, .jpg, .gif        → [IMAGES]
  .json, .txt, .log       → [DATA_EXPORTS]
  .md, .pdf               → [DOCS]
  Alles andere            → [MISC]
"""
import sys, os, json, re, time, argparse
import urllib.request, urllib.parse
from datetime import datetime

DEEPKEEP_ID = "154kjvPYPeD8HWEIITREecVk4i4ZK5fnO"
RCLONE_INI  = "/home/ubuntu/.gdrive-rclone.ini"

MIME_MAP = {
    '.zip': 'application/zip', '.gz': 'application/gzip',
    '.py':  'text/x-python',   '.sh': 'text/x-sh',
    '.ps1': 'text/plain',      '.bat': 'text/plain',
    '.html':'text/html',       '.js': 'application/javascript',
    '.css': 'text/css',        '.gs': 'text/plain',
    '.json':'application/json','.txt': 'text/plain',
    '.log': 'text/plain',      '.md':  'text/markdown',
    '.pdf': 'application/pdf', '.png': 'image/png',
    '.jpg': 'image/jpeg',      '.gif': 'image/gif',
    '.xml': 'application/xml', '.plist':'text/xml',
}

TYPE_FOLDER = {
    'zip': '[RELEASES]', 'gz': '[RELEASES]', 'tar': '[RELEASES]',
    'py':  '[SCRIPTS]',  'sh': '[SCRIPTS]',  'ps1': '[SCRIPTS]',
    'bat': '[SCRIPTS]',  'xml': '[SCRIPTS]', 'plist': '[SCRIPTS]',
    'html':'[DASHBOARD]','js':  '[DASHBOARD]','css': '[DASHBOARD]',
    'gs':  '[APPS_SCRIPT]',
    'png': '[IMAGES]',   'jpg': '[IMAGES]',  'gif': '[IMAGES]',
    'json':'[DATA_EXPORTS]','txt':'[DATA_EXPORTS]','log':'[DATA_EXPORTS]',
    'md':  '[DOCS]',     'pdf': '[DOCS]',
}

def get_token():
    with open(RCLONE_INI) as f:
        content = f.read()
    m = re.search(r'"access_token"\s*:\s*"([^"]+)"', content)
    if not m:
        raise RuntimeError("Kein Access Token in rclone config gefunden")
    return m.group(1)

TOKEN = get_token()
HEADERS_GET  = {"Authorization": f"Bearer {TOKEN}"}
HEADERS_JSON = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def api_get(url):
    req = urllib.request.Request(url, headers=HEADERS_GET)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def api_post(url, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers=HEADERS_JSON, method='POST')
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def get_or_create_folder(name, parent_id):
    q = (f'name = "{name}" and "{parent_id}" in parents '
         f'and mimeType = "application/vnd.google-apps.folder" and trashed = false')
    url = f'https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(q)}&fields=files(id,name)'
    result = api_get(url)
    if result.get('files'):
        return result['files'][0]['id']
    r = api_post(
        'https://www.googleapis.com/drive/v3/files?fields=id,name',
        {"name": name, "mimeType": "application/vnd.google-apps.folder", "parents": [parent_id]}
    )
    time.sleep(0.3)
    return r['id']

def upload_file(local_path, parent_id):
    fname = os.path.basename(local_path)
    ext   = os.path.splitext(fname)[1].lower().lstrip('.')
    mime  = MIME_MAP.get('.' + ext, 'application/octet-stream')
    size  = os.path.getsize(local_path)

    metadata = json.dumps({"name": fname, "parents": [parent_id]}).encode()
    with open(local_path, 'rb') as fh:
        file_data = fh.read()

    boundary = b'--deepkeep_upload_boundary'
    body = (
        boundary + b'\r\n'
        b'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        metadata + b'\r\n' +
        boundary + b'\r\n'
        b'Content-Type: ' + mime.encode() + b'\r\n\r\n' +
        file_data + b'\r\n' +
        boundary + b'--'
    )
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "multipart/related; boundary=deepkeep_upload_boundary",
        "Content-Length": str(len(body))
    }
    req = urllib.request.Request(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
        data=body, headers=headers, method='POST'
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        result = json.loads(r.read())
    return result['id'], size

def main():
    parser = argparse.ArgumentParser(description='Dateien in DEEPKEEP hochladen')
    parser.add_argument('files', nargs='*', help='Dateien zum Hochladen')
    parser.add_argument('--folder', help='Lokaler Ordner (alle Dateien darin hochladen)')
    parser.add_argument('--subfolder', help='Ziel-Unterordner in SESSION (überschreibt Auto-Erkennung)')
    args = parser.parse_args()

    # Dateiliste aufbauen
    files_to_upload = list(args.files or [])
    if args.folder:
        for f in os.listdir(args.folder):
            fp = os.path.join(args.folder, f)
            if os.path.isfile(fp):
                files_to_upload.append(fp)

    if not files_to_upload:
        print("Keine Dateien angegeben. Verwendung: upload_to_deepkeep.py <datei1> [datei2 ...]")
        sys.exit(1)

    # Session-Ordner (aktueller Monat)
    session_name = f"[SESSION_{datetime.now().strftime('%Y-%m')}]"
    print(f"\nZiel: [DEEPKEEP]/{session_name}")
    session_id = get_or_create_folder(session_name, DEEPKEEP_ID)

    # Dateien hochladen
    uploaded = 0
    errors = 0
    folder_cache = {}

    for local_path in files_to_upload:
        if not os.path.exists(local_path):
            print(f"  ⚠️  Nicht gefunden: {local_path}")
            errors += 1
            continue

        fname = os.path.basename(local_path)
        ext   = os.path.splitext(fname)[1].lower().lstrip('.')

        # Ziel-Unterordner bestimmen
        if args.subfolder:
            sub_name = args.subfolder
        else:
            sub_name = TYPE_FOLDER.get(ext, '[MISC]')

        if sub_name not in folder_cache:
            folder_cache[sub_name] = get_or_create_folder(sub_name, session_id)
        target_id = folder_cache[sub_name]

        try:
            file_id, size = upload_file(local_path, target_id)
            print(f"  ✅ {fname}  →  {sub_name}  ({size//1024}KB)")
            uploaded += 1
        except Exception as e:
            print(f"  ❌ {fname}: {e}")
            errors += 1
        time.sleep(0.2)

    print(f"\n✅ {uploaded} Dateien hochgeladen, {errors} Fehler")
    print(f"   Ordner: [DEEPKEEP]/{session_name}")

if __name__ == '__main__':
    main()
