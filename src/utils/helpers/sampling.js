/**
 * Sampling Helper Functions
 * Business logic and utilities for sampling operations.
 *
 * @module utils/helpers/sampling
 */

import { SAMPLING_STATUS, SAMPLING_STATUS_CONFIG } from '../../constants';

// ============================================================================
// Sampling ID Resolution
// ============================================================================

/**
 * Resolve sampling ID from various possible field names.
 * @param {Object} sampling - Sampling object
 * @returns {string|undefined}
 */
export function resolveSamplingId(sampling) {
  if (!sampling) return undefined;
  const rawId = sampling.samplingId || sampling.sampling_id || sampling.id || sampling._id;
  return rawId != null ? String(rawId) : undefined;
}

// ============================================================================
// Sampling Status Helpers
// ============================================================================

/**
 * Get status configuration (colors, labels, icons).
 * @param {string} status - Sampling status
 * @returns {Object}
 */
export function getSamplingStatusConfig(status) {
  return SAMPLING_STATUS_CONFIG[status] || SAMPLING_STATUS_CONFIG[SAMPLING_STATUS.SCHEDULED];
}

/**
 * Get status style for UI components.
 * @param {string} status - Sampling status
 * @returns {Object} Style object
 */
export function getSamplingStatusStyle(status) {
  const config = getSamplingStatusConfig(status);
  return {
    backgroundColor: config.bg,
    color: config.color,
  };
}

/**
 * Check if sampling is upcoming (scheduled and in future).
 * @param {Object} sampling - Sampling object
 * @returns {boolean}
 */
export function isSamplingUpcoming(sampling) {
  if (sampling?.status !== SAMPLING_STATUS.SCHEDULED) return false;
  if (!sampling.scheduled_date) return false;
  try {
    return new Date(sampling.scheduled_date) > new Date();
  } catch {
    return false;
  }
}

/**
 * Check if sampling is overdue (scheduled but past due).
 * @param {Object} sampling - Sampling object
 * @returns {boolean}
 */
export function isSamplingOverdue(sampling) {
  if (sampling?.status !== SAMPLING_STATUS.SCHEDULED) return false;
  if (!sampling.scheduled_date) return false;
  try {
    return new Date(sampling.scheduled_date) < new Date();
  } catch {
    return false;
  }
}

// ============================================================================
// Sampling Statistics
// ============================================================================

/**
 * Compute sampling statistics from a list of samplings.
 * @param {Array} samplings - List of samplings
 * @returns {Object} Statistics object
 */
export function computeSamplingStats(samplings) {
  const now = new Date();
  return samplings.reduce(
    (acc, s) => {
      if (s.status === SAMPLING_STATUS.SCHEDULED) {
        acc.scheduled++;
        if (s.scheduled_date) {
          try {
            if (new Date(s.scheduled_date) < now) acc.overdue++;
          } catch {}
        }
      } else if (s.status === SAMPLING_STATUS.IN_PROGRESS) {
        acc.inProgress++;
      } else if (s.status === SAMPLING_STATUS.COMPLETED) {
        acc.completed++;
      } else if (s.status === SAMPLING_STATUS.CANCELLED) {
        acc.cancelled++;
      }
      acc.total++;
      return acc;
    },
    { total: 0, scheduled: 0, inProgress: 0, completed: 0, cancelled: 0, overdue: 0 }
  );
}

/**
 * Count upcoming samplings (within next N days).
 * @param {Array} samplings - List of samplings
 * @param {number} days - Number of days ahead
 * @returns {number}
 */
export function countUpcomingSamplings(samplings, days = 7) {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return samplings.filter((s) => {
    if (s.status !== SAMPLING_STATUS.SCHEDULED) return false;
    if (!s.scheduled_date) return false;
    try {
      const date = new Date(s.scheduled_date);
      return date >= now && date <= future;
    } catch {
      return false;
    }
  }).length;
}

// ============================================================================
// Sampling Filtering
// ============================================================================

/**
 * Filter samplings by status, pond, and search term.
 * @param {Array} samplings - List of samplings
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered samplings
 */
export function filterSamplings(samplings, filters = {}) {
  const { status, pondId, searchTerm, dateRange } = filters;

  return samplings.filter((s) => {
    // Status filter
    if (status && status !== 'all' && s.status !== status) return false;

    // Pond filter
    if (pondId && s.pond_id !== pondId) return false;

    // Date range filter
    if (dateRange?.start || dateRange?.end) {
      const date = s.scheduled_date ? new Date(s.scheduled_date) : null;
      if (!date) return false;
      if (dateRange.start && date < new Date(dateRange.start)) return false;
      if (dateRange.end && date > new Date(dateRange.end)) return false;
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchType = (s.sample_type || '').toLowerCase().includes(term);
      const matchNotes = (s.notes || '').toLowerCase().includes(term);
      if (!matchType && !matchNotes) return false;
    }

    return true;
  });
}

/**
 * Sort samplings by date.
 * @param {Array} samplings - List of samplings
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted samplings
 */
export function sortSamplingsByDate(samplings, order = 'asc') {
  const sorted = [...samplings].sort((a, b) => {
    const dateA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
    const dateB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
    return dateA - dateB;
  });

  return order === 'desc' ? sorted.reverse() : sorted;
}

// ============================================================================
// Sampling Validation
// ============================================================================

/**
 * Validate sampling form data.
 * @param {Object} form - Sampling form data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateSamplingForm(form) {
  const errors = {};

  if (!form.pond_id) {
    errors.pond_id = 'Pond is required';
  }

  if (!form.scheduled_date) {
    errors.scheduled_date = 'Scheduled date is required';
  }

  if (!form.sample_type?.trim()) {
    errors.sample_type = 'Sample type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Sampling Formatting
// ============================================================================

/**
 * Get sampling summary text.
 * @param {Object} sampling - Sampling object
 * @returns {string}
 */
export function getSamplingSummary(sampling) {
  if (!sampling) return '';
  const type = sampling.sample_type || 'Sample';
  const date = sampling.scheduled_date
    ? new Date(sampling.scheduled_date).toLocaleDateString()
    : 'TBD';
  return `${type} - ${date}`;
}

/**
 * Get time until sampling.
 * @param {Object} sampling - Sampling object
 * @returns {string}
 */
export function getTimeUntilSampling(sampling) {
  if (!sampling?.scheduled_date) return 'No date set';

  try {
    const date = new Date(sampling.scheduled_date);
    const now = new Date();
    const diff = date - now;

    if (diff < 0) {
      const daysPast = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return `${daysPast}d overdue`;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `In ${days} days`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `In ${hours} hours`;

    return 'Today';
  } catch {
    return 'Invalid date';
  }
}

