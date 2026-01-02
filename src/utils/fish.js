import * as apiFish from './apis/api_fish';
import { createResourceUtil } from './resourceUtil';
import { parseFishList, parseFish } from './parseFish';

const fishResource = createResourceUtil({
  listFn: apiFish.listFish,
  getFn: apiFish.getFish,
  addFn: apiFish.addFish,
  updateFn: apiFish.updateFish,
  deleteFn: apiFish.deleteFish,
}, {
  cacheKey: 'fish',
  idField: 'fish_id',
  normalizeList: d => Array.isArray(d) ? d : (d && d.fish ? d.fish : (d && d.data && Array.isArray(d.data) ? d.data : [])),
});

const events = {
  _emitter: fishResource.events,
  on: (event, cb) => {
    const wrapper = (payload) => {
      try {
        if (!payload) return cb(payload);
        if (event === 'refreshed') return cb(parseFishList(payload));
        if (event === 'added' || event === 'updated') return cb(parseFish(payload));
        return cb(payload);
      } catch (e) {
        console.error('fishEvents wrapper error', e);
        return cb(payload);
      }
    };
    return fishResource.events.on(event, wrapper);
  }
};

export async function getFishList(opts) {
  const res = await fishResource.getList(opts);
  return { source: res.source, data: parseFishList(res.data) };
}
export async function fetchFishById(id) {
  const res = await fishResource.getById(id);
  if (res && res.data) return { source: res.source || 'api', data: parseFish(res.data) };
  return res;
}
export async function createFish(data, opts) {
  const res = await fishResource.create(data, opts);
  if (res) return parseFish(res);
  return null;
}
export async function modifyFish(id, data, opts) {
  const res = await fishResource.update(id, data, opts);
  if (res) return parseFish(res);
  return null;
}
export async function removeFish(id, opts) {
  const res = await fishResource.remove(id, opts);
  return res;
}

export const getCachedFish = () => parseFishList(fishResource.getCache());
export const saveFishToCache = (list) => fishResource.saveCache(list);
export const clearFishCache = () => fishResource.clearCache();
export const fishEvents = events;

const fishUtil = {
  getFishList,
  fetchFishById,
  createFish,
  modifyFish,
  removeFish,
  getCachedFish,
  saveFishToCache,
  clearFishCache,
  fishEvents: events,
};

if (typeof window !== 'undefined') {
  try { window.fishUtil = fishUtil; window.fishEvents = events; } catch (e) {}
}

export default fishUtil;

