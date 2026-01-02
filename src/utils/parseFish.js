/**
 * Parsing utilities for fish objects returned by backend
 */
export function parseFish(f = {}) {
  const id = f.id || f.fish_id || f._id || '';
  const common_name = f.common_name || f.name || f.commonName || '';
  const scientific_name = f.scientific_name || f.scientificName || '';
  const capture_date = f.capture_date || f.captured_at || f.captureDate || '';
  const vessel_name = f.vessel_name || f.vessel || f.vesselName || '';
  const specimen_photo = f.specimen_photo || f.photo || f.image || null;
  const count = Number(f.count || f.quantity || 0) || 0;
  const ponds = Array.isArray(f.ponds) ? f.ponds : (f.pond_list || []);
  const avg_weight = Number(f.avg_weight || f.average_weight || f.avgWeight || 0) || 0;
  const unit_price = Number(f.unit_price || f.price || 0) || 0;

  return {
    ...f,
    id,
    fish_id: id,
    common_name,
    scientific_name,
    capture_date,
    vessel_name,
    specimen_photo,
    count,
    ponds,
    avg_weight,
    unit_price,
  };
}

export function parseFishList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(parseFish);
  if (raw.fish && Array.isArray(raw.fish)) return raw.fish.map(parseFish);
  if (raw.data && Array.isArray(raw.data.fish)) return raw.data.fish.map(parseFish);
  if (raw.data && Array.isArray(raw.data)) return raw.data.map(parseFish);
  return [];
}

