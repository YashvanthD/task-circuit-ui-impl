import { apiFetch } from '../api/client';

export async function listEventsForAccount(params = {}) {
  // generic events listing; build query string
  const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  return apiFetch(`/events${qs ? '?' + qs : ''}`, { method: 'GET' });
}

const eventsApi = { listEventsForAccount };
export default eventsApi;
