/**
 * Farm Storage Service
 * Handles farm data storage and retrieval with localStorage
 *
 * @module services/farmStorage
 */

import Farm from '../models/Farm';

const STORAGE_KEY = 'tc_farms';
const SELECTED_FARM_KEY = 'tc_selected_farm';

/**
 * Get all farms from storage
 * @returns {Farm[]}
 */
export function getFarms() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const farms = JSON.parse(data);
    return farms.map(f => new Farm(f));
  } catch (error) {
    console.error('Error reading farms from storage:', error);
    return [];
  }
}

/**
 * Save farm to storage
 * @param {Farm} farm - Farm instance
 * @returns {boolean} Success status
 */
export function saveFarm(farm) {
  try {
    const farms = getFarms();
    const existing = farms.findIndex(f => f.farm_id === farm.farm_id);

    if (existing >= 0) {
      farms[existing] = farm;
    } else {
      farms.push(farm);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms.map(f => f.toJSON())));
    return true;
  } catch (error) {
    console.error('Error saving farm to storage:', error);
    return false;
  }
}

/**
 * Update farm in storage
 * @param {string} farmId - Farm ID
 * @param {Object} updates - Updates to apply
 * @returns {boolean} Success status
 */
export function updateFarm(farmId, updates) {
  try {
    const farms = getFarms();
    const index = farms.findIndex(f => f.farm_id === farmId);

    if (index === -1) return false;

    const farm = farms[index];
    Object.assign(farm, updates);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms.map(f => f.toJSON())));
    return true;
  } catch (error) {
    console.error('Error updating farm in storage:', error);
    return false;
  }
}

/**
 * Delete farm from storage
 * @param {string} farmId - Farm ID
 * @returns {boolean} Success status
 */
export function deleteFarm(farmId) {
  try {
    const farms = getFarms();
    const filtered = farms.filter(f => f.farm_id !== farmId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.map(f => f.toJSON())));

    // Clear selected farm if it was deleted
    if (getSelectedFarmId() === farmId) {
      clearSelectedFarm();
    }

    return true;
  } catch (error) {
    console.error('Error deleting farm from storage:', error);
    return false;
  }
}

/**
 * Get farm by ID
 * @param {string} farmId - Farm ID
 * @returns {Farm|null}
 */
export function getFarmById(farmId) {
  const farms = getFarms();
  const farm = farms.find(f => f.farm_id === farmId);
  return farm || null;
}

/**
 * Get selected farm ID
 * @returns {string|null}
 */
export function getSelectedFarmId() {
  try {
    return localStorage.getItem(SELECTED_FARM_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Set selected farm
 * @param {string} farmId - Farm ID
 */
export function setSelectedFarm(farmId) {
  try {
    localStorage.setItem(SELECTED_FARM_KEY, farmId);
  } catch (error) {
    console.error('Error setting selected farm:', error);
  }
}

/**
 * Get selected farm
 * @returns {Farm|null}
 */
export function getSelectedFarm() {
  const farmId = getSelectedFarmId();
  return farmId ? getFarmById(farmId) : null;
}

/**
 * Clear selected farm
 */
export function clearSelectedFarm() {
  try {
    localStorage.removeItem(SELECTED_FARM_KEY);
  } catch (error) {
    console.error('Error clearing selected farm:', error);
  }
}

/**
 * Clear all farms from storage
 */
export function clearAllFarms() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SELECTED_FARM_KEY);
  } catch (error) {
    console.error('Error clearing farms:', error);
  }
}

/**
 * Sync farms from API response
 * @param {Array} apiData - Array of farm data from API
 */
export function syncFarmsFromAPI(apiData) {
  try {
    const farms = apiData.map(data => new Farm(data));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(farms.map(f => f.toJSON())));
  } catch (error) {
    console.error('Error syncing farms from API:', error);
  }
}

export default {
  getFarms,
  saveFarm,
  updateFarm,
  deleteFarm,
  getFarmById,
  getSelectedFarmId,
  setSelectedFarm,
  getSelectedFarm,
  clearSelectedFarm,
  clearAllFarms,
  syncFarmsFromAPI
};
