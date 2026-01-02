import { getAccessToken, handle401 } from './storage';
import { BASE_URL } from '../config';

/**
 * Robust API fetch wrapper for authenticated requests.
 * Automatically handles 401 errors: attempts token refresh and retries once, else forces logout.
 * @param {string} url - endpoint URL (relative or absolute)
 * @param {object} options - fetch options
 * @param {function} forceLogout - callback to force logout (optional)
 * @returns {Promise<Response>} fetch response
 */
export async function apiFetch(url, options = {}, forceLogout) {
  // Use full URL logic: if the url is absolute, use it. If running in development and a CRA proxy is present,
  // prefer a relative path so the dev server proxy forwards requests to backend and avoids CORS.
  const isAbsolute = url.startsWith('http');
  const preferRelativeProxy = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development');

  const fullUrl = isAbsolute ? url : (preferRelativeProxy ? (url.startsWith('/') ? url : '/' + url) : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`);

  let opts = { ...options };
  if (!opts.headers) opts.headers = {};
  // Prefer JSON responses by default
  if (!opts.headers['Accept'] && !opts.headers['accept']) {
    opts.headers['Accept'] = 'application/json';
  }
  const token = getAccessToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  console.log('[apiFetch Debug] Request URL:', fullUrl);
  let res = await fetch(fullUrl, opts);
  console.log('[apiFetch Debug] Response status:', res.status);
  if (res.status === 401) {
    const recovered = await handle401(forceLogout);
    if (recovered) {
      const newToken = getAccessToken();
      if (newToken) opts.headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(fullUrl, opts);
      console.log('[apiFetch Debug] Retried response status:', res.status);
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
    };
  }
}

/**
 * Login to the application.
 * @param {object} credentials - The login credentials (e.g., email and password).
 * @returns {Promise<object>} The login response.
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
 * @returns {Promise<object>} The validation response.
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
 * @returns {Promise<object>} The new access token.
 */
export async function refreshToken(refreshToken) {
  return apiFetch('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'refresh_token', token: refreshToken }),
  });
}

/**
 * Add a new fish.
 * @param {object} fishData - The data for the new fish.
 * @returns {Promise<object>} The response from the server.
 */
export async function addFish(fishData) {
  return apiFetch('/fish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fishData),
  });
}

/**
 * Get details of a specific fish.
 * @param {string} fishId - The ID of the fish.
 * @returns {Promise<object>} The fish details.
 */
export async function getFish(fishId) {
  return apiFetch(`/fish/${fishId}`, {
    method: 'GET',
  });
}

/**
 * List all fish.
 * @returns {Promise<Array>} The list of fish.
 */
export async function listFish() {
  return apiFetch('/fish', {
    method: 'GET',
  });
}

/**
 * Update a fish's details.
 * @param {string} fishId - The ID of the fish.
 * @param {object} fishData - The updated fish data.
 * @returns {Promise<object>} The response from the server.
 */
export async function updateFish(fishId, fishData) {
  return apiFetch(`/fish/${fishId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fishData),
  });
}

/**
 * Delete a fish.
 * @param {string} fishId - The ID of the fish to delete.
 * @returns {Promise<object>} The response from the server.
 */
export async function deleteFish(fishId) {
  return apiFetch(`/fish/${fishId}`, {
    method: 'DELETE',
  });
}

// Pond endpoints
/**
 * List ponds
 */
export async function listPonds() {
  return apiFetch('/pond', { method: 'GET' });
}

/**
 * Get pond details
 */
export async function getPond(pondId) {
  return apiFetch(`/pond/${pondId}`, { method: 'GET' });
}

/**
 * Add a new pond
 */
export async function addPond(pondData) {
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pondData),
  };
  // Use canonical create endpoint per API doc.
  return apiFetch('/pond/create', opts);
}

/**
 * Update a pond
 */
export async function updatePond(pondId, pondData) {
  const opts = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pondData),
  };
  // Preferred doc endpoint is /pond/update/:pond_id; fallback to /pond/:pond_id
  try {
    const res = await apiFetch(`/pond/update/${pondId}`, opts);
    const status = res && res.status;
    const nonJsonClientError = res && !res.ok && res.error === 'Non-JSON response' && status >= 400 && status < 500;
    if (res && (status === 404 || status === 405 || nonJsonClientError)) {
      console.warn('[api.updatePond] falling back to /pond/:id because /pond/update returned', status);
      return apiFetch(`/pond/${pondId}`, opts);
    }
    return res;
  } catch (err) {
    console.warn('[api.updatePond] /pond/update request failed, trying /pond/:id', err);
    return apiFetch(`/pond/${pondId}`, opts);
  }
}

/**
 * Delete a pond
 */
export async function deletePond(pondId) {
  return apiFetch(`/pond/${pondId}`, { method: 'DELETE' });
}

/**
 * Add a daily update for a pond
 */
export async function addPondDailyUpdate(pondId, updateData) {
  return apiFetch(`/pond/${pondId}/daily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
}
