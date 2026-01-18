/**
 * Pond Utilities Index
 * Re-exports all pond-related utilities.
 *
 * @module utils/pond
 */

// Import modules
import cacheUtils from './cache';
import apiUtils from './api';

// Cache utilities
export {
  getPondCache,
  savePondCache,
  clearPondCache,
  getPondFromCache,
  updatePondInCache,
  removePondFromCache,
} from './cache';

// API utilities
export {
  getPonds,
  fetchPondById,
  createPond,
  modifyPond,
  removePond,
  addDailyUpdate,
  pondEvents,
} from './api';

// Aliases for backward compatibility
export const getCachedPonds = cacheUtils.getPondCache;
export const savePondsToCache = cacheUtils.savePondCache;

// Default export with all functions
const pondUtil = {
  // Cache
  getPondCache: cacheUtils.getPondCache,
  savePondCache: cacheUtils.savePondCache,
  clearPondCache: cacheUtils.clearPondCache,
  getPondFromCache: cacheUtils.getPondFromCache,
  updatePondInCache: cacheUtils.updatePondInCache,
  removePondFromCache: cacheUtils.removePondFromCache,
  // Aliases
  getCachedPonds: cacheUtils.getPondCache,
  savePondsToCache: cacheUtils.savePondCache,
  // API
  getPonds: apiUtils.getPonds,
  fetchPondById: apiUtils.fetchPondById,
  createPond: apiUtils.createPond,
  modifyPond: apiUtils.modifyPond,
  removePond: apiUtils.removePond,
  addDailyUpdate: apiUtils.addDailyUpdate,
  pondEvents: apiUtils.pondEvents,
};

// Expose for debugging
if (typeof window !== 'undefined') {
  try {
    window.pondUtil = pondUtil;
    // eslint-disable-next-line no-unused-vars
    const events = apiUtils.pondEvents;
    Object.defineProperty(window, 'pondEvents', { value: events, writable: true });
  } catch (e) { /* ignore */ }
}

export default pondUtil;

