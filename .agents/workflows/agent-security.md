---
description: Security Agent — XSS, CSRF, Injection Prüfung und Hardening
---

# /agent-security — Security Agent

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Security-Audit Checkliste

### 1. XSS Prevention (KRITISCH)
```javascript
// PFLICHT: esc() bei JEDEM User-Input
function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// ❌ element.innerHTML = userInput;
// ✅ element.innerHTML = esc(userInput);
// ✅ element.textContent = userInput;
```

### 2. API Key Scan
```bash
grep -rn "sk-[a-zA-Z0-9]" --include="*.js" --include="*.json" .
grep -rn "ghp_" --include="*.js" .
grep -rn "Bearer " --include="*.js" .
grep -rn "password" --include="*.js" .
```

### 3. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src https://fonts.gstatic.com;">
```

### 4. localStorage Security
```javascript
// Sensible Daten NICHT in localStorage
// ❌ localStorage.setItem('api-key', key);
// ✅ sessionStorage.setItem('api-key', key); // Nur für Session
```

### 5. CORS & Fetch
```javascript
// Immer Error Handling bei fetch
try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (e) {
    // Graceful Fallback
}
```

### 6. Git Commit
```bash
git commit -m "security([modul]): audit bestanden — [findings]"
```
