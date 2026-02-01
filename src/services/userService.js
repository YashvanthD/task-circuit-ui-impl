/**
 * User Service
 * Handles all user-related API calls and business logic
 * With offline support via userStorage
 *
 * @module services/userService
 */

import { apiFetch } from '../api';
import { API_USER } from '../api/constants';
import { User } from '../models';
import {
  saveUser as saveToStorage,
  syncUsersFromAPI,
  getUsers as getStoredUsers,
  deleteUser as deleteFromStorage,
  setCurrentUser as setStoredCurrentUser
} from './userStorage';

/**
 * Fetch all users from API
 * @param {Object} params - Query parameters
 * @returns {Promise<User[]>}
 */
export async function fetchUsers(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch(`${API_USER.LIST}${qs ? '?' + qs : ''}`);
    const data = await res.json();

    // Handle multiple possible response structures
    let usersList = [];
    if (data.users && Array.isArray(data.users)) {
      usersList = data.users;
    } else if (data.success && data.data) {
      usersList = Array.isArray(data.data) ? data.data : [data.data];
    } else if (Array.isArray(data)) {
      usersList = data;
    }

    // Model handles all parsing via _init()
    return usersList.map(userData => new User(userData));
  } catch (error) {
    console.error('[userService] Failed to fetch users:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<User>}
 */
export async function getUserById(userId) {
  try {
    const res = await apiFetch(API_USER.DETAIL(userId));
    const data = await res.json();

    const userData = data.data || data;
    return new User(userData);
  } catch (error) {
    console.error('[userService] Failed to fetch user by ID:', error);
    throw error;
  }
}

/**
 * Get current logged-in user
 * @returns {Promise<User>}
 */
export async function getCurrentUser() {
  try {
    const res = await apiFetch(API_USER.ME);
    const data = await res.json();

    const userData = data.data || data;
    return new User(userData);
  } catch (error) {
    console.error('[userService] Failed to fetch current user:', error);
    throw error;
  }
}

/**
 * Create a new user
 * @param {Object} formData - Form data
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function createUser(formData) {
  try {
    // Use User model's fromFormData method
    const user = User.fromFormData(formData);

    // Use model's validation
    if (!user.isValid()) {
      const errors = user.errors.map(e => e.message).join(', ');
      return { success: false, error: errors };
    }

    // Use model's toAPIPayload method
    const payload = user.toAPIPayload();

    // Add password if provided
    if (formData.password) {
      payload.password = formData.password;
    }

    const res = await apiFetch(API_USER.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Model handles parsing the response
      const createdUser = new User(data.data);
      return { success: true, user: createdUser };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to create user'
      };
    }
  } catch (err) {
    console.error('[userService] Failed to create user:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update an existing user
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function updateUser(userId, updates) {
  try {
    const res = await apiFetch(API_USER.UPDATE(userId), {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Model handles parsing
      const updatedUser = new User(data.data);

      // Update in storage
      saveToStorage(updatedUser);

      return { success: true, user: updatedUser };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update user'
      };
    }
  } catch (err) {
    console.error('[userService] Failed to update user:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteUser(userId) {
  try {
    const res = await apiFetch(API_USER.DELETE(userId), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Remove from storage
      deleteFromStorage(userId);

      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to delete user'
      };
    }
  } catch (err) {
    console.error('[userService] Failed to delete user:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updatePassword(userId, oldPassword, newPassword) {
  try {
    const res = await apiFetch(API_USER.UPDATE_PASSWORD(userId), {
      method: 'PUT',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update password'
      };
    }
  } catch (err) {
    console.error('[userService] Failed to update password:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data
 * @returns {Promise<{success: boolean, user?: User, error?: string}>}
 */
export async function updateProfile(userId, profileData) {
  try {
    const res = await apiFetch(API_USER.UPDATE_PROFILE(userId), {
      method: 'PUT',
      body: JSON.stringify(profileData),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const updatedUser = new User(data.data);
      return { success: true, user: updatedUser };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update profile'
      };
    }
  } catch (err) {
    console.error('[userService] Failed to update profile:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

export default {
  fetchUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  updateProfile
};
