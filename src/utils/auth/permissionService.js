/**
 * Permission Service
 * Helper logic for processing permission templates and user permissions.
 *
 * - Fetches permission template from API ONCE and caches in memory
 * - Default access is ALLOW (if no explicit deny)
 * - No localStorage persistence for security
 *
 * @module utils/auth/permissionService
 */

import { apiFetch } from '../../api/client';
import { API_PUBLIC } from '../../api/constants';

// ============================================================================
// In-Memory State (Singleton Pattern)
// ============================================================================

let _permissionTemplate = null;
let _templateLoading = null; // Promise to prevent duplicate fetches

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch permission template from API.
 * Fetches ONCE and caches in memory state.
 * Subsequent calls return cached data.
 *
 * @param {boolean} forceRefresh - Force re-fetch from API
 * @returns {Promise<object>} Permission template structure
 */
export async function getPermissionTemplate(forceRefresh = false) {
  // Return cached if available and not forcing refresh
  if (_permissionTemplate && !forceRefresh) {
    return _permissionTemplate;
  }

  // If already loading, wait for that promise
  if (_templateLoading && !forceRefresh) {
    return _templateLoading;
  }

  // Fetch from API
  _templateLoading = (async () => {
    try {
      const response = await apiFetch(API_PUBLIC.PERMISSIONS, {
        method: 'GET',
      });

      if (response) {
        _permissionTemplate = response.data || response;
        console.log('[PermissionService] Template loaded from API:', _permissionTemplate);
        return _permissionTemplate;
      }

      // API returned empty - return empty structure (default allow)
      _permissionTemplate = { categories: {}, permissions: [] };
      return _permissionTemplate;
    } catch (err) {
      console.error('[PermissionService] Failed to fetch permission template:', err);
      // On error, return empty structure (default allow)
      _permissionTemplate = { categories: {}, permissions: [] };
      return _permissionTemplate;
    } finally {
      _templateLoading = null;
    }
  })();

  return _templateLoading;
}

/**
 * Get cached permission template synchronously.
 * Returns null if not yet loaded.
 */
export function getCachedPermissionTemplate() {
  return _permissionTemplate;
}

/**
 * Clear cached permission template.
 * Call this on logout or when template needs refresh.
 */
export function clearPermissionTemplate() {
  _permissionTemplate = null;
  _templateLoading = null;
}

// ============================================================================
// Access Check Functions (Default: ALLOW)
// ============================================================================

/**
 * Check if user has permission for a specific action.
 * DEFAULT IS ALLOW - only returns false if explicitly denied.
 *
 * @param {object} userPermissions - User's permission overrides (from API)
 * @param {string} permissionCode - Permission code (e.g., "user:create")
 * @returns {boolean} true if allowed, false if explicitly denied
 */
export function hasPermission(userPermissions, permissionCode) {
  // Default: ALLOW if no user permissions or no specific override
  if (!userPermissions) return true;
  if (!permissionCode) return true;

  // Parse code: "category:action" -> { category, action }
  const [category, action] = permissionCode.split(':');
  if (!category || !action) return true;

  // Check if explicitly denied
  // Structure: { denied: { user: { create: true } } }
  // Or: { user: { create: 'Deny' } }

  // Check "denied" object
  if (userPermissions.denied) {
    const deniedCategory = userPermissions.denied[category];
    if (deniedCategory === true) return false; // Entire category denied
    if (deniedCategory && deniedCategory[action]) return false;
  }

  // Check direct category structure
  const categoryPerms = userPermissions[category];
  if (categoryPerms) {
    const actionValue = categoryPerms[action];
    if (actionValue === 'Deny' || actionValue === false) return false;
  }

  // Check flat permission code
  if (userPermissions[permissionCode] === 'Deny' || userPermissions[permissionCode] === false) {
    return false;
  }

  // Default: ALLOW
  return true;
}

/**
 * Check multiple permissions at once.
 * Returns true if ALL are allowed.
 *
 * @param {object} userPermissions - User's permission overrides
 * @param {string[]} permissionCodes - Array of permission codes
 * @returns {boolean}
 */
export function hasAllPermissions(userPermissions, permissionCodes) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) return true;
  return permissionCodes.every(code => hasPermission(userPermissions, code));
}

/**
 * Check multiple permissions at once.
 * Returns true if ANY is allowed.
 *
 * @param {object} userPermissions - User's permission overrides
 * @param {string[]} permissionCodes - Array of permission codes
 * @returns {boolean}
 */
export function hasAnyPermission(userPermissions, permissionCodes) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) return true;
  return permissionCodes.some(code => hasPermission(userPermissions, code));
}

// ============================================================================
// UI Helper Functions
// ============================================================================

/**
 * Group permissions by category for UI display.
 *
 * @param {object} templateData - The raw template data (from getPermissionTemplate())
 * @returns {Array} Array of category objects, each containing a 'permissions' array
 */
export function groupPermissionsByCategory(templateData) {
  if (!templateData) return [];

  const categories = templateData.categories || {};
  const permList = templateData.permissions || [];

  // Initialize result from categories map
  const result = Object.entries(categories).map(([key, info]) => ({
    key,
    name: info.name,
    description: info.description,
    permissions: []
  }));

  // Map permissions to their categories
  permList.forEach(perm => {
    let cat = result.find(c => c.key === perm.category);
    if (!cat) {
      // Create dynamic category if not found
      cat = {
        key: perm.category,
        name: perm.category_name || perm.category,
        description: 'Other permissions',
        permissions: []
      };
      result.push(cat);
    }
    cat.permissions.push(perm);
  });

  return result;
}

/**
 * Get all permission codes as a flat array.
 *
 * @param {object} templateData - The raw template data
 * @returns {string[]} Array of permission codes
 */
export function getAllPermissionCodes(templateData) {
  if (!templateData || !templateData.permissions) return [];
  return templateData.permissions.map(p => p.code);
}

/**
 * Find permission info by code.
 *
 * @param {object} templateData - The raw template data
 * @param {string} code - Permission code (e.g., "user:create")
 * @returns {object|null} Permission object or null
 */
export function getPermissionByCode(templateData, code) {
  if (!templateData || !templateData.permissions) return null;
  return templateData.permissions.find(p => p.code === code) || null;
}

/**
 * Build user permission state from denied list.
 * Useful for creating permission request payloads.
 *
 * @param {string[]} deniedCodes - Array of denied permission codes
 * @returns {object} Permission state object
 */
export function buildPermissionState(deniedCodes = []) {
  const state = { denied: {} };

  deniedCodes.forEach(code => {
    const [category, action] = code.split(':');
    if (category && action) {
      if (!state.denied[category]) {
        state.denied[category] = {};
      }
      state.denied[category][action] = true;
    }
  });

  return state;
}
