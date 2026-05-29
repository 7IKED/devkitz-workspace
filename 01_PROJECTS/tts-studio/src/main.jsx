import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider, KontrastProvider } from './shared';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider appName="tts-studio">
      <KontrastProvider appName="tts-studio">
        <App />
      </KontrastProvider>
    </I18nProvider>
  </StrictMode>
);
