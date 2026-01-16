/**
 * Sampling API Module
 * Sampling-related API calls.
 *
 * @module api/sampling
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_SAMPLING } from './constants';

/**
 * List all samplings
 */
export async function listSamplings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_SAMPLING.LIST}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get sampling by ID
 */
export async function getSampling(samplingId) {
  return apiFetch(API_SAMPLING.DETAIL(samplingId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create new sampling
 */
export async function createSampling(data) {
  const body = { ...data };
  if (!body.type) {
    body.type = body.cost_enabled ? 'buy' : 'sample';
  }
  return apiFetch(API_SAMPLING.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
}

/**
 * Update sampling
 */
export async function updateSampling(samplingId, data) {
  return apiFetch(API_SAMPLING.UPDATE(samplingId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete sampling
 */
export async function deleteSampling(samplingId) {
  return apiFetch(API_SAMPLING.DELETE(samplingId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Buy fish (sampling with cost)
 */
export async function buySampling(data) {
  return apiFetch(API_SAMPLING.BUY, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Get samplings by pond
 */
export async function getSamplingsByPond(pondId) {
  return apiFetch(API_SAMPLING.BY_POND(pondId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get sampling history (alias for listSamplings with filters)
 */
export async function getSamplingHistory(params = {}) {
  return listSamplings(params);
}

const samplingApi = {
  listSamplings,
  getSampling,
  createSampling,
  updateSampling,
  deleteSampling,
  buySampling,
  getSamplingsByPond,
  getSamplingHistory,
};

export default samplingApi;

