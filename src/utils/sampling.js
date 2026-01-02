import * as apiSampling from './apis/api_sampling';

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

// Normalize UI payload keys to API DTO keys for sampling operations
function normalizeSamplingPayload(payload = {}) {
  const out = { ...payload };
  // derive sampleSize from several possible UI names: sampling_count, samplingCount, count, sampleSize
  const rawCount = payload.sampling_count ?? payload.samplingCount ?? payload.count ?? payload.sampleSize ?? payload.sample_size ?? payload.sample_count;
  if (rawCount !== undefined) {
    // ensure numeric
    const n = Number(rawCount);
    out.sampleSize = Number.isFinite(n) ? n : 0;
  }
  // also normalize average weight aliases
  const rawAvg = payload.averageWeight ?? payload.avg_weight ?? payload.average_weight ?? payload.averageSize ?? payload.average_size;
  if (rawAvg !== undefined) {
    const w = Number(rawAvg);
    // If alias came from avg_weight (grams), convert to kg; if explicit averageWeight provided, assume it's kg
    if (payload.avg_weight !== undefined || payload.average_weight !== undefined || payload.averageSize !== undefined || payload.average_size !== undefined) {
      out.averageWeight = Number.isFinite(w) ? (w / 1000) : 0; // convert grams -> kg
    } else {
      out.averageWeight = Number.isFinite(w) ? w : 0; // already kg
    }
  }
  // normalize species: ensure we send string species code/id
  if (payload.species !== undefined && payload.species !== null) {
    const s = payload.species;
    if (typeof s === 'string') {
      out.species = s;
    } else if (typeof s === 'object') {
      out.species = s.species_id || s.speciesId || s.species_code || s.speciesCode || s.id || s._id || s.speciesCode || null;
    }
  }
  // normalize sampling date if provided (accept YYYY-MM-DD or ISO); convert to ISO string with date component
  const rawDate = payload.sampling_date ?? payload.samplingDate ?? payload.date ?? payload.samplingDateRaw;
  if (rawDate !== undefined && rawDate !== null && rawDate !== '') {
    try {
      // If user provided YYYY-MM-DD keep as date-only ISO string
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(rawDate))) {
        out.samplingDate = new Date(String(rawDate)).toISOString();
      } else {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) out.samplingDate = d.toISOString();
      }
    } catch (e) { /* ignore invalid date */ }
  }
  // normalize recorded by user key from UI alias to API field recordedBy
  const recorder = payload.recorded_by_userKey ?? payload.recordedBy ?? payload.recorded_by ?? payload.recorded_by_user ?? payload.recorded_by_userKey ?? payload.recordedByUser;
  if (recorder !== undefined) {
    out.recordedBy = recorder;
  }
  // map fish_cost (per kg) to cost and total_amount to totalAmount
  const rawCost = payload.fish_cost ?? payload.cost ?? payload.cost_amount ?? payload.costAmount;
  if (rawCost !== undefined) {
    const c = Number(rawCost);
    if (Number.isFinite(c)) {
      out.cost = c;
      // prefer explicit unit if provided
      out.costUnit = payload.costUnit || payload.cost_unit || payload.costUnit || 'kg';
    }
  }
  const rawTotal = payload.total_amount ?? payload.totalAmount ?? payload.total_cost ?? payload.totalCost;
  if (rawTotal !== undefined) {
    const t = Number(rawTotal);
    if (Number.isFinite(t)) out.totalAmount = t;
  }
  // Remove common UI-only aliases to avoid duplicate/confusing fields being sent
  delete out.sampling_count; delete out.samplingCount; delete out.count; delete out.sample_size; delete out.sample_count; delete out.avg_weight; delete out.average_size; delete out.average_weight;
  // also remove UI recorder alias
  delete out.recorded_by_userKey; delete out.recorded_by; delete out.recordedByUser; delete out.recorded_by_user;
  // remove UI cost aliases
  delete out.fish_cost; delete out.cost_amount; delete out.costAmount; delete out.total_amount; delete out.total_cost; delete out.totalCost;
  return out;
}

export async function createSampling(payload, apiFetch = true) {
  // Map UI payload to API DTO (GrowthRecordDTO / sampling endpoint)
  // start from payload and normalize keys
  const normalized = normalizeSamplingPayload(payload);
  const speciesVal = (typeof normalized.species === 'string') ? normalized.species : (normalized.species && (normalized.species.species_id || normalized.species)) || '';
  const body = {
    pondId: normalized.pond_id || normalized.pondId || (normalized.pond && (normalized.pond.id || normalized.pond.pond_id)),
    species: speciesVal || '',
    sampleSize: normalized.sampleSize || 0,
    averageWeight: normalized.averageWeight || 0,
    // include any additional fields passed through
    ...normalized.extra,
    notes: normalized.notes || normalized.note || '',
    // allow overriding recorder if provided
    ...(normalized.recordedBy ? { recordedBy: normalized.recordedBy, recorded_by: normalized.recordedBy } : {}),
    ...(normalized.cost !== undefined ? { cost: normalized.cost, cost_unit: normalized.costUnit || 'kg', costUnit: normalized.costUnit || 'kg' } : {}),
    ...(normalized.totalAmount !== undefined ? { totalAmount: normalized.totalAmount, total_amount: normalized.totalAmount } : {}),
  };
  // include samplingDate if normalized
  if (normalized.samplingDate) {
    body.samplingDate = normalized.samplingDate;
    body.sampling_date = normalized.samplingDate;
  }

  console.debug('[sampling.createSampling] payload normalized body:', body);

  let result = null;
  if (apiFetch) {
    result = await apiSampling.createSampling(body);
    if (result && result.json) {
      try { result = await result.json(); } catch (e) { /* ignore */ }
    }
  } else {
    // simulate created object with id and createdAt
    result = { id: `local-${Date.now()}`, pondId: body.pondId, species: body.species, sampleSize: body.sampleSize, averageWeight: body.averageWeight, createdAt: new Date().toISOString(), cost: body.cost, totalAmount: body.totalAmount };
  }

  // Invalidate cache for this pond so next get will refresh or allow manual sync.
  try {
    const activity = readActivity();
    activity[`sampling_${body.pondId || 'global'}`] = new Date().toISOString();
    writeActivity(activity);
    // Also append to local cache if present (dedupe to avoid duplicates)
    const cache = readCache() || [];
    cache.unshift(result);
    const deduped = dedupeItems(cache);
    writeCache(deduped);
  } catch (e) { /* ignore */ }

  return result;
}

export async function getSamplings({ pondId = null, fishId = null, forceApi = false, limit = 100, skip = 0, startDate = null, endDate = null } = {}) {
  // If cache is fresh and not forcing API, return cached items
  const cache = readCache();
  const activity = readActivity();
  const lastFetched = activity[`sampling_${pondId || 'global'}`];

  if (!forceApi && cache && cache.length > 0 && lastFetched) {
    const filtered = cache.filter((s) => {
      if (pondId && (s.pondId && s.pondId !== pondId)) return false;
      if (fishId && (s.species && s.species !== fishId)) return false;
      return true;
    });
    const dedupedFiltered = dedupeItems(filtered);
    return dedupedFiltered.slice(skip, skip + limit);
  }

  // Always fetch from the canonical history endpoint
  const params = { pondId, fishId, startDate, endDate, limit, skip };
  let res = await apiSampling.getSamplingHistory(params);
  try {
    if (res && res.json) res = await res.json();
  } catch (e) { /* ignore */ }

  // normalize possible shapes
  let items = [];
  if (Array.isArray(res)) items = res;
  else if (res && res.data && Array.isArray(res.data.records)) items = res.data.records;
  else if (res && res.data && Array.isArray(res.data)) items = res.data;
  else if (res && Array.isArray(res.items)) items = res.items;
  else if (res && res.records && Array.isArray(res.records)) items = res.records;
  else if (res && res.ponds && Array.isArray(res.ponds)) items = res.ponds;

  // dedupe, cache and update activity
  try { const deduped = dedupeItems(items); writeCache(deduped); const activityObj = readActivity(); activityObj[`sampling_${pondId || 'global'}`] = new Date().toISOString(); writeActivity(activityObj); } catch (e) {}

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

export async function updateSampling(id, payload, apiFetch = true) {
  // Normalize payload so backend gets sampleSize key
  const normalized = normalizeSamplingPayload(payload);
  // ensure species normalized to string if present
  if (normalized.species && typeof normalized.species !== 'string') {
    normalized.species = normalized.species.species_id || normalized.species.speciesId || normalized.species.id || normalized.species._id || normalized.species;
  }
  // include sampling date variants if present
  if (normalized.samplingDate) {
    normalized.sampling_date = normalized.samplingDate;
  }
  // include snake_case variants as some backends expect them
  if (normalized.recordedBy) normalized.recorded_by = normalized.recordedBy;
  if (normalized.cost !== undefined) {
    normalized.cost_unit = normalized.costUnit || normalized.cost_unit || 'kg';
    normalized.costUnit = normalized.costUnit || normalized.cost_unit || 'kg';
  }
  if (normalized.totalAmount !== undefined) normalized.total_amount = normalized.totalAmount;

  console.debug('[sampling.updateSampling] id, normalized payload:', id, normalized);
  let result = null;
  if (apiFetch) {
    result = await apiSampling.updateSampling(id, normalized);
    if (result && result.json) {
      try { result = await result.json(); } catch (e) { /* ignore */ }
    }
  } else {
    result = { id, ...normalized, updatedAt: new Date().toISOString() };
  }

  try {
    const cache = readCache() || [];
    const next = cache.map(x => (x.id === id || x._id === id ? { ...x, ...result } : x));
    writeCache(next);
    const activityObj = readActivity(); activityObj[`sampling_${result.pondId || 'global'}`] = new Date().toISOString(); writeActivity(activityObj);
  } catch (e) {}

  return result;
}

export function clearSamplingCache() { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} }

export default { createSampling, getSamplings: getSamplings, getSamplingHistory, updateSampling, clearSamplingCache };
