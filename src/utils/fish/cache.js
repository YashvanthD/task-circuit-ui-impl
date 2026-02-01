/**
 * Fish Cache Utilities
 * Handles fish data caching.
 *
 * @module utils/fish/cache
 */

const FISH_CACHE_KEY = 'tc_cache_fish';

/**
 * Get fish cache from localStorage.
 * @returns {Array}
 */
export function getFishCache() {
  try {
    const raw = localStorage.getItem(FISH_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save fish list to cache.
 * @param {Array} list - Fish list
 */
export function saveFishCache(list) {
  try {
    localStorage.setItem(FISH_CACHE_KEY, JSON.stringify(list || []));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Clear fish cache.
 */
export function clearFishCache() {
  try {
    localStorage.removeItem(FISH_CACHE_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Get single fish from cache by ID.
 * @param {string} fishId - Fish ID
 * @returns {object|null}
 */
export function getFishFromCache(fishId) {
  const list = getFishCache();
  return list.find(f =>
    f.fish_id === fishId ||
    f.fishId === fishId ||
    f.id === fishId
  ) || null;
}

/**
 * Update single fish in cache.
 * @param {object} fish - Fish data
 */
export function updateFishInCache(fish) {
  if (!fish) return;

  const fishId = fish.fish_id || fish.fishId || fish.id;
  if (!fishId) return;

  const list = getFishCache();
  const index = list.findIndex(f =>
    f.fish_id === fishId ||
    f.fishId === fishId ||
    f.id === fishId
  );

  if (index >= 0) {
    list[index] = { ...list[index], ...fish };
  } else {
    list.push(fish);
  }

  saveFishCache(list);
}

/**
 * Remove fish from cache.
 * @param {string} fishId - Fish ID
 */
export function removeFishFromCache(fishId) {
  const list = getFishCache();
  const filtered = list.filter(f =>
    f.fish_id !== fishId &&
    f.fishId !== fishId &&
    f.id !== fishId
  );
  saveFishCache(filtered);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  getFishCache,
  saveFishCache,
  clearFishCache,
  getFishFromCache,
  updateFishInCache,
  removeFishFromCache,
};

