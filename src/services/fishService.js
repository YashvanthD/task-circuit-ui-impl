/**
 * Fish Service
 * Handles fish species-related API calls (READ-ONLY due to permission restrictions)
 * Updated to use /api/fish/species endpoints
 *
 * @module services/fishService
 */

import { apiFetch } from '../api';
import { API_FISH } from '../api/constants';
import { Fish } from '../models';
import { deleteFish as deleteFishFromStorage } from './fishStorage';

/**
 * Fetch all fish species from API (READ-ONLY)
 * @param {Object} params - Query parameters (e.g., category)
 * @returns {Promise<Fish[]>}
 */
export async function fetchFish(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch(`${API_FISH.SPECIES}${qs ? '?' + qs : ''}`);
    const data = await res.json();

    // Handle multiple possible response structures
    let fishList = [];
    if (data.species && Array.isArray(data.species)) {
      fishList = data.species;
    } else if (data.success && data.data && data.data.species) {
      fishList = data.data.species;
    } else if (data.success && data.data) {
      fishList = Array.isArray(data.data) ? data.data : [data.data];
    } else if (Array.isArray(data)) {
      fishList = data;
    }

    // Model handles all parsing via _init()
    return fishList.map(fishData => new Fish(fishData));
  } catch (error) {
    console.error('[fishService] Failed to fetch fish:', error);
    throw error;
  }
}

/**
 * Fetch public fish (no authentication required)
 * @param {string} accountKey - Account key
 * @returns {Promise<Fish[]>}
 */
export async function fetchPublicFish(accountKey = null) {
  try {
    const params = accountKey ? `?account_key=${accountKey}` : '';
    const res = await apiFetch(`/public/fish${params}`, { skipAuth: true });
    const data = await res.json();

    let fishList = [];
    if (data.fish && Array.isArray(data.fish)) {
      fishList = data.fish;
    } else if (Array.isArray(data)) {
      fishList = data;
    }

    return fishList.map(fishData => new Fish(fishData));
  } catch (error) {
    console.error('[fishService] Failed to fetch public fish:', error);
    throw error;
  }
}

/**
 * Get fish by ID
 * @param {string} fishId - Fish ID
 * @returns {Promise<Fish>}
 */
export async function getFishById(fishId) {
  try {
    const res = await apiFetch(API_FISH.DETAIL(fishId));
    const data = await res.json();

    const fishData = data.data || data;
    return new Fish(fishData);
  } catch (error) {
    console.error('[fishService] Failed to fetch fish by ID:', error);
    throw error;
  }
}

/**
 * Create a new fish species
 * @param {Object} fishData - Fish species data
 * @returns {Promise<{success: boolean, data?: Fish, error?: string}>}
 */
export async function createFish(fishData) {
  try {
    const fish = Fish.fromFormData(fishData);

    // Use model's validation
    if (!fish.isValid()) {
      const errors = fish.errors.map(e => e.message).join(', ');
      return { success: false, error: errors };
    }

    // Use model's toAPIPayload method
    const payload = fish.toAPIPayload();

    const res = await apiFetch(API_FISH.SPECIES_CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Model handles parsing the response
      const createdFish = new Fish(data.data);
      return { success: true, fish: createdFish };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to create fish species'
      };
    }
  } catch (err) {
    console.error('[fishService] Failed to create fish:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update an existing fish record
 * @param {string} fishId - Fish ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<{success: boolean, fish?: Fish, error?: string}>}
 */
export async function updateFish(fishId, updates) {
  try {
    const res = await apiFetch(API_FISH.UPDATE(fishId), {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Model handles parsing
      const updatedFish = new Fish(data.data);
      return { success: true, fish: updatedFish };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update fish'
      };
    }
  } catch (err) {
    console.error('[fishService] Failed to update fish:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Delete a fish species record
 * @param {string} fishId - Fish species ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFish(fishId) {
  try {
    const res = await apiFetch(API_FISH.SPECIES_DELETE(fishId), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Remove from storage
      deleteFishFromStorage(fishId);

      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to delete fish'
      };
    }
  } catch (err) {
    console.error('[fishService] Failed to delete fish:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

// Note: Analytics and Fields endpoints are not available in the new species API
// If needed, these should be implemented using the stocks or other endpoints

export default {
  fetchFish,
  fetchPublicFish,
  getFishById,
  createFish,
  updateFish,
  deleteFish,
};
