import { apiFetch } from '../api';

export async function registerCompany(payload) {
  return apiFetch('/company/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getCompany(accountKey) {
  return apiFetch(`/company/${accountKey}`, { method: 'GET' });
}

export async function updateCompany(accountKey, data) {
  return apiFetch(`/company/${accountKey}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function getPublicCompany(accountKey) {
  return apiFetch(`/company/public/${accountKey}`, { method: 'GET' });
}

const companyApi = { registerCompany, getCompany, updateCompany, getPublicCompany };
export default companyApi;
