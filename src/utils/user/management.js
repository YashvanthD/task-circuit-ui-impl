/**
 * User Management Utilities
 * Handles user CRUD operations (list, create, update, delete).
 *
 * @module utils/user/management
 */

import { userApi, apiFetch, extractResponseData, API_USER } from '../../api';
import { readUsersCache, writeUsersCache, clearUsersCache } from './cache';

/**
 * Simple logError function
 */
function logError(context, error, meta = {}) {
  console.error(`[${context}]`, error, meta);
}

/**
 * Parse response and extract JSON data.
 */
async function parseResponse(res) {
  if (!res) return null;
  if (res.json && typeof res.json === 'function') {
    try {
      return await res.json();
    } catch (e) {
      return res;
    }
  }
  return res;
}

/**
 * Extract users array from various API response shapes.
 * @param {object} data - API response data
 * @returns {Array|null}
 */
function extractUsersArray(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data;

  // Use centralized extractor with 'users' key hint
  const extracted = extractResponseData(data, 'users');
  if (Array.isArray(extracted)) return extracted;

  return null;
}

/**
 * Fetch all users from API.
 * @param {object} params - Query parameters
 * @returns {Promise<Array|null>} Array of users or null on error
 */
export async function fetchUsers(params = {}) {
  try {
    const res = await userApi.listUsers(params);
    const data = await parseResponse(res);
    console.debug('[user.fetchUsers] raw response parsed:', data);
    return extractUsersArray(data);
  } catch (e) {
    logError('fetchUsers', e);
    return null;
  }
}

/**
 * Get user by key/id, with caching.
 * @param {string} userKey - User key/id
 * @param {boolean} forceApi - Force API call, skip cache
 * @returns {Promise<object|null>}
 */
export async function getUserByKey(userKey, forceApi = false) {
  if (!userKey) return null;

  const cache = readUsersCache();
  if (!forceApi && cache && cache[userKey]) {
    return cache[userKey];
  }

  try {
    // Try API with query param first
    let users = await fetchUsers({ user_key: userKey });

    if (!users || users.length === 0) {
      // Fallback: list all users and filter
      users = await fetchUsers();
    }

    if (users && users.length > 0) {
      // Find matching user by various key fields
      const found = users.find(u =>
        u.user_key === userKey ||
        u.userKey === userKey ||
        u.key === userKey ||
        u.id === userKey ||
        u._id === userKey ||
        String(u.account_user_key) === String(userKey)
      );

      if (found) {
        cache[userKey] = found;
        writeUsersCache(cache);
        return found;
      }
    }
  } catch (e) {
    logError('getUserByKey', e, { userKey });
  }

  return null;
}

/**
 * Get display name for a user.
 * @param {string} userKey - User key/id
 * @param {boolean} forceApi - Force API call
 * @returns {Promise<string|null>}
 */
export async function getUserName(userKey, forceApi = false) {
  const u = await getUserByKey(userKey, forceApi);
  if (!u) return null;

  // Return first available display name field
  return u.display_name || u.fullName || u.full_name || u.name ||
         u.username || u.user_name || u.label || u.email ||
         u.user_key || u.userKey || null;
}

/**
 * Alias for getUserByKey.
 * @param {string} userKey - User key/id
 * @param {boolean} forceApi - Force API call
 * @returns {Promise<object|null>}
 */
export async function getUserInfo(userKey, forceApi = false) {
  return getUserByKey(userKey, forceApi);
}

/**
 * List users for a specific account.
 * @param {string} accountKey - Account key
 * @param {object} params - Additional query parameters
 * @returns {Promise<Array>}
 */
export async function listAccountUsers(accountKey, params = {}) {
  try {
    const queryParams = { ...params };
    if (accountKey) queryParams.account_key = accountKey;

    let users = await fetchUsers(queryParams);

    // Fallback: filter locally if API doesn't support account filter
    if ((!users || users.length === 0) && accountKey) {
      users = await fetchUsers();
      if (users && users.length > 0) {
        users = users.filter(u =>
          u.accountKey === accountKey ||
          u.account_key === accountKey ||
          u.account === accountKey
        );
      }
    }

    return users || [];
  } catch (e) {
    logError('listAccountUsers', e, { accountKey });
    return [];
  }
}

/**
 * Create a new user.
 * @param {object} payload - User data
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function addUser(payload) {
  try {
    const res = await apiFetch(API_USER.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseResponse(res);
    clearUsersCache();
    return data;
  } catch (e) {
    logError('addUser', e, { payload });
    throw e;
  }
}

/**
 * Update an existing user.
 * @param {string} userId - User ID
 * @param {object} payload - Updated user data
 * @returns {Promise<object>}
 * @throws {Error} On API failure or missing userId
 */
export async function updateUser(userId, payload) {
  if (!userId) throw new Error('userId is required for update');

  try {
    const res = await apiFetch(`${API_USER.LIST}${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await parseResponse(res);
    clearUsersCache();
    return data;
  } catch (e) {
    logError('updateUser', e, { userId });
    throw e;
  }
}

/**
 * Delete a user.
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 * @throws {Error} On API failure or missing userId
 */
export async function deleteUser(userId) {
  if (!userId) throw new Error('userId is required for delete');

  try {
    const res = await apiFetch(`/auth/account/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const data = await parseResponse(res);
    clearUsersCache();
    return data;
  } catch (e) {
    logError('deleteUser', e, { userId });
    throw e;
  }
}

export { clearUsersCache };

export default {
  fetchUsers,
  getUserByKey,
  getUserName,
  getUserInfo,
  listAccountUsers,
  addUser,
  updateUser,
  deleteUser,
  clearUsersCache,
};

