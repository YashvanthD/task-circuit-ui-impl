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
        if (data.access_token) {
          setAccessToken(data.access_token);
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
 * @param {string} url - endpoint URL
 * @param {object} options - fetch options
 * @param {boolean} options.skipAuth - Skip adding auth header (for public APIs)
 * @returns {Promise<Response>} fetch response
 */
export async function apiFetch(url, options = {}) {
  const fullUrl = buildApiUrl(url);

  const { skipAuth, ...restOptions } = options;
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
        throw new NetworkError('Failed to connect on retry', err);
      }
    }
  }

  return res;
}

/**
 * API fetch with automatic JSON parsing.
 * @param {string} url - endpoint URL
 * @param {object} options - fetch options
 * @param {boolean} options.showErrors - Whether to show error alerts (default: true)
 * @returns {Promise<object>} Parsed JSON
 */
export async function apiJsonFetch(url, options = {}) {
  const { showErrors = true, ...fetchOptions } = options;
  const res = await apiFetch(url, fetchOptions);
  const data = await safeJsonParse(res);

  if (!res.ok) {
    const error = ApiError.fromResponse(res, data);
    if (showErrors) {
      showApiErrorAlert(error);
    }
    throw error;
  }

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
  ApiError,
  NetworkError,
};

