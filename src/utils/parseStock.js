/**
 * Parsing utilities for fish stock objects returned by backend
 */
export function parseStock(s = {}) {
  const stock_id = s.stock_id || s.stockId || s.id || s._id || '';
  const species_id = s.species_id || s.speciesId || '';
  const pond_id = s.pond_id || s.pondId || '';
  const farm_id = s.farm_id || s.farmId || '';
  const account_key = s.account_key || s.accountKey || '';

  const species_name = s.species_name || s.speciesName || s.common_name || s.name || '';
  const pond_name = s.pond_name || s.pondName || '';

  const initial_count = Number(s.initial_count || s.initialCount || s.quantity || 0) || 0;
  const current_count = Number(s.current_count || s.currentCount || initial_count) || 0;
  const initial_avg_weight_g = Number(s.initial_avg_weight_g || s.initialAvgWeightG || s.avg_weight_g || 0) || 0;

  const stocking_date = s.stocking_date || s.stockingDate || s.date || '';
  const termination_date = s.termination_date || s.terminationDate || null;

  const status = s.status || (termination_date ? 'inactive' : 'active');
  const batch_number = s.batch_number || s.batchNumber || '';
  const source = s.source || '';
  const notes = s.notes || '';

  return {
    ...s,
    id: stock_id,
    stock_id,
    species_id,
    pond_id,
    farm_id,
    account_key,
    species_name,
    pond_name,
    initial_count,
    current_count,
    initial_avg_weight_g,
    stocking_date,
    termination_date,
    status,
    batch_number,
    source,
    notes,
  };
}

export function parseStockList(list = []) {
  if (!Array.isArray(list)) return [];
  return list.map(parseStock);
}
