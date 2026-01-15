/**
 * Global Alert Manager
 * Event-based alert system that can be triggered from anywhere (including non-React code).
 * This allows API utilities to show alerts without needing React context.
 *
 * @module utils/alertManager
 */

// Event name for alerts
const ALERT_EVENT = 'global-alert';

/**
 * Alert types
 */
export const AlertType = {
  ERROR: 'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Show a global alert
 * @param {string} message - Alert message
 * @param {string} severity - Alert type (error, success, warning, info)
 * @param {string} title - Optional title
 */
export function showGlobalAlert(message, severity = AlertType.ERROR, title = '') {
  const event = new CustomEvent(ALERT_EVENT, {
    detail: { message, severity, title },
  });
  window.dispatchEvent(event);
}

/**
 * Show error alert
 * @param {string} message - Error message
 * @param {string} title - Optional title
 */
export function showErrorAlert(message, title = 'Error') {
  showGlobalAlert(message, AlertType.ERROR, title);
}

/**
 * Show success alert
 * @param {string} message - Success message
 * @param {string} title - Optional title
 */
export function showSuccessAlert(message, title = '') {
  showGlobalAlert(message, AlertType.SUCCESS, title);
}

/**
 * Show warning alert
 * @param {string} message - Warning message
 * @param {string} title - Optional title
 */
export function showWarningAlert(message, title = 'Warning') {
  showGlobalAlert(message, AlertType.WARNING, title);
}

/**
 * Show info alert
 * @param {string} message - Info message
 * @param {string} title - Optional title
 */
export function showInfoAlert(message, title = '') {
  showGlobalAlert(message, AlertType.INFO, title);
}

/**
 * Show API error alert - extracts message from error object
 * @param {Error|Object} error - Error object
 */
export function showApiErrorAlert(error) {
  let message = 'An unexpected error occurred';
  let title = 'Error';

  if (!error) {
    showGlobalAlert(message, AlertType.ERROR, title);
    return;
  }

  // String error
  if (typeof error === 'string') {
    showGlobalAlert(error, AlertType.ERROR, title);
    return;
  }

  // Axios-style error with response
  if (error.response) {
    const data = error.response.data;
    message = data?.message || data?.error || data?.detail ||
              (typeof data === 'string' ? data : `Request failed`);

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
  } else if (error.status) {
    // Fetch-style error
    message = error.statusText || error.message || `Error ${error.status}`;
    title = `Error ${error.status}`;
  } else if (error.message) {
    message = error.message;
  }

  showGlobalAlert(message, AlertType.ERROR, title);
}

/**
 * Subscribe to global alerts
 * @param {Function} callback - Callback function ({ message, severity, title })
 * @returns {Function} Unsubscribe function
 */
export function subscribeToAlerts(callback) {
  const handler = (event) => {
    callback(event.detail);
  };
  window.addEventListener(ALERT_EVENT, handler);
  return () => window.removeEventListener(ALERT_EVENT, handler);
}

// Export event name for reference
export { ALERT_EVENT };

