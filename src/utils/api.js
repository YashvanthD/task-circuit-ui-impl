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
  // Always use BASE_URL for relative endpoints
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  let opts = { ...options };
  if (!opts.headers) opts.headers = {};
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
