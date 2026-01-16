import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';
import { API_POND, API_POND_EVENT } from './constants';

export async function listPonds() {
  return apiFetch(API_POND.LIST, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getPond(pondId) {
  return apiFetch(API_POND.DETAIL(pondId), { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function addPond(pondData) {
  return apiFetch(API_POND.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pondData),
  });
}

export async function updatePond(pondId, pondData) {
  return apiFetch(API_POND.UPDATE(pondId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(pondData),
  });
}

export async function deletePond(pondId) {
  return apiFetch(API_POND.DELETE(pondId), { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

export async function addPondDailyUpdate(pondId, updateData) {
  return apiFetch(API_POND.DAILY_UPDATE(pondId), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
}

export async function addPondEvent(pondId, eventData) {
  return apiFetch(API_POND_EVENT.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ pond_id: pondId, ...eventData }),
  });
}

export async function listPondEvents(pondId) {
  return apiFetch(API_POND_EVENT.BY_POND(pondId), { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function deletePondEvent(eventId) {
  return apiFetch(API_POND_EVENT.DELETE(eventId), { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

export async function updatePondEvent(eventId, data) {
  return apiFetch(API_POND_EVENT.UPDATE(eventId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

const pondApi = {
  listPonds,
  getPond,
  addPond,
  updatePond,
  deletePond,
  addPondDailyUpdate,
  addPondEvent,
  listPondEvents,
  deletePondEvent,
  updatePondEvent,
};

export default pondApi;
