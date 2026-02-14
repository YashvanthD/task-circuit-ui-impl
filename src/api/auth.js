/**
 * Auth API Module
 * Authentication-related API calls.
 *
 * @module api/auth
 */

import { apiFetch, apiJsonFetch } from './client';
import { API_AUTH } from './constants';

/**
 * Get auth headers with token
 */
export function getAuthHeaders({ contentType = 'application/json', accept = 'application/json', extra = {} } = {}) {
  const headers = { ...extra };
  if (contentType) headers['Content-Type'] = contentType;
  if (accept) headers['Accept'] = accept;

  // Try userSession first
  let token = null;
  try {
    const { userSession } = require('../utils/auth/userSession');
    token = userSession.accessToken;
  } catch (e) { /* userSession not ready */ }

  // Fallback to localStorage (check both keys)
  if (!token) {
    token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Login with credentials
 * Returns camelized JSON response
 */
export async function login(credentials) {
  return apiJsonFetch(API_AUTH.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    skipAuth: true,
    showErrors: false, // Let LoginPage handle errors
  });
}

/**
 * Logout current user
 */
export async function logout() {
  return apiFetch(API_AUTH.LOGOUT, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

/**
 * Validate access token
 */
export async function validateToken(token) {
  return apiFetch(API_AUTH.VALIDATE, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    skipAuth: true,
  });
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshToken) {
  return apiFetch(API_AUTH.REFRESH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'refresh_token', token: refreshToken }),
    skipAuth: true,
  });
}

/**
 * Sign up new user
 */
export async function signup(data) {
  return apiFetch(API_AUTH.SIGNUP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    skipAuth: true,
  });
}

/**
 * Get current user info
 */
export async function getMe() {
  return apiFetch(API_AUTH.ME, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}


const authApi = {
  login,
  logout,
  validateToken,
  refreshToken,
  signup,
  getMe,
  getAuthHeaders,
};

export default authApi;

