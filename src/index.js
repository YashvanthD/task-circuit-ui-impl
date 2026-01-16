import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline } from '@mui/material';

// Expose mock functions for testing in browser console (development only)
if (process.env.NODE_ENV === 'development') {
  import('./api/notifications').then((module) => {
    window.mockNotification = module.addMockNotification;
    window.mockAlert = module.addMockAlert;
    console.log('🔔 Mock functions available:');
    console.log('  - window.mockNotification({ title: "Test", message: "Hello!" })');
    console.log('  - window.mockAlert({ title: "Alert", message: "Warning!" })');
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
