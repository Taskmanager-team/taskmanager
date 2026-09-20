import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { USE_MOCKS } from './api/config';
import './index.css';
import App from './App.tsx';

async function enableMocking() {
  if (!USE_MOCKS) return;
  const { worker } = await import('./mocks/browser');
  // Les requetes non mockees passent au reseau au lieu de lever un warning.
  await worker.start({ onUnhandledRequest: 'bypass' });
}

/**
 * On rend l'application meme si MSW echoue a demarrer (service worker
 * indisponible, navigation privee...) : mieux vaut une erreur visible dans
 * l'interface qu'une page blanche.
 */
enableMocking()
  .catch((error: unknown) => {
    console.error('MSW n’a pas pu demarrer :', error);
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
