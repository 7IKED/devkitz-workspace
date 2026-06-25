/**
 * DkZ DeepKeep Sanitizer (CI/CD Hook)
 *
 * Durchsucht ein Verzeichnis rekursiv nach Secrets/Credentials
 * und ersetzt sie vor Git-Push. Wird von auto-release.yml aufgerufen.
 * Aufruf: node .agents/scripts/deepkeep.js <verzeichnis> [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DIRECTORY = process.argv[2] || '.';
const DRY_RUN = process.argv.includes('--dry-run');
const EXTENSIONS = new Set([
  '.js', '.ts', '.json', '.md', '.html', '.htm', '.css', '.scss',
  '.yml', '.yaml', '.env', '.env.example', '.ini', '.cfg', '.conf',
  '.xml', '.py', '.rb', '.sh', '.ps1', '.bat', '.sql', '.php'
]);
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt',
  '.pytest_cache', '__pycache__', 'venv', '.venv', '.env',
  '99_ARCHIVE', '99_ARCHIVE_DEPRECATED', '[DEEPKEEP]',
  '.gitlab', '.github', 'coverage', '.nyc_output',
  'target', 'bin', 'obj', '.vercel', '.cache'
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const REPLACEMENTS = [
  // --- API Keys & Tokens ---
  { regex: /\b(?:sk-|fk-)[a-zA-Z0-9_-]{20,}/g,
    replacement: '[DEEPKEEP:OPENAI_KEY_HIDDEN]' },
  { regex: /\bgh[opsu]_[a-zA-Z0-9]{36,}/g,
    replacement: '[DEEPKEEP:GITHUB_TOKEN_HIDDEN]' },
  { regex: /\bAIza[a-zA-Z0-9_-]{35}/g,
    replacement: '[DEEPKEEP:GOOGLE_API_HIDDEN]' },
  { regex: /\bAKIA[0-9A-Z]{16}/g,
    replacement: '[DEEPKEEP:AWS_KEY_HIDDEN]' },
  { regex: /Bearer\s+[a-zA-Z0-9._-]{20,}/g,
    replacement: 'Bearer [DEEPKEEP:TOKEN_HIDDEN]' },
  { regex: /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,
    replacement: '[DEEPKEEP:JWT_HIDDEN]' },
  { regex: /\bsk_live_[a-zA-Z0-9]{24,}/g,
    replacement: '[DEEPKEEP:STRIPE_KEY_HIDDEN]' },
  { regex: /\bxox[baprs]-[a-zA-Z0-9-]{24,}/g,
    replacement: '[DEEPKEEP:SLACK_TOKEN_HIDDEN]' },

  // --- Credential Assignments ---
  {
    regex: /(password|passwd|pwd|secret|api[_-]?key|api[_-]?secret|token|private[_-]?key|access[_-]?key|auth[_-]?token|session[_-]?secret)["']?\s*[:=]\s*["']([^"'\s]{8,})["']/gi,
    replacement: '$1: "[DEEPKEEP:HIDDEN]"'
  },

  // --- URLs with embedded credentials ---
  { regex: /\/\/[^:@\s]+:[^@\s]+@/g,
    replacement: '//[USER]:[DEEPKEEP:PASS_HIDDEN]@' },

  // --- SSH Private Key Content Detection ---
  { regex: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    replacement: '[DEEPKEEP:SSH_KEY_REMOVED]' },

  // --- Project-specific Author Markers ---
  { regex: /BAZE²/g,
    replacement: '[AUTHOR_DEVKITZ]' },
  { regex: /\b777\b(?!\s*[:"])/g,
    replacement: '[AUTHOR_777]' },

  // --- Local Paths ---
  { regex: /C:\\Users\\[^\\]+\\/gi,
    replacement: 'C:\\Users\\[USER]\\' },
  { regex: /C:\/Users\/[^\/]+\//gi,
    replacement: 'C:/Users/[USER]/' },
  { regex: /\/home\/[^\/]+\//gi,
    replacement: '/home/[USER]/' },
  { regex: /\/Users\/[^\/]+\//gi,
    replacement: '/Users/[USER]/' },

  // --- Email Addresses (only if they look like personal/private accounts) ---
  { regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:com|de|eu|net|org)\b/g,
    replacement: '[EMAIL_HIDDEN]' }
];

function isBinary(buf) {
  const sampleLen = Math.min(buf.length, 4096);
  for (let i = 0; i < sampleLen; i++) {
    const byte = buf[i];
    if (byte === 0 || (byte < 8 && byte !== 0 && byte !== 10 && byte !== 13)) {
      return true;
    }
  }
  return false;
}

function sanitizeDirectory(dir) {
  let files = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return [];
  }

  let modified = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(file) && !file.startsWith('.')) {
        modified = modified.concat(sanitizeDirectory(fullPath));
      }
    } else if (stat.size <= MAX_FILE_SIZE) {
      const ext = path.extname(fullPath).toLowerCase();
      if (EXTENSIONS.has(ext)) {
        const result = sanitizeFile(fullPath);
        if (result) modified.push(result);
      }
    }
  }
  return modified;
}

function sanitizeFile(filePath) {
  let buf;
  try {
    buf = fs.readFileSync(filePath);
  } catch {
    return null;
  }

  if (isBinary(buf)) return null;

  let content = buf.toString('utf8');
  let original = content;
  let matchCount = 0;

  for (const { regex, replacement } of REPLACEMENTS) {
    regex.lastIndex = 0;
    const matches = content.match(regex);
    if (matches) {
      matchCount += matches.length;
      content = content.replace(regex, replacement);
    }
  }

  if (content !== original) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    return { file: filePath, count: matchCount };
  }
  return null;
}

console.log(`\n\x1b[36m[DEEPKEEP]\x1b[0m Scanne \x1b[33m${DIRECTORY}\x1b[0m${DRY_RUN ? ' (\x1b[33mDRY-RUN\x1b[0m)' : ''}...`);
const start = Date.now();
const modified = sanitizeDirectory(DIRECTORY);
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

if (modified.length === 0) {
  console.log(`\x1b[32m[DEEPKEEP]\x1b[0m Keine Secrets gefunden. (${elapsed}s)\n`);
} else {
  const totalHits = modified.reduce((sum, m) => sum + m.count, 0);
  console.log(`\x1b[32m[DEEPKEEP]\x1b[0m ${modified.length} Dateien, ${totalHits} Fundstellen ${DRY_RUN ? 'würden ersetzt' : 'ersetzt'} (${elapsed}s):`);
  for (const { file, count } of modified) {
    console.log(`  ${DRY_RUN ? '[WÜRDE]' : '[OK]'} ${file} (${count})`);
  }
  console.log();
}
