/**
 * Parsing utilities for fish species objects returned by backend
 * Updated to handle new species API structure
 */
export function parseFish(f = {}) {
  // Handle both old fish_id and new species_id
  const id = f.species_id || f.id || f.fish_id || f._id || '';
  const common_name = f.common_name || f.name || f.commonName || '';
  const scientific_name = f.scientific_name || f.scientificName || '';
  const local_name = f.local_name || f.localName || '';
  const category = f.category || '';
  const capture_date = f.capture_date || f.captured_at || f.captureDate || '';
  const stock_date = f.stock_date || f.stockDate || '';
  const vessel_name = f.vessel_name || f.vessel || f.vesselName || '';
  const specimen_photo = f.specimen_photo || f.photo || f.image || null;
  const count = Number(f.count || f.quantity || f.total_count || 0) || 0;
  const ponds = Array.isArray(f.ponds) ? f.ponds : (f.pond_list || []);
  const avg_weight = Number(f.avg_weight || f.average_weight || f.avgWeight || 0) || 0;
  const min_weight = Number(f.min_weight || f.minWeight || 0) || 0;
  const max_weight = Number(f.max_weight || f.maxWeight || 0) || 0;
  const unit_price = Number(f.unit_price || f.price || f.price_per_kg || 0) || 0;
  const status = f.status || 'active';
  const source = f.source || '';
  const notes = f.notes || '';

  return {
    ...f,
    id,
    fish_id: id,
    species_id: id, // Add species_id for new API
    common_name,
    scientific_name,
    local_name,
    category,
    capture_date,
    stock_date,
    vessel_name,
    specimen_photo,
    count,
    ponds,
    avg_weight,
    min_weight,
    max_weight,
    unit_price,
    status,
    source,
    notes,
  };
}

export function parseFishList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(parseFish);
  // New API structure
  if (raw.species && Array.isArray(raw.species)) return raw.species.map(parseFish);
  if (raw.data && Array.isArray(raw.data.species)) return raw.data.species.map(parseFish);
  // Old API structure (fallback)
  if (raw.fish && Array.isArray(raw.fish)) return raw.fish.map(parseFish);
  if (raw.data && Array.isArray(raw.data.fish)) return raw.data.fish.map(parseFish);
  if (raw.data && Array.isArray(raw.data)) return raw.data.map(parseFish);
  return [];
}

