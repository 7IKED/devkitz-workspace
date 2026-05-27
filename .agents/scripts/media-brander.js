/**
 * DkZ™ Media EXIF Brander
 * 
 * Verwendet ExifTool um Metadaten (Copyright/Author) in .jpg, .png, .mp4 Dateien 
 * einzubrennen, bevor diese auf den Server / Google Photos geladen werden.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DIRECTORY = process.argv[2] || '.';
const DOMAINS = "devkitz.eu dkz.app devkitz.shop devkitz.blog";
const AUTHOR = "BAZE² / DEVKiTZ";

// Nur bestimmte Dateitypen branden
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.mp4', '.webp'];

function isMediaFile(filePath) {
    return EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function runExifTool(dir) {
    console.log(`📸 [Media Brander] Suche Media-Dateien in ${dir}...`);
    
    // Finde alle Bilder (vereinfacht, exiftool kann auch rekursiv)
    // Wir nutzen exiftool rekursiv für Performance:
    
    const cmd = `exiftool -r -overwrite_original -Copyright="${DOMAINS}" -Author="${AUTHOR}" -Comment="${DOMAINS}" -ext jpg -ext png -ext mp4 -ext webp "${dir}"`;
    
    try {
        console.log(`Brenne Metadaten ein (Dies kann dauern)...`);
        const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
        console.log(output);
        console.log(`✅ [Media Brander] Erfolgreich gebrandet!`);
    } catch (err) {
        if (err.message.includes('command not found') || err.message.includes('not recognized')) {
            console.error('❌ ExifTool nicht gefunden! Bitte installiere es (apt-get install libimage-exiftool-perl)');
        } else {
            console.log('ℹ️ ExifTool lief durch (möglicherweise keine Bilder gefunden).');
        }
    }
}

runExifTool(DIRECTORY);
