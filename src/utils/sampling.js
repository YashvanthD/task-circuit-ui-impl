import { samplingApi } from '../api';

// Create alias for backward compatibility
const apiSampling = samplingApi;

const STORAGE_KEY = 'tc_cache_sampling';
const ACTIVITY_KEY = 'tc_activity_last_fetched';

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function writeCache(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function readActivity() {
  try { const raw = localStorage.getItem(ACTIVITY_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
}

function writeActivity(obj) {
  try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(obj)); } catch (e) {}
}

// Utility: get stable key for an item
function getItemKey(it) {
  if (!it || typeof it !== 'object') return null;
  return it.id || it._id || it.samplingId || it.sampling_id || it.recordId || it.sampleId || `${it.pondId || ''}::${it.species || ''}::${it.createdAt || ''}`;
}

// Deduplicate items array by id-like key, preserving latest occurrence (first wins)
function dedupeItems(items = []) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const k = getItemKey(it);
    if (!k) {
      // include items without key but avoid duplicates by reference
      if (!out.includes(it)) out.push(it);
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}


export async function createSampling(payload, apiFetch = true) {
  // Backend API expects exact field names from uc-05-growth-sampling.md
  const body = {
    stock_id: payload.stock_id || payload.stockId,
    pond_id: payload.pond_id || payload.pondId,
    sample_date: payload.sample_date || payload.sampling_date || payload.samplingDate || new Date().toISOString().split('T')[0],
    sample_count: Number(payload.sample_count || payload.sample_size || payload.sampleCount || 0),
    total_weight_g: payload.total_weight_g ? Number(payload.total_weight_g) : undefined,
    avg_weight_g: Number(payload.avg_weight_g || payload.avg_weight || payload.averageWeight || 0),
    min_weight_g: payload.min_weight_g ? Number(payload.min_weight_g) : undefined,
    max_weight_g: payload.max_weight_g ? Number(payload.max_weight_g) : undefined,
    length_cm: payload.length_cm ? Number(payload.length_cm) : undefined,
    condition_factor: payload.condition_factor ? Number(payload.condition_factor) : undefined,
    health_status: payload.health_status || undefined,
    notes: payload.notes || payload.note || '',
  };

  // Remove undefined/null/empty/NaN values
  Object.keys(body).forEach(key => {
    if (body[key] === undefined || body[key] === null || body[key] === '' || (typeof body[key] === 'number' && isNaN(body[key]))) {
      delete body[key];
    }
  });

  let result = null;
  if (apiFetch) {
    result = await apiSampling.createSampling(body);
    if (result && result.json) {
      try { result = await result.json(); } catch (e) { /* ignore */ }
    }
  } else {
    // simulate created object
    result = {
      sampling_id: `local-${Date.now()}`,
      stock_id: body.stock_id,
      pond_id: body.pond_id,
      sample_date: body.sample_date,
      sample_count: body.sample_count,
      avg_weight_g: body.avg_weight_g,
      created_at: new Date().toISOString(),
    };
  }

  // Invalidate cache
  try {
    const activity = readActivity();
    activity[`sampling_${body.pond_id || 'global'}`] = new Date().toISOString();
    if (body.stock_id) {
      activity[`stock_${body.stock_id}`] = new Date().toISOString();
    }
    writeActivity(activity);

    const cache = readCache() || [];
    cache.unshift(result);
    const deduped = dedupeItems(cache);
    writeCache(deduped);
  } catch (e) { /* ignore */ }

  return result;
}

export async function getSamplings({ stockId = null, pondId = null, fishId = null, forceApi = false, limit = 100, skip = 0, startDate = null, endDate = null } = {}) {
  // If cache is fresh and not forcing API, return cached items
  const cache = readCache();
  const activity = readActivity();
  const cacheKey = stockId ? `sampling_stock_${stockId}` : `sampling_${pondId || 'global'}`;
  const lastFetched = activity[cacheKey];

  if (!forceApi && cache && cache.length > 0 && lastFetched) {
    const filtered = cache.filter((s) => {
      if (stockId && s.stock_id && s.stock_id !== stockId) return false;
      if (pondId && s.pond_id && s.pond_id !== pondId) return false;
      if (fishId && s.species && s.species !== fishId) return false;
      return true;
    });
    const dedupedFiltered = dedupeItems(filtered);
    return dedupedFiltered.slice(skip, skip + limit);
  }

  // Fetch from API with correct parameter names (snake_case)
  const params = {
    stock_id: stockId,
    pond_id: pondId,
    start_date: startDate,
    end_date: endDate,
    limit,
    skip
  };

  // Remove null/undefined params
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === undefined) {
      delete params[key];
    }
  });

  let res = await apiSampling.listSamplings(params);
  try {
    if (res && res.json) res = await res.json();
  } catch (e) {
    console.error('[sampling.getSamplings] Failed to parse response:', e);
  }

  let items = [];

  // Robust response parsing to handle various API structures
  if (Array.isArray(res)) {
    items = res;
  } else if (res && typeof res === 'object') {
    if (Array.isArray(res.samplings)) {
      items = res.samplings;
    } else if (res.data && Array.isArray(res.data.samplings)) {
      items = res.data.samplings;
    } else if (Array.isArray(res.data)) {
      items = res.data;
    } else if (res.data && Array.isArray(res.data.records)) {
      items = res.data.records;
    } else if (Array.isArray(res.records)) {
      items = res.records;
    } else if (Array.isArray(res.items)) {
      items = res.items;
    }
  }

  try {
    const deduped = dedupeItems(items);
    writeCache(deduped);
    const activityObj = readActivity();
    activityObj[cacheKey] = new Date().toISOString();
    writeActivity(activityObj);
  } catch (e) {
    console.error('[sampling.getSamplings] Cache error:', e);
  }

  return dedupeItems(items);
}

export async function getSamplingHistory({ pondId = null, species = null, startDate = null, endDate = null, limit = 100, skip = 0, forceApi = false } = {}) {
  // this remains similar to previous but uses apiSampling.getSamplingHistory directly
  const cache = readCache();
  const activity = readActivity();
  const lastFetched = activity[`sampling_${pondId || 'global'}`];

  if (!forceApi && cache && cache.length > 0 && lastFetched) {
    const filtered = cache.filter((s) => {
      if (pondId && (s.pondId && s.pondId !== pondId)) return false;
      if (species && (s.species && s.species !== species)) return false;
      return true;
    });
    return filtered.slice(skip, skip + limit);
  }

  const params = { pondId, species, startDate, endDate, limit, skip };
  let res = await apiSampling.getSamplingHistory(params);
  try { if (res && res.json) res = await res.json(); } catch (e) {}

  let items = [];
  if (Array.isArray(res)) items = res;
  else if (res && res.data && Array.isArray(res.data)) items = res.data;
  else if (res && res.data && Array.isArray(res.data.records)) items = res.data.records;
  else if (res && res.records && Array.isArray(res.records)) items = res.records;

  try { const deduped = dedupeItems(items); writeCache(deduped); const activityObj = readActivity(); activityObj[`sampling_${pondId || 'global'}`] = new Date().toISOString(); writeActivity(activityObj); } catch (e) {}

  return dedupeItems(items);
}

export async function updateSampling(samplingId, payload, apiFetch = true) {
  // Backend API expects snake_case fields
  const body = {
    sample_date: payload.sample_date || payload.sampling_date || payload.samplingDate,
    sample_count: payload.sample_count ? Number(payload.sample_count) : undefined,
    avg_weight_g: payload.avg_weight_g ? Number(payload.avg_weight_g) : undefined,
    min_weight_g: payload.min_weight_g ? Number(payload.min_weight_g) : undefined,
    max_weight_g: payload.max_weight_g ? Number(payload.max_weight_g) : undefined,
    notes: payload.notes,
  };

  // Remove undefined values
  Object.keys(body).forEach(key => {
    if (body[key] === undefined || body[key] === null || body[key] === '') {
      delete body[key];
    }
  });


  let result = null;
  if (apiFetch) {
    result = await apiSampling.updateSampling(samplingId, body);
    if (result && result.json) {
      try { result = await result.json(); } catch (e) { /* ignore */ }
    }
  } else {
    result = { sampling_id: samplingId, ...body, updated_at: new Date().toISOString() };
  }

  // Invalidate cache
  try {
    const cache = readCache() || [];
    const stockId = payload.stock_id || result.stock_id;
    const pondId = payload.pond_id || result.pond_id;

    // Update item in cache
    const next = cache.map(x =>
      (x.sampling_id === samplingId || x.id === samplingId)
        ? { ...x, ...result }
        : x
    );
    writeCache(next);

    // Update activity timestamps
    const activityObj = readActivity();
    if (stockId) activityObj[`sampling_stock_${stockId}`] = new Date().toISOString();
    if (pondId) activityObj[`sampling_${pondId}`] = new Date().toISOString();
    writeActivity(activityObj);
  } catch (e) {
    console.error('[sampling.updateSampling] Cache error:', e);
  }

  return result;
}

export function clearSamplingCache() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }

export default { createSampling, getSamplings: getSamplings, getSamplingHistory, updateSampling, clearSamplingCache };
