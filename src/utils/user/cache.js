/**
 * User Cache Utilities
 * Handles user data caching in localStorage.
 *
 * @module utils/user/cache
 */

const USERS_CACHE_KEY = 'tc_cache_users';
const SESSION_KEY = 'tc_user_session';

/**
 * Read users cache from localStorage.
 * @returns {object} Cache object (userKey -> user)
 */
export function readUsersCache() {
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
export function writeUsersCache(obj) {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Ignore storage errors
  }
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
 * Get session from localStorage.
 * @returns {object|null}
 */
export function getSession() {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Update session in localStorage.
 * @param {object} updates - Partial session updates
 */
export function updateSession(updates) {
  try {
    const session = getSession() || {};
    const updated = { ...session, ...updates, updatedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Get settings from session cache.
 * @returns {object}
 */
export function getSettingsFromCache() {
  const session = getSession();
  return session?.settings || {};
}

/**
 * Update settings in session cache.
 * @param {object} settings - Settings to merge
 */
export function updateSettingsInCache(settings) {
  if (!settings) return;

  try {
    const session = getSession() || {};
    session.settings = { ...session.settings, ...settings };
    session.updatedAt = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    // Ignore storage errors
  }
}

export default {
  readUsersCache,
  writeUsersCache,
  clearUsersCache,
  getSession,
  updateSession,
  getSettingsFromCache,
  updateSettingsInCache,
};

