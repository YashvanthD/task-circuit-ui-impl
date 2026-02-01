/**
 * Fish API Operations
 * Handles fish CRUD operations with API.
 *
 * @module utils/fish/api
 */

import { fishApi } from '../../api';
import { parseFishList, parseFish } from '../parseFish';
import { saveFishCache, clearFishCache as clearCache, updateFishInCache, removeFishFromCache } from './cache';

/**
 * Simple event emitter for fish events.
 */
const eventListeners = {
  refreshed: [],
  added: [],
  updated: [],
  deleted: [],
};

function emit(event, payload) {
  (eventListeners[event] || []).forEach(cb => {
    try {
      cb(payload);
    } catch (e) {
      console.error(`[FishEvents] Error in ${event} listener:`, e);
    }
  });
}

/**
 * Fish events emitter.
 */
export const fishEvents = {
  on: (event, callback) => {
    if (!eventListeners[event]) {
      eventListeners[event] = [];
    }
    eventListeners[event].push(callback);
    // Return unsubscribe function
    return () => {
      eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
    };
  },
  emit,
};

/**
 * Parse API response.
 */
async function parseResponse(res) {
  if (!res) return null;
  if (res.json && typeof res.json === 'function') {
    try {
      return await res.json();
    } catch (e) {
      return res;
    }
  }
  return res;
}

/**
 * Extract fish list from API response.
 * Updated to handle new species API response structure
 */
function extractFishList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  // New API returns data.species
  if (Array.isArray(data.species)) return data.species;
  if (data.data && Array.isArray(data.data.species)) return data.data.species;
  // Fallback to old structure for compatibility
  if (Array.isArray(data.fish)) return data.fish;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.fish)) return data.data.fish;
  return [];
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Get all fish from API.
 * @param {object} opts - Options (forceApi, params)
 * @returns {Promise<{source: string, data: Array}>}
 */
export async function getFishList(opts = {}) {
  try {
    const res = await fishApi.listFish(opts.params);
    const data = await parseResponse(res);
    const fishList = parseFishList(extractFishList(data));

    // Update cache
    saveFishCache(fishList);
    emit('refreshed', fishList);

    return { source: 'api', data: fishList };
  } catch (e) {
    console.error('[Fish] getFishList error:', e);
    throw e;
  }
}

/**
 * Get single fish by ID.
 * @param {string} fishId - Fish ID
 * @returns {Promise<{source: string, data: object}>}
 */
export async function fetchFishById(fishId) {
  try {
    const res = await fishApi.getFish(fishId);
    const data = await parseResponse(res);
    const fishData = data?.data?.fish || data?.fish || data?.data || data;
    const fish = parseFish(fishData);

    // Update cache
    updateFishInCache(fish);

    return { source: 'api', data: fish };
  } catch (e) {
    console.error('[Fish] fetchFishById error:', e);
    throw e;
  }
}

/**
 * Create new fish.
 * @param {object} fishData - Fish data
 * @returns {Promise<object>}
 */
export async function createFish(fishData) {
  try {
    const res = await fishApi.addFish(fishData);
    const data = await parseResponse(res);
    const createdFish = parseFish(data?.data?.fish || data?.fish || data?.data || data);

    // Update cache
    updateFishInCache(createdFish);
    emit('added', createdFish);

    return createdFish;
  } catch (e) {
    console.error('[Fish] createFish error:', e);
    throw e;
  }
}

/**
 * Update existing fish.
 * @param {string} fishId - Fish ID
 * @param {object} fishData - Updated fish data
 * @returns {Promise<object>}
 */
export async function modifyFish(fishId, fishData) {
  try {
    const res = await fishApi.updateFish(fishId, fishData);
    const data = await parseResponse(res);
    const updatedFish = parseFish(data?.data?.fish || data?.fish || data?.data || data);

    // Update cache
    updateFishInCache(updatedFish);
    emit('updated', updatedFish);

    return updatedFish;
  } catch (e) {
    console.error('[Fish] modifyFish error:', e);
    throw e;
  }
}

/**
 * Delete fish.
 * @param {string} fishId - Fish ID
 * @returns {Promise<boolean>}
 */
export async function removeFish(fishId) {
  try {
    await fishApi.deleteFish(fishId);

    // Update cache
    removeFishFromCache(fishId);
    emit('deleted', { fishId });

    return true;
  } catch (e) {
    console.error('[Fish] removeFish error:', e);
    throw e;
  }
}

/**
 * Clear fish cache.
 */
export function clearFishCache() {
  clearCache();
}

export default {
  getFishList,
  fetchFishById,
  createFish,
  modifyFish,
  removeFish,
  clearFishCache,
  fishEvents,
};

