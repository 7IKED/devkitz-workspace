# 📐 Panel System — UI Skill

> **Skill-ID:** `panel-system`
> **Alias:** `panels`, `slide`
> **Terminal:** `dkz skill:panels`

---

## Panel-Typen

### 1. Slide-Panel (KI / Content)
```html
<div class="slide-panel" id="[name]-panel">
  <div class="slide-handle" onclick="toggle[Name]()">⋮</div>
  <div style="padding:1rem;height:100%;display:flex;flex-direction:column">
    <h4 style="color:var(--pink)">[Titel]</h4>
    <div style="flex:1;overflow-y:auto" id="[name]-content"></div>
  </div>
</div>
```
```css
.slide-panel {
  position: fixed; top: 48px; right: 0; bottom: 40px;
  width: 0; z-index: 150;
  background: rgba(5,5,5,.95);
  border-left: 1px solid var(--border);
  backdrop-filter: blur(30px);
  transition: width .35s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.slide-panel.open { width: 38%; }
```
```javascript
function toggle[Name]() {
  document.getElementById('[name]-panel').classList.toggle('open');
  log('[Name] toggle');
}
```

### 2. Popup (Settings / Handbuch / Blogger)
```html
<div class="popup-overlay" id="[name]-overlay">
  <div class="popup">
    <button class="popup-close" onclick="toggle[Name]()">✕</button>
    <h3>[Titel]</h3>
    <!-- Inhalt -->
  </div>
</div>
```
```javascript
function toggle[Name]() {
  document.getElementById('[name]-overlay').classList.toggle('on');
}
```

### 3. Sidebar (Keep)
```html
<div class="keep-bar" id="keep-bar">
  <div style="padding:1rem">
    <h4 style="color:var(--pink)">📌 Keep</h4>
    <div id="keep-list"></div>
  </div>
</div>
```

### 4. Bottom Bar (Log / RedNote / Clipboard)
```html
<div class="bottom-bar" id="bottom-bar">
  <button class="bottom-tab" onclick="setBottom('log',this)">📋 Log</button>
  <button class="bottom-tab" onclick="setBottom('rednote',this)">🔴 RedNote</button>
  <div class="ticker"><span>[Fließtext]</span></div>
  <button class="icon-btn" onclick="toggleBottom()">▲</button>
</div>
```

---

## Regeln

```
1. JEDES Panel öffnet/schließt mit EINEM Klick auf sein Symbol
2. Panels bleiben verbunden wenn geschlossen (kein Neurendern)
3. KI-Panel links geht ÜBER den Hauptinhalt (kein Resize)
4. Popup = OHNE Adressleiste, OHNE Menüleiste, OHNE Rand
5. Bottom-Bar hat 3 Modi: Ticker, Expanded, Hidden
6. Slide-Handle zum manuellen Ziehen (cursor:ew-resize)
```
