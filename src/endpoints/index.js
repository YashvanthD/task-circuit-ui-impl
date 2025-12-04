import { BASE_URL } from '../config';

// Auth endpoints
export const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/auth/token`;
export const VALIDATE_TOKEN_ENDPOINT = `${BASE_URL}/auth/validate`;

// User endpoints
export const GET_USER_ENDPOINT = `${BASE_URL}/user/me`;
export const USER_DASHBOARD_ENDPOINT = `${BASE_URL}/user/dashboard`;
export const USER_BASE_ENDPOINT = `${BASE_URL}/user`;

// Task endpoints
export const TASKS_ENDPOINT = `${BASE_URL}/task/`;
export const TASK_DETAIL_ENDPOINT = (taskId) => `${BASE_URL}/task/${taskId}`;

// Other endpoints can be added here as needed
