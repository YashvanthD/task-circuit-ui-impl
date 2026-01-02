// Sampling type definition (JS) - simple schema and helpers for forms

export const SamplingFields = {
  pond_id: { label: 'Pond', type: 'string', desc: 'Pond identifier or object', required: true },
  species: { label: 'Species', type: 'object', desc: 'Species object or string (species_id)', required: true },
  count: { label: 'Count', type: 'number', desc: 'Number of fish sampled', required: true },
  avg_weight: { label: 'Average weight (g)', type: 'number', desc: 'Average weight in grams per fish', required: false },
  fish_cost: { label: 'Fish cost (INR per kg)', type: 'number', desc: 'Cost per kilogram', required: false },
  total_amount: { label: 'Total amount (INR)', type: 'number', desc: 'Total amount either computed or manual override', required: false },
  manual_total: { label: 'Manual total flag', type: 'boolean', desc: 'Whether total_amount was manually overridden', required: false },
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

  return {
    pond_id: (input.pond_id && typeof input.pond_id === 'object') ? (input.pond_id.pond_id || input.pond_id.id || input.pond_id) : (input.pond_id || input.pondId || ''),
    species: speciesObj,
    count: Number(input.count || 0) || 0,
    avg_weight: Number(input.avg_weight || 0) || 0,
    fish_cost: Number(input.fish_cost || 0) || 0,
    total_amount: Number(input.total_amount || 0) || 0,
    manual_total: Boolean(input.manual_total),
    notes: input.notes || '',
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export default { SamplingFields, normalizeSampling };
