
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Optional Sentry (enabled only when VITE_SENTRY_DSN is set)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      tracesSampleRate: 0.05,
    });
  });
}

// Optional GA4 (fail-closed)
const enableGa = import.meta.env.VITE_ENABLE_GA === 'true';
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (enableGa && gaId && /^G-[A-Z0-9]+$/.test(gaId)) {
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);

  // @ts-expect-error gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    // @ts-expect-error gtag
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', gaId);
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
