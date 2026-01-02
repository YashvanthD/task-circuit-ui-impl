import { apiFetch } from '../api';
import { getAuthHeaders } from './api_auth';

export async function createSampling(payload) {
  // Ensure the server receives a 'type' indicating whether this is a buy (cost calc enabled) or a sample
  const body = Object.assign({}, payload);
  if (!body.type) {
    body.type = body.cost_enabled ? 'buy' : 'buy';
  }
  return apiFetch('/sampling', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
}

export async function listSamplings(params = {}) {
  // Generic sampling list endpoint (do NOT map to pond activity - pond activity contains mixed event types).
  const { fishId, startDate, endDate, limit, skip } = params || {};
  const qs = new URLSearchParams();
  if (fishId) qs.append('fish_id', fishId);
  if (startDate) qs.append('start_date', startDate);
  if (endDate) qs.append('end_date', endDate);
  if (limit) qs.append('limit', limit);
  if (skip) qs.append('skip', skip);

  const url = `/sampling${qs.toString() ? ('?' + qs.toString()) : ''}`;
  let res = await apiFetch(url, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
  // if direct sampling list isn't supported, allow higher-level history endpoint as fallback
  if (res && (res.status === 404 || res.status === 405)) {
    const hist = `/sampling/history${qs.toString() ? ('?' + qs.toString()) : ''}`;
    res = await apiFetch(hist, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
    if (res && res.status === 404) {
      const url2 = `/api/sampling/history${qs.toString() ? ('?' + qs.toString()) : ''}`;
      res = await apiFetch(url2, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
    }
  }
  return res;
}

export async function getSamplingHistory(params = {}) {
  const { pondId, species, startDate, endDate, limit, skip } = params || {};
  const qs = new URLSearchParams();
  if (pondId) qs.append('pondId', pondId);
  if (species) qs.append('species', species);
  if (startDate) qs.append('startDate', startDate);
  if (endDate) qs.append('endDate', endDate);
  if (limit) qs.append('limit', limit);
  if (skip) qs.append('skip', skip);

  const url = `/sampling/history${qs.toString() ? ('?' + qs.toString()) : ''}`;
  // primary
  let res = await apiFetch(url, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
  // fallback compatibility
  if (res && res.status === 404) {
    const url2 = `/api/sampling/history${qs.toString() ? ('?' + qs.toString()) : ''}`;
    res = await apiFetch(url2, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
  }
  return res;
}

export async function getSamplingById(id) {
  return apiFetch(`/sampling/${id}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function updateSampling(id, payload) {
  return apiFetch(`/sampling/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export default { createSampling, listSamplings, getSamplingHistory, getSamplingById, updateSampling };
