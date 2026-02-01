/**
 * Pond Storage Service
 * Handles localStorage operations for ponds with offline support
 *
 * @module services/pondStorage
 */

const STORAGE_KEY_PONDS = 'tc_ponds';
const STORAGE_KEY_SELECTED_POND = 'tc_selected_pond';

/**
 * Get all ponds from localStorage
 * @returns {Array}
 */
export function getPonds() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PONDS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[pondStorage] Failed to get ponds:', error);
    return [];
  }
}

/**
 * Get pond by ID
 * @param {string} pondId - Pond ID
 * @returns {Object|null}
 */
export function getPondById(pondId) {
  const ponds = getPonds();
  return ponds.find(p => p.pond_id === pondId || p.id === pondId) || null;
}

/**
 * Get ponds by farm ID
 * @param {string} farmId - Farm ID
 * @returns {Array}
 */
export function getPondsByFarm(farmId) {
  const ponds = getPonds();
  return ponds.filter(p => p.farm_id === farmId);
}

/**
 * Save pond to localStorage
 * @param {Object} pond - Pond object (can be Pond model instance)
 */
export function savePond(pond) {
  try {
    const ponds = getPonds();
    const pondData = pond.toJSON ? pond.toJSON() : pond;
    const pondId = pondData.pond_id || pondData.id;

    const existingIndex = ponds.findIndex(p =>
      (p.pond_id === pondId || p.id === pondId)
    );

    if (existingIndex >= 0) {
      ponds[existingIndex] = pondData;
    } else {
      ponds.push(pondData);
    }

    localStorage.setItem(STORAGE_KEY_PONDS, JSON.stringify(ponds));
    console.log('[pondStorage] Pond saved:', pondId);
  } catch (error) {
    console.error('[pondStorage] Failed to save pond:', error);
  }
}

/**
 * Update pond in localStorage
 * @param {string} pondId - Pond ID
 * @param {Object} updates - Updates to apply
 */
export function updatePond(pondId, updates) {
  try {
    const ponds = getPonds();
    const index = ponds.findIndex(p => p.pond_id === pondId || p.id === pondId);

    if (index >= 0) {
      ponds[index] = { ...ponds[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY_PONDS, JSON.stringify(ponds));
      console.log('[pondStorage] Pond updated:', pondId);
    }
  } catch (error) {
    console.error('[pondStorage] Failed to update pond:', error);
  }
}

/**
 * Delete pond from localStorage
 * @param {string} pondId - Pond ID
 */
export function deletePond(pondId) {
  try {
    const ponds = getPonds();
    const filtered = ponds.filter(p => p.pond_id !== pondId && p.id !== pondId);
    localStorage.setItem(STORAGE_KEY_PONDS, JSON.stringify(filtered));

    // Clear selected if it was this pond
    const selected = getSelectedPond();
    if (selected === pondId) {
      clearSelectedPond();
    }

    console.log('[pondStorage] Pond deleted:', pondId);
  } catch (error) {
    console.error('[pondStorage] Failed to delete pond:', error);
  }
}

/**
 * Get selected pond ID
 * @returns {string|null}
 */
export function getSelectedPond() {
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED_POND);
  } catch (error) {
    console.error('[pondStorage] Failed to get selected pond:', error);
    return null;
  }
}

/**
 * Set selected pond
 * @param {string} pondId - Pond ID
 */
export function setSelectedPond(pondId) {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_POND, pondId);
  } catch (error) {
    console.error('[pondStorage] Failed to set selected pond:', error);
  }
}

/**
 * Clear selected pond
 */
export function clearSelectedPond() {
  try {
    localStorage.removeItem(STORAGE_KEY_SELECTED_POND);
  } catch (error) {
    console.error('[pondStorage] Failed to clear selected pond:', error);
  }
}

/**
 * Sync ponds from API response to localStorage
 * @param {Array} apiPonds - Ponds from API
 */
export function syncPondsFromAPI(apiPonds) {
  try {
    if (!Array.isArray(apiPonds)) {
      console.warn('[pondStorage] syncPondsFromAPI: expected array');
      return;
    }

    localStorage.setItem(STORAGE_KEY_PONDS, JSON.stringify(apiPonds));
    console.log('[pondStorage] Synced', apiPonds.length, 'ponds from API');
  } catch (error) {
    console.error('[pondStorage] Failed to sync ponds:', error);
  }
}

/**
 * Clear all ponds from localStorage
 */
export function clearAllPonds() {
  try {
    localStorage.removeItem(STORAGE_KEY_PONDS);
    localStorage.removeItem(STORAGE_KEY_SELECTED_POND);
    console.log('[pondStorage] All ponds cleared');
  } catch (error) {
    console.error('[pondStorage] Failed to clear ponds:', error);
  }
}

export default {
  getPonds,
  getPondById,
  getPondsByFarm,
  savePond,
  updatePond,
  deletePond,
  getSelectedPond,
  setSelectedPond,
  clearSelectedPond,
  syncPondsFromAPI,
  clearAllPonds
};
