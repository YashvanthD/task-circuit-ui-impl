/**
 * API Client
 * Provides fetch wrappers with authentication, error handling, and response parsing.
 *
 * @module api/client
 */

import { BASE_URL } from '../config';
import { showApiErrorAlert, showErrorAlert } from '../utils/alertManager';

// ============================================================================
// Local Storage Helpers (synced with userSession)
// ============================================================================

function getAccessToken() {
  // Try userSession first
  try {
    const { userSession } = require('../utils/auth/userSession');
    if (userSession.accessToken) {
      return userSession.accessToken;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage (check both keys for compatibility)
  return localStorage.getItem('access_token') || localStorage.getItem('accessToken') || null;
}

function getRefreshToken() {
  // Try userSession first
  try {
    const { userSession } = require('../utils/auth/userSession');
    if (userSession.refreshToken) {
      return userSession.refreshToken;
    }
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage (check both keys for compatibility)
  const token = localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken');
  if (!token) return null;
  try {
    return JSON.parse(token);
  } catch {
    return token;
  }
}

function setAccessToken(token) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('accessToken', token); // Keep both for compatibility

  // Also update userSession
  try {
    const { userSession } = require('../utils/auth/userSession');
    userSession.updateAccessToken(token);
  } catch (e) { /* userSession not ready */ }
}

// ============================================================================
// Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  static fromResponse(res, data) {
    const message = data?.message || data?.error || `API Error: ${res.status}`;
    return new ApiError(message, res.status, data);
  }
}

export class NetworkError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// ============================================================================
// URL Building
// ============================================================================

/**
 * Build full URL for API requests.
 * @param {string} url - Endpoint URL (relative or absolute)
 * @returns {string} Full URL
 */
export function buildApiUrl(url) {
  if (url.startsWith('http')) return url;

  const preferRelativeProxy = typeof process !== 'undefined' &&
    process.env?.NODE_ENV === 'development';

  const normalizedUrl = url.startsWith('/') ? url : '/' + url;
  // console.debug('API URL:',preferRelativeProxy, BASE_URL, preferRelativeProxy ? normalizedUrl : `${BASE_URL}${normalizedUrl}`);
  return preferRelativeProxy ? normalizedUrl : `${BASE_URL}${normalizedUrl}`;
}

// ============================================================================
// Case Conversion Utilities
// ============================================================================

/**
 * Convert snake_case to camelCase
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Recursively convert object keys from snake_case to camelCase
 * @param {any} obj - Object, array, or primitive to convert
 * @returns {any} Converted object with camelCase keys
 */
export function camelizeKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => camelizeKeys(item));
  }

  const camelized = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    camelized[camelKey] = camelizeKeys(value);
  }
  return camelized;
}

/**
 * Recursively convert object keys from camelCase to snake_case
 * @param {any} obj - Object, array, or primitive to convert
 * @returns {any} Converted object with snake_case keys
 */
export function snakifyKeys(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => snakifyKeys(item));
  }

  const snakified = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    snakified[snakeKey] = snakifyKeys(value);
  }
  return snakified;
}

// ============================================================================
// JSON Parsing
// ============================================================================

/**
 * Safely parse JSON from a response.
 */
export async function safeJsonParse(res) {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ============================================================================
// Token Refresh Handler
// ============================================================================

let isRefreshing = false;
let refreshPromise = null;

async function handleTokenRefresh() {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        return false;
      }

      const res = await fetch(buildApiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'refresh_token', token: refreshTokenValue }),
      });

      if (res.ok) {
        const data = await res.json();
        // Support both snake_case and camelCase from backend
        const accessToken = data.access_token || data.accessToken;
        if (accessToken) {
          setAccessToken(accessToken);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================================
// Main API Fetch
// ============================================================================

/**
 * Main API fetch wrapper with auth handling.
 * By default, automatically camelizes JSON response keys (snake_case -> camelCase).
 *
 * @param {string} url - endpoint URL
 * @param {object} options - fetch options
 * @param {boolean} options.skipAuth - Skip adding auth header (for public APIs, default: false)
 * @param {boolean} options.skipCamelize - Skip camelizing response keys (default: false, meaning camelize by default)
 * @returns {Promise<Response>} fetch response with camelized .json() method (unless skipCamelize=true)
 *
 * @example
 * // Returns Response with camelized .json() by default
 * const res = await apiFetch('/api/user/profile');
 * const data = await res.json(); // camelized keys
 *
 * @example
 * // Skip camelization if needed
 * const res = await apiFetch('/api/user/profile', { skipCamelize: true });
 * const data = await res.json(); // original snake_case keys
 */
export async function apiFetch(url, options = {}) {
  const fullUrl = buildApiUrl(url);

  const { skipAuth, skipCamelize = true, ...restOptions } = options;
  const opts = { ...restOptions };
  opts.headers = { ...opts.headers };

  // Default to JSON accept
  if (!opts.headers['Accept']) {
    opts.headers['Accept'] = 'application/json';
  }

  // Add auth token (unless skipAuth is true)
  if (!skipAuth) {
    const token = getAccessToken();

    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let res;
  try {
    res = await fetch(fullUrl, opts);
  } catch (err) {
    console.error('[API] Network error:', err);
    showErrorAlert('Failed to connect to server. Please check your network connection.', 'Network Error');
    throw new NetworkError('Failed to connect to server', err);
  }

  // Handle 401 - attempt token refresh
  if (res.status === 401) {
    const refreshed = await handleTokenRefresh();
    if (refreshed) {
      // Retry with new token
      const newToken = getAccessToken();
      if (newToken) {
        opts.headers['Authorization'] = `Bearer ${newToken}`;
      }
      try {
        res = await fetch(fullUrl, opts);
      } catch (err) {
        showErrorAlert('Failed to connect after token refresh', 'Network Error');
        throw new NetworkError('Failed to connect on retry', err);
      }
    } else {
      // Token refresh failed
      showErrorAlert('Your session has expired. Please login again.', 'Session Expired');
    }
  }

  // Handle non-ok responses (except 401 which is handled above)
  if (!res.ok && res.status !== 401) {
    // Try to get error message from response
    try {
      const errorData = await safeJsonParse(res);
      const errorMessage = errorData?.message || errorData?.error || errorData?.detail ||
                          `Request failed with status ${res.status}`;

      let title = 'Error';
      switch (res.status) {
        case 400: title = 'Bad Request'; break;
        case 403: title = 'Access Denied'; break;
        case 404: title = 'Not Found'; break;
        case 409: title = 'Conflict'; break;
        case 422: title = 'Validation Error'; break;
        case 429: title = 'Too Many Requests'; break;
        case 500: title = 'Server Error'; break;
        case 502: title = 'Bad Gateway'; break;
        case 503: title = 'Service Unavailable'; break;
        default: title = `Error ${res.status}`;
      }

      // Show error popup (unless explicitly disabled via options)
      if (options.showErrors !== false) {
        showErrorAlert(errorMessage, title);
      }
    } catch (parseErr) {
      // If we can't parse the error, show a generic message
      if (options.showErrors !== false) {
        showErrorAlert(`Request failed with status ${res.status}`, `Error ${res.status}`);
      }
    }
  }

  // Auto-camelize JSON responses if requested (default: true)
  if (!skipCamelize && res.ok && res.headers.get('content-type')?.includes('application/json')) {
    const originalJson = res.json.bind(res);
    res.json = async function() {
      const data = await originalJson();
      return camelizeKeys(data);
    };
  }

  return res;
}

/**
 * API fetch with automatic JSON parsing and key transformation.
 * By default, converts all snake_case keys to camelCase for JavaScript convention.
 *
 * @param {string} url - endpoint URL
 * @param {object} options - fetch options
 * @param {boolean} options.showErrors - Whether to show error alerts (default: true)
 * @param {boolean} options.skipCamelize - Skip camelizing response keys (default: false, meaning camelize by default)
 * @param {boolean} options.skipAuth - Skip adding auth header (default: false)
 * @returns {Promise<object>} Parsed JSON with camelCase keys (unless skipCamelize=true)
 *
 * @example
 * // Returns camelized response by default
 * const data = await apiJsonFetch('/api/user/profile');
 * // data.userKey, data.displayName, etc.
 *
 * @example
 * // Skip camelization if needed
 * const data = await apiJsonFetch('/api/user/profile', { skipCamelize: true });
 * // data.user_key, data.display_name, etc.
 */
export async function apiJsonFetch(url, options = {}) {
  const { showErrors = true, skipCamelize = false, ...fetchOptions } = options;
  const res = await apiFetch(url, { ...fetchOptions, skipCamelize });
  const data = await safeJsonParse(res);

  if (!res.ok) {
    const error = ApiError.fromResponse(res, data);
    if (showErrors) {
      showApiErrorAlert(error);
    }
    throw error;
  }

  // Note: camelization already happened in apiFetch if skipCamelize=false
  return data;
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Extract data from various API response shapes.
 */
export function extractResponseData(response, key = null) {
  if (!response) return null;
  if (Array.isArray(response)) return response;

  if (key) {
    if (Array.isArray(response[key])) return response[key];
    if (response.data?.[key]) return response.data[key];
  }

  if (response.data !== undefined) {
    if (Array.isArray(response.data)) return response.data;
    if (response.data?.items) return response.data.items;
    return response.data;
  }

  if (response.items) return response.items;
  if (response.results) return response.results;

  return response;
}

export default {
  apiFetch,
  apiJsonFetch,
  safeJsonParse,
  buildApiUrl,
  extractResponseData,
  camelizeKeys,
  snakifyKeys,
  ApiError,
  NetworkError,
};

