---
description: React/Framework Komponente zu Vanilla HTML/CSS/JS konvertieren
---

# React to Vanilla Konvertierung

## Wann nutzen
- Gefundene GitHub Komponente ist in React → DkZ™ braucht Vanilla
- n8n Workflows UI-Panels in React → zu HTML konvertieren
- Awesome-Repo Skills haben Framework-Dependencies

## Schritte

1. **React-Quellcode analysieren**
   - JSX-Struktur → HTML Elemente identifizieren
   - State/Props → JavaScript Variablen
   - useEffect/Hooks → DOMContentLoaded + Event Listeners
   - CSS Modules/Styled → Vanilla CSS

2. **HTML erstellen**
   ```html
   <!-- Von React JSX: -->
   <!-- <Button onClick={handleClick} className="primary">Text</Button> -->
   <!-- Zu Vanilla HTML: -->
   <button class="btn btn-a" onclick="handleClick()">Text</button>
   ```

3. **JavaScript konvertieren**
   ```javascript
   // Von React State:
   // const [count, setCount] = useState(0)
   // Zu Vanilla:
   let count = 0;
   function updateCount(v) { count = v; render(); }
   ```

4. **DkZ™ Design anwenden**
   - CSS Variables nutzen (`--accent`, `--bg`, etc.)
   - DkZ™ Klassen verwenden (`.panel`, `.btn`, `.fld`)
   - Glassmorphism + Dark Theme
   - `esc()` bei User-Input

5. **Testen** → `/webapp-test` ausführen

## VERBOTEN
- React/Vue/Angular behalten — IMMER zu Vanilla konvertieren
- Tailwind CSS → zu DkZ CSS Variables konvertieren
- jQuery → Native DOM API nutzen
