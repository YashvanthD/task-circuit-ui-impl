/**
 * Fish API Module
 * Fish species-related API calls.
 * Updated to use /api/fish/species endpoints
 *
 * @module api/fish
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_FISH, API_PUBLIC } from './constants';

/**
 * List all fish species
 */
export async function listFish(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_FISH.SPECIES}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * List public fish (no authentication required)
 */
export async function listPublicFish(accountKey = null) {
  const params = accountKey ? `?account_key=${accountKey}` : '';
  return apiFetch(`${API_PUBLIC.BASE}/fish/species${params}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    skipAuth: true,
  });
}

/**
 * Get fish species by ID
 */
export async function getFish(fishId) {
  return apiFetch(API_FISH.SPECIES_DETAIL(fishId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create new fish species
 */
export async function createFish(data) {
  return apiFetch(API_FISH.SPECIES_CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Update fish species
 */
export async function updateFish(fishId, data) {
  return apiFetch(API_FISH.SPECIES_UPDATE(fishId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete fish species
 */
export async function deleteFish(fishId) {
  return apiFetch(API_FISH.SPECIES_DELETE(fishId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

// Note: Analytics and Fields endpoints are not available in the new species API
// Removed: getAnalytics() and getFields()

const fishApi = {
  listFish,
  listPublicFish,
  getFish,
  createFish,
  addFish: createFish,  // Alias for backward compatibility
  updateFish,
  deleteFish,
};

export default fishApi;

