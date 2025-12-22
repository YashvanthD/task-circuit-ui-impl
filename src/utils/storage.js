import { BASE_URL } from '../config';
import { LOGIN_ENDPOINT, GET_USER_ENDPOINT } from '../endpoints';

/**
 * Utility functions for localStorage and sessionStorage.
 */

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
  return value ? JSON.parse(value) : null;
}

/**
 * Remove data from localStorage.
 * @param {string} key
 */
export function removeFromLocalStorage(key) {
  localStorage.removeItem(key);
}

/**
 * Get the refresh token from localStorage.
 * @returns {string|null}
 */
export function getRefreshToken() {
  return localStorage.getItem('refresh_token') || null;
}

/**
 * Save user info (full login response) to localStorage.
 * @param {object} userInfo
 */
export function saveUserToLocalStorage(userInfo) {
  localStorage.setItem('user', JSON.stringify(userInfo));
}

/**
 * Load user data from localStorage.
 * @returns {object|null}
 */
export function loadUserFromLocalStorage() {
  const value = localStorage.getItem('user');
  return value ? JSON.parse(value) : null;
}

/**
 * Remove user data from localStorage.
 */
export function removeUserFromLocalStorage() {
  localStorage.removeItem('user');
}

/**
 * Get the access token from localStorage.
 * @returns {string|null}
 */
export function getAccessToken() {
  const token = localStorage.getItem('access_token') || null;
  debugLog('Access token accessed', token);
  return token;
}

let accessTokenRefreshTimer = null;

/**
 * Start robust access token management: schedules refresh before expiry, avoids duplicate timers.
 * Call this after login or app start.
 */
export function startAccessTokenManagement() {
  clearAccessTokenManagement();
  const expiry = getAccessTokenExpiry();
  let msUntilRefresh = expiry ? (expiry - Date.now() - 2 * 60 * 1000) : (30 * 60 * 1000); // 2 min before expiry or 30min fallback
  if (msUntilRefresh < 0) msUntilRefresh = 0;
  accessTokenRefreshTimer = setTimeout(async () => {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      startAccessTokenManagement(); // Reschedule with new expiry
    } else {
      // Optionally, handle refresh failure (e.g., force logout)
    }
  }, msUntilRefresh);
}

/**
 * Clear the access token refresh timer. Call on logout.
 */
export function clearAccessTokenManagement() {
  if (accessTokenRefreshTimer) {
    clearTimeout(accessTokenRefreshTimer);
    accessTokenRefreshTimer = null;
  }
}

/**
 * Save access token and expiry to localStorage, and reschedule refresh timer.
 * @param {string} accessToken
 * @param {number} expiresIn - seconds until expiry
 */
export function saveAccessToken(accessToken, expiresIn) {
  localStorage.setItem('access_token', accessToken);
  const expiry = Date.now() + expiresIn * 1000;
  localStorage.setItem('access_token_expiry', expiry.toString());
  debugLog('Access token regenerated and saved', { accessToken, expiresIn, expiry });
  startAccessTokenManagement(); // Reschedule timer on new token
}

/**
 * Set access token expiry in localStorage and reschedule timer.
 * @param {number} expiryTimestampMs
 */
export function setAccessTokenExpiry(expiryTimestampMs) {
  localStorage.setItem('access_token_expiry', expiryTimestampMs.toString());
  debugLog('Access token expiry updated', { expiryTimestampMs });
  startAccessTokenManagement();
}

/**
 * Get access token expiry timestamp (ms).
 * @returns {number|null}
 */
export function getAccessTokenExpiry() {
  const expiry = localStorage.getItem('access_token_expiry');
  return expiry ? parseInt(expiry, 10) : null;
}

/**
 * Check if access token is expired or about to expire (within 2 min).
 * @returns {boolean}
 */
export function isAccessTokenExpiringSoon() {
  const expiry = getAccessTokenExpiry();
  if (!expiry) return true;
  // 2 min before expiry
  return Date.now() > (expiry - 2 * 60 * 1000);
}

/**
 * Schedule access token refresh before expiry.
 * @param {function} refreshFn - function to call to refresh token
 */
export function scheduleAccessTokenRefresh(refreshFn) {
  const expiry = getAccessTokenExpiry();
  if (!expiry) return;
  const msUntilRefresh = expiry - Date.now() - 2 * 60 * 1000; // 2 min before expiry
  if (msUntilRefresh > 0) {
    setTimeout(refreshFn, msUntilRefresh);
  } else {
    refreshFn();
  }
}

/**
 * Refresh access token using refresh token API.
 * Calls /auth/token with refresh_token and updates access_token in localStorage.
 * @returns {Promise<boolean>} true if refreshed, false otherwise
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    debugLog('No refresh token found, cannot refresh access token');
    return false;
  }
  debugLog('Calling API: /auth/token to refresh access token', { refreshToken });
  try {
    const res = await fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'refresh_token', token: refreshToken, expires_in: 3600 })
    });
    debugLog('API response: /auth/token', { status: res.status });
    const data = await res.json();
    debugLog('API response data: /auth/token', data);
    if (res.ok && data.access_token && data.expires_in) {
      saveAccessToken(data.access_token, data.expires_in);
      return true;
    }
    return false;
  } catch (err) {
    debugLog('API error: /auth/token', err);
    return false;
  }
}

/**
 * Validate the current access token using /auth/validate API.
 * Returns { valid: boolean, expiry: number|null }
 */
export async function validateAccessToken() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    debugLog('No access token found, cannot validate');
    return { valid: false, expiry: null };
  }
  debugLog('Calling API: /auth/validate to validate access token', { accessToken });
  try {
    const res = await fetch(`${BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    debugLog('API response: /auth/validate', { status: res.status });
    const data = await res.json();
    debugLog('API response data: /auth/validate', data);
    let expiry = null;
    if (data.expiry) {
      expiry = typeof data.expiry === 'number' && data.expiry > 10000000000 ? data.expiry : data.expiry * 1000;
    }
    return { valid: res.ok && data.success === true, expiry };
  } catch (err) {
    debugLog('API error: /auth/validate', err);
    return { valid: false, expiry: null };
  }
}

/**
 * NOTE: Do NOT call validateAccessToken automatically in getAccessToken or any token getter.
 * Token validation and refresh should only be handled by scheduler/timer logic, not on every token access.
 * This avoids unnecessary API calls and ensures efficient token management.
 */

/**
 * Automatically refresh access token every 30 minutes, or reschedule using expiry from validator.
 */
export function startPeriodicAccessTokenRefresh() {
  async function periodicRefresh() {
    const { valid, expiry } = await validateAccessToken();
    if (expiry) {
      setAccessTokenExpiry(expiry);
    }
    if (!valid) {
      await refreshAccessToken();
    }
    // Reschedule using expiry if available, else fallback to 30min
    let msUntilNext = expiry ? (expiry - Date.now() - 2 * 60 * 1000) : (30 * 60 * 1000);
    if (msUntilNext < 0) msUntilNext = 0;
    setTimeout(periodicRefresh, msUntilNext);
  }
  setTimeout(periodicRefresh, 30 * 60 * 1000);
}

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
 * Process login response: extract expiry from access_token, store tokens, user info, and start token management.
 * @param {object} loginResponse
 */
export function processLoginResponse(loginResponse) {
  if (!loginResponse || !loginResponse.data || !loginResponse.data.accessToken || !loginResponse.data.refreshToken) return;
  const payload = parseJwt(loginResponse.data.accessToken);
  let expiresIn = 3600; // default 1 hour
  if (payload && payload.exp) {
    const nowSec = Math.floor(Date.now() / 1000);
    expiresIn = payload.exp - nowSec;
    if (expiresIn < 0) expiresIn = 0;
  }
  saveAccessToken(loginResponse.data.accessToken, expiresIn);
  saveToLocalStorage('refresh_token', loginResponse.data.refreshToken);
  saveUserToLocalStorage(loginResponse.data);
}

/**
 * Save tasks and last fetch time to localStorage.
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
 * Get last fetch time for tasks (ms).
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

function debugLog(msg, ...args) {
  const now = new Date().toISOString();
  console.log(`[${now}] [Token/API Debug]`, msg, ...args);
}

/**
 * Handle 401 Unauthorized responses: validate access token, refresh if needed, force logout if expired.
 * @param {function} forceLogout - callback to force logout and redirect to login
 * @returns {Promise<boolean>} true if recovered, false if forced logout
 */
export async function handle401(forceLogout) {
  debugLog('401 detected: validating access token');
  const { valid, expiry } = await validateAccessToken();
  if (valid) {
    debugLog('Access token is valid after validation');
    return true;
  }
  debugLog('Access token invalid, attempting refresh');
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    debugLog('Access token refreshed successfully');
    return true;
  }
  debugLog('Refresh token expired or refresh failed, forcing logout');
  clearAccessTokenManagement();
  removeUserFromLocalStorage();
  removeFromLocalStorage('access_token');
  removeFromLocalStorage('refresh_token');
  removeFromLocalStorage('access_token_expiry');
  clearTasksFromLocalStorage();
  if (typeof forceLogout === 'function') forceLogout();
  return false;
}
