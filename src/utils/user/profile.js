/**
 * User Profile Utilities
 * Handles user profile operations (get, update, photo, etc.).
 *
 * @module utils/user/profile
 */

import { userApi } from '../../api';

/**
 * Simple logError function
 */
function logError(context, error) {
  console.error(`[${context}]`, error);
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
 * Normalize user data from API response to consistent field names
 * @param {object} userData - Raw user data from API
 * @returns {object} Normalized user data
 */
export function normalizeUserData(userData) {
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
 * Refresh user session with fresh data from API.
 * Call this after any profile update to ensure cache is in sync.
 * @returns {Promise<object|null>} Updated user data
 */
export async function refreshUserSession() {
  try {
    // Fetch fresh profile from API
    const res = await userApi.getProfile();
    const data = await parseResponse(res);

    // Extract user from response - API returns { data: { user: {...} } }
    const rawUserData = data?.data?.user || data?.user || data?.data || data;

    if (rawUserData) {
      // Normalize the user data
      const userData = normalizeUserData(rawUserData);

      // Update userSession with fresh data
      try {
        const { userSession } = require('../auth/userSession');
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
 * @param {boolean} forceApi - Force API call even if userSession has data
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser(forceApi = false) {
  // Get user data from userSession (cached from login)
  let sessionUser = null;
  try {
    const { userSession } = require('../auth/userSession');
    sessionUser = userSession.user;
  } catch (e) {
    // userSession not available
  }

  // If forcing API or no session user, fetch from API
  if (forceApi || !sessionUser) {
    try {
      const res = await userApi.getProfile();
      const data = await parseResponse(res);

      // Extract user from response - API returns { data: { user: {...} } }
      let userData = data?.data?.user || data?.user || data?.data || data;

      if (userData) {
        // Normalize field names from API response
        const normalizedUser = normalizeUserData(userData);

        // Update session with fresh data
        try {
          const { userSession } = require('../auth/userSession');
          userSession.updateProfile(normalizedUser);
        } catch (e) { /* ignore */ }

        // Merge: API data takes full precedence, session fills gaps
        if (sessionUser) {
          return { ...sessionUser, ...normalizedUser };
        }

        return normalizedUser;
      }
    } catch (e) {
      logError('getCurrentUser', e);
      return sessionUser;
    }
  }

  // Have session user and not forcing API - return session but refresh in background
  if (sessionUser) {
    // Fire and forget background refresh
    (async () => {
      try {
        const res = await userApi.getProfile();
        if (res) {
          const data = await parseResponse(res);
          const userData = data?.data?.user || data?.user || data?.data || data;
          if (userData) {
            const normalizedUser = normalizeUserData(userData);
            try {
              const { userSession } = require('../auth/userSession');
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
 * Update current user's email.
 * @param {string} newEmail - New email address
 * @returns {Promise<object>}
 * @throws {Error} On API failure
 */
export async function updateUserEmail(newEmail) {
  try {
    const res = await userApi.updateProfile({ email: newEmail });
    const data = await parseResponse(res);
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
    const res = await userApi.updateProfile({ mobile: newMobile, phone: newMobile });
    const data = await parseResponse(res);
    const updatedUser = await refreshUserSession();
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
    const res = await userApi.updatePassword(payload);
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
    const res = await userApi.updateProfile({ username: newUsername });
    const data = await parseResponse(res);
    await refreshUserSession();
    return data;
  } catch (e) {
    logError('updateUsername', e);
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
    const res = await userApi.uploadProfilePicture(file);
    const data = await parseResponse(res);
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
    const res = await userApi.updateProfile({ description });
    const data = await parseResponse(res);
    await refreshUserSession();
    return data;
  } catch (e) {
    logError('updateProfileDescription', e);
    throw e;
  }
}

export default {
  normalizeUserData,
  refreshUserSession,
  getCurrentUser,
  updateUserEmail,
  updateUserMobile,
  updateUserPassword,
  updateUsername,
  uploadProfilePicture,
  updateProfileDescription,
};

