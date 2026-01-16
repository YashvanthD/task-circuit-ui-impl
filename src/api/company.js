/**
 * Company API Module
 * Company-related API calls.
 *
 * @module api/company
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_COMPANY } from './constants';

/**
 * Register new company
 */
export async function registerCompany(data) {
  return apiFetch(API_COMPANY.REGISTER, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Get company details
 */
export async function getCompany(accountKey) {
  return apiFetch(API_COMPANY.DETAIL(accountKey), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Update company
 */
export async function updateCompany(accountKey, data) {
  return apiFetch(API_COMPANY.UPDATE(accountKey), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Get public company info
 */
export async function getPublicCompany(accountKey) {
  return apiFetch(API_COMPANY.PUBLIC(accountKey), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get company users
 */
export async function getCompanyUsers(accountKey) {
  return apiFetch(API_COMPANY.USERS(accountKey), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Delete company user
 */
export async function deleteCompanyUser(accountKey, userKey) {
  return apiFetch(API_COMPANY.DELETE_USER(accountKey, userKey), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

const companyApi = {
  registerCompany,
  getCompany,
  updateCompany,
  getPublicCompany,
  getCompanyUsers,
  deleteCompanyUser,
};

export default companyApi;

