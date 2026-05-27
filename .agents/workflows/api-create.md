---
description: REST API Route erstellen — Express.js Endpoint mit Validierung und Error Handling
---

# /api-create — API Endpoint erstellen

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Template: Express.js Route

```javascript
// routes/[name].js
const express = require('express');
const router = express.Router();

// GET /api/[name]
router.get('/', async (req, res) => {
    try {
        const data = await getData();
        res.json({ ok: true, data, timestamp: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// POST /api/[name]
router.post('/', async (req, res) => {
    const { body } = req;
    if (!body || !body.action) {
        return res.status(400).json({ ok: false, error: 'action required' });
    }
    try {
        const result = await processAction(body);
        res.json({ ok: true, result });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

module.exports = router;
```

## In ONTHERUN™ einbinden
```javascript
// server.js
const nameRoutes = require('./routes/[name]');
app.use('/api/[name]', nameRoutes);
```

## Git Commit
```bash
git commit -m "feat(api): /api/[name] endpoint erstellt"
```
