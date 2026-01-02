import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from '../storage';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const TS_SUFFIX = '_last_fetched';

function tsKeyFor(cacheKey) {
  return `${cacheKey}${TS_SUFFIX}`;
}

export function getActivityTimestamps() {
  // Scan localStorage for keys that end with the TS_SUFFIX and return a map { cacheKey: timestamp }
  try {
    const out = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.endsWith(TS_SUFFIX)) {
          const cacheKey = key.slice(0, -TS_SUFFIX.length);
          const raw = loadFromLocalStorage(key);
          out[cacheKey] = typeof raw === 'number' ? raw : parseInt(raw, 10) || null;
        }
      }
    }
    return out;
  } catch (e) {
    // Fallback: try to read a few common keys
    const candidates = ['ponds', 'fish', 'tasks', 'user', 'settings'];
    const out = {};
    for (const k of candidates) {
      const t = loadFromLocalStorage(tsKeyFor(k));
      if (t) out[k] = typeof t === 'number' ? t : parseInt(t, 10) || null;
    }
    return out;
  }
}

export function clearActivityTimestamps() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.endsWith(TS_SUFFIX)) keys.push(key);
      }
      for (const k of keys) removeFromLocalStorage(k);
      return;
    }
  } catch (e) {
    // ignore
  }
  // fallback for some common keys
  const candidates = ['ponds', 'fish', 'tasks', 'user', 'settings'];
  for (const k of candidates) removeFromLocalStorage(tsKeyFor(k));
}

export function readCache(cacheKey) {
  const v = loadFromLocalStorage(cacheKey);
  return v === null ? null : v;
}

export function writeCache(cacheKey, data) {
  saveToLocalStorage(cacheKey, data);
  saveToLocalStorage(tsKeyFor(cacheKey), Date.now());
}

export function clearCache(cacheKey) {
  removeFromLocalStorage(cacheKey);
  removeFromLocalStorage(tsKeyFor(cacheKey));
}

export function readCacheTimestamp(cacheKey) {
  const raw = loadFromLocalStorage(tsKeyFor(cacheKey));
  if (!raw) return null;
  return typeof raw === 'number' ? raw : parseInt(raw, 10) || null;
}

/**
 * Fetch-on-demand helper. If cached and fresh (and non-empty when requireNonEmpty=true) and fetchApi is false, returns cache.
 * Otherwise calls fetchFn() (should return a fetch Response), parses JSON, stores to cache and returns object { source, data }.
 */
export async function fetchOrCache(cacheKey, fetchFn, { fetchApi = false, ttl = DEFAULT_TTL_MS, requireNonEmpty = true } = {}) {
  const cached = readCache(cacheKey);
  const ts = readCacheTimestamp(cacheKey);
  const now = Date.now();

  const hasCached = cached !== null && (!requireNonEmpty || (Array.isArray(cached) ? cached.length > 0 : true));
  const fresh = ts && (now - ts) < ttl;

  if (!fetchApi && hasCached && fresh) {
    return { source: 'cache', data: cached };
  }

  // attempt fetch
  try {
    const res = await fetchFn();
    if (!res || !res.ok) {
      if (hasCached) return { source: 'cache', data: cached, error: res ? await safeJson(res) : new Error('No response') };
      const body = res ? await safeJson(res) : {};
      throw new Error(body.error || `Failed to fetch (status ${res && res.status})`);
    }
    const data = await safeJson(res);
    // store
    writeCache(cacheKey, data);
    return { source: 'api', data };
  } catch (err) {
    if (hasCached) return { source: 'cache', data: cached, error: err };
    throw err;
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Perform a mutation (POST/PUT/PATCH/DELETE). By default, calls mutateFn which should perform the API call and return Response.
 * On success, applies updateCacheFn(existingCache, apiResult) to compute next cache and writes it.
 * If fetchApi===false, it will skip calling the API and only update local cache using updateCacheFn (optimistic local update).
 */
export async function mutateAndSync(cacheKey, mutateFn, updateCacheFn, { fetchApi = true } = {}) {
  const cached = readCache(cacheKey) || null;

  // First, perform an optimistic local update (store before calling API)
  const optimistic = updateCacheFn(cached, null);
  writeCache(cacheKey, optimistic);

  if (!fetchApi) {
    // caller opted out of API call; return optimistic result
    return { source: 'local', data: optimistic };
  }

  // Call API and reconcile
  try {
    const res = await mutateFn();
    if (!res || !res.ok) {
      // revert to previous cache on failure
      writeCache(cacheKey, cached);
      const body = res ? await safeJson(res) : {};
      throw new Error(body && body.error ? body.error : `Mutation failed (status ${res && res.status})`);
    }
    const result = await safeJson(res);
    const finalCache = updateCacheFn(cached, result);
    writeCache(cacheKey, finalCache);
    return { source: 'api', data: result, cache: finalCache };
  } catch (err) {
    // revert optimistic state and rethrow
    writeCache(cacheKey, cached);
    throw err;
  }
}

const apiStore = {
  fetchOrCache,
  mutateAndSync,
  readCache,
  writeCache,
  clearCache,
  readCacheTimestamp,
  getActivityTimestamps,
  clearActivityTimestamps,
};

export { apiStore };
export default apiStore;
