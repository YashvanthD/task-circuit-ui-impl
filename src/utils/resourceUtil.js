import { apiStore } from './apis/api_store';

// Detect whether the page was reloaded (full refresh). We'll force an API fetch once after reload.
let PAGE_WAS_RELOADED = false;
try {
  if (typeof performance !== 'undefined') {
    const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length) {
      PAGE_WAS_RELOADED = navEntries[0].type === 'reload';
    } else if (performance.navigation) {
      PAGE_WAS_RELOADED = performance.navigation.type === 1; // TYPE_RELOAD
    }
  }
} catch (e) {
  PAGE_WAS_RELOADED = false;
}

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

/**
 * Create a generic resource util for a domain.
 * apiFns: { listFn, getFn, addFn, updateFn, deleteFn, extraFns? }
 * options: { cacheKey, idField = 'id', normalizeList(resData) }
 */
export function createResourceUtil(apiFns, options = {}) {
  const { listFn, getFn, addFn, updateFn, deleteFn, extraFns = {} } = apiFns;
  const cacheKey = options.cacheKey || 'resources';
  const idField = options.idField || 'id';
  const normalizeList = options.normalizeList || (d => (Array.isArray(d) ? d : (d && d.items ? d.items : (d && d[cacheKey] ? d[cacheKey] : []))));
  const events = new EventEmitter();

  async function getList({ force = false, ttl } = {}) {
    // If the page was reloaded, force API fetch once across all resources.
    const shouldFetchApi = force || PAGE_WAS_RELOADED;
    PAGE_WAS_RELOADED = false;
    const res = await apiStore.fetchOrCache(cacheKey, () => listFn(), { fetchApi: shouldFetchApi, ttl, requireNonEmpty: true });
    const data = normalizeList(res.data);
    if (res.source === 'api') events.emit('refreshed', data);
    return { source: res.source, data };
  }

  async function getById(id) {
    // try cache first
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
      const next = [...existing, created];
      events.emit('added', created);
      return next;
    }, { fetchApi });

    try { const latest = apiStore.readCache(cacheKey) || []; events.emit('refreshed', latest); } catch (e) {}
    return result && result.data ? result.data : null;
  }

  async function update(id, patch, { fetchApi = true } = {}) {
    const result = await apiStore.mutateAndSync(cacheKey, () => updateFn(id, patch), (cached, apiResult) => {
      const existing = Array.isArray(cached) ? cached : [];
      const updated = apiResult || { ...patch, [idField]: id };
      const next = existing.map(x => (x[idField] === id || x.id === id ? { ...x, ...updated } : x));
      events.emit('updated', updated);
      return next;
    }, { fetchApi });

    try { const latest = apiStore.readCache(cacheKey) || []; events.emit('refreshed', latest); } catch (e) {}
    return result && result.data ? result.data : null;
  }

  async function remove(id, { fetchApi = true } = {}) {
    const result = await apiStore.mutateAndSync(cacheKey, () => deleteFn(id), (cached/*, apiResult*/) => {
      const existing = Array.isArray(cached) ? cached : [];
      const next = existing.filter(x => !(x[idField] === id || x.id === id));
      events.emit('deleted', { id });
      return next;
    }, { fetchApi });

    try { const latest = apiStore.readCache(cacheKey) || []; events.emit('refreshed', latest); } catch (e) {}
    return result && result.data ? result.data : null;
  }

  // expose extra fns if present (like addDailyUpdate)
  const extra = {};
  for (const k of Object.keys(extraFns)) {
    extra[k] = async function(...args) {
      const fn = extraFns[k];
      // optimistic update not handled generically; caller should subscribe to events or update cache separately
      const res = await fn(...args);
      // after exec, emit refreshed cache
      try { const latest = apiStore.readCache(cacheKey) || []; events.emit('refreshed', latest); } catch (e) {}
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

async function safeJson(res) {
  try { return await res.json(); } catch (e) { return null; }
}

export const resourceUtil = { createResourceUtil };
