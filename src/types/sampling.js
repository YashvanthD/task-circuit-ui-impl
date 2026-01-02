// Sampling type definition (JS) - simple schema and helpers for forms

/**
 * @typedef {Object} GrowthRecordDTO
 * @property {string} [id]
 * @property {string} [samplingId]
 * @property {string} pondId
 * @property {string} species
 * @property {number} [sampleSize]
 * @property {number} [averageWeight] // kg
 * @property {number} [cost]
 * @property {string} [costUnit]
 * @property {number} [totalAmount]
 * @property {number} [totalCount]
 * @property {string} [samplingDate]
 * @property {string} [recordedBy]
 * @property {string} [notes]
 * @property {string} [createdAt]
 */

export const SamplingFields = {
  pond_id: { label: 'Pond', type: 'string', desc: 'Pond identifier or object', required: true },
  species: { label: 'Species', type: 'object', desc: 'Species object or string (species_id)', required: true },
  sampling_count: { label: 'Sampled Count', type: 'number', desc: 'Number of fish sampled', required: true },
  total_count: { label: 'Total Count', type: 'number', desc: 'Total number in stock/purchase', required: false },
  avg_weight: { label: 'Average weight (g)', type: 'number', desc: 'Average weight in grams per fish', required: false },
  fish_cost: { label: 'Fish cost (INR per kg)', type: 'number', desc: 'Cost per kilogram', required: false },
  total_amount: { label: 'Total amount (INR)', type: 'number', desc: 'Total amount either computed or manual override', required: false },
  manual_total: { label: 'Manual total flag', type: 'boolean', desc: 'Whether total_amount was manually overridden', required: false },
  sampling_date: { label: 'Sampling date', type: 'date', desc: 'Date when sampling was performed', required: false },
  notes: { label: 'Notes', type: 'string', desc: 'Additional notes', required: false },
  createdAt: { label: 'Created at', type: 'string', desc: 'ISO timestamp', required: false },
};

export function normalizeSampling(input = {}) {
  // Normalize incoming sampling payload to canonical shape
  const species = input.species;
  const speciesObj = !species ? null : (typeof species === 'string' ? { species_id: species, common_name: species, scientific_name: '' } : {
    species_id: species.species_id || species.id || species.speciesCode || '',
    common_name: species.common_name || species.commonName || '',
    scientific_name: species.scientific_name || species.scientificName || '',
  });

  // normalize samplingDate if present
  let samplingDate = input.samplingDate || input.sampling_date || input.date || input.createdAt || input.created_at || null;
  if (samplingDate) {
    try { samplingDate = new Date(samplingDate).toISOString(); } catch (e) { /* ignore */ }
  }

  // cost_enabled: default to true when not provided by backend (UI expects enabled by default)
  const costEnabledProvided = (input.cost_enabled !== undefined) || (input.costEnabled !== undefined);
  const cost_enabled = costEnabledProvided ? Boolean(input.cost_enabled ?? input.costEnabled) : true;

  return {
    pond_id: (input.pond_id && typeof input.pond_id === 'object') ? (input.pond_id.pond_id || input.pond_id.id || input.pond_id) : (input.pond_id || input.pondId || ''),
    species: speciesObj,
    sampling_count: Number(input.sampling_count || input.sampleSize || input.sample_size || 0) || 0,
    total_count: Number(input.total_count || input.totalCount || input.total || 0) || 0,
    avg_weight: Number(input.avg_weight || input.averageWeight || 0) || 0, // grams in UI
    fish_cost: Number(input.fish_cost || input.cost || 0) || 0,
    total_amount: Number(input.total_amount || input.totalAmount || 0) || 0,
    manual_total: Boolean(input.manual_total || input.manualTotal),
    cost_enabled: cost_enabled,
    sampling_date: samplingDate,
    notes: input.notes || '',
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export default { SamplingFields, normalizeSampling };
