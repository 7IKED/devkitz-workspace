# DkZ Files 📁

A dual-pane file commander built with the DEVKiTZ™ Neon Matrix Design System. Browse, preview, and manage files using the File System Access API with a stunning dark neon aesthetic.

## Features

- **Dual-Pane Commander** — Side-by-side file browsing (desktop), tab-switched (mobile)
- **File System Access API** — `showDirectoryPicker()` for real folder access
- **File List** — Name, size, type, and date columns
- **Sorting** — Sort by name, size, date, or type (ascending/descending)
- **Breadcrumbs Navigation** — Click any segment to navigate back
- **Preview Panel** — Inline image preview, text/code syntax display
- **Context Menu** — Right-click for Open, Rename, Delete, Preview
- **File Icons by Type** — Folder, image, code, text, video, audio, archive, and more
- **Search/Filter** — Real-time filter in current directory
- **New Folder** — Create folders directly from the toolbar
- **Drag & Drop** — HTML5 drag between panes
- **Responsive** — Single-pane on mobile, dual-pane on desktop
- **FSAA Fallback** — Shows a helpful message if browser doesn't support FSAA
- **i18n** — English (default) + German
- **Kontrast Mode** — Enhanced neon glow for accessibility

## Requirements

This app requires a **Chromium-based browser** with File System Access API support:
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Brave
- ✅ Vivaldi
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

## Screenshots

> _Coming soon_

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- DEVKiTZ™ Neon Matrix Design System
- File System Access API (native browser)
- No external dependencies beyond React

## Installation

```bash
cd dkz-files
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a Chromium-based browser.

## Project Structure

```
dkz-files/
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
├── README.md
└── src/
    ├── main.jsx          # Entry point with providers
    ├── App.jsx           # Main app with all features
    ├── shared.jsx        # i18n & Kontrast providers
    ├── components.jsx    # Navbar, Toast, EmptyState, Spinner
    └── index.css         # Neon Matrix CSS
```

## License

MIT License — DEVKiTZ™
