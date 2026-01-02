import { apiFetch } from '../api';

export async function publicStats() {
  return apiFetch('/public/stats', { method: 'GET' });
}

export async function listPublicFish(account_key) {
  const url = account_key ? `/public/fish?account_key=${encodeURIComponent(account_key)}` : '/public/fish';
  return apiFetch(url, { method: 'GET' });
}
