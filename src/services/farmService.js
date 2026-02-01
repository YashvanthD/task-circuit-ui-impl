/**
 * Farm Service
 * Handles all farm-related API calls and business logic
 *
 * @module services/farmService
 */

import { apiFetch } from '../api';
import { API_FISH } from '../api/constants';
import { Farm } from '../models';
import { saveFarm, syncFarmsFromAPI } from './farmStorage';

/**
 * Fetch all farms from API
 * @returns {Promise<Farm[]>}
 */
export async function fetchFarms() {
  try {
    const res = await apiFetch(API_FISH.FARMS);
    const data = await res.json();

    // Handle multiple possible response structures
    let farmsList = [];
    if (data.data && data.data.farms && Array.isArray(data.data.farms)) {
      // Response: { data: { farms: [...] } }
      farmsList = data.data.farms;
    } else if (data.farms && Array.isArray(data.farms)) {
      // Response: { farms: [...] }
      farmsList = data.farms;
    } else if (data.success && data.data && Array.isArray(data.data)) {
      // Response: { success: true, data: [...] }
      farmsList = data.data;
    } else if (Array.isArray(data)) {
      // Response: [...]
      farmsList = data;
    }

    // Convert to Farm model instances
    return farmsList.map(farmData => new Farm(farmData));
  } catch (error) {
    console.error('[farmService] Failed to fetch farms:', error);
    throw error;
  }
}

/**
 * Create a new farm
 * @param {Object} formData - Form data
 * @returns {Promise<{success: boolean, farm?: Farm, error?: string}>}
 */
export async function createFarm(formData) {
  try {
    // Create Farm model instance from form data
    const farm = Farm.fromFormData(formData);

    // Validate
    if (!farm.isValid()) {
      const errors = farm.errors.map(e => e.message).join(', ');
      return { success: false, error: errors };
    }

    // Prepare API payload
    const payload = farm.toAPIPayload();

    const res = await apiFetch(API_FISH.FARMS_CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Create Farm instance from API response
      const createdFarm = new Farm(data.data);

      // Save to storage
      saveFarm(createdFarm);

      // Sync all farms to keep storage updated
      await syncAllFarms();

      return { success: true, farm: createdFarm };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to create farm'
      };
    }
  } catch (err) {
    console.error('[farmService] Failed to create farm:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update an existing farm
 * @param {string} farmId - Farm ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<{success: boolean, farm?: Farm, error?: string}>}
 */
export async function updateFarm(farmId, updates) {
  try {
    const res = await apiFetch(API_FISH.FARM_UPDATE(farmId), {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const updatedFarm = new Farm(data.data);
      saveFarm(updatedFarm);
      return { success: true, farm: updatedFarm };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update farm'
      };
    }
  } catch (err) {
    console.error('[farmService] Failed to update farm:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Delete a farm
 * @param {string} farmId - Farm ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteFarm(farmId) {
  try {
    const res = await apiFetch(API_FISH.FARM_DELETE(farmId), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Remove from storage
      const { deleteFarm: removeFromStorage } = await import('./farmStorage');
      removeFromStorage(farmId);
      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to delete farm'
      };
    }
  } catch (err) {
    console.error('[farmService] Failed to delete farm:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Sync all farms from API to storage
 * @returns {Promise<void>}
 */
export async function syncAllFarms() {
  try {
    const farms = await fetchFarms();
    // Model's toJSON method handles serialization
    const farmsData = farms.map(farm => farm.toJSON());
    syncFarmsFromAPI(farmsData);
  } catch (error) {
    console.error('[farmService] Failed to sync farms:', error);
  }
}

export default {
  fetchFarms,
  createFarm,
  updateFarm,
  deleteFarm,
  syncAllFarms
};
