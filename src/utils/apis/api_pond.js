import { apiFetch } from '../api';
import { getAuthHeaders } from './api_auth';

export async function listPonds() {
  return apiFetch('/pond', { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getPond(pondId) {
  return apiFetch(`/pond/${pondId}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function addPond(pondData) {
  return apiFetch('/pond/create', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pondData),
  });
}

export async function updatePond(pondId, pondData) {
  // prefer /pond/update/:id
  const res = await apiFetch(`/pond/update/${pondId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(pondData),
  });
  if (res && (res.status === 404 || res.status === 405)) {
    return apiFetch(`/pond/${pondId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pondData),
    });
  }
  return res;
}

export async function deletePond(pondId) {
  return apiFetch(`/pond/${pondId}`, { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

export async function addPondDailyUpdate(pondId, updateData) {
  return apiFetch(`/pond/${pondId}/daily`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
}

export async function addPondEvent(pondId, eventType, eventData) {
  return apiFetch(`/pond_event/${pondId}/event/${eventType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });
}

export async function listPondEvents(pondId) {
  return apiFetch(`/pond_event/${pondId}/events`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function deletePondEvent(pondId, eventId) {
  return apiFetch(`/pond_event/${pondId}/events/${eventId}`, { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

export async function updatePondEvent(pondId, eventId, data) {
  return apiFetch(`/pond_event/${pondId}/events/${eventId}`, {
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
