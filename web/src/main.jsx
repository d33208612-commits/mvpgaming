import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initTelegram } from './telegram.js';
import { LanguageProvider } from './i18n.jsx';
import './styles.css';

initTelegram();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="bg-decor" />
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
