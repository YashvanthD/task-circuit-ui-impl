import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';
import { API_USER } from './constants';

export async function getProfile() {
  return apiFetch(API_USER.PROFILE, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function updateProfile(data) {
  return apiFetch(API_USER.PROFILE, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
}

export async function listUsers(params = {}) {
  const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  return apiFetch(`${API_USER.LIST}${qs ? ('?' + qs) : ''}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

const userApi = { getProfile, updateProfile, listUsers };
export default userApi;
