/**
 * Pond API Module
 * Pond-related API calls.
 *
 * @module api/pond
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_POND, API_POND_EVENT } from './constants';

// ============================================================================
// Pond CRUD
// ============================================================================

/**
 * List all ponds
 */
export async function listPonds(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_POND.LIST}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get pond by ID
 */
export async function getPond(pondId) {
  return apiFetch(API_POND.DETAIL(pondId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create new pond
 */
export async function createPond(data) {
  return apiFetch(API_POND.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Update pond
 */
export async function updatePond(pondId, data) {
  return apiFetch(API_POND.UPDATE(pondId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete pond
 */
export async function deletePond(pondId) {
  return apiFetch(API_POND.DELETE(pondId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

// ============================================================================
// Pond Operations
// ============================================================================

/**
 * Add daily update to pond
 */
export async function addDailyUpdate(pondId, data) {
  return apiFetch(API_POND.DAILY_UPDATE(pondId), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Get pond stats
 */
export async function getPondStats(pondId) {
  return apiFetch(API_POND.STATS(pondId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

// ============================================================================
// Pond Events
// ============================================================================

/**
 * List pond events
 */
export async function listPondEvents(pondId) {
  return apiFetch(API_POND_EVENT.BY_POND(pondId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create pond event
 */
export async function createPondEvent(data) {
  return apiFetch(API_POND_EVENT.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Update pond event
 */
export async function updatePondEvent(eventId, data) {
  return apiFetch(API_POND_EVENT.UPDATE(eventId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete pond event
 */
export async function deletePondEvent(eventId) {
  return apiFetch(API_POND_EVENT.DELETE(eventId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

const pondApi = {
  listPonds,
  getPond,
  createPond,
  updatePond,
  deletePond,
  addDailyUpdate,
  getPondStats,
  listPondEvents,
  createPondEvent,
  updatePondEvent,
  deletePondEvent,
};

export default pondApi;

