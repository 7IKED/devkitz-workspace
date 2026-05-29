# TTS Studio 🔊

> **Text-to-Speech Application** — Part of the DEVKiTZ™ Neon Matrix App Suite

![DEVKiTZ™](https://img.shields.io/badge/DEVKiTZ™-Neon%20Matrix-00ff88?style=for-the-badge&labelColor=000000)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v3-38B2AC?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Features

- **Web Speech API** — Full `speechSynthesis` integration for browser-native TTS
- **Voice Selection** — All available browser voices grouped by language with filter dropdown
- **Speed Control** — Adjustable rate from 0.5x to 3x via smooth slider
- **Pitch Control** — Adjustable pitch from 0.5 to 2.0
- **Volume Control** — Full volume control from 0% to 100%
- **Playback Controls** — Play / Pause / Resume / Stop with visual status indicator
- **Word Highlighting** — Active word is highlighted in real-time using the `onboundary` event
- **Character & Word Counter** — Live count in the editor
- **Template System** — 5 pre-built demo texts (EN + DE): Welcome, News, Story, Poetry, Technical
- **History** — Last 20 spoken texts with replay and delete functionality
- **Responsive Design** — Full editor on desktop with side panels; tabbed compact view on mobile
- **Persistent Settings** — Voice, speed, pitch, volume and history saved in localStorage
- **i18n** — English (default) and German language support
- **High Contrast Mode** — Enhanced neon glow for accessibility
- **Glassmorphism UI** — Premium dark theme with neon accents

---

## Screenshots

> *Coming soon*

---

## Installation

```bash
cd tts-studio
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- DEVKiTZ™ Neon Matrix Design System
- Web Speech API (SpeechSynthesis)
- localStorage for persistence

## Browser Compatibility

The Web Speech API is supported in most modern browsers. Voice availability varies by OS and browser:
- **Chrome/Edge**: Full support with many voices
- **Firefox**: Supported with system voices
- **Safari**: Supported with macOS/iOS voices

---

## License

MIT License — Made with 💚 by DEVKiTZ™
