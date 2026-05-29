import { useState } from 'react';
import { useI18n, useKontrast } from './shared';

// === NAVBAR ===
export function Navbar({ title, icon, children }) {
  const { lang, setLang, t } = useI18n();
  const { kontrast, setKontrast } = useKontrast();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h1 className="text-lg font-bold text-neon-green text-glow tracking-wide">
          {title}
        </h1>
        <span className="badge-neon text-[10px] uppercase tracking-widest">
          Beta
        </span>
      </div>

      <div className="flex items-center gap-3">
        {children}

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
          className="btn-ghost flex items-center gap-1.5 text-xs font-mono uppercase"
          title={t('language')}
        >
          <span className="text-base">{lang === 'en' ? '🇬🇧' : '🇩🇪'}</span>
          {lang.toUpperCase()}
        </button>

        {/* Kontrast Toggle */}
        <button
          onClick={() => setKontrast(!kontrast)}
          className={`btn-ghost text-xs font-mono ${kontrast ? 'text-neon-green text-glow' : ''}`}
          title={t('kontrastMode')}
        >
          {kontrast ? '⚡' : '🌙'}
        </button>

        {/* Settings Menu */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn-ghost text-lg"
        >
          ⚙️
        </button>
      </div>

      {showMenu && (
        <SettingsMenu onClose={() => setShowMenu(false)} />
      )}
    </nav>
  );
}

// === SETTINGS MENU ===
function SettingsMenu({ onClose }) {
  const { lang, setLang, t } = useI18n();
  const { kontrast, setKontrast } = useKontrast();
  const [showImpressum, setShowImpressum] = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-16 right-4 z-50 w-80 neon-card animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-neon-green font-semibold text-glow">{t('settings')}</h2>
          <button onClick={onClose} className="btn-ghost text-lg">✕</button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-3 border-b border-matrix-border">
          <span className="text-sm text-dkz-text-dim">{t('language')}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="input-neon !w-auto !py-1.5 !px-3 text-sm"
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {/* Kontrast */}
        <div className="flex items-center justify-between py-3 border-b border-matrix-border">
          <span className="text-sm text-dkz-text-dim">{t('kontrastMode')}</span>
          <div
            className={`toggle ${kontrast ? 'active' : ''}`}
            onClick={() => setKontrast(!kontrast)}
          >
            <span className="toggle-dot" />
          </div>
        </div>

        {/* Links */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() => setShowImpressum(true)}
            className="btn-ghost w-full text-left text-sm"
          >
            📋 {t('impressum')}
          </button>
          <a
            href="https://github.com/777/devkitz-ecosystem"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full text-left text-sm block"
          >
            🔗 GitHub
          </a>
        </div>

        <div className="mt-4 pt-3 border-t border-matrix-border text-center">
          <p className="text-xs text-dkz-muted font-mono">
            {t('madeWith')} 💚 {t('byDkz')}
          </p>
        </div>
      </div>

      {showImpressum && (
        <ImpressumModal onClose={() => setShowImpressum(false)} />
      )}
    </>
  );
}

// === IMPRESSUM MODAL ===
function ImpressumModal({ onClose }) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg neon-card animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neon-green text-glow">
            {t('impressumTitle')}
          </h2>
          <button onClick={onClose} className="btn-ghost text-lg">✕</button>
        </div>

        <div className="space-y-4 text-sm text-dkz-text-dim leading-relaxed">
          <div>
            <h3 className="text-neon-green font-semibold mb-2">{t('about')}</h3>
            <p>{t('impressumText')}</p>
          </div>

          <div>
            <h3 className="text-neon-green font-semibold mb-2">{t('privacy')}</h3>
            <p>{t('privacyText')}</p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <a
              href="https://github.com/777/devkitz-ecosystem"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-xs"
            >
              {t('impressumGithub')}
            </a>
          </div>

          <div className="pt-4 border-t border-matrix-border">
            <p className="text-xs text-dkz-muted font-mono">
              DEVKiTZ™ · {t('license')} · v1.0.0-beta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// === TOAST NOTIFICATION ===
export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'border-neon-green/30 text-neon-green',
    error: 'border-accent/30 text-accent',
    info: 'border-dkz-blue/30 text-dkz-blue',
    warning: 'border-dkz-yellow/30 text-dkz-yellow',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 neon-card !p-4 animate-slide-up
                      border ${colors[type]} min-w-[250px]`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-dkz-muted hover:text-white text-lg">✕</button>
      </div>
    </div>
  );
}

// === EMPTY STATE ===
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <span className="text-6xl mb-4 opacity-30">{icon}</span>
      <h3 className="text-lg font-semibold text-dkz-text-dim mb-2">{title}</h3>
      <p className="text-sm text-dkz-muted max-w-sm">{description}</p>
    </div>
  );
}

// === LOADING SPINNER ===
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-matrix-border border-t-neon-green
                      rounded-full animate-spin`} />
  );
}

export { ImpressumModal };
