import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './common/styles/main.css';
import App from './App.tsx';

// Update client if SW changes (skip on initial activation)
if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
