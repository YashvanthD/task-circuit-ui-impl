/**
 * Data Formatters Utility
 * Helper functions for formatting data for display
 *
 * @module utils/formatters
 */

/**
 * Format weight value with appropriate unit
 * @param {number} grams - Weight in grams
 * @param {boolean} showUnit - Whether to show unit (default: true)
 * @returns {string} Formatted weight
 */
export function formatWeight(grams, showUnit = true) {
  if (grams === null || grams === undefined || isNaN(grams)) return '-';

  const num = Number(grams);

  // Use kg for weights >= 1000g
  if (num >= 1000) {
    const kg = (num / 1000).toFixed(2);
    return showUnit ? `${kg} kg` : kg;
  }

  // Use g for weights < 1000g
  const g = num.toFixed(0);
  return showUnit ? `${g} g` : g;
}

/**
 * Format count/number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export function formatCount(number) {
  if (number === null || number === undefined || isNaN(number)) return '-';
  return Number(number).toLocaleString();
}

/**
 * Format growth value with sign and color indicator
 * @param {number} growth - Growth value in grams
 * @param {boolean} showSign - Whether to show + sign for positive (default: true)
 * @returns {string} Formatted growth
 */
export function formatGrowth(growth, showSign = true) {
  if (growth === null || growth === undefined || isNaN(growth)) return '-';

  const num = Number(growth);
  const sign = num > 0 ? '+' : '';
  const value = num.toFixed(1);

  return showSign ? `${sign}${value}g` : `${value}g`;
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type: 'short', 'long', 'relative' (default: 'short')
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  if (format === 'relative') {
    const now = new Date();
    const diffTime = now - dateObj;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Default: short format
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount, currency = '₹') {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';

  const num = Number(amount);
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency}${formatted}`;
}

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  const num = Number(value);
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format status badge text
 * @param {string} status - Status value
 * @returns {string} Formatted status
 */
export function formatStatus(status) {
  if (!status) return 'Unknown';

  const statusMap = {
    'active': 'Active',
    'terminated': 'Terminated',
    'harvested': 'Harvested',
    'empty': 'Empty',
    'stocked': 'Stocked',
    'preparing': 'Preparing',
    'maintenance': 'Maintenance',
  };

  return statusMap[status.toLowerCase()] || status;
}

/**
 * Format days count to readable duration
 * @param {number} days - Number of days
 * @returns {string} Formatted duration
 */
export function formatDuration(days) {
  if (days === null || days === undefined || isNaN(days)) return '-';

  const num = Number(days);

  if (num === 0) return 'Today';
  if (num === 1) return '1 day';
  if (num < 7) return `${num} days`;
  if (num < 30) {
    const weeks = Math.floor(num / 7);
    const remainingDays = num % 7;
    if (remainingDays === 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
    return `${weeks}w ${remainingDays}d`;
  }
  if (num < 365) {
    const months = Math.floor(num / 30);
    const remainingDays = num % 30;
    if (remainingDays === 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${months}m ${remainingDays}d`;
  }

  const years = Math.floor(num / 365);
  const months = Math.floor((num % 365) / 30);
  if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years}y ${months}m`;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export default {
  formatWeight,
  formatCount,
  formatGrowth,
  formatDate,
  formatCurrency,
  formatPercentage,
  formatStatus,
  formatDuration,
  truncateText,
};
