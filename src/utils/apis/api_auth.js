import { apiFetch } from '../api/client';
import { getAccessToken } from '../auth/storage';
import { API_AUTH } from './constants';

export async function login(credentials) {
  return apiFetch(API_AUTH.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

export async function validateToken(token) {
  return apiFetch(API_AUTH.VALIDATE_TOKEN, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function refreshToken(refreshToken) {
  return apiFetch(API_AUTH.REFRESH_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'refresh_token', token: refreshToken }),
  });
}

// Centralized header helper so API modules can reuse consistent headers and auth
export function getAuthHeaders({ contentType = 'application/json', accept = 'application/json', extra = {} } = {}) {
  const headers = { ...extra };
  if (contentType) headers['Content-Type'] = contentType;
  if (accept) headers['Accept'] = accept;
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

const authApi = { login, validateToken, refreshToken, getAuthHeaders };
export default authApi;
