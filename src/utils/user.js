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

    // Extract user from response - API returns { data: { user: {...} } }
    const rawUserData = data?.data?.user || data?.user || data?.data || data;

    if (rawUserData) {
      // Normalize the user data
      const userData = normalizeUserData(rawUserData);

      // Update userSession with fresh data
      try {
        const { userSession } = require('./auth/userSession');
        userSession.updateProfile(userData);
        console.log('[User] Session refreshed with updated profile:', userData);
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

      return userData;
    }

    return null;
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

  // If forcing API or no session user, fetch from API
  if (forceApi || !sessionUser) {
    try {
      const res = await apiUser.getProfile();
      const data = await parseResponse(res);

      // Extract user from response - API returns { data: { user: {...} } }
      let userData = data?.data?.user || data?.user || data?.data || data;

      if (userData) {
        // Normalize field names from API response
        const normalizedUser = normalizeUserData(userData);

        // Update session with fresh data
        try {
          const { userSession } = require('./auth/userSession');
          userSession.updateProfile(normalizedUser);
        } catch (e) { /* ignore */ }

        // Merge: API data takes full precedence, session fills gaps only for missing fields
        if (sessionUser) {
          return {
            ...sessionUser,  // Base from session
            ...normalizedUser,     // API overwrites everything it has
          };
        }

        return normalizedUser;
      }
    } catch (e) {
      logError('getCurrentUser', e);
      // Return session user as fallback if API fails
      return sessionUser;
    }
  }

  // Have session user and not forcing API - return session but refresh in background
  if (sessionUser) {
    // Fire and forget background refresh
    (async () => {
      try {
        const res = await apiUser.getProfile();
        if (res) {
          const data = await parseResponse(res);
          const userData = data?.data?.user || data?.user || data?.data || data;
          if (userData) {
            const normalizedUser = normalizeUserData(userData);
            try {
              const { userSession } = require('./auth/userSession');
              userSession.updateProfile(normalizedUser);
            } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // Ignore background fetch errors
      }
    })();

    return sessionUser;
  }

  return null;
}

/**
 * Normalize user data from API response to consistent field names
 * @param {object} userData - Raw user data from API
 * @returns {object} Normalized user data
 */
function normalizeUserData(userData) {
  if (!userData) return null;

  return {
    ...userData,
    // Map API fields to consistent names
    user_key: userData.user_key || userData.userKey || userData.id,
    userKey: userData.userKey || userData.user_key || userData.id,
    account_key: userData.account_key || userData.accountKey,
    username: userData.username || userData.name,
    name: userData.name || userData.username,
    display_name: userData.display_name || userData.displayName || userData.name || userData.username,
    email: userData.email,
    mobile: userData.mobile || userData.phone,
    phone: userData.phone || userData.mobile,
    role: userData.role,
    roles: userData.roles || (userData.role ? [userData.role] : []),
    avatar_url: userData.avatar_url || userData.profile_photo || userData.profilePhoto,
    description: userData.description || userData.bio || '',
    created_at: userData.created_at || userData.createdAt,
    createdAt: userData.createdAt || userData.created_at,
  };
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
    // Send both 'mobile' and 'phone' for API compatibility
    const res = await apiUser.updateProfile({ mobile: newMobile, phone: newMobile });
    const data = await parseResponse(res);

    // Refresh user session with updated data from API
    const updatedUser = await refreshUserSession();

    // Return the updated user data
    return updatedUser || data;
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
 * @param {boolean} forceApi - Force API call
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function getUserSettings(forceApi = false) {
  try {
    // Try to get from session first
    if (!forceApi) {
      try {
        const { userSession } = require('./auth/userSession');
        if (userSession.settings) {
          return userSession.settings;
        }
      } catch (e) { /* ignore */ }
    }

    // Fetch from API
    const res = await apiUser.getSettings();
    const data = await parseResponse(res);
    const settings = data?.data?.settings || data?.data || data?.settings || data;

    // Update session with fetched settings
    if (settings) {
      try {
        const { userSession } = require('./auth/userSession');
        userSession.updateSettings(settings);
      } catch (e) { /* ignore */ }

      // Also update localStorage
      try {
        localStorage.setItem('user_settings', JSON.stringify(settings));
      } catch (e) { /* ignore */ }
    }

    return settings;
  } catch (e) {
    logError('getUserSettings', e);
    // Try to return cached settings on error
    try {
      const cached = localStorage.getItem('user_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) { /* ignore */ }
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
    const data = await parseResponse(res);

    // Update session with new settings
    try {
      const { userSession } = require('./auth/userSession');
      userSession.updateSettings(settings);
    } catch (e) { /* ignore */ }

    // Update localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('user_settings') || '{}');
      localStorage.setItem('user_settings', JSON.stringify({ ...existing, ...settings }));
    } catch (e) { /* ignore */ }

    return data;
  } catch (e) {
    logError('updateUserSettings', e);
    throw e;
  }
}

/**
 * Update theme settings.
 * @param {string} theme - Theme mode ('light' or 'dark')
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateThemeSettings(theme) {
  try {
    const res = await apiUser.updateSettings({ theme });
    const data = await parseResponse(res);

    // Update userSession singleton
    try {
      const { userSession } = require('./auth/userSession');
      userSession.updateSettings({ theme });
    } catch (e) { /* ignore */ }

    // Update tc_user_session in localStorage
    try {
      const sessionStr = localStorage.getItem('tc_user_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (!session.settings) {
          session.settings = {};
        }
        session.settings.theme = theme;
        session.updatedAt = Date.now();
        localStorage.setItem('tc_user_session', JSON.stringify(session));
      }
    } catch (e) { /* ignore */ }

    // Update themeMode for backward compatibility
    try {
      localStorage.setItem('themeMode', theme);
    } catch (e) { /* ignore */ }

    return data;
  } catch (e) {
    logError('updateThemeSettings', e);
    // Still update localStorage even if API fails
    try {
      localStorage.setItem('themeMode', theme);
    } catch (e) { /* ignore */ }
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

    // Update localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('user_settings') || '{}');
      localStorage.setItem('user_settings', JSON.stringify({ ...existing, notifications: notificationSettings }));
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
  updateThemeSettings,
  updateNotificationSettings,
  uploadProfilePicture,
  updateProfileDescription,
};

export default userUtil;

