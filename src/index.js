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

  import('./api/chat').then((module) => {
    window.mockMessage = (convId, content) => {
      const msg = module.addMockMessage(convId || 'conv_001', {
        content: content || 'Test message from mock!',
        sender_key: 'user_john',
      });
      // Trigger cache refresh
      import('./utils/cache/chatCache').then((cache) => {
        cache.refreshConversations();
        cache.getMessagesForConversation(convId || 'conv_001', true);
      });
      return msg;
    };
    console.log('💬 Chat mock functions available:');
    console.log('  - window.mockMessage("conv_001", "Hello from John!")');
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
