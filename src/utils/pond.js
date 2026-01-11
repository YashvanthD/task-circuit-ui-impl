import * as api from './apis/api_pond';
import { createResourceUtil } from './resources/base';
import { parsePondList, parsePond } from './parsePond';
import { extractResponseData } from './api/client';

/**
 * Normalize pond list from various API response shapes.
 * Uses centralized extractResponseData helper with pond-specific fallbacks.
 * @param {object} d - API response data
 * @returns {Array} Array of pond objects
 */
function normalizePondList(d) {
  if (!d) return [];
  if (Array.isArray(d)) return d;

  // Check common pond-specific keys
  if (Array.isArray(d.ponds)) return d.ponds;
  if (d.data && Array.isArray(d.data.ponds)) return d.data.ponds;

  // Use centralized extractor for common patterns
  const extracted = extractResponseData(d, 'ponds');
  if (Array.isArray(extracted)) return extracted;

  // Last resort: check results key
  if (Array.isArray(d.results)) return d.results;
  if (d.data && Array.isArray(d.data.results)) return d.data.results;

  return [];
}

// Create a pond resource util using the generic factory
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
  normalizeList: normalizePondList,
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
