import { useState, useEffect, createContext, useContext } from 'react';

// === i18n SYSTEM ===
const translations = {
  en: {
    settings: 'Settings',
    language: 'Language',
    contrast: 'Contrast Mode',
    impressum: 'Imprint',
    about: 'About',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    cancel: 'Cancel',
    search: 'Search...',
    noResults: 'No results found',
    copied: 'Copied!',
    export: 'Export',
    import: 'Import',
    darkMode: 'Dark Mode',
    kontrastMode: 'High Contrast (Neon)',
    version: 'Version',
    license: 'MIT License',
    madeWith: 'Made with',
    byDkz: 'by DEVKiTZ™',
    impressumTitle: 'Imprint',
    impressumText: 'This is an open-source project by DEVKiTZ™. No personal data is collected or stored on external servers. All data is stored locally in your browser (localStorage/IndexedDB).',
    impressumContact: 'Contact',
    impressumGithub: 'GitHub Repository',
    privacy: 'Privacy',
    privacyText: 'This application runs entirely in your browser. No data is sent to external servers. All your data stays on your device.',
  },
  de: {
    settings: 'Einstellungen',
    language: 'Sprache',
    contrast: 'Kontrast-Modus',
    impressum: 'Impressum',
    about: 'Ueber',
    close: 'Schliessen',
    save: 'Speichern',
    delete: 'Loeschen',
    cancel: 'Abbrechen',
    search: 'Suchen...',
    noResults: 'Keine Ergebnisse gefunden',
    copied: 'Kopiert!',
    export: 'Exportieren',
    import: 'Importieren',
    darkMode: 'Dunkelmodus',
    kontrastMode: 'Hoher Kontrast (Neon)',
    version: 'Version',
    license: 'MIT Lizenz',
    madeWith: 'Erstellt mit',
    byDkz: 'von DEVKiTZ™',
    impressumTitle: 'Impressum',
    impressumText: 'Dies ist ein Open-Source-Projekt von DEVKiTZ™. Es werden keine personenbezogenen Daten erhoben oder auf externen Servern gespeichert. Alle Daten verbleiben lokal in Ihrem Browser (localStorage/IndexedDB).',
    impressumContact: 'Kontakt',
    impressumGithub: 'GitHub Repository',
    privacy: 'Datenschutz',
    privacyText: 'Diese Anwendung laeuft vollstaendig in Ihrem Browser. Es werden keine Daten an externe Server gesendet. Alle Ihre Daten bleiben auf Ihrem Geraet.',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children, appName }) {
  const [lang, setLang] = useState(() =>
    localStorage.getItem(`${appName}-lang`) || 'en'
  );

  useEffect(() => {
    localStorage.setItem(`${appName}-lang`, lang);
    document.documentElement.lang = lang;
  }, [lang, appName]);

  const t = (key, appTranslations = {}) => {
    const appT = appTranslations[lang] || {};
    return appT[key] || translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// === KONTRAST MODE ===
const KontrastContext = createContext();

export function KontrastProvider({ children, appName }) {
  const [kontrast, setKontrast] = useState(() =>
    localStorage.getItem(`${appName}-kontrast`) === 'true'
  );

  useEffect(() => {
    localStorage.setItem(`${appName}-kontrast`, kontrast);
    document.body.classList.toggle('kontrast', kontrast);
  }, [kontrast, appName]);

  return (
    <KontrastContext.Provider value={{ kontrast, setKontrast }}>
      {children}
    </KontrastContext.Provider>
  );
}

export function useKontrast() {
  return useContext(KontrastContext);
}

export { translations };
