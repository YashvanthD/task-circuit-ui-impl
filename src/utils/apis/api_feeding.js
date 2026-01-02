import { apiFetch } from '../api';
import { getAuthHeaders } from './api_auth';

export async function recordFeeding(payload) {
  return apiFetch('/feeding', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
}

export default { recordFeeding };
