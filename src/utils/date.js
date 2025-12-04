// Utility functions for date handling in tasks

/**
 * Returns a default end date string (YYYY-MM-DD) for new tasks (tomorrow).
 */
export function getDefaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns a human-readable time left until the given end date (YYYY-MM-DD).
 * @param {string} endDate
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

