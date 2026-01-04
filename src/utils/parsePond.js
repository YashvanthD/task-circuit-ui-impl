/**
 * Pond parsing utilities - normalize backend pond objects to UI-friendly shape.
 * Keep parsing logic here so components remain clean and focused on presentation.
 */

/**
 * Normalize a single pond object coming from backend into a UI-friendly Pond shape.
 * @param {Object} p
 * @returns {Object} normalized pond
 */
export function parsePond(p = {}) {
  const farmName = p.farmName || p.farm_name || p.name || '';
  const pondId = p.pondId || p.pond_id || p.id || '';

  let pondLocation = '';
  if (p.location) {
    if (typeof p.location === 'string') pondLocation = p.location;
    else if (p.location.address) pondLocation = p.location.address;
    else if (p.location.name) pondLocation = p.location.name;
    else pondLocation = JSON.stringify(p.location);
  }

  const dims = p.dimensions || {};
  const pondArea = p.pond_area || dims.area || dims.area_m2 || p.size || '';
  const pondVolume = p.pond_volume || p.volume || dims.volume || '';
  const pondType = p.pond_type || p.type || '';
  const pondShape = p.pond_shape || p.shape || '';

  // water quality
  let temperature = p.temperature || '';
  let ph = p.ph || '';
  let dissolved_oxygen = p.dissolved_oxygen || '';
  const wq = p.waterQuality || p.water_quality || [];
  if (Array.isArray(wq) && wq.length > 0) {
    const first = wq[0];
    temperature = temperature || first.temperature || first.temp || '';
    ph = ph || first.ph || '';
    dissolved_oxygen = dissolved_oxygen || first.do || first.dissolved_oxygen || '';
  }

  const rawCurrentStock = p.currentStock || p.current_stock || [];
  // Normalize stock entries: prefer numeric counts (quantity/count/number), normalize averageWeight -> average_weight, unit price keys, and keep original fields
  const currentStock = Array.isArray(rawCurrentStock) ? rawCurrentStock.map(s => {
    const cnt = Number(s.count || s.number || s.quantity || 0) || 0;
    const rawAvg = (s.averageWeight !== undefined) ? s.averageWeight : (s.average_weight !== undefined ? s.average_weight : (s.avgWeight !== undefined ? s.avgWeight : (s.avg_weight !== undefined ? s.avg_weight : (s.avg !== undefined ? s.avg : (s.weight !== undefined ? s.weight : null)))));
    // Normalize average weight to grams for UI consumers. Some APIs send averageWeight in kilograms (e.g., 1)
    let avgVal = null;
    if (rawAvg !== null && rawAvg !== undefined && rawAvg !== '') {
      const n = Number(rawAvg);
      if (!Number.isNaN(n)) {
        // Heuristic: values <= 10 are likely kilograms (1, 2.5, etc.) -> convert to grams
        if (n > 0 && n <= 10) avgVal = n * 1000;
        else avgVal = n;
      }
    }
    const unitPrice = (s.unit_price !== undefined) ? s.unit_price : (s.price !== undefined ? s.price : (s.avg_price !== undefined ? s.avg_price : (s.avgPrice !== undefined ? s.avgPrice : 0)));
    return {
      ...s,
      count: cnt,
      quantity: Number(s.quantity || s.count || s.number || 0) || 0,
      average_weight: avgVal === null ? null : (Number(avgVal) || 0),
      unit_price: Number(unitPrice || 0) || 0,
    };
  }) : [];
  const stocked_species = Array.isArray(currentStock) && currentStock.length > 0 ? currentStock.map(s => s.species || s.name || '').filter(Boolean).join(', ') : '';
  const number_stocked = Array.isArray(currentStock) && currentStock.length > 0 ? currentStock.reduce((acc, s) => acc + (Number(s.count || s.number || s.quantity || 0) || 0), 0) : (p.number_stocked || 0);

  const last_update = p.lastMaintenance || p.last_maintenance || p.last_update || p.updatedAt || p.createdAt || '';

  // Pond overview: cost, expenses and stack (fish summary)
  let pond_cost = null;
  if (p.pond_cost) pond_cost = p.pond_cost;
  else if (p.cost) pond_cost = p.cost;
  else if (p.financials && (p.financials.cost || p.financials.initial_cost)) pond_cost = p.financials.cost || p.financials.initial_cost;

  // Default pond_cost to 0 (hardcoded for now; API will supply later)
  if (pond_cost === null || pond_cost === undefined) pond_cost = 0;

  // total expenses: support { expenses: [{amount, value}], expenses_total, total_expenses }
  let total_expenses = null;
  if (typeof p.total_expenses === 'number') total_expenses = p.total_expenses;
  else if (typeof p.expenses_total === 'number') total_expenses = p.expenses_total;
  else if (Array.isArray(p.expenses) && p.expenses.length > 0) {
    total_expenses = p.expenses.reduce((acc, it) => acc + (Number(it.amount || it.value || 0) || 0), 0);
  } else if (p.financials && typeof p.financials.total_expenses === 'number') total_expenses = p.financials.total_expenses;

  // Default total_expenses to 0 (hardcoded for now)
  if (total_expenses === null || total_expenses === undefined) total_expenses = 0;

  // pond stack summary from currentStock: species(count)
  let pond_stack = '';
  if (Array.isArray(currentStock) && currentStock.length > 0) {
    pond_stack = currentStock.map(s => {
      const name = s.species || s.name || s.type || '';
      const cnt = Number(s.count || s.number || s.quantity || 0) || '';
      return cnt ? `${name} (${cnt})` : name;
    }).filter(Boolean).join(', ');
  } else if (p.stocked_species) pond_stack = p.stocked_species;

  // current stock value if unit price available
  let current_stock_value = null;
  if (Array.isArray(currentStock) && currentStock.length > 0) {
    current_stock_value = currentStock.reduce((acc, s) => {
      const cnt = Number(s.count || s.number || s.quantity || 0) || 0;
      const price = Number(s.unit_price || s.price || s.avg_price || 0) || 0;
      return acc + (cnt * price);
    }, 0);
    if (current_stock_value === 0) current_stock_value = null;
  }

  // Default current stock value to 0 (hardcoded for now)
  if (current_stock_value === null || current_stock_value === undefined) current_stock_value = 0;

  return {
    ...p,
    // override raw currentStock with normalized structure for UI consumers
    currentStock,
    current_stock: currentStock,
    farm_name: farmName,
    pond_id: pondId,
    pond_location: pondLocation,
    pond_area: pondArea,
    pond_volume: pondVolume,
    pond_type: pondType,
    pond_shape: pondShape,
    temperature,
    ph,
    dissolved_oxygen,
    stocked_species,
    number_stocked,
    last_update,
    pond_cost,
    total_expenses,
    pond_stack,
    current_stock_value,
  };
}

/**
 * Parse various list responses from API into an array of normalized ponds.
 * Accepts:
 *  - an array of ponds
 *  - { ponds: [...] }
 *  - { data: { ponds: [...] } }
 *  - null/undefined => []
 * @param {any} raw
 * @returns {Array<Object>} normalized ponds
 */
export function parsePondList(raw) {
  let arr = [];
  if (!raw) return [];
  if (Array.isArray(raw)) arr = raw;
  else if (raw && Array.isArray(raw.ponds)) arr = raw.ponds;
  else if (raw && raw.data && Array.isArray(raw.data.ponds)) arr = raw.data.ponds;
  else {
    // recursive scan: find first array of objects that look like ponds
    const looksLikePondArray = (a) => {
      if (!Array.isArray(a) || a.length === 0) return false;
      const sample = a[0];
      if (!sample || typeof sample !== 'object') return false;
      const keys = Object.keys(sample).map(k => k.toLowerCase());
      return keys.includes('pondid') || keys.includes('pond_id') || keys.includes('id') || keys.includes('farmname');
    };

    const queue = [raw];
    const seen = new Set();
    while (queue.length) {
      const cur = queue.shift();
      if (!cur || typeof cur !== 'object') continue;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const k of Object.keys(cur)) {
        try {
          const v = cur[k];
          if (Array.isArray(v) && looksLikePondArray(v)) {
            arr = v; break;
          }
          if (v && typeof v === 'object') queue.push(v);
        } catch (e) { /* ignore */ }
      }
      if (arr.length) break;
    }
  }
  return arr.map(parsePond);
}
