/**
 * API Endpoints
 * Full URL endpoints for API calls.
 *
 * NOTE: These include BASE_URL for backward compatibility.
 * New code should use API_* constants from utils/apis/constants.js
 * with apiFetch() which adds BASE_URL automatically.
 *
 * @module endpoints
 * @deprecated Use API_* constants from utils/apis/constants.js instead
 */

import { BASE_URL } from '../config';
import {
  API_AUTH,
  API_USER,
  API_TASK,
  API_POND,
  API_COMPANY,
} from '../utils/apis/constants';

// ============================================================================
// Auth endpoints (with full URL - legacy)
// ============================================================================
export const LOGIN_ENDPOINT = `${BASE_URL}${API_AUTH.LOGIN}`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}${API_AUTH.REFRESH_TOKEN}`;
export const VALIDATE_TOKEN_ENDPOINT = `${BASE_URL}${API_AUTH.VALIDATE_TOKEN}`;
export const SIGNUP_ENDPOINT = `${BASE_URL}${API_AUTH.SIGNUP}`;
export const REGISTER_COMPANY_ENDPOINT = `${BASE_URL}${API_COMPANY.REGISTER}`;

// ============================================================================
// User endpoints (with full URL - legacy)
// ============================================================================
export const GET_USER_ENDPOINT = `${BASE_URL}${API_USER.ME}`;
export const USER_DASHBOARD_ENDPOINT = `${BASE_URL}${API_USER.DASHBOARD}`;
export const USER_BASE_ENDPOINT = `${BASE_URL}${API_USER.BASE}`;
export const UPDATE_PASSWORD_ENDPOINT = `${BASE_URL}${API_USER.PASSWORD}`;
export const UPDATE_MOBILE_ENDPOINT = `${BASE_URL}${API_USER.MOBILE}`;
export const UPDATE_MAIL_ENDPOINT = `${BASE_URL}${API_USER.EMAIL}`;
export const ADD_USER_ENDPOINT = `${BASE_URL}${API_USER.ADD}`;
export const UPDATE_USERNAME_ENDPOINT = `${BASE_URL}${API_USER.USERNAME}`;

// ============================================================================
// Task endpoints (with full URL - legacy)
// ============================================================================
export const TASKS_ENDPOINT = `${BASE_URL}${API_TASK.LIST}`;
export const TASK_DETAIL_ENDPOINT = (taskId) => `${BASE_URL}${API_TASK.DETAIL(taskId)}`;

// ============================================================================
// Pond endpoints (with full URL - legacy)
// ============================================================================
export const ADD_POND_ENDPOINT = `${BASE_URL}${API_POND.ADD}`;

// ============================================================================
// Re-export API constants for convenience
// ============================================================================
export {
  API_AUTH,
  API_USER,
  API_TASK,
  API_POND,
  API_COMPANY,
} from '../utils/apis/constants';
