import { apiFetch } from '../api';

export async function login(credentials) {
  return apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}

export async function validateToken(token) {
  return apiFetch('/auth/validate', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function refreshToken(refreshToken) {
  return apiFetch('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'refresh_token', token: refreshToken }),
  });
}

const authApi = { login, validateToken, refreshToken };
export default authApi;
