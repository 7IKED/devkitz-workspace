# DkZ Translate 🌐

> A sleek, real-time translator powered by the MyMemory API with 34 languages, auto-detect, history, and favorites. Part of the **DEVKiTZ™ Neon Matrix** app ecosystem.

![License](https://img.shields.io/badge/license-MIT-00ff88)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Tailwind-000)

---

## Features

- **Dual Textarea** — Source text on the left, translation on the right (stacked on mobile)
- **MyMemory API** — Free translation API with no API key required
- **34 Languages** — Each with flag emoji identifiers
- **Auto-Detect** — Automatically detect the source language via the API
- **Swap Button** — Swap source and target languages with a smooth spin animation
- **Auto-Translate** — Automatic translation after 500ms typing pause (debounce)
- **Copy to Clipboard** — One-click copy for both source and target text
- **Translation History** — Last 50 translations saved to localStorage
- **Favorites** — Star translations to save them permanently
- **Character Counter** — Real-time count for both source and target
- **Quick Language Chips** — Popular languages as clickable chips below the translator
- **Responsive Design** — Side-by-side on desktop, stacked on mobile
- **i18n** — English (default) and German UI language support
- **High Contrast Mode** — Enhanced neon glow for accessibility
- **Impressum** — Built-in legal/privacy information

---

## Screenshots

<!-- TODO: Add screenshots -->

---

## Languages Supported

🇬🇧 English · 🇩🇪 German · 🇫🇷 French · 🇪🇸 Spanish · 🇮🇹 Italian · 🇵🇹 Portuguese · 🇳🇱 Dutch · 🇵🇱 Polish · 🇷🇺 Russian · 🇺🇦 Ukrainian · 🇯🇵 Japanese · 🇰🇷 Korean · 🇨🇳 Chinese · 🇸🇦 Arabic · 🇮🇳 Hindi · 🇹🇷 Turkish · 🇸🇪 Swedish · 🇩🇰 Danish · 🇳🇴 Norwegian · 🇫🇮 Finnish · 🇨🇿 Czech · 🇷🇴 Romanian · 🇭🇺 Hungarian · 🇬🇷 Greek · 🇧🇬 Bulgarian · 🇭🇷 Croatian · 🇸🇰 Slovak · 🇸🇮 Slovenian · 🇪🇪 Estonian · 🇱🇻 Latvian · 🇱🇹 Lithuanian · 🇹🇭 Thai · 🇻🇳 Vietnamese · 🇮🇩 Indonesian

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Design System | DEVKiTZ Neon Matrix |
| API | MyMemory Translation API |
| Persistence | localStorage |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/777/devkitz-ecosystem.git
cd 01_PROJECTS/dkz-translate

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Usage

1. Select source and target languages from the dropdowns
2. Type or paste text in the left textarea
3. Translation appears automatically after 500ms pause
4. Click the **swap button** (⇆) to reverse languages and text
5. Use **📋 Copy** to copy translated text to clipboard
6. Click **📜 History** to browse past translations
7. Star ☆ any translation to save it as a favorite

---

## API

This app uses the [MyMemory Translation API](https://mymemory.translated.net/doc/spec.php):

```
GET https://api.mymemory.translated.net/get?q=TEXT&langpair=SRC|TGT
```

**Rate Limits:** 5000 chars/day (anonymous), 50000 chars/day (with email). No API key required.

---

## License

MIT License — DEVKiTZ™
