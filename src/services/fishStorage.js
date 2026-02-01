/**
 * Fish Storage Service
 * Handles localStorage operations for fish with offline support
 *
 * @module services/fishStorage
 */

const STORAGE_KEY_FISH = 'tc_fish';
const STORAGE_KEY_SELECTED_FISH = 'tc_selected_fish';

/**
 * Get all fish from localStorage
 * @returns {Array}
 */
export function getFish() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_FISH);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[fishStorage] Failed to get fish:', error);
    return [];
  }
}

/**
 * Get fish by ID
 * @param {string} fishId - Fish ID
 * @returns {Object|null}
 */
export function getFishById(fishId) {
  const fishList = getFish();
  return fishList.find(f => f.fish_id === fishId || f.id === fishId) || null;
}

/**
 * Get fish by pond ID
 * @param {string} pondId - Pond ID
 * @returns {Array}
 */
export function getFishByPond(pondId) {
  const fishList = getFish();
  return fishList.filter(f =>
    f.ponds && f.ponds.includes(pondId)
  );
}

/**
 * Get fish by status
 * @param {string} status - Status (active, inactive, harvested, sold)
 * @returns {Array}
 */
export function getFishByStatus(status) {
  const fishList = getFish();
  return fishList.filter(f => f.status === status);
}

/**
 * Save fish to localStorage
 * @param {Object} fish - Fish object (can be Fish model instance)
 */
export function saveFish(fish) {
  try {
    const fishList = getFish();
    const fishData = fish.toJSON ? fish.toJSON() : fish;
    const fishId = fishData.fish_id || fishData.id;

    const existingIndex = fishList.findIndex(f =>
      (f.fish_id === fishId || f.id === fishId)
    );

    if (existingIndex >= 0) {
      fishList[existingIndex] = fishData;
    } else {
      fishList.push(fishData);
    }

    localStorage.setItem(STORAGE_KEY_FISH, JSON.stringify(fishList));
    console.log('[fishStorage] Fish saved:', fishId);
  } catch (error) {
    console.error('[fishStorage] Failed to save fish:', error);
  }
}

/**
 * Update fish in localStorage
 * @param {string} fishId - Fish ID
 * @param {Object} updates - Updates to apply
 */
export function updateFish(fishId, updates) {
  try {
    const fishList = getFish();
    const index = fishList.findIndex(f => f.fish_id === fishId || f.id === fishId);

    if (index >= 0) {
      fishList[index] = { ...fishList[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY_FISH, JSON.stringify(fishList));
      console.log('[fishStorage] Fish updated:', fishId);
    }
  } catch (error) {
    console.error('[fishStorage] Failed to update fish:', error);
  }
}

/**
 * Delete fish from localStorage
 * @param {string} fishId - Fish ID
 */
export function deleteFish(fishId) {
  try {
    const fishList = getFish();
    const filtered = fishList.filter(f => f.fish_id !== fishId && f.id !== fishId);
    localStorage.setItem(STORAGE_KEY_FISH, JSON.stringify(filtered));

    // Clear selected if it was this fish
    const selected = getSelectedFish();
    if (selected === fishId) {
      clearSelectedFish();
    }

    console.log('[fishStorage] Fish deleted:', fishId);
  } catch (error) {
    console.error('[fishStorage] Failed to delete fish:', error);
  }
}

/**
 * Get selected fish ID
 * @returns {string|null}
 */
export function getSelectedFish() {
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED_FISH);
  } catch (error) {
    console.error('[fishStorage] Failed to get selected fish:', error);
    return null;
  }
}

/**
 * Set selected fish
 * @param {string} fishId - Fish ID
 */
export function setSelectedFish(fishId) {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_FISH, fishId);
  } catch (error) {
    console.error('[fishStorage] Failed to set selected fish:', error);
  }
}

/**
 * Clear selected fish
 */
export function clearSelectedFish() {
  try {
    localStorage.removeItem(STORAGE_KEY_SELECTED_FISH);
  } catch (error) {
    console.error('[fishStorage] Failed to clear selected fish:', error);
  }
}

/**
 * Sync fish from API response to localStorage
 * @param {Array} apiFish - Fish from API
 */
export function syncFishFromAPI(apiFish) {
  try {
    if (!Array.isArray(apiFish)) {
      console.warn('[fishStorage] syncFishFromAPI: expected array');
      return;
    }

    localStorage.setItem(STORAGE_KEY_FISH, JSON.stringify(apiFish));
    console.log('[fishStorage] Synced', apiFish.length, 'fish from API');
  } catch (error) {
    console.error('[fishStorage] Failed to sync fish:', error);
  }
}

/**
 * Clear all fish from localStorage
 */
export function clearAllFish() {
  try {
    localStorage.removeItem(STORAGE_KEY_FISH);
    localStorage.removeItem(STORAGE_KEY_SELECTED_FISH);
    console.log('[fishStorage] All fish cleared');
  } catch (error) {
    console.error('[fishStorage] Failed to clear fish:', error);
  }
}

export default {
  getFish,
  getFishById,
  getFishByPond,
  getFishByStatus,
  saveFish,
  updateFish,
  deleteFish,
  getSelectedFish,
  setSelectedFish,
  clearSelectedFish,
  syncFishFromAPI,
  clearAllFish
};
