import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import App from './AppMain';

const mountNode = document.getElementById('app');

if (mountNode) {
  const root = createRoot(mountNode);
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

