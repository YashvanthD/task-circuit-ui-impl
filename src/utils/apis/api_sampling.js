import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';
import { API_SAMPLING } from './constants';

export async function createSampling(payload) {
  const body = Object.assign({}, payload);
  if (!body.type) {
    body.type = body.cost_enabled ? 'buy' : 'sample';
  }
  return apiFetch(API_SAMPLING.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
}

export async function listSamplings(params = {}) {
  const { fishId, pondId, startDate, endDate, limit, skip } = params || {};
  const qs = new URLSearchParams();
  if (fishId) qs.append('fish_id', fishId);
  if (pondId) qs.append('pond_id', pondId);
  if (startDate) qs.append('start_date', startDate);
  if (endDate) qs.append('end_date', endDate);
  if (limit) qs.append('limit', limit);
  if (skip) qs.append('skip', skip);

  const url = `${API_SAMPLING.LIST}${qs.toString() ? ('?' + qs.toString()) : ''}`;
  return apiFetch(url, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getSamplingsByPond(pondId) {
  return apiFetch(API_SAMPLING.BY_POND(pondId), { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getSamplingHistory(params = {}) {
  const { pondId, species, startDate, endDate, limit, skip } = params || {};
  const qs = new URLSearchParams();
  if (pondId) qs.append('pond_id', pondId);
  if (species) qs.append('species', species);
  if (startDate) qs.append('start_date', startDate);
  if (endDate) qs.append('end_date', endDate);
  if (limit) qs.append('limit', limit);
  if (skip) qs.append('skip', skip);

  const url = `${API_SAMPLING.LIST}${qs.toString() ? ('?' + qs.toString()) : ''}`;
  return apiFetch(url, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getSamplingById(id) {
  return apiFetch(API_SAMPLING.DETAIL(id), { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function updateSampling(id, payload) {
  return apiFetch(API_SAMPLING.UPDATE(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function deleteSampling(id) {
  return apiFetch(API_SAMPLING.DELETE(id), { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

export async function buySampling(payload) {
  return apiFetch(API_SAMPLING.BUY, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

const samplingApi = {
  createSampling,
  listSamplings,
  getSamplingsByPond,
  getSamplingHistory,
  getSamplingById,
  updateSampling,
  deleteSampling,
  buySampling,
};
export default samplingApi;
