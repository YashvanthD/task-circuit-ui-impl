import * as apiSampling from './apis/api_sampling';

export async function createSampling(payload) {
  // Map UI payload to API DTO (GrowthRecordDTO / sampling endpoint)
  const body = {
    pondId: payload.pond_id || payload.pondId || (payload.pond && (payload.pond.id || payload.pond.pond_id)),
    species: (payload.species && (payload.species.species_id || payload.species)) || payload.species || '',
    sampleSize: Number(payload.count || payload.sampleSize || 0) || 0,
    averageWeight: Number(payload.avg_weight || payload.averageWeight || 0) || 0,
    // include any additional fields passed through
    ...payload.extra,
    notes: payload.notes || payload.note || '',
  };

  const res = await apiSampling.createSampling(body);
  // if apiFetch returned a Response-like object, try to parse json
  if (res && res.json) {
    try { return await res.json(); } catch (e) { return res; }
  }
  return res;
}

export default { createSampling };
