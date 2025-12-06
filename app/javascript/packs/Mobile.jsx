import React from 'react';
import { createRoot } from 'react-dom/client';
import Rails from '@rails/ujs';
import App from '../mobile/App';

Rails.start();

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.body.appendChild(document.createElement('div')));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
