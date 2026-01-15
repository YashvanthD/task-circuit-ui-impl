/**
 * Pond Helper Functions
 * Business logic and utilities for pond operations.
 *
 * @module utils/helpers/pond
 */

import { POND_STATUS, POND_STATUS_CONFIG } from '../../constants';

// ============================================================================
// Pond ID Resolution
// ============================================================================

/**
 * Resolve pond ID from various possible field names.
 * @param {Object} pond - Pond object
 * @returns {string|undefined}
 */
export function resolvePondId(pond) {
  if (!pond) return undefined;
  const rawId = pond.pondId || pond.pond_id || pond.id || pond._id;
  return rawId != null ? String(rawId) : undefined;
}

// ============================================================================
// Pond Status Helpers
// ============================================================================

/**
 * Get status configuration (colors, labels, icons).
 * @param {string} status - Pond status
 * @returns {Object}
 */
export function getPondStatusConfig(status) {
  return POND_STATUS_CONFIG[status] || POND_STATUS_CONFIG[POND_STATUS.ACTIVE];
}

/**
 * Get status style for UI components.
 * @param {string} status - Pond status
 * @returns {Object} Style object
 */
export function getPondStatusStyle(status) {
  const config = getPondStatusConfig(status);
  return {
    backgroundColor: config.bg,
    borderLeft: `4px solid ${config.borderColor}`,
    color: config.color,
  };
}

/**
 * Check if pond is active.
 * @param {Object} pond - Pond object
 * @returns {boolean}
 */
export function isPondActive(pond) {
  return pond?.status === POND_STATUS.ACTIVE;
}

/**
 * Check if pond needs attention (maintenance or harvesting).
 * @param {Object} pond - Pond object
 * @returns {boolean}
 */
export function pondNeedsAttention(pond) {
  return pond?.status === POND_STATUS.MAINTENANCE || pond?.status === POND_STATUS.HARVESTING;
}

// ============================================================================
// Pond Statistics
// ============================================================================

/**
 * Compute pond statistics from a list of ponds.
 * @param {Array} ponds - List of ponds
 * @returns {Object} Statistics object
 */
export function computePondStats(ponds) {
  return ponds.reduce(
    (acc, p) => {
      if (p.status === POND_STATUS.ACTIVE) acc.active++;
      else if (p.status === POND_STATUS.INACTIVE) acc.inactive++;
      else if (p.status === POND_STATUS.MAINTENANCE) acc.maintenance++;
      else if (p.status === POND_STATUS.HARVESTING) acc.harvesting++;
      acc.total++;
      acc.totalFish += Number(p.fish_count) || 0;
      acc.totalSize += Number(p.size) || 0;
      return acc;
    },
    { total: 0, active: 0, inactive: 0, maintenance: 0, harvesting: 0, totalFish: 0, totalSize: 0 }
  );
}

/**
 * Count active ponds.
 * @param {Array} ponds - List of ponds
 * @returns {number}
 */
export function countActivePonds(ponds) {
  return ponds.filter((p) => p.status === POND_STATUS.ACTIVE).length;
}

/**
 * Count ponds needing attention.
 * @param {Array} ponds - List of ponds
 * @returns {number}
 */
export function countPondsNeedingAttention(ponds) {
  return ponds.filter(
    (p) => p.status === POND_STATUS.MAINTENANCE || p.status === POND_STATUS.HARVESTING
  ).length;
}

/**
 * Calculate total fish count across all ponds.
 * @param {Array} ponds - List of ponds
 * @returns {number}
 */
export function calculateTotalFish(ponds) {
  return ponds.reduce((sum, p) => sum + (Number(p.fish_count) || 0), 0);
}

// ============================================================================
// Pond Filtering
// ============================================================================

/**
 * Filter ponds by status and search term.
 * @param {Array} ponds - List of ponds
 * @param {string} filterStatus - Status filter ('all' or specific status)
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered ponds
 */
export function filterPonds(ponds, filterStatus, searchTerm) {
  return ponds.filter((p) => {
    // Status filter
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(term);
      const matchLocation = (p.location || '').toLowerCase().includes(term);
      const matchFishType = (p.fish_type || '').toLowerCase().includes(term);
      if (!matchName && !matchLocation && !matchFishType) return false;
    }

    return true;
  });
}

/**
 * Sort ponds by various criteria.
 * @param {Array} ponds - List of ponds
 * @param {string} sortBy - Sort field ('name', 'size', 'fish_count', 'status')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted ponds
 */
export function sortPonds(ponds, sortBy = 'name', order = 'asc') {
  const sorted = [...ponds].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    // Handle numeric fields
    if (sortBy === 'size' || sortBy === 'fish_count') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  return order === 'desc' ? sorted.reverse() : sorted;
}

// ============================================================================
// Pond Validation
// ============================================================================

/**
 * Validate pond form data.
 * @param {Object} form - Pond form data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validatePondForm(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'Pond name is required';
  }

  if (form.size && isNaN(Number(form.size))) {
    errors.size = 'Size must be a number';
  }

  if (form.fish_count && isNaN(Number(form.fish_count))) {
    errors.fish_count = 'Fish count must be a number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Pond Formatting
// ============================================================================

/**
 * Format pond size with unit.
 * @param {number|string} size - Pond size
 * @param {string} unit - Unit (default: 'sq.m')
 * @returns {string}
 */
export function formatPondSize(size, unit = 'sq.m') {
  if (!size) return 'N/A';
  return `${Number(size).toLocaleString()} ${unit}`;
}

/**
 * Format fish count.
 * @param {number|string} count - Fish count
 * @returns {string}
 */
export function formatFishCount(count) {
  if (!count) return '0';
  return Number(count).toLocaleString();
}

