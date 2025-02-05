import React from 'react';
import { createRoot } from 'react-dom/client';
import NetworkMonitor from '../../components/NetworkMonitor';


console.log('Popup script starting...');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <NetworkMonitor />
  </React.StrictMode>
);

console.log('Popup rendered');