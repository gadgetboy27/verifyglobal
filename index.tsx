import React from 'react';
import { createRoot } from 'react-dom/client';
import VerifyGlobalApp from './components/VerifyGlobalApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <VerifyGlobalApp />
    </React.StrictMode>
  );
}