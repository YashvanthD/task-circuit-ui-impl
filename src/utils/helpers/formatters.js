/**
 * Formatting Utilities
 * Provides consistent formatting for dates, numbers, percentages, and currency.
 *
 * @module utils/helpers/formatters
 */

/**
 * Format a date value for display.
 * @param {Date|string|number} val - Date value
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(val, options = {}) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleString(undefined, options);
}

/**
 * Format a date value as date only.
 * @param {Date|string|number} val
 * @returns {string}
 */
export function formatDateOnly(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString();
}

/**
 * Format a date value as time only.
 * @param {Date|string|number} val
 * @returns {string}
 */
export function formatTimeOnly(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleTimeString();
}

/**
 * Format a date as relative time.
 * @param {Date|string|number} val
 * @returns {string}
 */
export function formatRelativeTime(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);

  const now = Date.now();
  const diffMs = d.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (Math.abs(diffSec) < 60) return 'just now';
  if (Math.abs(diffMin) < 60) return diffMin > 0 ? `in ${diffMin} min` : `${Math.abs(diffMin)} min ago`;
  if (Math.abs(diffHour) < 24) return diffHour > 0 ? `in ${diffHour} hr` : `${Math.abs(diffHour)} hr ago`;
  if (Math.abs(diffDay) < 30) return diffDay > 0 ? `in ${diffDay} days` : `${Math.abs(diffDay)} days ago`;

  return formatDateOnly(val);
}

/**
 * Format a number with locale formatting.
 * @param {number|string} val
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a number as a percentage.
 * @param {number|string} val
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(val, decimals = 1) {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return `${(n * 100).toFixed(decimals)}%`;
}

/**
 * Format a number as currency.
 * @param {number|string} val
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(val, currency = 'INR') {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString(undefined, { style: 'currency', currency });
}

/**
 * Format bytes to human-readable size.
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Truncate a string with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  const s = String(str);
  if (s.length <= maxLength) return s;
  return s.substring(0, maxLength - 3) + '...';
}

/**
 * Format a phone number.
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

