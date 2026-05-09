# DkZ devkitz V2 - Architecture Overview

## 1. System Philosophy

- **Vanilla JS Core**: Direct DOM manipulation, no Virtual DOM overhead.
- **Mobile First**: UI designed for touch and small screens, scaling up to desktop.
- **Offline Capable**: All data in `IndexedDB`, assets local.
- **Zero-Dependency**: No `npm`, `webpack`, or external CDNs required for core functionality.

## 2. Directory Structure & Modules

```
js/
├── app.js            # Bootstrapper & Global Error Handler
├── core/
│   ├── config.js     # Default settings & environment constants
│   ├── event-bus.js  # Simple Pub/Sub for module communication
│   └── settings.js   # User preferences storage (app theme, editor mode)
├── data/
│   ├── db.js         # Low-level IndexedDB wrapper (Open, Add, Get, Put)
│   ├── models.js     # Data definitions (Project, ExportItem)
│   └── store.js      # High-level Data Access Object (DAO) for App
├── features/
│   ├── editor/
│   │   ├── base.js   # Abstract class for Editors
│   │   ├── smart.js  # Markdown Editor (Textarea + Preview)
│   │   └── extended.js # WYSIWYG Editor (contenteditable)
│   └── export.js     # Orchestrates PDF/MD/HTML generation
├── services/
│   └── drive.js      # Google Drive API Handlers (Authentication, Upload)
└── ui/
    ├── router.js     # Swaps visible <section> based on hash/state
    ├── renderer.js   # Helper for creating DOM elements
    └── components/   # Specific UI widgets (Modal, Toast, Cards)
```

## 3. Data Flow

1. **User Action** (Click "Save") -> `UI Component`
2. **Event** -> `EventBus.emit('cmd:save')`
3. **Handler** -> `EditorModule` listens, gathers content.
4. **Storage** -> `Store.saveProject(data)` -> `DB.put('projects', data)`
5. **Feedback** -> `EventBus.emit('notify:success')` -> `ToastComponent` displays message.

## 4. Key Technologies

- **IndexedDB**: For structured data (Projects, Versions).
- **LocalStorage**: For small key-value pairs (Theme, LastView).
- **CSS Variables**: For dynamic theming.
- **Service Worker** (Future): For PWA offline caching.
