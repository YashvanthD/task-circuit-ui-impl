/**
 * Permission and Role Utilities
 * Centralizes all permission checking and user role detection.
 *
 * @module utils/auth/permissions
 */

/**
 * Role levels for permission hierarchy
 */
export const ROLE_LEVELS = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
};

/**
 * Extract the user object from various response shapes.
 * @param {object} u - User data in any shape
 * @returns {object|null}
 */
export function extractUser(u) {
  if (!u) return null;
  if (u.user && typeof u.user === 'object') return u.user;
  if (u.data && u.data.user && typeof u.data.user === 'object') return u.data.user;
  return u;
}

/**
 * Get the user's role as a normalized lowercase string.
 * @param {object} u - User data
 * @returns {string|null}
 */
export function getUserRole(u) {
  const user = extractUser(u);
  if (!user) return null;

  if (user.permission && typeof user.permission === 'object') {
    if (user.permission.name) return String(user.permission.name).toLowerCase();
    if (user.permission.level) return String(user.permission.level).toLowerCase();
  }

  if (user.role) return String(user.role).toLowerCase();
  if (typeof user.permissions === 'string') return user.permissions.toLowerCase();
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return String(user.roles[0]).toLowerCase();
  }

  return null;
}

/**
 * Get all roles for a user as an array.
 * @param {object} u - User data
 * @returns {string[]}
 */
export function getUserRoles(u) {
  const user = extractUser(u);
  if (!user) return [];

  const roles = [];

  if (Array.isArray(user.roles)) {
    roles.push(...user.roles.map(r => String(r).toLowerCase()));
  }

  if (user.role) {
    const role = String(user.role).toLowerCase();
    if (!roles.includes(role)) roles.push(role);
  }

  if (typeof user.permissions === 'string') {
    const perm = user.permissions.toLowerCase();
    if (!roles.includes(perm)) roles.push(perm);
  }

  if (user.permission && typeof user.permission === 'object' && user.permission.name) {
    const name = String(user.permission.name).toLowerCase();
    if (!roles.includes(name)) roles.push(name);
  }

  return roles;
}

/**
 * Check if user has admin role.
 * @param {object} u - User data
 * @returns {boolean}
 */
export function is_admin(u) {
  const roles = getUserRoles(u);
  return roles.some(r => r.includes('admin'));
}

/**
 * Check if user has manager role.
 * @param {object} u - User data
 * @returns {boolean}
 */
export function is_manager(u) {
  const roles = getUserRoles(u);
  return roles.some(r => r.includes('manager') || r.includes('admin'));
}

/**
 * Check if user has a specific role.
 * @param {object} u - User data
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(u, role) {
  if (!role) return false;
  const roles = getUserRoles(u);
  return roles.some(r => r.includes(role.toLowerCase()));
}

/**
 * Check if user has any of the specified roles.
 * @param {object} u - User data
 * @param {string[]} requiredRoles - Roles to check
 * @returns {boolean}
 */
export function hasAnyRole(u, requiredRoles) {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) return true;
  return requiredRoles.some(role => hasRole(u, role));
}

/**
 * Get permission level as a number.
 * @param {object} u - User data
 * @returns {number}
 */
export function getPermissionLevel(u) {
  if (is_admin(u)) return 100;
  if (is_manager(u)) return 50;
  if (!extractUser(u)) return 0;
  return 10;
}

/**
 * Normalize a user object for consistent access.
 * @param {object} u - Raw user data
 * @returns {object}
 */
export function normalizeUser(u) {
  const user = extractUser(u);
  if (!user) return null;

  return {
    ...user,
    id: user.id || user._id || user.userId || user.user_id || user.userKey || user.user_key,
    displayName: user.display_name || user.displayName || user.fullName || user.full_name || user.name || user.username || user.email,
    email: user.email || user.email_address || user.emailAddress,
    username: user.username || user.user_name || user.userName,
    roles: getUserRoles(u),
    isAdmin: is_admin(u),
    isManager: is_manager(u),
    permissionLevel: getPermissionLevel(u),
  };
}

