/**
 * Fish API Module
 * Fish-related API calls.
 *
 * @module api/fish
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_FISH, API_PUBLIC } from './constants';

/**
 * List all fish
 */
export async function listFish(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_FISH.LIST}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * List public fish (no authentication required)
 */
export async function listPublicFish(accountKey = null) {
  const params = accountKey ? `?account_key=${accountKey}` : '';
  return apiFetch(`${API_PUBLIC.BASE}/fish${params}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    skipAuth: true,
  });
}

/**
 * Get fish by ID
 */
export async function getFish(fishId) {
  return apiFetch(API_FISH.DETAIL(fishId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create new fish
 */
export async function createFish(data) {
  return apiFetch(API_FISH.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Update fish
 */
export async function updateFish(fishId, data) {
  return apiFetch(API_FISH.UPDATE(fishId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete fish (using DETAIL path with DELETE method)
 */
export async function deleteFish(fishId) {
  return apiFetch(API_FISH.DETAIL(fishId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get fish analytics
 */
export async function getAnalytics() {
  return apiFetch(API_FISH.ANALYTICS, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get fish fields
 */
export async function getFields() {
  return apiFetch(API_FISH.FIELDS, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

const fishApi = {
  listFish,
  listPublicFish,
  getFish,
  createFish,
  updateFish,
  deleteFish,
  getAnalytics,
  getFields,
};

export default fishApi;

