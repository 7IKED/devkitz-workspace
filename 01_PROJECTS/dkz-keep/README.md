# DkZ Keep 📝

A premium Google Keep clone built with the DEVKiTZ™ Neon Matrix Design System. Create, organize, and manage notes with a stunning dark neon aesthetic.

## Features

- **Note Types** — Text notes and checklist notes with checkable items
- **Masonry Grid Layout** — CSS Grid with auto-rows for Pinterest-style layout
- **8 Color Categories** — Assign colors to notes for visual organization
- **Labels/Tags** — Create, assign, rename, and delete labels
- **Pin/Unpin** — Keep important notes at the top
- **Archive** — Move notes to archive without deleting
- **Drag & Drop** — Reorder notes with HTML5 Drag API (no external packages)
- **Search** — Full-text search across titles and content
- **Grid/List Toggle** — Switch between masonry grid and list view
- **Edit Modal** — Click any note to open a detailed editing view
- **localStorage Persistence** — All data persisted locally
- **Responsive** — 1 column on mobile, 2-4 columns on desktop
- **i18n** — English (default) + German
- **Kontrast Mode** — Enhanced neon glow for accessibility

## Screenshots

> _Coming soon_

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- DEVKiTZ™ Neon Matrix Design System
- localStorage for persistence
- No external dependencies beyond React

## Installation

```bash
cd dkz-keep
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
dkz-keep/
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
