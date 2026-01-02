import * as apiUser from './apis/api_user';

const USERS_CACHE_KEY = 'tc_cache_users';

function readUsersCache() {
  try {
    const raw = localStorage.getItem(USERS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeUsersCache(obj) {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {}
}

export async function fetchUsers(params = {}) {
  // returns array of users or null
  try {
    const res = await apiUser.listUsers(params);
    let data = res;
    if (res && res.json) {
      try { data = await res.json(); } catch (e) { data = res; }
    }
    console.debug('[user.fetchUsers] raw response parsed:', data);
    // expected shapes: { data: [...users] } or array
    if (!data) return null;
    if (Array.isArray(data)) return data;
    // handle nested shapes: { data: { users: [...] } }
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.data && data.data.users && Array.isArray(data.data.users)) return data.data.users;
    if (data.users && Array.isArray(data.users)) return data.users;
    // sometimes data may be { success: true, data: { data: { users: [...] } } }
    if (data.data && data.data.data && Array.isArray(data.data.data.users)) return data.data.data.users;
    return null;
  } catch (e) {
    console.error('fetchUsers failed', e);
    return null;
  }
}

export async function getUserByKey(userKey, forceApi = false) {
  if (!userKey) return null;
  const cache = readUsersCache();
  if (!forceApi && cache && cache[userKey]) return cache[userKey];

  // try API with a query param if supported
  try {
    const params = { user_key: userKey };
    let users = await fetchUsers(params);
    if (!users || users.length === 0) {
      // fallback to listing all users (may be large) and filter
      users = await fetchUsers();
    }
    if (users && users.length > 0) {
      // find matching by common keys
      const found = users.find(u => (u.user_key === userKey || u.userKey === userKey || u.key === userKey || u.id === userKey || u._id === userKey || String(u.account_user_key) === String(userKey)));
      if (found) {
        cache[userKey] = found;
        writeUsersCache(cache);
        return found;
      }
    }
  } catch (e) {
    console.error('getUserByKey api failed', e);
  }

  return null;
}

export async function getUserName(userKey, forceApi = false) {
  const u = await getUserByKey(userKey, forceApi);
  if (!u) return null;
  // prefer display name fields
  return u.display_name || u.fullName || u.full_name || u.name || u.username || u.user_name || u.label || u.email || u.user_key || u.userKey || null;
}

export function clearUsersCache() {
  try { localStorage.removeItem(USERS_CACHE_KEY); } catch (e) {}
}

// New helpers for current user and profile updates
export async function getCurrentUser(forceApi = false) {
  try {
    const res = await apiUser.getProfile();
    let data = res;
    if (res && res.json) {
      try { data = await res.json(); } catch (e) { data = res; }
    }
    // canonical shape: { data: { ...user } }
    if (data && data.data) return data.data;
    if (data && data.user) return data.user;
    return data;
  } catch (e) {
    console.error('getCurrentUser failed', e);
    return null;
  }
}

export async function getUserInfo(userKey, forceApi = false) {
  // alias for getUserByKey
  return getUserByKey(userKey, forceApi);
}

export async function listAccountUsers(accountKey, params = {}) {
  // list users for an account. Use listUsers API and filter by accountKey if API doesn't support direct filter
  try {
    const p = { ...params };
    if (accountKey) p.account_key = accountKey;
    let users = await fetchUsers(p);
    if ((!users || users.length === 0) && accountKey) {
      // fallback: get all users and filter locally
      users = await fetchUsers();
      if (users && users.length > 0) users = users.filter(u => (u.accountKey === accountKey || u.account_key === accountKey || u.account === accountKey));
    }
    return users || [];
  } catch (e) {
    console.error('listAccountUsers failed', e);
    return [];
  }
}

// Update helpers - reuse apiUser.updateProfile which updates current user's profile.
// These functions are convenience wrappers used by forms.
export async function updateUserEmail(newEmail) {
  try {
    const res = await apiUser.updateProfile({ email: newEmail });
    let data = res;
    if (res && res.json) data = await res.json();
    return data;
  } catch (e) {
    console.error('updateUserEmail failed', e);
    throw e;
  }
}

export async function updateUserMobile(newMobile) {
  try {
    const res = await apiUser.updateProfile({ mobile: newMobile });
    let data = res;
    if (res && res.json) data = await res.json();
    return data;
  } catch (e) {
    console.error('updateUserMobile failed', e);
    throw e;
  }
}

export async function updateUserPassword(payload) {
  // payload may include currentPassword and newPassword or similar keys depending on form
  try {
    const res = await apiUser.updateProfile(payload);
    let data = res;
    if (res && res.json) data = await res.json();
    return data;
  } catch (e) {
    console.error('updateUserPassword failed', e);
    throw e;
  }
}

export async function updateUsername(newUsername) {
  try {
    const res = await apiUser.updateProfile({ username: newUsername });
    let data = res;
    if (res && res.json) data = await res.json();
    return data;
  } catch (e) {
    console.error('updateUsername failed', e);
    throw e;
  }
}

const userUtil = { fetchUsers, getUserByKey, getUserName, clearUsersCache, getCurrentUser, getUserInfo, listAccountUsers, updateUserEmail, updateUserMobile, updateUserPassword, updateUsername };
export default userUtil;

