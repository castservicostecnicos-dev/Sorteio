import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Unregister any stale dev service worker that could intercept dev preview requests
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.DEV) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        if (registration.active?.scriptURL.includes('dev-sw')) {
          registration.unregister();
        }
      }
    })
    .catch(() => {
      // Ignore in sandboxed iframes
    });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
