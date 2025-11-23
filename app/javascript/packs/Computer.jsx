import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../computer/App';

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.body.appendChild(document.createElement('div')));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
