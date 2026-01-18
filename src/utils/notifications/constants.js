/**
 * Notifications - Constants
 *
 * @module utils/notifications/constants
 */

// Storage keys
export const STORAGE_KEYS = {
  NOTIFICATIONS: 'tc_cache_notifications',
  ALERTS: 'tc_cache_alerts',
};

// Cache TTL
export const CACHE_TTL = {
  NOTIFICATIONS: 2 * 60 * 1000, // 2 minutes
  ALERTS: 2 * 60 * 1000, // 2 minutes
};

// Notification types
export const NOTIFICATION_TYPE = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Notification priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
};

// Alert severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Alert types
export const ALERT_TYPE = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

export default {
  STORAGE_KEYS,
  CACHE_TTL,
  NOTIFICATION_TYPE,
  NOTIFICATION_PRIORITY,
  ALERT_SEVERITY,
  ALERT_TYPE,
};

