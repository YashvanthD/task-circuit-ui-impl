/**
 * Alert Context
 * Global context for showing alerts from any component.
 * Also listens to global events from alertManager for non-React code.
 *
 * @module contexts/AlertContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AlertPopup from '../components/common/AlertPopup';
import { subscribeToAlerts } from '../utils/alertManager';

// Create context
const AlertContext = createContext(null);

/**
 * AlertProvider - Wrap your app with this to enable global alerts
 */
export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    title: '',
    severity: 'info',
  });

  const showAlert = useCallback((message, severity = 'info', title = '') => {
    setAlert({
      open: true,
      message,
      title,
      severity,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, open: false }));
  }, []);

  const showError = useCallback(
    (message, title = 'Error') => {
      showAlert(message, 'error', title);
    },
    [showAlert]
  );

  const showSuccess = useCallback(
    (message, title = '') => {
      showAlert(message, 'success', title);
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message, title = 'Warning') => {
      showAlert(message, 'warning', title);
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message, title = '') => {
      showAlert(message, 'info', title);
    },
    [showAlert]
  );

  /**
   * Show error from API response
   */
  const showApiError = useCallback(
    (error) => {
      let message = 'An unexpected error occurred';
      let title = 'Error';

      if (typeof error === 'string') {
        message = error;
      } else if (error?.response) {
        // Axios-style error
        const data = error.response.data;
        message = data?.message || data?.error || data?.detail || `Error ${error.response.status}`;

        const status = error.response.status;
        switch (status) {
          case 400: title = 'Bad Request'; break;
          case 401: title = 'Unauthorized'; break;
          case 403: title = 'Access Denied'; break;
          case 404: title = 'Not Found'; break;
          case 409: title = 'Conflict'; break;
          case 422: title = 'Validation Error'; break;
          case 429: title = 'Too Many Requests'; break;
          case 500: title = 'Server Error'; break;
          case 502: title = 'Bad Gateway'; break;
          case 503: title = 'Service Unavailable'; break;
          default: title = `Error ${status}`;
        }
      } else if (error?.message) {
        message = error.message;
      }

      showAlert(message, 'error', title);
    },
    [showAlert]
  );

  // Listen to global alert events from non-React code (like API utilities)
  useEffect(() => {
    const unsubscribe = subscribeToAlerts(({ message, severity, title }) => {
      showAlert(message, severity, title);
    });
    return unsubscribe;
  }, [showAlert]);

  const value = {
    alert,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showApiError,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertPopup
        open={alert.open}
        onClose={hideAlert}
        message={alert.message}
        title={alert.title}
        severity={alert.severity}
        duration={5000}
        position="top"
      />
    </AlertContext.Provider>
  );
}

/**
 * useGlobalAlert - Hook to access global alert functions
 * @returns {Object} { showError, showSuccess, showWarning, showInfo, showApiError, hideAlert }
 */
export function useGlobalAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useGlobalAlert must be used within an AlertProvider');
  }
  return context;
}

export default AlertContext;

