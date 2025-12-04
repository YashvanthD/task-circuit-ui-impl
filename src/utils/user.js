import { apiFetch } from './api';
import { BASE_URL } from '../config';

const USER_INFO_KEY = 'user';

/**
 * Get user info from localStorage (fast, no API call).
 * @returns {object|null}
 */
export function getUserInfo() {
  const value = localStorage.getItem(USER_INFO_KEY);
  return value ? JSON.parse(value) : null;
}

/**
 * Explicitly fetch user info from API and update localStorage.
 * Use only when a fresh get is needed.
 * @returns {Promise<object|null>}
 */
export async function getUserInfoFresh() {
  try {
    const res = await apiFetch(`${BASE_URL}/user/me`, { method: 'GET' });
    const data = await res.json();
    if (res.ok && data.success) {
      saveUserInfo(data.user);
      return data.user;
    }
  } catch (err) {}
  return null;
}

/**
 * Save user info to localStorage only.
 * @param {object} userInfo
 */
export function saveUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
}

/**
 * Remove user info from localStorage.
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

/**
 * Update user info in localStorage only.
 * @param {object} updates
 */
export function updateUserInfo(updates) {
  const user = getUserInfo();
  if (!user) return;
  const updated = { ...user, ...updates };
  saveUserInfo(updated);
}

/**
 * Manually sync user info with API (explicit call only).
 * @param {object} userInfo
 * @returns {Promise<void>}
 */
export async function syncUserInfoWithApi(userInfo) {
  try {
    await apiFetch(`${BASE_URL}/user/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo)
    });
  } catch (err) {}
}
