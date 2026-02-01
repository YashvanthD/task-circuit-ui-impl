/**
 * User Storage Service
 * Handles localStorage operations for users with offline support
 *
 * @module services/userStorage
 */

const STORAGE_KEY_USERS = 'tc_users';
const STORAGE_KEY_CURRENT_USER = 'tc_current_user';

/**
 * Get all users from localStorage
 * @returns {Array}
 */
export function getUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[userStorage] Failed to get users:', error);
    return [];
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object|null}
 */
export function getUserById(userId) {
  const users = getUsers();
  return users.find(u => u.user_key === userId || u.id === userId) || null;
}

/**
 * Get users by role
 * @param {string} role - Role (admin, manager, user)
 * @returns {Array}
 */
export function getUsersByRole(role) {
  const users = getUsers();
  return users.filter(u => u.role === role || (u.roles && u.roles.includes(role)));
}

/**
 * Get current logged-in user
 * @returns {Object|null}
 */
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[userStorage] Failed to get current user:', error);
    return null;
  }
}

/**
 * Set current logged-in user
 * @param {Object} user - User object (can be User model instance)
 */
export function setCurrentUser(user) {
  try {
    const userData = user.toJSON ? user.toJSON() : user;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userData));
    console.log('[userStorage] Current user set:', userData.user_key || userData.id);
  } catch (error) {
    console.error('[userStorage] Failed to set current user:', error);
  }
}

/**
 * Clear current user (logout)
 */
export function clearCurrentUser() {
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    console.log('[userStorage] Current user cleared');
  } catch (error) {
    console.error('[userStorage] Failed to clear current user:', error);
  }
}

/**
 * Save user to localStorage
 * @param {Object} user - User object (can be User model instance)
 */
export function saveUser(user) {
  try {
    const users = getUsers();
    const userData = user.toJSON ? user.toJSON() : user;
    const userId = userData.user_key || userData.id;

    const existingIndex = users.findIndex(u =>
      (u.user_key === userId || u.id === userId)
    );

    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    console.log('[userStorage] User saved:', userId);
  } catch (error) {
    console.error('[userStorage] Failed to save user:', error);
  }
}

/**
 * Update user in localStorage
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 */
export function updateUser(userId, updates) {
  try {
    const users = getUsers();
    const index = users.findIndex(u => u.user_key === userId || u.id === userId);

    if (index >= 0) {
      users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      console.log('[userStorage] User updated:', userId);

      // Update current user if it's the same
      const currentUser = getCurrentUser();
      if (currentUser && (currentUser.user_key === userId || currentUser.id === userId)) {
        setCurrentUser(users[index]);
      }
    }
  } catch (error) {
    console.error('[userStorage] Failed to update user:', error);
  }
}

/**
 * Delete user from localStorage
 * @param {string} userId - User ID
 */
export function deleteUser(userId) {
  try {
    const users = getUsers();
    const filtered = users.filter(u => u.user_key !== userId && u.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));
    console.log('[userStorage] User deleted:', userId);
  } catch (error) {
    console.error('[userStorage] Failed to delete user:', error);
  }
}

/**
 * Sync users from API response to localStorage
 * @param {Array} apiUsers - Users from API
 */
export function syncUsersFromAPI(apiUsers) {
  try {
    if (!Array.isArray(apiUsers)) {
      console.warn('[userStorage] syncUsersFromAPI: expected array');
      return;
    }

    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(apiUsers));
    console.log('[userStorage] Synced', apiUsers.length, 'users from API');
  } catch (error) {
    console.error('[userStorage] Failed to sync users:', error);
  }
}

/**
 * Clear all users from localStorage (but keep current user)
 */
export function clearAllUsers() {
  try {
    localStorage.removeItem(STORAGE_KEY_USERS);
    console.log('[userStorage] All users cleared');
  } catch (error) {
    console.error('[userStorage] Failed to clear users:', error);
  }
}

/**
 * Complete logout - clear all user data
 */
export function logout() {
  try {
    clearCurrentUser();
    clearAllUsers();
    console.log('[userStorage] Logout complete');
  } catch (error) {
    console.error('[userStorage] Failed to logout:', error);
  }
}

export default {
  getUsers,
  getUserById,
  getUsersByRole,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  saveUser,
  updateUser,
  deleteUser,
  syncUsersFromAPI,
  clearAllUsers,
  logout
};
