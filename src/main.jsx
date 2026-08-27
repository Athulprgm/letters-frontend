import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './App.css';

// Invalidate legacy browser caches and trigger Service Worker update
if (typeof window !== 'undefined') {
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (!key.includes('v3.2')) {
          caches.delete(key).catch(() => {});
        }
      });
    }).catch(() => {});
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => {
        reg.update().catch(() => {});
      });
    }).catch(() => {});
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

