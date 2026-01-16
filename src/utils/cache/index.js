/**
 * Cache Module Index
 * Export all cache utilities and entity caches.
 *
 * @module utils/cache
 */

// Import for utility functions
import { clearUsersCache, refreshUsers, getUsers } from './usersCache';
import { clearPondsCache, refreshPonds, getPonds } from './pondsCache';
import { clearFishCache, refreshFish, getFish } from './fishCache';
import { clearSamplingsCache, refreshSamplings } from './samplingsCache';
import { clearTasksCache, refreshTasks } from './tasksCache';

// Base cache utilities
export * from './baseCache';

// Entity caches
export * from './usersCache';
export * from './pondsCache';
export * from './fishCache';
export * from './samplingsCache';
export * from './tasksCache';

// ============================================================================
// Utility: Clear all caches
// ============================================================================

/**
 * Clear all entity caches.
 */
export function clearAllCaches() {
  clearUsersCache();
  clearPondsCache();
  clearFishCache();
  clearSamplingsCache();
  clearTasksCache();
}

// ============================================================================
// Utility: Refresh all caches
// ============================================================================

/**
 * Refresh all entity caches.
 * @returns {Promise<void>}
 */
export async function refreshAllCaches() {
  await Promise.all([
    refreshUsers(),
    refreshPonds(),
    refreshFish(),
    refreshSamplings(),
    refreshTasks(),
  ]);
}

// ============================================================================
// Utility: Preload essential caches
// ============================================================================

/**
 * Preload essential caches (users, ponds, fish) for forms.
 * @returns {Promise<void>}
 */
export async function preloadFormCaches() {
  await Promise.all([
    getUsers(),
    getPonds(),
    getFish(),
  ]);
}

