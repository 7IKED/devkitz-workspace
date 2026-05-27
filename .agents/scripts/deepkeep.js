/**
 * DkZ™ DeepKeep Sanitizer (Monorepo Edition)
 * 
 * Durchsucht ALLE 96 Module auf Passwörter und persönliche Daten.
 */

const fs = require('fs');
const path = require('path');

const DIRECTORY = process.argv[2] || '.';
const EXTENSIONS = ['.js', '.json', '.md', '.html', '.css', '.yml', '.env.example'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.pytest_cache', '__pycache__', 'venv'];

const REPLACEMENTS = [
    // 1. API Keys & Tokens
    { regex: /sk-[a-zA-Z0-9]{20,}/g, replacement: '[DEEPKEEP:OPENAI_KEY_HIDDEN]' },
    { regex: /ghp_[a-zA-Z0-9]{36}/g, replacement: '[DEEPKEEP:GITHUB_TOKEN_HIDDEN]' },
    { regex: /AIza[a-zA-Z0-9_-]{35}/g, replacement: '[DEEPKEEP:GOOGLE_API_HIDDEN]' },
    { regex: /Bearer\s+[a-zA-Z0-9_-]{20,}/g, replacement: 'Bearer [DEEPKEEP:TOKEN_HIDDEN]' },
    
    // 2. Passwörter
    { regex: /(password|passwd|secret|api_key|token)["']?\s*[:=]\s*["']([^"']+)["']/gi, replacement: '$1: "[DEEPKEEP:HIDDEN]"' },

    // 3. Personenbezogene Daten & Identitäten
    { regex: /BAZE²/g, replacement: '[AUTHOR_DEVKITZ]' },
    { regex: /777/g, replacement: '[AUTHOR_777]' },
    { regex: /C:\\Users\\[^\\]+\\/gi, replacement: 'C:\\Users\\[USER]\\' },
    { regex: /C:\/Users\/[^\/]+\//gi, replacement: 'C:/Users/[USER]/' }
];

function sanitizeDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                sanitizeDirectory(fullPath);
            }
        } else {
            const ext = path.extname(fullPath).toLowerCase();
            if (EXTENSIONS.includes(ext)) {
                sanitizeFile(fullPath);
            }
        }
    }
}

function sanitizeFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    REPLACEMENTS.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
            content = content.replace(regex, replacement);
            hasChanges = true;
        }
    });

    if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[DeepKeep] Zensiert: ${filePath}`);
    }
}

console.log('🛡️  DkZ™ DeepKeep scannt das Monorepo...');
sanitizeDirectory(DIRECTORY);
console.log('✅ DeepKeep Scan abgeschlossen.');
