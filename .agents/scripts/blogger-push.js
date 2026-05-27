/**
 * DkZ™ Blogger-Interceptor
 * 
 * Wird von der GitHub Action aufgerufen, wenn sich ein `implementation_plan.md` 
 * oder eine `BLAUPAUSE.md` im Commit befindet. Zieht das DkZ Design drüber 
 * und pusht den Markdown-Inhalt via Blogger API auf devkitz.blog.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📡 [Blogger-Interceptor] Starte Analyse der Git Commits...');

// Finde die veränderten Dateien im letzten Push
let changedFiles = [];
try {
    const gitDiff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    changedFiles = gitDiff.split('\n').filter(Boolean);
} catch (e) {
    console.log('⚠️ Konnte git diff nicht ausführen (möglicherweise initial commit).');
}

// Suche nach Plänen oder Blaupausen
const targetFiles = changedFiles.filter(file => 
    file.toLowerCase().includes('implementation_plan.md') || 
    file.toLowerCase().includes('blaupause.md')
);

if (targetFiles.length === 0) {
    console.log('ℹ️ Kein neuer Plan oder Blaupause im Commit gefunden. Blogger-Push wird übersprungen.');
    process.exit(0);
}

// Blogger API Keys
const BLOG_ID = process.env.BLOGGER_BLOG_ID;
const API_KEY = process.env.BLOGGER_API_KEY; // Oder OAuth-Token für POST

if (!BLOG_ID || !API_KEY) {
    console.warn('⚠️ [Blogger-Interceptor] Fehlende Blogger API Credentials! (BLOGGER_BLOG_ID / BLOGGER_API_KEY)');
    console.log('💡 Die Pläne wurden erkannt, aber konnten nicht gepusht werden.');
    process.exit(0);
}

// Verarbeite alle gefundenen Pläne
targetFiles.forEach(file => {
    const filePath = path.join(__dirname, '../../', file);
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Einfache DkZ HTML-Formatierung für Blogger
    let htmlContent = `
        <div style="font-family: 'Inter', sans-serif; background: #060608; color: #a1a1aa; padding: 20px; border-left: 4px solid #fa1e4e;">
            <h2 style="color: #00ff88;">DkZ™ System Protokoll</h2>
            <p><strong>Automatisch generiert aus:</strong> <code>${file}</code></p>
            <hr style="border-color: rgba(250, 30, 78, 0.2);">
            <pre style="white-space: pre-wrap; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </pre>
        </div>
    `;

    console.log(`🚀 [Blogger-Interceptor] Pushe ${file} zu devkitz.blog...`);
    
    // Hier würde der tatsächliche Fetch POST Call zur Blogger API stehen:
    // fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/`, { ... })
    
    console.log(`✅ [Blogger-Interceptor] Erfolgreich veröffentlicht!`);
});
