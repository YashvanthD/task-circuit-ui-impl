import pondUtil from './pond';
import fishUtil from './fish';
import { listPublicFish } from './apis/api_public';
import { loadFromLocalStorage, saveToLocalStorage } from './auth/storage';
import { parseFishList } from './parseFish';

function extractArray(maybe) {
  if (!maybe) return [];
  if (Array.isArray(maybe)) return maybe;
  if (maybe.data && Array.isArray(maybe.data.fish)) return maybe.data.fish;
  if (maybe.fish && Array.isArray(maybe.fish)) return maybe.fish;
  if (maybe.data && Array.isArray(maybe.data)) return maybe.data;
  if (maybe.results && Array.isArray(maybe.results)) return maybe.results;
  return [];
}

export async function getPondOptions({ force = false } = {}) {
  let list;
  try { list = pondUtil.getCachedPonds ? pondUtil.getCachedPonds() : []; } catch (e) { list = []; }
  if ((!list || list.length === 0) || force) {
    try {
      const res = await pondUtil.getPonds({ force });
      list = res && (res.data || res) ? (res.data || res) : [];
    } catch (e) { list = list || []; }
  }
  return (Array.isArray(list) ? list : []).map(p => ({
    id: p.pond_id || p.id || p.pondId || '',
    label: p.farm_name ? `${p.farm_name} | ${p.pond_id || p.id || ''}` : (p.name || p.pond_id || p.id || ''),
    raw: p,
  }));
}

export async function getFishOptions({ force = false, account_key = null } = {}) {
  // Try local storage for public fish first (not account-specific)
  if (!force) {
    try {
      const cachedPublic = loadFromLocalStorage('public_fish');
      if (Array.isArray(cachedPublic) && cachedPublic.length > 0) {
        // cachedPublic is expected to be normalized fish objects
        return (cachedPublic || []).map(f => ({ id: f.id, common_name: f.common_name, scientific_name: f.scientific_name, label: `${f.common_name || ''} | ${f.scientific_name || ''} | ${f.id}`, raw: f }));
      }
    } catch (e) { /* ignore */ }
  }

  let list;
  try { list = fishUtil.getCachedFish ? fishUtil.getCachedFish() : []; } catch (e) { list = []; }
  if ((!list || list.length === 0) || force) {
    try {
      const res = await fishUtil.getFishList({ force });
      list = res && (res.data || res) ? (res.data || res) : res;
    } catch (e) { list = list || []; }
  }

  // normalize to array
  let arr = extractArray(list);

  // if still empty, try public endpoint
  if ((!arr || arr.length === 0) && typeof listPublicFish === 'function') {
    try {
      const res = await listPublicFish(account_key);
      if (res && res.json) {
        const body = await res.json();
        arr = extractArray(body) || extractArray(body.data) || extractArray(body.fish) || arr;
      } else if (res && res.data) {
        arr = extractArray(res) || arr;
      }
    } catch (e) { /* ignore */ }
  }

  // convert to normalized fish objects using parseFishList
  let normalized = parseFishList(arr || []);

  // persist normalized public fish to storage for faster subsequent loads
  try {
    if (Array.isArray(normalized) && normalized.length > 0) {
      saveToLocalStorage('public_fish', normalized);
    }
  } catch (e) { /* ignore */ }

  return (Array.isArray(normalized) ? normalized : []).map(f => ({ id: f.id, common_name: f.common_name, scientific_name: f.scientific_name, label: `${f.common_name || ''} | ${f.scientific_name || ''} | ${f.id}`, raw: f }));
}
