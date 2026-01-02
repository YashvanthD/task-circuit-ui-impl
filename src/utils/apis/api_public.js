import { apiFetch } from '../api';

export async function publicStats() {
  return apiFetch('/public/stats', { method: 'GET' });
}

export default { publicStats };
