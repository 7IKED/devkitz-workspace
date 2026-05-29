import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider, KontrastProvider } from './shared';
import './index.css';

const APP_NAME = 'dkz-keep';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider appName={APP_NAME}>
      <KontrastProvider appName={APP_NAME}>
        <App />
      </KontrastProvider>
    </I18nProvider>
  </React.StrictMode>
);
