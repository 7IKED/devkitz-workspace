---
description: Daten-Export System — JSON, CSV, PDF Export aus DkZ Modulen
---

# /export-data — Daten exportieren

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## JSON Export
```javascript
function exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
}
```

## CSV Export
```javascript
function exportCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row =>
        headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
    )].join('\n');
    downloadBlob(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`);
}
```

## Download Helper
```javascript
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}
```

## In DkZ Module einbauen
```javascript
// Export-Button im Header
const exportBtn = document.createElement('button');
exportBtn.textContent = '📥 Export';
exportBtn.addEventListener('click', () => {
    const data = collectModuleData();
    const format = prompt('Format? (json/csv)', 'json');
    if (format === 'csv') exportCSV(data, 'dkz-export');
    else exportJSON(data, 'dkz-export');
});
```
