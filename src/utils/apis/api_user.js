import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';
import {PATH_USER_PROFILE, PATH_USER_LIST, USER_PROFILE} from "./constants";

export async function getProfile() {
  return apiFetch(PATH_USER_PROFILE, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function updateProfile(data) {
  return apiFetch('/user/profile', { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
}

export async function listUsers(params = {}) {
  // Use account users endpoint per API docs
  const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  return apiFetch(`${PATH_USER_LIST}${qs ? ('?' + qs) : ''}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export default { getProfile, updateProfile, listUsers };
