/**
 * User API Module
 * User-related API calls.
 *
 * @module api/user
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_USER } from './constants';

/**
 * Get current user profile
 */
export async function getProfile() {
  return apiFetch(API_USER.PROFILE, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Update user profile
 */
export async function updateProfile(data) {
  return apiFetch(API_USER.PROFILE, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * List all users
 */
export async function listUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_USER.LIST}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get user by ID
 */
export async function getUser(userId) {
  return apiFetch(API_USER.DETAIL(userId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create new user
 */
export async function createUser(data) {
  return apiFetch(API_USER.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Update user
 */
export async function updateUser(userId, data) {
  return apiFetch(API_USER.UPDATE(userId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  return apiFetch(API_USER.DELETE(userId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Update password
 */
export async function updatePassword(data) {
  return apiFetch(API_USER.PASSWORD, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

const userApi = {
  getProfile,
  updateProfile,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
};

export default userApi;

