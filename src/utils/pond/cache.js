/**
 * Pond Cache Utilities
 * Handles pond data caching.
 *
 * @module utils/pond/cache
 */

const POND_CACHE_KEY = 'tc_cache_ponds';

/**
 * Get pond cache from localStorage.
 * @returns {Array}
 */
export function getPondCache() {
  try {
    const raw = localStorage.getItem(POND_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save pond list to cache.
 * @param {Array} list - Pond list
 */
export function savePondCache(list) {
  try {
    localStorage.setItem(POND_CACHE_KEY, JSON.stringify(list || []));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Clear pond cache.
 */
export function clearPondCache() {
  try {
    localStorage.removeItem(POND_CACHE_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Get single pond from cache by ID.
 * @param {string} pondId - Pond ID
 * @returns {object|null}
 */
export function getPondFromCache(pondId) {
  const list = getPondCache();
  return list.find(p =>
    p.pond_id === pondId ||
    p.pondId === pondId ||
    p.id === pondId
  ) || null;
}

/**
 * Update single pond in cache.
 * @param {object} pond - Pond data
 */
export function updatePondInCache(pond) {
  if (!pond) return;

  const pondId = pond.pond_id || pond.pondId || pond.id;
  if (!pondId) return;

  const list = getPondCache();
  const index = list.findIndex(p =>
    p.pond_id === pondId ||
    p.pondId === pondId ||
    p.id === pondId
  );

  if (index >= 0) {
    list[index] = { ...list[index], ...pond };
  } else {
    list.push(pond);
  }

  savePondCache(list);
}

/**
 * Remove pond from cache.
 * @param {string} pondId - Pond ID
 */
export function removePondFromCache(pondId) {
  const list = getPondCache();
  const filtered = list.filter(p =>
    p.pond_id !== pondId &&
    p.pondId !== pondId &&
    p.id !== pondId
  );
  savePondCache(filtered);
}

export default {
  getPondCache,
  savePondCache,
  clearPondCache,
  getPondFromCache,
  updatePondInCache,
  removePondFromCache,
};

