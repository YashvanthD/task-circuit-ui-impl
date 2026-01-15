/**
 * Date Utilities
 * Helper functions for date handling.
 *
 * @module utils/helpers/date
 */

/**
 * Returns a default end date string (YYYY-MM-DD) for new tasks (tomorrow).
 * @returns {string}
 */
export function getDefaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns a human-readable time left until the given end date.
 * @param {string} endDate - Date string (YYYY-MM-DD)
 * @returns {string}
 */
export function getTimeLeft(endDate) {
  if (!endDate) return 'N/A';
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;
  if (diffMs <= 0) return 'Expired';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${mins}m`;
}

/**
 * Check if a date is today.
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past.
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export function isPast(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

/**
 * Check if a date is in the future.
 * @param {Date|string|number} date
 * @returns {boolean}
 */
export function isFuture(date) {
  if (!date) return false;
  return new Date(date) > new Date();
}

/**
 * Get start of day for a date.
 * @param {Date|string|number} date
 * @returns {Date}
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day for a date.
 * @param {Date|string|number} date
 * @returns {Date}
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to a date.
 * @param {Date|string|number} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format date as ISO date string (YYYY-MM-DD).
 * @param {Date|string|number} date
 * @returns {string}
 */
export function toISODateString(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/**
 * Format timestamp (seconds since epoch) to locale string.
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date for display.
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return d.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date and time for display.
 * @param {Date|string|number} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return d.toLocaleString();
  } catch {
    return 'Invalid date';
  }
}
