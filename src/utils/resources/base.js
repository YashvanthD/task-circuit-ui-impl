/**
 * Base Resource Utility
 * Generic factory for creating CRUD resource utilities with caching and events.
 *
 * @module utils/resources/base
 */

import { apiStore } from '../api/store';

/**
 * Detect if page was reloaded.
 */
function detectPageReload() {
  try {
    if (typeof performance !== 'undefined') {
      const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length) {
        return navEntries[0].type === 'reload';
      } else if (performance.navigation) {
        return performance.navigation.type === 1;
      }
    }
  } catch (e) {}
  return false;
}

const reloadedResources = new Set();
const PAGE_WAS_RELOADED = detectPageReload();

function shouldForceFetchOnReload(cacheKey) {
  if (!PAGE_WAS_RELOADED) return false;
  if (reloadedResources.has(cacheKey)) return false;
  reloadedResources.add(cacheKey);
  return true;
}

/**
 * Simple EventEmitter for resource events.
 */
class EventEmitter {
  constructor() { this.listeners = {}; }

  on(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(cb);
    return () => this.off(event, cb);
  }

  off(event, cb) {
    if (!this.listeners[event]) return;
    this.listeners[event].delete(cb);
  }

  emit(event, payload) {
    if (!this.listeners[event]) return;
    for (const cb of Array.from(this.listeners[event])) {
      try { cb(payload); } catch (e) { console.error('EventEmitter listener error', e); }
    }
  }
}

async function safeJson(res) {
  try { return await res.json(); } catch (e) { return null; }
}

/**
 * Create a generic resource utility for a domain.
 *
 * @param {object} apiFns - API functions { listFn, getFn, addFn, updateFn, deleteFn, extraFns? }
 * @param {object} options - Options { cacheKey, idField, normalizeList }
 * @returns {object} Resource utility
 */
export function createResourceUtil(apiFns, options = {}) {
  const { listFn, getFn, addFn, updateFn, deleteFn, extraFns = {} } = apiFns;
  const cacheKey = options.cacheKey || 'resources';
  const idField = options.idField || 'id';
  const normalizeList = options.normalizeList || (d => (Array.isArray(d) ? d : (d && d.items ? d.items : (d && d[cacheKey] ? d[cacheKey] : []))));
  const events = new EventEmitter();

  async function getList({ force = false, ttl } = {}) {
    const shouldFetchApi = force || shouldForceFetchOnReload(cacheKey);
    const res = await apiStore.fetchOrCache(cacheKey, () => listFn(), { fetchApi: shouldFetchApi, ttl, requireNonEmpty: true });
    const data = normalizeList(res.data);
    if (res.source === 'api') events.emit('refreshed', data);
    return { source: res.source, data };
  }

  async function getById(id) {
    const cached = apiStore.readCache(cacheKey) || [];
    const found = cached.find(x => (x[idField] === id || x.id === id));
    if (found) return { source: 'cache', data: found };
    if (!getFn) throw new Error('getFn not provided');
    const res = await getFn(id);
    if (!res || !res.ok) throw new Error(`Failed to get ${cacheKey} ${id}`);
    const data = await safeJson(res);
    return { source: 'api', data };
  }

  async function create(item, { fetchApi = true } = {}) {
    const result = await apiStore.mutateAndSync(cacheKey, () => addFn(item), (cached, apiResult) => {
      const existing = Array.isArray(cached) ? cached : [];
      const created = apiResult || item;
      events.emit('added', created);
      return [...existing, created];
    }, { fetchApi });

    try { events.emit('refreshed', apiStore.readCache(cacheKey) || []); } catch (e) {}
    return result && result.data ? result.data : null;
  }

  async function update(id, patch, { fetchApi = true } = {}) {
    const result = await apiStore.mutateAndSync(cacheKey, () => updateFn(id, patch), (cached, apiResult) => {
      const existing = Array.isArray(cached) ? cached : [];
      const updated = apiResult || { ...patch, [idField]: id };
      events.emit('updated', updated);
      return existing.map(x => (x[idField] === id || x.id === id ? { ...x, ...updated } : x));
    }, { fetchApi });

    try { events.emit('refreshed', apiStore.readCache(cacheKey) || []); } catch (e) {}
    return result && result.data ? result.data : null;
  }

  async function remove(id, { fetchApi = true } = {}) {
    const result = await apiStore.mutateAndSync(cacheKey, () => deleteFn(id), (cached) => {
      const existing = Array.isArray(cached) ? cached : [];
      events.emit('deleted', { id });
      return existing.filter(x => !(x[idField] === id || x.id === id));
    }, { fetchApi });

    try { events.emit('refreshed', apiStore.readCache(cacheKey) || []); } catch (e) {}
    return result && result.data ? result.data : null;
  }

  // Extra functions
  const extra = {};
  for (const k of Object.keys(extraFns)) {
    extra[k] = async function(...args) {
      const res = await extraFns[k](...args);
      try { events.emit('refreshed', apiStore.readCache(cacheKey) || []); } catch (e) {}
      return res && res.json ? await res.json() : res;
    };
  }

  function getCache() { return apiStore.readCache(cacheKey) || []; }
  function saveCache(list) { apiStore.writeCache(cacheKey, list); }
  function clearCache() { apiStore.clearCache(cacheKey); }

  return {
    getList,
    getById,
    create,
    update,
    remove,
    events,
    getCache,
    saveCache,
    clearCache,
    ...extra,
  };
}

