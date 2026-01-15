/**
 * AlertPopup Component
 * Global alert popup for displaying API errors and notifications.
 * Shows at the top of the screen with auto-dismiss and close button.
 *
 * @module components/common/AlertPopup
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Slide transition from top
 */
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

/**
 * AlertPopup - Global alert popup component
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether alert is visible
 * @param {Function} props.onClose - Close handler
 * @param {string} props.message - Alert message
 * @param {string} props.title - Alert title (optional)
 * @param {string} props.severity - Alert severity ('error' | 'warning' | 'info' | 'success')
 * @param {number} props.duration - Auto-hide duration in ms (default: 5000)
 * @param {boolean} props.autoHide - Whether to auto-hide (default: true)
 * @param {string} props.position - Vertical position ('top' | 'bottom')
 */
export default function AlertPopup({
  open,
  onClose,
  message,
  title,
  severity = 'error',
  duration = 5000,
  autoHide = true,
  position = 'top',
}) {
  const handleClose = useCallback(
    (event, reason) => {
      if (reason === 'clickaway') return;
      onClose?.();
    },
    [onClose]
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHide ? duration : null}
      onClose={handleClose}
      anchorOrigin={{ vertical: position, horizontal: 'center' }}
      TransitionComponent={SlideTransition}
      sx={{
        top: position === 'top' ? { xs: 16, sm: 24 } : undefined,
        bottom: position === 'bottom' ? { xs: 16, sm: 24 } : undefined,
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={handleClose}
        sx={{
          width: '100%',
          minWidth: { xs: 280, sm: 400 },
          maxWidth: 600,
          boxShadow: 6,
          '& .MuiAlert-message': {
            flex: 1,
          },
        }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}

// ============================================================================
// useAlert Hook - For managing alert state
// ============================================================================

/**
 * useAlert - Custom hook for managing alert state
 *
 * @returns {Object} { alert, showAlert, hideAlert, showError, showSuccess, showWarning, showInfo }
 */
export function useAlert() {
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

  return {
    alert,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

// ============================================================================
// API Error Handler Helper
// ============================================================================

/**
 * Extract error message from API error response
 * @param {Error|Object} error - Error object
 * @returns {string} Error message
 */
export function getApiErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  // String error
  if (typeof error === 'string') return error;

  // Axios-style error
  if (error.response) {
    const data = error.response.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
    if (typeof data === 'string') return data;
    return `Error ${error.response.status}: ${error.response.statusText || 'Request failed'}`;
  }

  // Fetch-style error
  if (error.message) return error.message;

  // Object with error property
  if (error.error) return error.error;

  return 'An unexpected error occurred';
}

/**
 * Get error title based on status code
 * @param {Error|Object} error - Error object
 * @returns {string} Error title
 */
export function getApiErrorTitle(error) {
  if (!error?.response?.status) return 'Error';

  const status = error.response.status;
  switch (status) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Validation Error';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return `Error ${status}`;
  }
}

