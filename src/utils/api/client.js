/**
 * API Client Utilities
 * Provides fetch wrappers with authentication, error handling, and response parsing.
 *
 * @module utils/api/client
 */

import { getAccessToken, handle401 } from '../auth/storage';
import { BASE_URL } from '../../config';
import { ApiError, NetworkError, logError } from './errors';

/**
 * Safely parse JSON from a response.
 * @param {Response} res - Fetch response
 * @returns {Promise<object|null>}
 */
export async function safeJsonParse(res) {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') return null;
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

/**
 * Build full URL for API requests.
 * Uses relative URLs in development (for CRA proxy) and full URLs in production.
 * @param {string} url - Endpoint URL (relative or absolute)
 * @returns {string} Full URL
 */
export function buildApiUrl(url) {
  const isAbsolute = url.startsWith('http');
  if (isAbsolute) return url;

  const preferRelativeProxy = typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'development';

  const normalizedUrl = url.startsWith('/') ? url : '/' + url;
  return preferRelativeProxy ? normalizedUrl : `${BASE_URL}${normalizedUrl}`;
}

/**
 * Robust API fetch wrapper for authenticated requests.
 * Automatically handles 401 errors: attempts token refresh and retries once, else forces logout.
 * @param {string} url - endpoint URL (relative or absolute)
 * @param {object} options - fetch options
 * @param {function} forceLogout - callback to force logout (optional)
 * @returns {Promise<Response>} fetch response
 */
export async function apiFetch(url, options = {}, forceLogout) {
  const fullUrl = buildApiUrl(url);

  let opts = { ...options };
  if (!opts.headers) opts.headers = {};

  // Prefer JSON responses by default
  if (!opts.headers['Accept'] && !opts.headers['accept']) {
    opts.headers['Accept'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;

  console.log('[apiFetch Debug] Request URL:', fullUrl);

  let res;
  try {
    res = await fetch(fullUrl, opts);
  } catch (err) {
    logError('apiFetch', err, { url: fullUrl });
    throw new NetworkError('Failed to connect to server', err);
  }

  console.log('[apiFetch Debug] Response status:', res.status);

  // Handle 401 - attempt token refresh and retry
  if (res.status === 401) {
    const recovered = await handle401(forceLogout);
    if (recovered) {
      const newToken = getAccessToken();
      if (newToken) opts.headers['Authorization'] = `Bearer ${newToken}`;
      try {
        res = await fetch(fullUrl, opts);
        console.log('[apiFetch Debug] Retried response status:', res.status);
      } catch (err) {
        logError('apiFetch retry', err, { url: fullUrl });
        throw new NetworkError('Failed to connect to server on retry', err);
      }
    }
  }

  // Check for JSON response
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res;
  } else {
    // Not JSON, likely an error page or redirect
    const text = await res.text();
    console.log('[apiFetch Debug] Non-JSON response:', text.slice(0, 200));
    // Return a fake response object with error info
    return {
      ok: false,
      status: res.status,
      error: 'Non-JSON response',
      text,
      json: async () => ({ error: 'Non-JSON response', status: res.status, text }),
      headers: res.headers,
    };
  }
}

/**
 * Enhanced API fetch that automatically parses JSON and throws on errors.
 * Use this when you want automatic JSON parsing and consistent error handling.
 * @param {string} url - endpoint URL (relative or absolute)
 * @param {object} options - fetch options
 * @param {function} forceLogout - callback to force logout (optional)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {ApiError} On HTTP errors
 * @throws {NetworkError} On connection failures
 */
export async function apiJsonFetch(url, options = {}, forceLogout) {
  const res = await apiFetch(url, options, forceLogout);
  const data = await safeJsonParse(res);

  if (!res.ok) {
    throw ApiError.fromResponse(res, data);
  }

  return data;
}

/**
 * Normalized response handler - extracts data from various API response shapes.
 * Handles: { data: [...] }, { data: { items: [...] } }, { items: [...] }, [...]
 * @param {object} response - API response object
 * @param {string} key - Optional key to look for (e.g., 'users', 'ponds')
 * @returns {Array|object} Extracted data
 */
export function extractResponseData(response, key = null) {
  if (!response) return null;

  // Direct array
  if (Array.isArray(response)) return response;

  // Check for specific key first
  if (key) {
    if (Array.isArray(response[key])) return response[key];
    if (response.data && Array.isArray(response.data[key])) return response.data[key];
  }

  // Common patterns
  if (response.data !== undefined) {
    if (Array.isArray(response.data)) return response.data;
    if (typeof response.data === 'object') {
      // Nested data.data
      if (response.data.data !== undefined) return response.data.data;
      // data.items
      if (Array.isArray(response.data.items)) return response.data.items;
      // data.results
      if (Array.isArray(response.data.results)) return response.data.results;
      // Return the data object itself
      return response.data;
    }
    return response.data;
  }

  // Top-level items/results
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;

  // Return as-is
  return response;
}

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Login to the application.
 * @param {object} credentials - The login credentials (e.g., email and password).
 * @returns {Promise<Response>} The login response.
 */
export async function login(credentials) {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

/**
 * Validate the access token.
 * @param {string} token - The access token to validate.
 * @returns {Promise<Response>} The validation response.
 */
export async function validateToken(token) {
  return apiFetch('/auth/validate', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

/**
 * Refresh the access token.
 * @param {string} refreshToken - The refresh token.
 * @returns {Promise<Response>} The new access token.
 */
export async function refreshToken(refreshToken) {
  return apiFetch('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'refresh_token', token: refreshToken }),
  });
}

