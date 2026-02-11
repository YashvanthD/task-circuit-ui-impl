/**
 * Authentication Storage Utilities
 * Handles token storage, refresh, and session management.
 *
 * @module utils/auth/storage
 */

import { BASE_URL } from '../../config';

// ============================================================================
// Basic Storage Utilities
// ============================================================================

/**
 * Save data to localStorage.
 * @param {string} key
 * @param {any} value
 */
export function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Load data from localStorage.
 * @param {string} key
 * @returns {any}
 */
export function loadFromLocalStorage(key) {
  const value = localStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn(`Failed to parse localStorage key "${key}":`, value, err);
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove data from localStorage.
 * @param {string} key
 */
export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Get the refresh token from localStorage or userSession.
 * @returns {string|null}
 */
export function getRefreshToken() {
  // Try userSession first (if initialized)
  try {
    const { userSession } = require('./userSession');
    if (userSession.refreshToken) {
      return userSession.refreshToken;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage
  const token = localStorage.getItem('refresh_token');
  if (!token) return null;
  // Handle both raw string and JSON-stringified token
  try {
    return JSON.parse(token);
  } catch {
    return token;
  }
}

/**
 * Get the access token from localStorage or userSession.
 * @returns {string|null}
 */
export function getAccessToken() {
  // Try userSession first (if initialized)
  try {
    const { userSession } = require('./userSession');
    if (userSession.accessToken) {
      return userSession.accessToken;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage
  const token = localStorage.getItem('access_token') || null;
  debugLog('Access token accessed', token ? '[present]' : '[missing]');
  return token;
}

/**
 * Get access token expiry timestamp (ms) from localStorage or userSession.
 * @returns {number|null}
 */
export function getAccessTokenExpiry() {
  // Try userSession first (if initialized)
  try {
    const { userSession } = require('./userSession');
    if (userSession.tokenExpiry) {
      return userSession.tokenExpiry;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage
  const expiry = localStorage.getItem('access_token_expiry');
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Save access token and expiry to localStorage and userSession.
 * @param {string} accessToken
 * @param {number} expiresIn - seconds until expiry
 */
export function saveAccessToken(accessToken, expiresIn) {
  localStorage.setItem('access_token', accessToken);
  const expiry = Date.now() + expiresIn * 1000;
  localStorage.setItem('access_token_expiry', expiry.toString());
  debugLog('Access token saved', { expiresIn, expiry });

  // Also update userSession singleton
  try {
    const { userSession } = require('./userSession');
    userSession.updateAccessToken(accessToken, expiresIn);
  } catch (e) { /* userSession not ready */ }

  startAccessTokenManagement();
}

/**
 * Set access token expiry in localStorage.
 * @param {number} expiryTimestampMs
 */
export function setAccessTokenExpiry(expiryTimestampMs) {
  localStorage.setItem('access_token_expiry', expiryTimestampMs.toString());
  debugLog('Access token expiry updated', { expiryTimestampMs });
  startAccessTokenManagement();
}

/**
 * Check if access token is expired or about to expire (within 2 min).
 * @returns {boolean}
 */
export function isAccessTokenExpiringSoon() {
  // Try userSession first (if initialized)
  try {
    const { userSession } = require('./userSession');
    if (userSession.isAuthenticated) {
      return userSession.isTokenExpiringSoon;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage check
  const expiry = getAccessTokenExpiry();
  if (!expiry) return true;
  return Date.now() > (expiry - 2 * 60 * 1000);
}

// ============================================================================
// User Management
// ============================================================================

/**
 * Save user info to localStorage.
 * @param {object} userInfo
 */
export function saveUserToLocalStorage(userInfo) {
  localStorage.setItem('user', JSON.stringify(userInfo));
}

/**
 * Load user data from localStorage or userSession.
 * @returns {object|null}
 */
export function loadUserFromLocalStorage() {
  // Try userSession first (if initialized)
  try {
    const { userSession } = require('./userSession');
    if (userSession.user) {
      return userSession.user;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage
  return loadFromLocalStorage('user');
}

/**
 * Remove user data from localStorage.
 */
export function removeUserFromLocalStorage() {
  localStorage.removeItem('user');
}

// ============================================================================
// Task Cache
// ============================================================================

/**
 * Save tasks to localStorage.
 * @param {Array} tasks
 */
export function saveTasksToLocalStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('tasks_last_fetched', Date.now().toString());
}

/**
 * Load tasks from localStorage.
 * @returns {Array|null}
 */
export function loadTasksFromLocalStorage() {
  const value = localStorage.getItem('tasks');
  return value ? JSON.parse(value) : null;
}

/**
 * Get last fetch time for tasks.
 * @returns {number|null}
 */
export function getTasksLastFetched() {
  const value = localStorage.getItem('tasks_last_fetched');
  return value ? parseInt(value, 10) : null;
}

/**
 * Clear tasks from localStorage.
 */
export function clearTasksFromLocalStorage() {
  localStorage.removeItem('tasks');
  localStorage.removeItem('tasks_last_fetched');
}

// ============================================================================
// Token Refresh Management
// ============================================================================

let accessTokenRefreshTimer = null;
let periodicRefreshTimer = null;

/**
 * Start access token management with automatic refresh.
 */
export function startAccessTokenManagement() {
  clearAccessTokenManagement();
  const expiry = getAccessTokenExpiry();
  let msUntilRefresh = expiry ? (expiry - Date.now() - 2 * 60 * 1000) : (30 * 60 * 1000);
  if (msUntilRefresh < 0) msUntilRefresh = 0;

  accessTokenRefreshTimer = setTimeout(async () => {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      startAccessTokenManagement();
    }
  }, msUntilRefresh);
}

/**
 * Clear the access token refresh timer.
 */
export function clearAccessTokenManagement() {
  if (accessTokenRefreshTimer) {
    clearTimeout(accessTokenRefreshTimer);
    accessTokenRefreshTimer = null;
  }
}

/**
 * Start periodic access token refresh.
 */
export function startPeriodicAccessTokenRefresh() {
  stopPeriodicAccessTokenRefresh();

  async function periodicRefresh() {
    const { valid, expiry } = await validateAccessToken();
    if (expiry) setAccessTokenExpiry(expiry);
    if (!valid) await refreshAccessToken();

    let msUntilNext = expiry ? (expiry - Date.now() - 2 * 60 * 1000) : (30 * 60 * 1000);
    if (msUntilNext < 0) msUntilNext = 0;
    periodicRefreshTimer = setTimeout(periodicRefresh, msUntilNext);
  }

  periodicRefreshTimer = setTimeout(periodicRefresh, 30 * 60 * 1000);
}

/**
 * Stop the periodic access token refresh timer.
 */
export function stopPeriodicAccessTokenRefresh() {
  if (periodicRefreshTimer) {
    clearTimeout(periodicRefreshTimer);
    periodicRefreshTimer = null;
  }
}

/**
 * Refresh access token using refresh token API.
 * Also updates userSession singleton.
 * @returns {Promise<boolean>}
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    debugLog('No refresh token found');
    return false;
  }

  debugLog('Refreshing access token');
  try {
    const res = await fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'refresh_token', token: refreshToken, expires_in: 3600 })
    });

    const json = await res.json();
    // Support nested data structure: { data: { access_token: ... } } or direct { access_token: ... }
    const data = json.data || json;
    const accessToken = data.access_token || data.accessToken;
    const expiresIn = data.expires_in || data.expiresIn;
    if (res.ok && accessToken && expiresIn) {
      // saveAccessToken already syncs with userSession
      saveAccessToken(accessToken, expiresIn);
      debugLog('Access token refreshed successfully');
      return true;
    }
    debugLog('Token refresh response invalid', json);
    return false;
  } catch (err) {
    debugLog('Token refresh failed', err);
    return false;
  }
}

/**
 * Validate the current access token.
 * @returns {Promise<{valid: boolean, expiry: number|null}>}
 */
export async function validateAccessToken() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { valid: false, expiry: null };
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await res.json();
    let expiry = null;
    if (data.expiry) {
      expiry = typeof data.expiry === 'number' && data.expiry > 10000000000 ? data.expiry : data.expiry * 1000;
    }
    return { valid: res.ok && data.success === true, expiry };
  } catch (err) {
    debugLog('Token validation failed', err);
    return { valid: false, expiry: null };
  }
}

// ============================================================================
// Login/Logout Processing
// ============================================================================

/**
 * Parse a JWT and return its payload.
 * @param {string} token
 * @returns {object|null}
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Detect if user has admin role from user data.
 * @param {object} userData
 * @returns {boolean}
 */
function detectAdminFromUserData(userData) {
  if (!userData) return false;
  const user = userData.user || userData;

  if (typeof user.permissions === 'string' && user.permissions.toLowerCase().includes('admin')) return true;
  if (typeof user.role === 'string' && user.role.toLowerCase().includes('admin')) return true;
  if (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase().includes('admin'))) return true;
  if (user.permission && typeof user.permission === 'object') {
    if (typeof user.permission.name === 'string' && user.permission.name.toLowerCase().includes('admin')) return true;
    if (String(user.permission.level).toLowerCase() === 'admin') return true;
  }

  return false;
}

/**
 * Process login response: extract expiry, store tokens, user info.
 * Also initializes the UserSession singleton.
 * @param {object} loginResponse
 */
export function processLoginResponse(loginResponse) {
  if (!loginResponse || !loginResponse.data || !loginResponse.data.accessToken || !loginResponse.data.refreshToken) return;

  const payload = parseJwt(loginResponse.data.accessToken);
  let expiresIn = 3600;
  if (payload && payload.exp) {
    const nowSec = Math.floor(Date.now() / 1000);
    expiresIn = payload.exp - nowSec;
    if (expiresIn < 0) expiresIn = 0;
  }

  saveAccessToken(loginResponse.data.accessToken, expiresIn);
  saveToLocalStorage('refresh_token', loginResponse.data.refreshToken);
  saveUserToLocalStorage(loginResponse.data);
  saveToLocalStorage('is_admin', detectAdminFromUserData(loginResponse.data));

  // Also initialize UserSession singleton for new code
  try {
    const { userSession } = require('./userSession');
    userSession.initFromLoginResponse(loginResponse);
  } catch (e) {
    // UserSession may not be loaded yet during initial import
    console.debug('[processLoginResponse] Could not init userSession:', e.message);
  }

  try {
    window.dispatchEvent(new Event('authChanged'));
  } catch (e) {}
}

/**
 * Handle 401 Unauthorized responses.
 * @param {function} forceLogout - callback to force logout
 * @returns {Promise<boolean>} true if recovered, false if forced logout
 */
export async function handle401(forceLogout) {
  debugLog('401 detected: validating access token');
  const { valid } = await validateAccessToken();
  if (valid) {
    debugLog('Access token is valid');
    return true;
  }

  debugLog('Access token invalid, attempting refresh');
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    debugLog('Access token refreshed');
    return true;
  }

  debugLog('Refresh failed, forcing logout');
  clearAccessTokenManagement();
  stopPeriodicAccessTokenRefresh();

  // Clear userSession singleton
  try {
    const { userSession } = require('./userSession');
    userSession.logout();
  } catch (e) { /* userSession not ready */ }

  // Also clear legacy storage keys
  removeUserFromLocalStorage();
  removeFromLocalStorage('access_token');
  removeFromLocalStorage('refresh_token');
  removeFromLocalStorage('access_token_expiry');
  removeFromLocalStorage('is_admin');
  clearTasksFromLocalStorage();

  if (typeof forceLogout === 'function') forceLogout();
  return false;
}

// ============================================================================
// Debug Logging
// ============================================================================

function debugLog(msg, ...args) {
  const now = new Date().toISOString();
  console.log(`[${now}] [Auth]`, msg, ...args);
}

