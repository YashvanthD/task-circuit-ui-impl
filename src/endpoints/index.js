import { BASE_URL } from '../config';

// Auth endpoints
export const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;
export const REFRESH_TOKEN_ENDPOINT = `${BASE_URL}/auth/token`;
export const VALIDATE_TOKEN_ENDPOINT = `${BASE_URL}/auth/validate`;
export const SIGNUP_ENDPOINT = `${BASE_URL}/auth/signup`;

// User endpoints
export const GET_USER_ENDPOINT = `${BASE_URL}/user/me`;
export const USER_DASHBOARD_ENDPOINT = `${BASE_URL}/user/dashboard`;
export const USER_BASE_ENDPOINT = `${BASE_URL}/user`;
export const UPDATE_PASSWORD_ENDPOINT = `${BASE_URL}/user/password`;
export const UPDATE_MOBILE_ENDPOINT = `${BASE_URL}/user/mobile`;
export const UPDATE_MAIL_ENDPOINT = `${BASE_URL}/user/email`;
export const ADD_USER_ENDPOINT = `${BASE_URL}/user/add`;
export const UPDATE_USERNAME_ENDPOINT = `${BASE_URL}/user/username`;

// Task endpoints
export const TASKS_ENDPOINT = `${BASE_URL}/task/`;
export const TASK_DETAIL_ENDPOINT = (taskId) => `${BASE_URL}/task/${taskId}`;

// Company endpoints
export const REGISTER_COMPANY_ENDPOINT = `${BASE_URL}/company/register`;

// Pond endpoints
export const ADD_POND_ENDPOINT = `${BASE_URL}/pond/add`;

// Other endpoints can be added here as needed
