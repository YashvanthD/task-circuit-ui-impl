import { apiFetch } from '../api';

export async function listPonds() {
  return apiFetch('/pond', { method: 'GET' });
}

export async function getPond(pondId) {
  return apiFetch(`/pond/${pondId}`, { method: 'GET' });
}

export async function addPond(pondData) {
  return apiFetch('/pond/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pondData),
  });
}

export async function updatePond(pondId, pondData) {
  // prefer /pond/update/:id
  const res = await apiFetch(`/pond/update/${pondId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pondData),
  });
  if (res && (res.status === 404 || res.status === 405)) {
    return apiFetch(`/pond/${pondId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pondData),
    });
  }
  return res;
}

export async function deletePond(pondId) {
  return apiFetch(`/pond/${pondId}`, { method: 'DELETE' });
}

export async function addPondDailyUpdate(pondId, updateData) {
  return apiFetch(`/pond/${pondId}/daily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
}

export async function addPondEvent(pondId, eventType, eventData) {
  return apiFetch(`/pond_event/${pondId}/event/${eventType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
}

export async function listPondEvents(pondId) {
  return apiFetch(`/pond_event/${pondId}/events`, { method: 'GET' });
}

export async function deletePondEvent(pondId, eventId) {
  return apiFetch(`/pond_event/${pondId}/events/${eventId}`, { method: 'DELETE' });
}

export async function updatePondEvent(pondId, eventId, data) {
  return apiFetch(`/pond_event/${pondId}/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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
