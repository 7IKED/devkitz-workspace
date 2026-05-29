import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from './shared';
import { Navbar, Toast, EmptyState } from './components';

// === APP TRANSLATIONS ===
const appTranslations = {
  en: {
    appTitle: 'TTS Studio',
    speak: 'Speak',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    voice: 'Voice',
    speed: 'Speed',
    pitch: 'Pitch',
    volume: 'Volume',
    textArea: 'Enter text to speak...',
    charCount: 'characters',
    wordCount: 'words',
    history: 'History',
    historyEmpty: 'No History',
    historyEmptyDesc: 'Spoken texts will appear here.',
    templates: 'Templates',
    useTemplate: 'Use',
    clearText: 'Clear',
    speaking: 'Speaking...',
    paused: 'Paused',
    ready: 'Ready',
    noVoices: 'No voices available',
    allLanguages: 'All Languages',
    replayHistory: 'Replay',
    deleteHistory: 'Delete',
    clearHistory: 'Clear History',
    clearHistoryConfirm: 'Clear all history entries?',
    copied: 'Text copied!',
    templateLoaded: 'Template loaded',
    controls: 'Controls',
    editor: 'Editor',
    voiceSettings: 'Voice Settings',
    loadingVoices: 'Loading voices...',
  },
  de: {
    appTitle: 'TTS Studio',
    speak: 'Vorlesen',
    pause: 'Pause',
    resume: 'Fortfahren',
    stop: 'Stopp',
    voice: 'Stimme',
    speed: 'Geschwindigkeit',
    pitch: 'Tonhoehe',
    volume: 'Lautstaerke',
    textArea: 'Text zum Vorlesen eingeben...',
    charCount: 'Zeichen',
    wordCount: 'Woerter',
    history: 'Verlauf',
    historyEmpty: 'Kein Verlauf',
    historyEmptyDesc: 'Vorgelesene Texte erscheinen hier.',
    templates: 'Vorlagen',
    useTemplate: 'Verwenden',
    clearText: 'Leeren',
    speaking: 'Liest vor...',
    paused: 'Pausiert',
    ready: 'Bereit',
    noVoices: 'Keine Stimmen verfuegbar',
    allLanguages: 'Alle Sprachen',
    replayHistory: 'Erneut',
    deleteHistory: 'Loeschen',
    clearHistory: 'Verlauf loeschen',
    clearHistoryConfirm: 'Gesamten Verlauf loeschen?',
    copied: 'Text kopiert!',
    templateLoaded: 'Vorlage geladen',
    controls: 'Steuerung',
    editor: 'Editor',
    voiceSettings: 'Stimm-Einstellungen',
    loadingVoices: 'Stimmen werden geladen...',
  },
};

// === DEMO TEMPLATES ===
const demoTemplates = [
  {
    id: 'welcome',
    icon: '👋',
    titleEn: 'Welcome Message',
    titleDe: 'Willkommensnachricht',
    textEn: 'Welcome to TTS Studio! This is a powerful text-to-speech application built with the Web Speech API. You can adjust the voice, speed, pitch, and volume to customize the reading experience. Try it out now!',
    textDe: 'Willkommen im TTS Studio! Dies ist eine leistungsstarke Text-to-Speech-Anwendung, die mit der Web Speech API erstellt wurde. Sie koennen Stimme, Geschwindigkeit, Tonhoehe und Lautstaerke anpassen. Probieren Sie es jetzt aus!',
  },
  {
    id: 'news',
    icon: '📰',
    titleEn: 'Breaking News',
    titleDe: 'Eilmeldung',
    textEn: 'Breaking news from the technology sector: A new breakthrough in artificial intelligence has been announced today. Researchers have developed a system that can understand and generate natural language with unprecedented accuracy. This advancement could revolutionize how we interact with computers and machines in our daily lives.',
    textDe: 'Eilmeldung aus dem Technologiesektor: Ein neuer Durchbruch in der kuenstlichen Intelligenz wurde heute angekuendigt. Forscher haben ein System entwickelt, das natuerliche Sprache mit beispielloser Genauigkeit verstehen und erzeugen kann. Dieser Fortschritt koennte revolutionieren, wie wir im Alltag mit Computern und Maschinen interagieren.',
  },
  {
    id: 'story',
    icon: '📖',
    titleEn: 'Short Story',
    titleDe: 'Kurzgeschichte',
    textEn: 'Once upon a time, in a digital realm far beyond the screen, there lived a small robot named Echo. Echo had one special ability: it could turn written words into spoken language. Every night, it would read bedtime stories to the children of the digital world, bringing warmth and wonder to their pixelated dreams.',
    textDe: 'Es war einmal, in einem digitalen Reich weit hinter dem Bildschirm, da lebte ein kleiner Roboter namens Echo. Echo hatte eine besondere Faehigkeit: Er konnte geschriebene Worte in gesprochene Sprache verwandeln. Jede Nacht las er den Kindern der digitalen Welt Gute-Nacht-Geschichten vor und brachte Waerme und Staunen in ihre pixeligen Traeume.',
  },
  {
    id: 'poetry',
    icon: '🎭',
    titleEn: 'Digital Poetry',
    titleDe: 'Digitale Poesie',
    textEn: 'In circuits deep and silicon wide,\nWhere electrons dance and photons glide,\nA voice emerges, clear and bright,\nTurning darkness into light.\nWords once trapped in silent code,\nNow travel down the audio road.',
    textDe: 'In Schaltkreisen tief und Silizium weit,\nWo Elektronen tanzen in der Zeit,\nEine Stimme erhebt sich, klar und rein,\nVerwandelt Dunkelheit in hellen Schein.\nWorte einst gefangen in stillem Code,\nReisen nun als Klang, als Stimme, als Bote.',
  },
  {
    id: 'technical',
    icon: '⚙️',
    titleEn: 'Technical Documentation',
    titleDe: 'Technische Dokumentation',
    textEn: 'The Web Speech API provides two distinct areas of functionality: Speech Recognition, which allows the browser to recognize speech input, and Speech Synthesis, which enables the browser to read text aloud. The SpeechSynthesis interface provides methods for starting, pausing, and stopping speech output, as well as events for tracking the progress of speech.',
    textDe: 'Die Web Speech API bietet zwei verschiedene Funktionsbereiche: Spracherkennung, die es dem Browser ermoeglicht, Spracheingaben zu erkennen, und Sprachsynthese, die es dem Browser ermoeglicht, Text laut vorzulesen. Die SpeechSynthesis-Schnittstelle bietet Methoden zum Starten, Pausieren und Stoppen der Sprachausgabe sowie Ereignisse zur Verfolgung des Sprachfortschritts.',
  },
];

const HISTORY_KEY = 'tts-studio-history';
const SETTINGS_KEY = 'tts-studio-settings';
const MAX_HISTORY = 20;

export default function App() {
  const { lang, t } = useI18n();
  const tApp = (key) => t(key, appTranslations);

  // State
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speed, setSpeed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.speed || 1; } catch { return 1; }
  });
  const [pitch, setPitch] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.pitch || 1; } catch { return 1; }
  });
  const [volume, setVolume] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.volume || 1; } catch { return 1; }
  });
  const [status, setStatus] = useState('ready'); // ready | speaking | paused
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [langFilter, setLangFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('editor'); // editor | templates | history
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ speed, pitch, volume, voice: selectedVoice }));
  }, [speed, pitch, volume, selectedVoice]);

  // Persist history
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        // Restore saved voice or pick default
        const savedSettings = (() => {
          try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch { return null; }
        })();
        if (savedSettings?.voice) {
          const found = v.find((voice) => voice.name === savedSettings.voice);
          if (found) {
            setSelectedVoice(found.name);
            return;
          }
        }
        // Pick first English voice as default
        const enVoice = v.find((voice) => voice.lang.startsWith('en'));
        if (enVoice) setSelectedVoice(enVoice.name);
        else setSelectedVoice(v[0].name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Show toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Group voices by language
  const groupedVoices = voices.reduce((acc, voice) => {
    const langCode = voice.lang.split('-')[0].toUpperCase();
    const langName = voice.lang;
    const groupKey = langCode;
    if (!acc[groupKey]) acc[groupKey] = { label: langName, voices: [] };
    acc[groupKey].voices.push(voice);
    return acc;
  }, {});

  // Filter voices by language
  const filteredGroupedVoices = langFilter === 'all'
    ? groupedVoices
    : Object.fromEntries(
        Object.entries(groupedVoices).filter(([key]) => key === langFilter)
      );

  // Get unique language codes for filter
  const languageCodes = [...new Set(voices.map((v) => v.lang.split('-')[0].toUpperCase()))].sort();

  // Speak
  const speak = useCallback((inputText) => {
    const textToSpeak = inputText || text;
    if (!textToSpeak.trim()) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = speed;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Words for highlighting
    wordsRef.current = textToSpeak.trim().split(/\s+/);

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Find which word index this character offset corresponds to
        const charIndex = event.charIndex;
        const fullText = textToSpeak.trim();
        const textBefore = fullText.slice(0, charIndex);
        const wordsBefore = textBefore.split(/\s+/).filter(Boolean);
        setActiveWordIndex(wordsBefore.length);
      }
    };

    utterance.onend = () => {
      setStatus('ready');
      setActiveWordIndex(-1);
    };

    utterance.onerror = () => {
      setStatus('ready');
      setActiveWordIndex(-1);
    };

    utteranceRef.current = utterance;
    setStatus('speaking');
    setActiveWordIndex(0);
    speechSynthesis.speak(utterance);

    // Add to history
    setHistory((prev) => {
      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: textToSpeak.trim().slice(0, 500),
        voiceName: selectedVoice,
        speed,
        pitch,
        timestamp: new Date().toISOString(),
      };
      return [entry, ...prev.filter((h) => h.text !== entry.text)].slice(0, MAX_HISTORY);
    });
  }, [text, voices, selectedVoice, speed, pitch, volume]);

  // Pause
  const pauseSpeech = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setStatus('paused');
    }
  };

  // Resume
  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setStatus('speaking');
    }
  };

  // Stop
  const stopSpeech = () => {
    speechSynthesis.cancel();
    setStatus('ready');
    setActiveWordIndex(-1);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => speechSynthesis.cancel();
  }, []);

  // Load template
  const loadTemplate = (template) => {
    const templateText = lang === 'de' ? template.textDe : template.textEn;
    setText(templateText);
    setActiveTab('editor');
    showToast(tApp('templateLoaded'), 'info');
  };

  // Replay from history
  const replayHistory = (entry) => {
    setText(entry.text);
    if (entry.voiceName) setSelectedVoice(entry.voiceName);
    if (entry.speed) setSpeed(entry.speed);
    if (entry.pitch) setPitch(entry.pitch);
    setActiveTab('editor');
    setTimeout(() => speak(entry.text), 100);
  };

  // Delete history entry
  const deleteHistoryEntry = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    setShowConfirm(false);
    showToast(tApp('clearHistory'), 'warning');
  };

  // Word count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Words with highlighting
  const words = text.trim().split(/\s+/);

  // Status display
  const statusConfig = {
    ready: { label: tApp('ready'), color: 'text-dkz-muted', icon: '⏸️' },
    speaking: { label: tApp('speaking'), color: 'text-neon-green text-glow animate-glow-pulse', icon: '🔊' },
    paused: { label: tApp('paused'), color: 'text-dkz-yellow', icon: '⏯️' },
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen">
      <Navbar title={tApp('appTitle')} icon="🔊" />

      <main className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* === STATUS BAR === */}
        <div className="mb-6 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-mono ${statusConfig[status].color}`}>
              {statusConfig[status].icon} {statusConfig[status].label}
            </span>
          </div>
          <div className="text-xs text-dkz-muted font-mono">
            {voices.length} {tApp('voice')}(s)
          </div>
        </div>

        {/* === MAIN LAYOUT: Desktop=2-col, Mobile=tabs === */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-6">

          {/* === LEFT COLUMN: Editor + Controls === */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mobile tab bar */}
            <div className="flex gap-2 lg:hidden mb-4">
              {['editor', 'templates', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 border
                    ${activeTab === tab
                      ? 'bg-neon-green/15 text-neon-green border-neon-green/30 shadow-neon'
                      : 'bg-matrix-card text-dkz-text-dim border-matrix-border'
                    }`}
                >
                  {tab === 'editor' ? `📝 ${tApp('editor')}` :
                   tab === 'templates' ? `📄 ${tApp('templates')}` :
                   `📜 ${tApp('history')}`}
                </button>
              ))}
            </div>

            {/* Editor (always visible on desktop, tab-controlled on mobile) */}
            <div className={`${activeTab !== 'editor' ? 'hidden lg:block' : ''}`}>

              {/* Text Editor */}
              <div className="neon-card animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-neon-green font-semibold text-glow flex items-center gap-2">
                    📝 {tApp('editor')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dkz-muted font-mono">
                      {text.length} {tApp('charCount')} · {wordCount} {tApp('wordCount')}
                    </span>
                    {text && (
                      <button
                        onClick={() => { setText(''); stopSpeech(); }}
                        className="btn-ghost text-xs"
                      >
                        ✕ {tApp('clearText')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Text area */}
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={tApp('textArea')}
                  className="input-neon !min-h-[200px] lg:!min-h-[280px] resize-y font-sans text-sm leading-relaxed mb-4"
                />

                {/* Word highlighting preview */}
                {status !== 'ready' && words.length > 0 && (
                  <div className="p-4 rounded-xl bg-matrix-dark border border-matrix-border mb-4 max-h-40 overflow-y-auto">
                    <p className="text-sm leading-relaxed">
                      {words.map((word, idx) => (
                        <span
                          key={idx}
                          className={`inline-block mr-1 mb-1 px-1 rounded transition-all duration-150
                            ${idx === activeWordIndex
                              ? 'bg-neon-green/30 text-neon-green font-semibold scale-105 shadow-neon'
                              : idx < activeWordIndex
                                ? 'text-dkz-muted'
                                : 'text-dkz-text'
                            }`}
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  </div>
                )}

                {/* Playback Controls */}
                <div className="flex items-center gap-3 flex-wrap">
                  {status === 'ready' && (
                    <button
                      onClick={() => speak()}
                      disabled={!text.trim() || voices.length === 0}
                      className="btn-neon flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ▶️ {tApp('speak')}
                    </button>
                  )}

                  {status === 'speaking' && (
                    <>
                      <button onClick={pauseSpeech} className="btn-neon flex items-center gap-2">
                        ⏸️ {tApp('pause')}
                      </button>
                      <button onClick={stopSpeech} className="btn-accent flex items-center gap-2">
                        ⏹️ {tApp('stop')}
                      </button>
                    </>
                  )}

                  {status === 'paused' && (
                    <>
                      <button onClick={resumeSpeech} className="btn-neon flex items-center gap-2">
                        ▶️ {tApp('resume')}
                      </button>
                      <button onClick={stopSpeech} className="btn-accent flex items-center gap-2">
                        ⏹️ {tApp('stop')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Voice Settings */}
              <div className="neon-card animate-fade-in animate-delay-100 mt-6">
                <h2 className="text-neon-green font-semibold text-glow mb-4 flex items-center gap-2">
                  🎛️ {tApp('voiceSettings')}
                </h2>

                {/* Voice Selector */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-dkz-text-dim">{tApp('voice')}</label>
                    {/* Language filter */}
                    <select
                      value={langFilter}
                      onChange={(e) => setLangFilter(e.target.value)}
                      className="input-neon !w-auto !py-1 !px-2 text-xs"
                    >
                      <option value="all">{tApp('allLanguages')}</option>
                      {languageCodes.map((lc) => (
                        <option key={lc} value={lc}>{lc}</option>
                      ))}
                    </select>
                  </div>
                  {voices.length === 0 ? (
                    <p className="text-sm text-dkz-muted italic">{tApp('loadingVoices')}</p>
                  ) : (
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="input-neon text-sm"
                    >
                      {Object.entries(filteredGroupedVoices).sort(([a], [b]) => a.localeCompare(b)).map(([groupKey, group]) => (
                        <optgroup key={groupKey} label={`${groupKey} — ${group.label}`}>
                          {group.voices.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.lang}){v.default ? ' ★' : ''}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  )}
                </div>

                {/* Sliders */}
                <div className="space-y-5">
                  <SliderControl
                    label={tApp('speed')}
                    value={speed}
                    onChange={setSpeed}
                    min={0.5}
                    max={3}
                    step={0.1}
                    displayValue={`${speed.toFixed(1)}x`}
                    icon="⚡"
                  />
                  <SliderControl
                    label={tApp('pitch')}
                    value={pitch}
                    onChange={setPitch}
                    min={0.5}
                    max={2}
                    step={0.1}
                    displayValue={pitch.toFixed(1)}
                    icon="🎵"
                  />
                  <SliderControl
                    label={tApp('volume')}
                    value={volume}
                    onChange={setVolume}
                    min={0}
                    max={1}
                    step={0.05}
                    displayValue={`${Math.round(volume * 100)}%`}
                    icon="🔈"
                  />
                </div>
              </div>
            </div>

            {/* Templates (mobile tab) */}
            <div className={`${activeTab !== 'templates' ? 'hidden lg:hidden' : ''}`}>
              <TemplatesPanel
                templates={demoTemplates}
                lang={lang}
                onLoadTemplate={loadTemplate}
                tApp={tApp}
              />
            </div>

            {/* History (mobile tab) */}
            <div className={`${activeTab !== 'history' ? 'hidden lg:hidden' : ''}`}>
              <HistoryPanel
                history={history}
                onReplay={replayHistory}
                onDelete={deleteHistoryEntry}
                onClearAll={() => setShowConfirm(true)}
                formatTime={formatTime}
                tApp={tApp}
                t={t}
                appTranslations={appTranslations}
              />
            </div>
          </div>

          {/* === RIGHT COLUMN: Templates + History (desktop only) === */}
          <div className="hidden lg:block space-y-6">
            <TemplatesPanel
              templates={demoTemplates}
              lang={lang}
              onLoadTemplate={loadTemplate}
              tApp={tApp}
            />
            <HistoryPanel
              history={history}
              onReplay={replayHistory}
              onDelete={deleteHistoryEntry}
              onClearAll={() => setShowConfirm(true)}
              formatTime={formatTime}
              tApp={tApp}
              t={t}
              appTranslations={appTranslations}
            />
          </div>
        </div>
      </main>

      {/* === CONFIRM DIALOG === */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm neon-card animate-slide-up text-center">
            <p className="text-dkz-text mb-6 text-sm">{tApp('clearHistoryConfirm')}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowConfirm(false)} className="btn-ghost">
                {t('cancel', appTranslations)}
              </button>
              <button onClick={clearHistory} className="btn-accent">
                {t('delete', appTranslations)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === TOAST === */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// === SLIDER CONTROL ===
function SliderControl({ label, value, onChange, min, max, step, displayValue, icon }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-dkz-text-dim flex items-center gap-1.5">
          {icon} {label}
        </label>
        <span className="text-sm font-mono text-neon-green">{displayValue}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
                     bg-matrix-dark border border-matrix-border
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-neon-green
                     [&::-webkit-slider-thumb]:shadow-neon
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-all
                     [&::-webkit-slider-thumb]:duration-200
                     [&::-webkit-slider-thumb]:hover:shadow-neon-lg
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-neon-green
                     [&::-moz-range-thumb]:border-none
                     [&::-moz-range-thumb]:shadow-neon
                     [&::-moz-range-thumb]:cursor-pointer"
        />
        {/* Track fill */}
        <div
          className="absolute top-0 left-0 h-2 rounded-full bg-neon-green/30 pointer-events-none border border-neon-green/20"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// === TEMPLATES PANEL ===
function TemplatesPanel({ templates, lang, onLoadTemplate, tApp }) {
  return (
    <div className="neon-card animate-fade-in animate-delay-200">
      <h2 className="text-neon-green font-semibold text-glow mb-4 flex items-center gap-2">
        📄 {tApp('templates')}
      </h2>
      <div className="space-y-3">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-3 rounded-xl bg-matrix-dark/50 border border-matrix-border hover:border-neon-green/20 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{tmpl.icon}</span>
                <h3 className="text-sm font-medium text-dkz-text">
                  {lang === 'de' ? tmpl.titleDe : tmpl.titleEn}
                </h3>
              </div>
              <button
                onClick={() => onLoadTemplate(tmpl)}
                className="btn-ghost text-xs opacity-60 group-hover:opacity-100 transition-opacity"
              >
                ▶️ {tApp('useTemplate')}
              </button>
            </div>
            <p className="text-xs text-dkz-muted line-clamp-2 leading-relaxed">
              {(lang === 'de' ? tmpl.textDe : tmpl.textEn).slice(0, 120)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// === HISTORY PANEL ===
function HistoryPanel({ history, onReplay, onDelete, onClearAll, formatTime, tApp, t, appTranslations }) {
  if (history.length === 0) {
    return (
      <div className="neon-card animate-fade-in animate-delay-300">
        <h2 className="text-neon-green font-semibold text-glow mb-4 flex items-center gap-2">
          📜 {tApp('history')}
        </h2>
        <EmptyState
          icon="📜"
          title={tApp('historyEmpty')}
          description={tApp('historyEmptyDesc')}
        />
      </div>
    );
  }

  return (
    <div className="neon-card animate-fade-in animate-delay-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-neon-green font-semibold text-glow flex items-center gap-2">
          📜 {tApp('history')}
        </h2>
        <button onClick={onClearAll} className="btn-ghost text-xs text-accent">
          🗑️ {tApp('clearHistory')}
        </button>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-xl bg-matrix-dark/50 border border-matrix-border hover:border-neon-green/20 transition-all duration-300 group"
          >
            <p className="text-xs text-dkz-text mb-2 line-clamp-2 leading-relaxed">
              {entry.text}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-dkz-muted font-mono">
                {formatTime(entry.timestamp)}
                {entry.speed && entry.speed !== 1 ? ` · ${entry.speed}x` : ''}
              </span>
              <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onReplay(entry)}
                  className="text-[10px] px-2 py-1 rounded hover:bg-neon-green/10 hover:text-neon-green transition-all"
                  title={tApp('replayHistory')}
                >
                  ▶️
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-[10px] px-2 py-1 rounded hover:bg-accent/10 hover:text-accent transition-all"
                  title={tApp('deleteHistory')}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
