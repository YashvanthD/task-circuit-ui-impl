import { apiFetch } from '../api';

export async function recordFeeding(payload) {
  return apiFetch('/feeding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export default { recordFeeding };
