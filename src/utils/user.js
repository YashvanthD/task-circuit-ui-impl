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
 * Refresh user session with fresh data from API.
 * Call this after any profile update to ensure cache is in sync.
 * @returns {Promise<object|null>} Updated user data
 */
export async function refreshUserSession() {
  try {
    // Fetch fresh profile from API
    const res = await apiUser.getProfile();
    const data = await parseResponse(res);
    const userData = data?.data || data?.user || data;

    if (userData) {
      // Update userSession with fresh data
      try {
        const { userSession } = require('./auth/userSession');
        userSession.updateProfile(userData);
        console.log('[User] Session refreshed with updated profile');
      } catch (e) {
        console.warn('[User] Failed to update userSession:', e);
      }

      // Also update localStorage user data for backward compatibility
      try {
        const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...existingUser, ...userData }));
      } catch (e) {
        // Ignore storage errors
      }
    }

    return userData;
  } catch (e) {
    logError('refreshUserSession', e);
    return null;
  }
}

/**
 * Get the current logged-in user's profile.
 * Tries userSession first (already has data from login), then API as fallback.
 * Merges data from both sources to ensure all fields are populated.
 * @param {boolean} forceApi - Force API call even if userSession has data
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser(forceApi = false) {
  // Get user data from userSession (cached from login)
  let sessionUser = null;
  try {
    const { userSession } = require('./auth/userSession');
    sessionUser = userSession.user;
  } catch (e) {
    // userSession not available
  }

  // If we have session user and not forcing API, return it
  if (sessionUser && !forceApi) {
    // Still try to get fresh data from API in background (fire and forget)
    (async () => {
      try {
        const res = await apiUser.getProfile();
        if (res) {
          const data = await parseResponse(res);
          const apiUserData = data?.data || data?.user || data;
          if (apiUserData) {
            // Update session with fresh data
            try {
              const { userSession } = require('./auth/userSession');
              userSession.updateProfile(apiUserData);
            } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // Ignore background fetch errors
      }
    })();

    return sessionUser;
  }

  // Fetch from API
  try {
    const res = await apiUser.getProfile();
    const data = await parseResponse(res);

    // Extract user from response
    let userData = data?.data || data?.user || data;

    // Merge with session user data to ensure all fields are populated
    if (sessionUser && userData) {
      userData = {
        ...sessionUser,
        ...userData,
        // Ensure key fields from session are preserved if API doesn't return them
        user_key: userData.user_key || userData.userKey || sessionUser.user_key,
        account_key: userData.account_key || userData.accountKey || sessionUser.account_key,
        username: userData.username || sessionUser.username,
        email: userData.email || sessionUser.email,
        mobile: userData.mobile || sessionUser.mobile,
        display_name: userData.display_name || userData.displayName || sessionUser.display_name,
        roles: userData.roles || sessionUser.roles,
        settings: userData.settings || sessionUser.settings,
      };
    }

    return userData;
  } catch (e) {
    logError('getCurrentUser', e);
    // Return session user as fallback if API fails
    return sessionUser;
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
    const data = await parseResponse(res);

    // Refresh user session with updated data
    await refreshUserSession();

    return data;
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
    const res = await apiUser.updateProfile({ phone: newMobile });
    const data = await parseResponse(res);

    // Refresh user session with updated data
    await refreshUserSession();

    return data;
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
    const res = await apiUser.updatePassword(payload);
    const data = await parseResponse(res);
    return data;
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
    const data = await parseResponse(res);

    // Refresh user session with updated data
    await refreshUserSession();

    return data;
  } catch (e) {
    logError('updateUsername', e);
    throw e;
  }
}

/**
 * Get user settings.
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function getUserSettings() {
  try {
    const res = await apiUser.getSettings();
    const data = await parseResponse(res);
    if (data && data.data) return data.data;
    return data;
  } catch (e) {
    logError('getUserSettings', e);
    throw e;
  }
}

/**
 * Update user settings.
 * @param {object} settings - Settings to update
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUserSettings(settings) {
  try {
    const res = await apiUser.updateSettings(settings);
    return parseResponse(res);
  } catch (e) {
    logError('updateUserSettings', e);
    throw e;
  }
}

/**
 * Update notification settings.
 * @param {object} notificationSettings - Notification settings to update
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateNotificationSettings(notificationSettings) {
  try {
    const res = await apiUser.updateNotificationSettings(notificationSettings);
    const data = await parseResponse(res);

    // Update userSession settings
    try {
      const { userSession } = require('./auth/userSession');
      userSession.updateSettings({ notifications: notificationSettings });
    } catch (e) { /* ignore */ }

    return data;
  } catch (e) {
    logError('updateNotificationSettings', e);
    throw e;
  }
}

/**
 * Upload profile picture.
 * @param {File} file - Image file to upload
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function uploadProfilePicture(file) {
  try {
    const res = await apiUser.uploadProfilePicture(file);
    const data = await parseResponse(res);

    // Refresh user session with updated data
    await refreshUserSession();

    return data;
  } catch (e) {
    logError('uploadProfilePicture', e);
    throw e;
  }
}

/**
 * Update profile description.
 * @param {string} description - New description
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateProfileDescription(description) {
  try {
    const res = await apiUser.updateProfile({ description });
    const data = await parseResponse(res);

    // Refresh user session with updated data
    await refreshUserSession();

    return data;
  } catch (e) {
    logError('updateProfileDescription', e);
    throw e;
  }
}

const userUtil = {
  fetchUsers,
  getUserByKey,
  getUserName,
  clearUsersCache,
  getCurrentUser,
  refreshUserSession,
  getUserInfo,
  listAccountUsers,
  addUser,
  updateUser,
  deleteUser,
  updateUserEmail,
  updateUserMobile,
  updateUserPassword,
  updateUsername,
  getUserSettings,
  updateUserSettings,
  updateNotificationSettings,
  uploadProfilePicture,
  updateProfileDescription,
};

export default userUtil;

