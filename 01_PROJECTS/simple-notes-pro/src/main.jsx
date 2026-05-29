import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider, KontrastProvider } from './shared';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider appName="simple-notes-pro">
      <KontrastProvider appName="simple-notes-pro">
        <App />
      </KontrastProvider>
    </I18nProvider>
  </React.StrictMode>
);
