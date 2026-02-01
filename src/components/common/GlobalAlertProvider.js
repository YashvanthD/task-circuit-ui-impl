/**
 * GlobalAlertProvider Component
 * Subscribes to global alert events and displays AlertPopup
 * Automatically handles API errors and shows proper error messages
 *
 * @module components/common/GlobalAlertProvider
 */

import React, { useState, useEffect } from 'react';
import { subscribeToAlerts } from '../../utils/alertManager';
import AlertPopup from './AlertPopup';

/**
 * GlobalAlertProvider - Connects alertManager to AlertPopup
 * Place this at the root of your app to enable global alerts
 */
export default function GlobalAlertProvider() {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    title: '',
    severity: 'info',
  });

  useEffect(() => {
    // Subscribe to global alert events
    const unsubscribe = subscribeToAlerts(({ message, severity, title }) => {
      setAlert({
        open: true,
        message: message || 'An error occurred',
        title: title || '',
        severity: severity || 'error',
      });
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const handleClose = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <AlertPopup
      open={alert.open}
      onClose={handleClose}
      message={alert.message}
      title={alert.title}
      severity={alert.severity}
      duration={6000}
      autoHide={true}
      position="top"
    />
  );
}
