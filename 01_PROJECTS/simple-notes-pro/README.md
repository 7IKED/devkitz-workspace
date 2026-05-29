# Simple Notes Pro 📝

> A premium Markdown note-taking app with live preview, tags, color categories, and full-text search. Part of the **DEVKiTZ™ Neon Matrix** app ecosystem.

![License](https://img.shields.io/badge/license-MIT-00ff88)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-000)

---

## Features

- **Split-View Editor** — Markdown editor on the left, live preview on the right
- **Custom Markdown Parser** — Regex-based, zero dependencies. Supports H1-H6, bold, italic, code blocks, inline code, lists, links, blockquotes, horizontal rules, and images
- **Tag System** — Create, assign, and filter notes by colored tags
- **6 Color Categories** — Red, Green, Blue, Yellow, Purple, Orange
- **Full-Text Search** — Instantly search across all note titles, content, and tags
- **Auto-Save** — Automatic save every 3 seconds to localStorage
- **Export** — Single note as `.md`, `.txt`, or `.json`. Bulk export all notes as `.json`
- **Import** — Import `.md`, `.txt`, or `.json` files
- **Word & Character Counter** — Real-time stats in the editor toolbar
- **Sortable Notes List** — Sort by date (newest first) or alphabetically by title
- **Responsive Design** — Sidebar becomes a drawer on mobile devices
- **i18n** — English (default) and German language support
- **High Contrast Mode** — Enhanced neon glow for accessibility
- **Impressum** — Built-in legal/privacy information

---

## Screenshots

<!-- TODO: Add screenshots -->

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Design System | DEVKiTZ Neon Matrix |
| Persistence | localStorage |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/777/devkitz-ecosystem.git
cd 01_PROJECTS/simple-notes-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Usage

1. Click **"New Note"** to create a note
2. Write Markdown in the left editor pane
3. See the live preview in the right pane
4. Add tags by clicking **"+ Add tag..."**
5. Assign a color category via the color picker
6. Use the search bar to find notes by title, content, or tags
7. Export individual notes or all notes via the export menu
8. Import `.md`, `.txt`, or `.json` files via the sidebar import button

---

## Markdown Syntax Supported

| Syntax | Description |
|:-------|:------------|
| `# Title` | Heading H1 |
| `## - ######` | Heading H2-H6 |
| `**bold**` | Bold text |
| `*italic*` | Italic text |
| `` `code` `` | Inline code |
| ` ``` ` | Code blocks |
| `- item` | Unordered list |
| `1. item` | Ordered list |
| `[text](url)` | Links |
| `![alt](url)` | Images |
| `> quote` | Blockquotes |
| `---` | Horizontal rule |

---

## License

MIT License — DEVKiTZ™
