/**
 * Pond API Operations
 * Handles pond CRUD operations with API.
 *
 * @module utils/pond/api
 */

import { pondApi } from '../../api';
import { parsePondList, parsePond } from '../parsePond';
import { savePondCache, clearPondCache as clearCache, updatePondInCache, removePondFromCache } from './cache';

/**
 * Simple event emitter for pond events.
 */
const eventListeners = {
  refreshed: [],
  added: [],
  updated: [],
  deleted: [],
  dailyUpdate: [],
};

function emit(event, payload) {
  (eventListeners[event] || []).forEach(cb => {
    try {
      cb(payload);
    } catch (e) {
      console.error(`[PondEvents] Error in ${event} listener:`, e);
    }
  });
}

/**
 * Pond events emitter.
 */
export const pondEvents = {
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
 * Extract pond list from API response.
 */
function extractPondList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.ponds)) return data.ponds;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.ponds)) return data.data.ponds;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Get all ponds from API.
 * @param {object} opts - Options (forceApi, params)
 * @returns {Promise<{source: string, data: Array}>}
 */
export async function getPonds(opts = {}) {
  try {
    const res = await pondApi.listPonds(opts.params);
    const data = await parseResponse(res);
    const pondList = parsePondList(extractPondList(data));

    // Update cache
    savePondCache(pondList);
    emit('refreshed', pondList);

    return { source: 'api', data: pondList };
  } catch (e) {
    console.error('[Pond] getPonds error:', e);
    throw e;
  }
}

/**
 * Get single pond by ID.
 * @param {string} pondId - Pond ID
 * @returns {Promise<{source: string, data: object}>}
 */
export async function fetchPondById(pondId) {
  try {
    const res = await pondApi.getPond(pondId);
    const data = await parseResponse(res);
    const pondData = data?.data?.pond || data?.pond || data?.data || data;
    const pond = parsePond(pondData);

    // Update cache
    updatePondInCache(pond);

    return { source: 'api', data: pond };
  } catch (e) {
    console.error('[Pond] fetchPondById error:', e);
    throw e;
  }
}

/**
 * Create new pond.
 * @param {object} pondData - Pond data
 * @returns {Promise<object>}
 */
export async function createPond(pondData) {
  try {
    const res = await pondApi.createPond(pondData);
    const data = await parseResponse(res);
    const createdPond = parsePond(data?.data?.pond || data?.pond || data?.data || data);

    // Update cache
    updatePondInCache(createdPond);
    emit('added', createdPond);

    return createdPond;
  } catch (e) {
    console.error('[Pond] createPond error:', e);
    throw e;
  }
}

/**
 * Update existing pond.
 * @param {string} pondId - Pond ID
 * @param {object} pondData - Updated pond data
 * @returns {Promise<object>}
 */
export async function modifyPond(pondId, pondData) {
  try {
    const res = await pondApi.updatePond(pondId, pondData);
    const data = await parseResponse(res);
    const updatedPond = parsePond(data?.data?.pond || data?.pond || data?.data || data);

    // Update cache
    updatePondInCache(updatedPond);
    emit('updated', updatedPond);

    return updatedPond;
  } catch (e) {
    console.error('[Pond] modifyPond error:', e);
    throw e;
  }
}

/**
 * Delete pond.
 * @param {string} pondId - Pond ID
 * @returns {Promise<boolean>}
 */
export async function removePond(pondId) {
  try {
    await pondApi.deletePond(pondId);

    // Update cache
    removePondFromCache(pondId);
    emit('deleted', { pondId });

    return true;
  } catch (e) {
    console.error('[Pond] removePond error:', e);
    throw e;
  }
}

/**
 * Add daily update to pond.
 * @param {string} pondId - Pond ID
 * @param {object} updateData - Daily update data
 * @returns {Promise<object>}
 */
export async function addDailyUpdate(pondId, updateData) {
  try {
    const res = await pondApi.addDailyUpdate(pondId, updateData);
    const data = await parseResponse(res);

    emit('dailyUpdate', { pondId, update: data?.data || data });

    return data?.data || data;
  } catch (e) {
    console.error('[Pond] addDailyUpdate error:', e);
    throw e;
  }
}

/**
 * Clear pond cache.
 */
export function clearPondCache() {
  clearCache();
}

export default {
  getPonds,
  fetchPondById,
  createPond,
  modifyPond,
  removePond,
  addDailyUpdate,
  clearPondCache,
  pondEvents,
};

