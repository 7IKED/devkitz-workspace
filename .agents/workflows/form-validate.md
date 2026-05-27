---
description: Formular-Validierung mit DkZ Design — Input, Textarea, Select mit Live-Feedback
---

# /form-validate — Formular mit Validierung

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Pattern
```javascript
function validateForm(formEl) {
    const rules = {
        'email': { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Ungültige E-Mail' },
        'name':  { required: true, minLength: 2, msg: 'Mind. 2 Zeichen' },
        'text':  { required: true, maxLength: 500, msg: 'Max. 500 Zeichen' }
    };
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
        const input = formEl.querySelector(`[name="${field}"]`);
        if (!input) continue;
        const val = input.value.trim();
        if (rule.required && !val) errors.push({ field, msg: `${field} ist Pflichtfeld` });
        if (rule.pattern && !rule.pattern.test(val)) errors.push({ field, msg: rule.msg });
        if (rule.minLength && val.length < rule.minLength) errors.push({ field, msg: rule.msg });
        if (rule.maxLength && val.length > rule.maxLength) errors.push({ field, msg: rule.msg });
        // Visual Feedback
        input.style.borderColor = errors.some(e => e.field === field) ? 'var(--red)' : 'var(--green)';
    }
    return { valid: errors.length === 0, errors };
}
```

## DkZ Input Style
```css
.dkz-input {
    width: 100%; padding: 10px 14px;
    background: rgba(26,26,32,1); color: var(--text-primary);
    border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
    font-family: var(--font-main); font-size: 0.85rem;
    outline: none; transition: border-color 0.2s;
}
.dkz-input:focus { border-color: var(--accent); }
.dkz-input.error { border-color: var(--red); }
.dkz-input.valid { border-color: var(--green); }
```
