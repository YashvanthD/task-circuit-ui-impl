import { userApi, apiFetch, safeJsonParse, extractResponseData, API_USER } from '../api';

// Create alias for backward compatibility
const apiUser = userApi;

// Simple logError function
function logError(context, error) {
  console.error(`[${context}]`, error);
}

// PATH_USER_LIST is API_USER.LIST
const PATH_USER_LIST = API_USER.LIST;

const USERS_CACHE_KEY = 'tc_cache_users';

/**
 * Read users cache from localStorage.
 * @returns {object} Cache object (userKey -> user)
 */
function readUsersCache() {
  try {
    const raw = localStorage.getItem(USERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Write users cache to localStorage.
 * @param {object} obj - Cache object
 */
function writeUsersCache(obj) {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Parse response and extract JSON data.
 * Centralizes the repetitive response handling pattern.
 * @param {Response} res - Fetch response
 * @returns {Promise<object|null>}
 */
async function parseResponse(res) {
  if (!res) return null;
  if (res.json && typeof res.json === 'function') {
    return safeJsonParse(res);
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
    const res = await apiUser.listUsers(params);
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
 * Clear the users cache.
 */
export function clearUsersCache() {
  try {
    localStorage.removeItem(USERS_CACHE_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Get the current logged-in user's profile.
 * @param {boolean} forceApi - Force API call (unused, always calls API)
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser(forceApi = false) {
  try {
    const res = await apiUser.getProfile();
    const data = await parseResponse(res);

    // Extract user from response
    if (data && data.data) return data.data;
    if (data && data.user) return data.user;
    return data;
  } catch (e) {
    logError('getCurrentUser', e);
    return null;
  }
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
    const res = await apiFetch('/api/users', {
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
    const res = await apiFetch(`${PATH_USER_LIST}${encodeURIComponent(userId)}`, {
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

/**
 * Update current user's email.
 * @param {string} newEmail - New email address
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUserEmail(newEmail) {
  try {
    const res = await apiUser.updateProfile({ email: newEmail });
    return parseResponse(res);
  } catch (e) {
    logError('updateUserEmail', e);
    throw e;
  }
}

/**
 * Update current user's mobile number.
 * @param {string} newMobile - New mobile number
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUserMobile(newMobile) {
  try {
    const res = await apiUser.updateProfile({ mobile: newMobile });
    return parseResponse(res);
  } catch (e) {
    logError('updateUserMobile', e);
    throw e;
  }
}

/**
 * Update current user's password.
 * @param {object} payload - Password update payload (currentPassword, newPassword)
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUserPassword(payload) {
  try {
    const res = await apiUser.updateProfile(payload);
    return parseResponse(res);
  } catch (e) {
    logError('updateUserPassword', e);
    throw e;
  }
}

/**
 * Update current user's username.
 * @param {string} newUsername - New username
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUsername(newUsername) {
  try {
    const res = await apiUser.updateProfile({ username: newUsername });
    return parseResponse(res);
  } catch (e) {
    logError('updateUsername', e);
    throw e;
  }
}

const userUtil = {
  fetchUsers,
  getUserByKey,
  getUserName,
  clearUsersCache,
  getCurrentUser,
  getUserInfo,
  listAccountUsers,
  addUser,
  updateUser,
  deleteUser,
  updateUserEmail,
  updateUserMobile,
  updateUserPassword,
  updateUsername,
};

export default userUtil;

