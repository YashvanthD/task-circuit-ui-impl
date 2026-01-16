import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';
import { API_COMPANY } from './constants';

export async function registerCompany(payload) {
  return apiFetch(API_COMPANY.REGISTER, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getCompany(accountKey) {
  return apiFetch(`${API_COMPANY.DETAILS}${accountKey}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function updateCompany(accountKey, data) {
  return apiFetch(`${API_COMPANY.UPDATE}${accountKey}`, {
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
