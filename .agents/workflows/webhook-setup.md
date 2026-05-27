---
description: Webhook-System einrichten — Events empfangen und verarbeiten über HTTP Callbacks
---

# /webhook-setup — Webhooks einrichten

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## ONTHERUN™ Webhook Endpoint
```javascript
// routes/webhooks.js
router.post('/webhook/:source', async (req, res) => {
    const { source } = req.params;
    const payload = req.body;
    const signature = req.headers['x-webhook-signature'];

    // Signatur verifizieren
    if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // Event verarbeiten
    switch(source) {
        case 'github':   await handleGitHub(payload); break;
        case 'stripe':   await handleStripe(payload); break;
        case 'cloudflare': await handleCF(payload); break;
        default: console.warn(`Unknown webhook source: ${source}`);
    }

    res.status(200).json({ received: true });
});

function verifySignature(payload, sig, secret) {
    const crypto = require('crypto');
    const expected = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(payload)).digest('hex');
    return sig === `sha256=${expected}`;
}
```

## GitHub Webhook Events
```markdown
Nützliche Events:
- `push` → Auto-Deploy triggern
- `pull_request` → Review-Notification
- `issues` → Triage-Pipeline
- `release` → Changelog generieren
```

## Git Commit
```bash
git commit -m "feat(webhooks): [source] webhook endpoint erstellt"
```
