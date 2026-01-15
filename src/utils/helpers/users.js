/**
 * User Helper Functions
 * Business logic and utilities for user management operations.
 *
 * @module utils/helpers/users
 */

import { USER_ROLES, USER_ROLE_CONFIG, USER_STATUS } from '../../constants';

// ============================================================================
// User ID Resolution
// ============================================================================

/**
 * Resolve user ID from various possible field names.
 * @param {Object} user - User object
 * @returns {string|undefined}
 */
export function resolveUserId(user) {
  if (!user) return undefined;
  const rawId = user.userId || user.user_id || user.user_key || user.id || user._id;
  return rawId != null ? String(rawId) : undefined;
}

// ============================================================================
// User Role Helpers
// ============================================================================

/**
 * Get role configuration (colors, labels, icons).
 * @param {string} role - User role
 * @returns {Object}
 */
export function getUserRoleConfig(role) {
  return USER_ROLE_CONFIG[role] || USER_ROLE_CONFIG[USER_ROLES.VIEWER];
}

/**
 * Get role style for UI components.
 * @param {string} role - User role
 * @returns {Object} Style object
 */
export function getUserRoleStyle(role) {
  const config = getUserRoleConfig(role);
  return {
    backgroundColor: config.bg,
    color: config.color,
  };
}

/**
 * Check if user is admin.
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isUserAdmin(user) {
  return user?.role === USER_ROLES.ADMIN;
}

/**
 * Check if user is manager or above.
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isUserManagerOrAbove(user) {
  return user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MANAGER;
}

/**
 * Check if user can edit other users.
 * @param {Object} currentUser - Current logged in user
 * @param {Object} targetUser - User to be edited
 * @returns {boolean}
 */
export function canEditUser(currentUser, targetUser) {
  if (!currentUser || !targetUser) return false;

  // Admin can edit anyone
  if (currentUser.role === USER_ROLES.ADMIN) return true;

  // Manager can edit operators and viewers
  if (currentUser.role === USER_ROLES.MANAGER) {
    return targetUser.role === USER_ROLES.OPERATOR || targetUser.role === USER_ROLES.VIEWER;
  }

  // Users can only edit themselves
  return resolveUserId(currentUser) === resolveUserId(targetUser);
}

// ============================================================================
// User Statistics
// ============================================================================

/**
 * Compute user statistics from a list of users.
 * @param {Array} users - List of users
 * @returns {Object} Statistics object
 */
export function computeUserStats(users) {
  return users.reduce(
    (acc, u) => {
      // Count by role
      if (u.role === USER_ROLES.ADMIN) acc.admins++;
      else if (u.role === USER_ROLES.MANAGER) acc.managers++;
      else if (u.role === USER_ROLES.OPERATOR) acc.operators++;
      else acc.viewers++;

      // Count by status
      if (u.status === USER_STATUS.ACTIVE) acc.active++;
      else if (u.status === USER_STATUS.INACTIVE) acc.inactive++;
      else acc.pending++;

      acc.total++;
      return acc;
    },
    { total: 0, admins: 0, managers: 0, operators: 0, viewers: 0, active: 0, inactive: 0, pending: 0 }
  );
}

/**
 * Count active users.
 * @param {Array} users - List of users
 * @returns {number}
 */
export function countActiveUsers(users) {
  return users.filter((u) => u.status === USER_STATUS.ACTIVE).length;
}

/**
 * Count users by role.
 * @param {Array} users - List of users
 * @param {string} role - Role to count
 * @returns {number}
 */
export function countUsersByRole(users, role) {
  return users.filter((u) => u.role === role).length;
}

// ============================================================================
// User Filtering
// ============================================================================

/**
 * Filter users by role, status, and search term.
 * @param {Array} users - List of users
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered users
 */
export function filterUsers(users, filters = {}) {
  const { role, status, searchTerm } = filters;

  return users.filter((u) => {
    // Role filter
    if (role && role !== 'all' && u.role !== role) return false;

    // Status filter
    if (status && status !== 'all' && u.status !== status) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchUsername = (u.username || '').toLowerCase().includes(term);
      const matchEmail = (u.email || '').toLowerCase().includes(term);
      const matchDepartment = (u.department || '').toLowerCase().includes(term);
      if (!matchUsername && !matchEmail && !matchDepartment) return false;
    }

    return true;
  });
}

/**
 * Sort users by various criteria.
 * @param {Array} users - List of users
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted users
 */
export function sortUsers(users, sortBy = 'username', order = 'asc') {
  const sorted = [...users].sort((a, b) => {
    const valA = String(a[sortBy] || '').toLowerCase();
    const valB = String(b[sortBy] || '').toLowerCase();

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  return order === 'desc' ? sorted.reverse() : sorted;
}

// ============================================================================
// User Validation
// ============================================================================

/**
 * Validate user form data.
 * @param {Object} form - User form data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateUserForm(form) {
  const errors = {};

  if (!form.username?.trim()) {
    errors.username = 'Username is required';
  } else if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (!form.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
  }

  if (form.phone && !/^[\d\s\-+()]+$/.test(form.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// User Formatting
// ============================================================================

/**
 * Get user display name.
 * @param {Object} user - User object
 * @returns {string}
 */
export function getUserDisplayName(user) {
  if (!user) return 'Unknown';
  return user.username || user.email || user.user_key || 'User';
}

/**
 * Get user initials for avatar.
 * @param {Object} user - User object
 * @returns {string}
 */
export function getUserInitials(user) {
  const name = getUserDisplayName(user);
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Format user role for display.
 * @param {string} role - User role
 * @returns {string}
 */
export function formatUserRole(role) {
  const config = getUserRoleConfig(role);
  return config.label;
}

