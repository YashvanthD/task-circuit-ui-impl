/**
 * Fish Utilities Index
 * Re-exports all fish-related utilities.
 *
 * @module utils/fish
 */

// Import modules
import cacheUtils from './cache';
import apiUtils from './api';

// Cache utilities
export {
  getFishCache,
  saveFishCache,
  clearFishCache,
  getFishFromCache,
  updateFishInCache,
  removeFishFromCache,
} from './cache';

// API utilities
export {
  getFishList,
  fetchFishById,
  createFish,
  modifyFish,
  removeFish,
  fishEvents,
  getStockList,
  createStock,
  updateStock,
  terminateStock,
} from './api';

// Aliases for backward compatibility
export const getCachedFish = cacheUtils.getFishCache;
export const saveFishToCache = cacheUtils.saveFishCache;

// Default export with all functions
const fishUtil = {
  // Cache
  getFishCache: cacheUtils.getFishCache,
  saveFishCache: cacheUtils.saveFishCache,
  clearFishCache: cacheUtils.clearFishCache,
  getFishFromCache: cacheUtils.getFishFromCache,
  updateFishInCache: cacheUtils.updateFishInCache,
  removeFishFromCache: cacheUtils.removeFishFromCache,
  // Aliases
  getCachedFish: cacheUtils.getFishCache,
  saveFishToCache: cacheUtils.saveFishCache,
  // API
  getFishList: apiUtils.getFishList,
  fetchFishById: apiUtils.fetchFishById,
  createFish: apiUtils.createFish,
  modifyFish: apiUtils.modifyFish,
  removeFish: apiUtils.removeFish,
  fishEvents: apiUtils.fishEvents,
  // Stock API
  getStockList: apiUtils.getStockList,
  createStock: apiUtils.createStock,
  updateStock: apiUtils.updateStock,
  terminateStock: apiUtils.terminateStock,
};

// Expose for debugging
if (typeof window !== 'undefined') {
  try {
    window.fishUtil = fishUtil;
    // eslint-disable-next-line no-unused-vars
    const events = apiUtils.fishEvents;
    Object.defineProperty(window, 'fishEvents', { value: events, writable: true });
  } catch (e) { /* ignore */ }
}

export default fishUtil;

