import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CRITICAL_SHARED_ASSETS, preloadAssets, initDebugAssetScanner } from './lib/preload';

// Preload critical shared assets once at app start
preloadAssets(CRITICAL_SHARED_ASSETS as string[], false);

// In ?debug=1 mode, warn whenever an unregistered <img> is rendered
initDebugAssetScanner(() => window.location.pathname);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
