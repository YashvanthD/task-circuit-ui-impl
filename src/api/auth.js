/**
 * Auth API Module
 * Authentication-related API calls.
 *
 * @module api/auth
 */

import { apiFetch } from './client';
import { API_AUTH } from './constants';

/**
 * Get auth headers with token
 */
export function getAuthHeaders({ contentType = 'application/json', accept = 'application/json', extra = {} } = {}) {
  const headers = { ...extra };
  if (contentType) headers['Content-Type'] = contentType;
  if (accept) headers['Accept'] = accept;

  // Import dynamically to avoid circular dependencies
  const token = localStorage.getItem('accessToken');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Login with credentials
 */
export async function login(credentials) {
  return apiFetch(API_AUTH.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    skipAuth: true,
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

/**
 * Get user permissions
 */
export async function getPermissions() {
  return apiFetch(API_AUTH.PERMISSIONS, {
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
  getPermissions,
  getAuthHeaders,
};

export default authApi;

