import * as api from './apis/api_pond';
import { createResourceUtil } from './resourceUtil';
import { parsePondList, parsePond } from './parsePond';

// Create a pond resource util using the generic factory. Use cacheKey 'ponds' and pond_id as id field
const pondResource = createResourceUtil({
  listFn: api.listPonds,
  getFn: api.getPond,
  addFn: api.addPond,
  updateFn: api.updatePond,
  deleteFn: api.deletePond,
  extraFns: { addDailyUpdate: api.addPondDailyUpdate, addEvent: api.addPondEvent }
}, {
  cacheKey: 'ponds',
  idField: 'pond_id',
  normalizeList: (d) => {
    // Accept several shapes and try to find array of ponds in nested structures.
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.ponds)) return d.ponds;
    if (d.data && Array.isArray(d.data.ponds)) return d.data.ponds;
    if (d.data && Array.isArray(d.data)) return d.data;
    if (d.data && Array.isArray(d.data.results)) return d.data.results;
    if (Array.isArray(d.results)) return d.results;

    // Recursive scan: find first array of objects where elements look like ponds (have pondId/pond_id/id/farmName)
    const looksLikePondArray = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return false;
      const sample = arr[0];
      if (typeof sample !== 'object' || sample === null) return false;
      const keys = Object.keys(sample).map(k => k.toLowerCase());
      return keys.includes('pondid') || keys.includes('pond_id') || keys.includes('id') || keys.includes('farmname');
    };

    const queue = [d];
    const seen = new Set();
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || typeof cur !== 'object') continue;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const k of Object.keys(cur)) {
        try {
          const v = cur[k];
          if (Array.isArray(v) && looksLikePondArray(v)) return v;
          if (v && typeof v === 'object') queue.push(v);
        } catch (e) { /* ignore */ }
      }
    }
    return [];
  },
});

// Proxy events so we emit parsed payloads (normalized shapes) to consumers
const events = {
  _emitter: pondResource.events,
  on: (event, cb) => {
    // wrap callback to parse incoming payloads depending on event
    const wrapper = (payload) => {
      try {
        if (!payload) return cb(payload);
        if (event === 'refreshed') {
          return cb(parsePondList(payload));
        }
        if (event === 'added' || event === 'updated') {
          return cb(parsePond(payload));
        }
        if (event === 'dailyUpdate') {
          // payload: { pondId, update }
          const out = { pondId: payload.pondId || payload.pond_id || payload.id, update: payload.update || payload };
          return cb(out);
        }
        if (event === 'deleted') {
          // keep as-is
          return cb(payload);
        }
        // default
        return cb(payload);
      } catch (e) {
        console.error('pondEvents wrapper error', e);
        return cb(payload);
      }
    };
    const unsub = pondResource.events.on(event, wrapper);
    // return unsubscribe for wrapper
    return unsub;
  }
};

// Re-export pondResource methods but wrap results to return parsed data where appropriate
export async function getPonds(opts) {
  const res = await pondResource.getList(opts);
  // res: { source, data }
  const parsed = { source: res.source, data: parsePondList(res.data) };
  return parsed;
}
export async function fetchPondById(id) {
  const res = await pondResource.getById(id);
  if (res && res.data) return { source: res.source || 'api', data: parsePond(res.data) };
  return res;
}
export async function createPond(data, opts) {
  const res = await pondResource.create(data, opts);
  // pondResource.create returns the created item (result.data) or null
  if (res) return parsePond(res);
  return null;
}
export async function modifyPond(id, data, opts) {
  const res = await pondResource.update(id, data, opts);
  if (res) return parsePond(res);
  return null;
}
export async function removePond(id, opts) {
  const res = await pondResource.remove(id, opts);
  return res;
}
export async function addDailyUpdate(pondId, data, opts) {
  const res = await (pondResource.addDailyUpdate ? pondResource.addDailyUpdate(pondId, data, opts) : pondResource.create(data, opts));
  // return parsed update result if possible
  if (res && res.data) return res.data;
  return res;
}

export const getCachedPonds = () => parsePondList(pondResource.getCache());
export const savePondsToCache = (list) => pondResource.saveCache(list);
export const clearPondCache = () => pondResource.clearCache();

// named export for compatibility with existing imports
export const pondEvents = events;

const pondUtil = {
  getPonds,
  fetchPondById,
  createPond,
  modifyPond,
  removePond,
  addDailyUpdate,
  getCachedPonds,
  savePondsToCache,
  clearPondCache,
  pondEvents: events,
};

// Expose for debugging in browser console (development helper)
if (typeof window !== 'undefined') {
  try { window.pondUtil = pondUtil; window.pondEvents = events; } catch (e) {}
}

export default pondUtil;
