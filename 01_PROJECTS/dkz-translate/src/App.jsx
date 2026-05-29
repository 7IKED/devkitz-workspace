import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from './shared';
import { Navbar, Toast, EmptyState, Spinner } from './components';

// === XSS Protection ===
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// === i18n Translations ===
const appT = {
  en: {
    appTitle: 'DkZ Translate',
    translate: 'Translate',
    swap: 'Swap',
    history: 'History',
    favorites: 'Favorites',
    copy: 'Copy',
    clear: 'Clear',
    sourceText: 'Enter text to translate...',
    targetText: 'Translation will appear here...',
    charCount: 'characters',
    autoDetect: 'Auto Detect',
    translating: 'Translating...',
    noHistory: 'No history yet',
    noHistoryDesc: 'Your recent translations will appear here',
    noFavorites: 'No favorites yet',
    noFavoritesDesc: 'Star a translation to save it',
    clearHistory: 'Clear History',
    copySuccess: 'Copied to clipboard!',
    apiError: 'Translation error. Please try again.',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    showHistory: 'Show History',
    hideHistory: 'Hide History',
    autoTranslate: 'Auto-translate',
  },
  de: {
    appTitle: 'DkZ Translate',
    translate: 'Uebersetzen',
    swap: 'Tauschen',
    history: 'Verlauf',
    favorites: 'Favoriten',
    copy: 'Kopieren',
    clear: 'Leeren',
    sourceText: 'Text zum Uebersetzen eingeben...',
    targetText: 'Uebersetzung erscheint hier...',
    charCount: 'Zeichen',
    autoDetect: 'Automatisch erkennen',
    translating: 'Uebersetze...',
    noHistory: 'Noch kein Verlauf',
    noHistoryDesc: 'Deine letzten Uebersetzungen erscheinen hier',
    noFavorites: 'Noch keine Favoriten',
    noFavoritesDesc: 'Markiere eine Uebersetzung als Favorit',
    clearHistory: 'Verlauf loeschen',
    copySuccess: 'In Zwischenablage kopiert!',
    apiError: 'Uebersetzungsfehler. Bitte erneut versuchen.',
    addFavorite: 'Zu Favoriten',
    removeFavorite: 'Aus Favoriten entfernen',
    showHistory: 'Verlauf anzeigen',
    hideHistory: 'Verlauf ausblenden',
    autoTranslate: 'Auto-Uebersetzen',
  },
};

// === 30+ Languages with Flags ===
const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', flag: '🔍', nameDE: 'Auto-Erkennung' },
  { code: 'en', name: 'English', flag: '🇬🇧', nameDE: 'Englisch' },
  { code: 'de', name: 'German', flag: '🇩🇪', nameDE: 'Deutsch' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nameDE: 'Franzoesisch' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nameDE: 'Spanisch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nameDE: 'Italienisch' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nameDE: 'Portugiesisch' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', nameDE: 'Niederlaendisch' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', nameDE: 'Polnisch' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nameDE: 'Russisch' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', nameDE: 'Ukrainisch' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nameDE: 'Japanisch' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nameDE: 'Koreanisch' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nameDE: 'Chinesisch' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nameDE: 'Arabisch' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nameDE: 'Hindi' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', nameDE: 'Tuerkisch' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', nameDE: 'Schwedisch' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', nameDE: 'Daenisch' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', nameDE: 'Norwegisch' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', nameDE: 'Finnisch' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', nameDE: 'Tschechisch' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', nameDE: 'Rumaenisch' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', nameDE: 'Ungarisch' },
  { code: 'el', name: 'Greek', flag: '🇬🇷', nameDE: 'Griechisch' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', nameDE: 'Bulgarisch' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', nameDE: 'Kroatisch' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', nameDE: 'Slowakisch' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮', nameDE: 'Slowenisch' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪', nameDE: 'Estnisch' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', nameDE: 'Lettisch' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', nameDE: 'Litauisch' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', nameDE: 'Thailaendisch' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', nameDE: 'Vietnamesisch' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', nameDE: 'Indonesisch' },
];

// === Main App ===
export default function App() {
  const { t, lang: uiLang } = useI18n();

  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('de');
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [toast, setToast] = useState(null);
  const [swapAnim, setSwapAnim] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('dkz-translate-history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('dkz-translate-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // === Persist ===
  useEffect(() => {
    localStorage.setItem('dkz-translate-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('dkz-translate-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // === Toast auto-dismiss ===
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // === Translation API ===
  const translateText = useCallback(async (text, src, tgt) => {
    if (!text.trim()) {
      setTargetText('');
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsTranslating(true);
    try {
      const srcCode = src === 'auto' ? '' : src;
      const langPair = srcCode ? `${srcCode}|${tgt}` : `${tgt}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;
        setTargetText(translated);

        // Add to history (max 50)
        const entry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          source: text.slice(0, 200),
          target: translated.slice(0, 200),
          sourceLang: src,
          targetLang: tgt,
          timestamp: Date.now(),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 50));
      } else {
        setTargetText(data.responseData?.translatedText || '');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setToast({ message: t('apiError', appT), type: 'error' });
      }
    } finally {
      setIsTranslating(false);
    }
  }, [t]);

  // === Auto-translate with debounce ===
  useEffect(() => {
    if (!autoTranslate || !sourceText.trim()) {
      if (!sourceText.trim()) setTargetText('');
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      translateText(sourceText, sourceLang, targetLang);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [sourceText, sourceLang, targetLang, autoTranslate, translateText]);

  // === Swap Languages ===
  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 600);

    const tempLang = sourceLang;
    const tempText = sourceText;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(targetText);
    setTargetText(tempText);
  };

  // === Manual Translate ===
  const handleManualTranslate = () => {
    if (sourceText.trim()) {
      translateText(sourceText, sourceLang, targetLang);
    }
  };

  // === Copy to clipboard ===
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: t('copySuccess', appT), type: 'success' });
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setToast({ message: t('copySuccess', appT), type: 'success' });
    }
  };

  // === Favorites ===
  const toggleFavorite = (entry) => {
    const exists = favorites.find((f) => f.id === entry.id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== entry.id));
    } else {
      setFavorites((prev) => [entry, ...prev]);
    }
  };

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  // === Clear History ===
  const handleClearHistory = () => {
    setHistory([]);
    setToast({ message: t('clearHistory', appT), type: 'info' });
  };

  // === Load from history/favorites ===
  const loadEntry = (entry) => {
    setSourceLang(entry.sourceLang);
    setTargetLang(entry.targetLang);
    setSourceText(entry.source);
    setTargetText(entry.target);
    setShowHistory(false);
  };

  // === Get language display ===
  const getLangDisplay = (code) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    if (!lang) return code;
    return `${lang.flag} ${uiLang === 'de' ? lang.nameDE : lang.name}`;
  };

  const getLangFlag = (code) => {
    return LANGUAGES.find((l) => l.code === code)?.flag || '🌐';
  };

  // === Format time ===
  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const activeList = activeTab === 'history' ? history : favorites;

  return (
    <div className="min-h-screen bg-matrix-black">
      <Navbar title={t('appTitle', appT)} icon="🌐">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`btn-ghost text-xs font-mono flex items-center gap-1
            ${showHistory ? 'text-neon-green' : ''}`}
        >
          📜 {showHistory ? t('hideHistory', appT) : t('showHistory', appT)}
        </button>
      </Navbar>

      <main className="pt-20 pb-8 px-4 max-w-6xl mx-auto">
        {/* === Translator Card === */}
        <div className="neon-card !p-0 overflow-hidden animate-fade-in">
          {/* Language Selector Bar */}
          <div className="flex items-center border-b border-matrix-border">
            {/* Source Language */}
            <div className="flex-1 p-3">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="input-neon !py-2 !bg-transparent !border-none !shadow-none text-sm font-medium cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {uiLang === 'de' ? lang.nameDE : lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={sourceLang === 'auto'}
              className={`mx-2 w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-300 cursor-pointer
                ${sourceLang === 'auto'
                  ? 'bg-matrix-surface text-dkz-muted cursor-not-allowed'
                  : 'bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 hover:shadow-neon active:scale-90'
                }
                ${swapAnim ? 'animate-spin' : ''}`}
              title={t('swap', appT)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            {/* Target Language */}
            <div className="flex-1 p-3">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="input-neon !py-2 !bg-transparent !border-none !shadow-none text-sm font-medium cursor-pointer"
              >
                {LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {uiLang === 'de' ? lang.nameDE : lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Textareas */}
          <div className="flex flex-col md:flex-row">
            {/* Source */}
            <div className="flex-1 relative border-b md:border-b-0 md:border-r border-matrix-border">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={t('sourceText', appT)}
                className="w-full h-48 md:h-64 p-4 bg-transparent text-dkz-text text-base leading-relaxed resize-none outline-none placeholder:text-dkz-muted/40 font-sans"
                spellCheck={false}
              />
              {/* Source Footer */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between border-t border-matrix-border/30">
                <span className="text-[10px] text-dkz-muted font-mono">
                  {sourceText.length} {t('charCount', appT)}
                </span>
                <div className="flex items-center gap-1">
                  {sourceText && (
                    <button
                      onClick={() => { setSourceText(''); setTargetText(''); }}
                      className="btn-ghost text-[10px] text-dkz-muted hover:text-accent"
                      title={t('clear', appT)}
                    >
                      ✕
                    </button>
                  )}
                  {sourceText && (
                    <button
                      onClick={() => handleCopy(sourceText)}
                      className="btn-ghost text-[10px]"
                      title={t('copy', appT)}
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Target */}
            <div className="flex-1 relative">
              {isTranslating && (
                <div className="absolute inset-0 flex items-center justify-center bg-matrix-card/50 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-3">
                    <Spinner size="sm" />
                    <span className="text-sm text-neon-green font-mono animate-glow-pulse">
                      {t('translating', appT)}
                    </span>
                  </div>
                </div>
              )}
              <textarea
                value={targetText}
                readOnly
                placeholder={t('targetText', appT)}
                className="w-full h-48 md:h-64 p-4 bg-transparent text-dkz-text text-base leading-relaxed resize-none outline-none placeholder:text-dkz-muted/40 font-sans"
              />
              {/* Target Footer */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-2 flex items-center justify-between border-t border-matrix-border/30">
                <span className="text-[10px] text-dkz-muted font-mono">
                  {targetText.length} {t('charCount', appT)}
                </span>
                <div className="flex items-center gap-1">
                  {targetText && (
                    <button
                      onClick={() => handleCopy(targetText)}
                      className="btn-ghost text-[10px] text-neon-green"
                      title={t('copy', appT)}
                    >
                      📋 {t('copy', appT)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-matrix-border px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {/* Auto-translate toggle */}
              <div className="flex items-center gap-2">
                <div
                  className={`toggle ${autoTranslate ? 'active' : ''}`}
                  onClick={() => setAutoTranslate(!autoTranslate)}
                >
                  <span className="toggle-dot" />
                </div>
                <span className="text-xs text-dkz-text-dim font-mono">
                  {t('autoTranslate', appT)}
                </span>
              </div>
            </div>

            {!autoTranslate && (
              <button
                onClick={handleManualTranslate}
                disabled={!sourceText.trim() || isTranslating}
                className="btn-neon !py-2 !px-5 text-sm flex items-center gap-2"
              >
                {isTranslating ? <Spinner size="sm" /> : '🌐'}
                {t('translate', appT)}
              </button>
            )}
          </div>
        </div>

        {/* === History/Favorites Panel === */}
        {showHistory && (
          <div className="mt-6 neon-card animate-slide-up">
            {/* Tabs */}
            <div className="flex items-center border-b border-matrix-border mb-4">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer
                  ${activeTab === 'history'
                    ? 'text-neon-green border-neon-green'
                    : 'text-dkz-muted border-transparent hover:text-dkz-text'
                  }`}
              >
                📜 {t('history', appT)} ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer
                  ${activeTab === 'favorites'
                    ? 'text-neon-green border-neon-green'
                    : 'text-dkz-muted border-transparent hover:text-dkz-text'
                  }`}
              >
                ⭐ {t('favorites', appT)} ({favorites.length})
              </button>

              <div className="flex-1" />

              {activeTab === 'history' && history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="btn-ghost text-xs text-accent"
                >
                  🗑️ {t('clearHistory', appT)}
                </button>
              )}
            </div>

            {/* List */}
            {activeList.length === 0 ? (
              <EmptyState
                icon={activeTab === 'history' ? '📜' : '⭐'}
                title={activeTab === 'history' ? t('noHistory', appT) : t('noFavorites', appT)}
                description={activeTab === 'history' ? t('noHistoryDesc', appT) : t('noFavoritesDesc', appT)}
              />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activeList.map((entry) => (
                  <div
                    key={entry.id}
                    className="group p-3 rounded-xl bg-matrix-surface/50 border border-matrix-border
                               hover:border-neon-green/15 transition-all duration-200 cursor-pointer"
                    onClick={() => loadEntry(entry)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-dkz-muted">
                            {getLangFlag(entry.sourceLang)} → {getLangFlag(entry.targetLang)}
                          </span>
                          <span className="text-[10px] text-dkz-muted font-mono">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-dkz-text truncate">{entry.source}</p>
                        <p className="text-sm text-neon-green/70 truncate mt-0.5">{entry.target}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(entry); }}
                          className={`btn-ghost text-xs ${isFavorite(entry.id) ? 'text-dkz-yellow' : 'text-dkz-muted'}`}
                          title={isFavorite(entry.id) ? t('removeFavorite', appT) : t('addFavorite', appT)}
                        >
                          {isFavorite(entry.id) ? '★' : '☆'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(entry.target); }}
                          className="btn-ghost text-xs"
                          title={t('copy', appT)}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Language Chips */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {['en', 'de', 'fr', 'es', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'pt', 'tr'].map((code) => {
            const lang = LANGUAGES.find((l) => l.code === code);
            if (!lang) return null;
            return (
              <button
                key={code}
                onClick={() => setTargetLang(code)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer
                  ${targetLang === code
                    ? 'bg-neon-green/15 text-neon-green border border-neon-green/30 shadow-neon'
                    : 'bg-matrix-surface text-dkz-muted border border-matrix-border hover:border-neon-green/20 hover:text-dkz-text'
                  }`}
              >
                {lang.flag} {uiLang === 'de' ? lang.nameDE : lang.name}
              </button>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-dkz-muted font-mono">
            {history.length} translations · {favorites.length} favorites · Powered by MyMemory API
          </p>
        </div>
      </main>

      {/* Toast */}
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
