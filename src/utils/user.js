import { apiFetch } from './api';
import { BASE_URL } from '../config';

const USER_INFO_KEY = 'user';
const USER_LAST_FETCHED_KEY = 'user_last_fetched';
const USER_STALE_MS = 5 * 60 * 1000; // 5 minutes

const ACCOUNT_USERS_KEY = 'account_users';
const ACCOUNT_USERS_LAST_FETCHED_KEY = 'account_users_last_fetched';
const ACCOUNT_USERS_STALE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get user info from localStorage (fast, no API call).
 * @returns {object|null}
 */
export function getUserInfo() {
  const value = localStorage.getItem(USER_INFO_KEY);
  return value ? JSON.parse(value) : null;
}

/**
 * Get current user, using localStorage cache when fresh.
 * If forceApiCall is true or cache is stale/missing, fetch from /user/me and refresh cache.
 * @param {boolean} [forceApiCall=false]
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser(forceApiCall = false) {
  const cached = getUserInfo();
  const lastFetchedRaw = localStorage.getItem(USER_LAST_FETCHED_KEY);
  const lastFetched = lastFetchedRaw ? parseInt(lastFetchedRaw, 10) : null;
  const now = Date.now();

  if (!forceApiCall && cached && lastFetched && (now - lastFetched < USER_STALE_MS)) {
    return cached;
  }

  // Fallback to explicit fresh fetch
  const fresh = await getUserInfoFresh();
  return fresh || cached;
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
      localStorage.setItem(USER_LAST_FETCHED_KEY, Date.now().toString());
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
  localStorage.removeItem(USER_LAST_FETCHED_KEY);
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

/**
 * Update current user's password.
 */
export async function updateUserPassword(oldPassword, newPassword) {
  const res = await apiFetch('/user/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to update password');
  }
  return data;
}

/**
 * Update current user's mobile.
 */
export async function updateUserMobile(mobile, otp) {
  const res = await apiFetch('/user/mobile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to update mobile number');
  }
  return data;
}

/**
 * Update current user's email.
 */
export async function updateUserEmail(email, otp) {
  const res = await apiFetch('/user/email', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to update email');
  }
  return data;
}

/**
 * Update current user's username.
 */
export async function updateUsername(username) {
  const res = await apiFetch('/user/username', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to update username');
  }
  return data;
}

/**
 * Add a new user to the current account.
 */
export async function addUser(payload) {
  const res = await apiFetch('/user/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to add user');
  }
  return data;
}

/**
 * List users in the current account.
 * Uses localStorage cache (list + map) to avoid repeated API calls.
 * @param {boolean} [forceApiCall=false] - if true, ignores cache and hits API.
 * @returns {Promise<Array>} users array
 */
export async function listAccountUsers(forceApiCall = false) {
  const now = Date.now();
  if (!forceApiCall) {
    const cachedRaw = localStorage.getItem(ACCOUNT_USERS_KEY);
    const lastFetchedRaw = localStorage.getItem(ACCOUNT_USERS_LAST_FETCHED_KEY);
    const lastFetched = lastFetchedRaw ? parseInt(lastFetchedRaw, 10) : null;
    if (cachedRaw && lastFetched && now - lastFetched < ACCOUNT_USERS_STALE_MS) {
      try {
        return JSON.parse(cachedRaw);
      } catch (e) {
        // fall through to API
      }
    }
  }
  const res = await apiFetch('/auth/account/users', { method: 'GET' });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to load users');
  }
  const users = data.data?.users || data.users || [];
  localStorage.setItem(ACCOUNT_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(ACCOUNT_USERS_LAST_FETCHED_KEY, now.toString());
  return users;
}
