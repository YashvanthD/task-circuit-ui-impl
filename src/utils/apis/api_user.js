import { apiFetch } from '../api';

export async function getProfile() {
  return apiFetch('/user/profile', { method: 'GET' });
}

export async function updateProfile(data) {
  return apiFetch('/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function listUsers(params = {}) {
  const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  return apiFetch(`/user${qs ? '?' + qs : ''}`, { method: 'GET' });
}

export default { getProfile, updateProfile, listUsers };
