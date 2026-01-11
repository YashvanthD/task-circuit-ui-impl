import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';

export async function registerCompany(payload) {
  return apiFetch('/company/register', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getCompany(accountKey) {
  return apiFetch(`/company/${accountKey}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function updateCompany(accountKey, data) {
  return apiFetch(`/company/${accountKey}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

export async function getPublicCompany(accountKey) {
  return apiFetch(`/company/public/${accountKey}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

const companyApi = { registerCompany, getCompany, updateCompany, getPublicCompany };
export default companyApi;
