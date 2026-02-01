/**
 * Pond Service
 * Handles all pond-related API calls and business logic
 * With offline support via pondStorage
 *
 * @module services/pondService
 */

import { apiFetch } from '../api';
import { API_FISH } from '../api';
import { Pond } from '../models';
import {
  savePond as saveToStorage,
  syncPondsFromAPI,
  getPonds as getStoredPonds,
  deletePond as deleteFromStorage
} from './pondStorage';

/**
 * Fetch all ponds from API
 * @returns {Promise<Pond[]>}
 */
export async function fetchPonds() {
  try {
    const res = await apiFetch(API_FISH.PONDS);
    const data = await res.json();

    let pondsList = [];
    if (data.ponds && Array.isArray(data.ponds)) {
      pondsList = data.ponds;
    } else if (data.success && data.data && Array.isArray(data.data)) {
      pondsList = data.data;
    } else if (data.success && data.data && data.data.ponds) {
      pondsList = data.data.ponds;
    } else if (data.data && Array.isArray(data.data)) {
      pondsList = data.data;
    } else if (Array.isArray(data)) {
      pondsList = data;
    }

    return pondsList.map(pondData => new Pond(pondData));
  } catch (error) {
    console.error('[pondService] Failed to fetch ponds:', error);
    throw error;
  }
}

/**
 * Fetch ponds for a specific farm
 * @param {string} farmId - Farm ID
 * @returns {Promise<Pond[]>}
 */
export async function fetchPondsByFarm(farmId) {
  try {
    const res = await apiFetch(API_FISH.FARM_PONDS(farmId));
    const data = await res.json();

    let pondsList = [];
    if (data.ponds && Array.isArray(data.ponds)) {
      pondsList = data.ponds;
    } else if (data.success && data.data) {
      pondsList = Array.isArray(data.data) ? data.data : [data.data];
    } else if (Array.isArray(data)) {
      pondsList = data;
    }

    return pondsList.map(pondData => new Pond(pondData));
  } catch (error) {
    console.error('[pondService] Failed to fetch ponds for farm:', error);
    throw error;
  }
}

/**
 * Create a new pond
 * @param {Object} formData - Form data
 * @returns {Promise<{success: boolean, pond?: Pond, error?: string}>}
 */
export async function createPond(formData) {
  try {
    // Create Pond model instance from form data
    const pond = Pond.fromFormData(formData);

    // Validate
    if (!pond.isValid()) {
      const errors = pond.errors.map(e => e.message).join(', ');
      return { success: false, error: errors };
    }

    // Prepare API payload
    const payload = pond.toAPIPayload();

    const res = await apiFetch(API_FISH.PONDS_CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const createdPond = new Pond(data.data);
      return { success: true, pond: createdPond };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to create pond'
      };
    }
  } catch (err) {
    console.error('[pondService] Failed to create pond:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update an existing pond
 * @param {string} pondId - Pond ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<{success: boolean, pond?: Pond, error?: string}>}
 */
export async function updatePond(pondId, updates) {
  try {
    const res = await apiFetch(API_FISH.POND_UPDATE(pondId), {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Model handles parsing
      const updatedPond = new Pond(data.data);
      return { success: true, pond: updatedPond };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update pond'
      };
    }
  } catch (err) {
    console.error('[pondService] Failed to update pond:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Delete a pond
 * @param {string} pondId - Pond ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deletePond(pondId) {
  try {
    const res = await apiFetch(API_FISH.POND_DELETE(pondId), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Remove from storage
      deleteFromStorage(pondId);

      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to delete pond'
      };
    }
  } catch (err) {
    console.error('[pondService] Failed to delete pond:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

export default {
  fetchPonds,
  fetchPondsByFarm,
  createPond,
  updatePond,
  deletePond
};
