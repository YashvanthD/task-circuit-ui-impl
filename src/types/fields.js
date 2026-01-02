/**
 * Field metadata used to drive dynamic cards and mapping between backend shapes and UI.
 * Each resource (user, pond, fish, task, ...) has an array of field definitions. Fields
 * include: key (canonical), label, type, description, aliases (possible backend keys),
 * visibility/card hints and optional format/formatter name.
 *
 * This lets components render cards and maps dynamically without hardcoding field names.
 */

/**
 * @typedef {'string'|'number'|'date'|'boolean'|'list'|'object'|'currency'} FieldType
 */

/**
 * @typedef {Object} FieldDef
 * @property {string} key - canonical field key used by UI (e.g. 'pond_id')
 * @property {string} label - human readable label
 * @property {FieldType} type - data type
 * @property {string} [desc] - short description
 * @property {Array<string>} [aliases] - backend keys that map to this field
 * @property {boolean} [visible] - whether to show by default in lists/cards
 * @property {Object} [card] - card specific display hints: { show, order, prominent }
 * @property {string} [formatter] - optional formatter id to apply when rendering
 */

/**
 * @typedef {Object<string, FieldDef[]>} ResourceFieldDefs
 */

export const fields = /** @type {ResourceFieldDefs} */ ({
  // Users
  user: [
    { key: 'user_id', label: 'User ID', type: 'string', desc: 'Internal user id', aliases: ['id', 'userId', 'user_id'], visible: false, card: { show: false, order: 1 } },
    { key: 'username', label: 'Username', type: 'string', desc: 'Unique username / login id', aliases: ['username', 'user_name', 'userName', 'login'], visible: true, card: { show: true, order: 10, prominent: true } },
    { key: 'display_name', label: 'Name', type: 'string', desc: 'Full name or display name', aliases: ['displayName', 'name', 'full_name', 'display_name'], visible: true, card: { show: true, order: 20 } },
    { key: 'email', label: 'Email', type: 'string', desc: 'Primary email address', aliases: ['email', 'email_address'], visible: true, card: { show: false, order: 30 } },
    { key: 'mobile', label: 'Mobile', type: 'string', desc: 'Mobile / phone', aliases: ['mobile', 'phone', 'mobile_number'], visible: true, card: { show: false, order: 40 } },
    { key: 'roles', label: 'Roles', type: 'list', desc: 'User roles', aliases: ['roles', 'role'], visible: false, card: { show: false, order: 50 } },
    { key: 'account_key', label: 'Account', type: 'string', desc: 'Account key the user belongs to', aliases: ['accountKey', 'account_key'], visible: false, card: { show: false, order: 60 } },
    { key: 'active', label: 'Active', type: 'boolean', desc: 'Is account active', aliases: ['active', 'is_active'], visible: false, card: { show: false, order: 70 } },
    { key: 'last_login', label: 'Last Login', type: 'date', desc: 'Last login timestamp', aliases: ['lastLogin', 'last_login', 'last_logged_in'], visible: false, card: { show: false, order: 80 }, formatter: 'date' },
    { key: 'createdAt', label: 'Created', type: 'date', desc: 'Account created at', aliases: ['createdAt', 'created_at'], visible: false, card: { show: false, order: 90 }, formatter: 'date' },
    { key: 'profile_photo', label: 'Photo', type: 'string', desc: 'Profile photo URL', aliases: ['profile_photo', 'photo', 'avatar'], visible: false, card: { show: false, order: 100 } },
  ],

  // Ponds
  pond: [
    { key: 'pond_id', label: 'Pond ID', type: 'string', desc: 'Canonical pond identifier', aliases: ['pond_id', 'pondId', 'id', 'pondId', 'pondId'], visible: true, card: { show: true, order: 5, prominent: true } },
    { key: 'pond_cost', label: 'Pond Cost', type: 'number', desc: 'Initial / setup cost for pond', aliases: ['pond_cost', 'cost', 'initial_cost', 'financials.cost', 'financials.initial_cost'], visible: false, card: { show: true, order: 7 }, formatter: 'currency', default: 0 },
    { key: 'total_expenses', label: 'Expenses', type: 'number', desc: 'Total expenses recorded for the pond', aliases: ['total_expenses', 'expenses_total', 'expenses', 'financials.total_expenses'], visible: false, card: { show: true, order: 8 }, formatter: 'currency', default: 0 },
    { key: 'pond_stack', label: 'Stack', type: 'string', desc: 'Overview of stocked species and counts', aliases: ['pond_stack', 'stocked_species'], visible: true, card: { show: true, order: 9 }, formatter: 'string' },
    { key: 'current_stock_value', label: 'Stock Value', type: 'number', desc: 'Estimated value of current stock', aliases: ['current_stock_value', 'currentStockValue', 'stock_value'], visible: false, card: { show: true, order: 10 }, formatter: 'currency', default: 0 },
    { key: 'account_key', label: 'Account', type: 'string', desc: 'Account key owning the pond', aliases: ['accountKey', 'account_key'], visible: false, card: { show: false, order: 6 } },
    { key: 'farm_name', label: 'Farm', type: 'string', desc: 'Farm or site name', aliases: ['farm_name', 'farmName', 'name'], visible: true, card: { show: true, order: 10 } },
    { key: 'pond_location', label: 'Location', type: 'string', desc: 'Human readable location/address', aliases: ['location', 'pond_location', 'address'], visible: true, card: { show: true, order: 20 } },
    { key: 'dimensions', label: 'Dimensions', type: 'object', desc: 'Dimensions object (area, depth, volume)', aliases: ['dimensions'], visible: false, card: { show: false, order: 25 } },
    { key: 'pond_area', label: 'Area (m²)', type: 'number', desc: 'Pond area (m²)', aliases: ['pond_area', 'area', 'size', 'dimensions.area', 'dimensions.area_m2'], visible: true, card: { show: true, order: 30 }, formatter: 'number' },
    { key: 'pond_volume', label: 'Volume (m³)', type: 'number', desc: 'Pond volume (m³)', aliases: ['pond_volume', 'volume', 'dimensions.volume'], visible: false, card: { show: false, order: 40 }, formatter: 'number' },
    { key: 'pond_type', label: 'Type', type: 'string', desc: 'Pond type (earthen, lined, etc.)', aliases: ['pond_type', 'type'], visible: true, card: { show: true, order: 50 } },
    { key: 'pond_shape', label: 'Shape', type: 'string', desc: 'Pond shape', aliases: ['pond_shape', 'shape'], visible: false, card: { show: false, order: 60 } },
    { key: 'status', label: 'Status', type: 'string', desc: 'Pond status', aliases: ['status'], visible: false, card: { show: false, order: 65 } },
    { key: 'waterQuality', label: 'Water Quality Readings', type: 'list', desc: 'Array of water quality readings', aliases: ['waterQuality', 'water_quality'], visible: false, card: { show: false, order: 70 } },
    { key: 'temperature', label: 'Temperature (°C)', type: 'number', desc: 'Latest water temperature', aliases: ['temperature', 'temp', 'waterQuality[0].temperature'], visible: true, card: { show: true, order: 75 }, formatter: 'number2' },
    { key: 'ph', label: 'pH', type: 'number', desc: 'Latest pH reading', aliases: ['ph', 'waterQuality[0].ph'], visible: true, card: { show: true, order: 80 }, formatter: 'number2' },
    { key: 'dissolved_oxygen', label: 'DO (mg/L)', type: 'number', desc: 'Dissolved oxygen', aliases: ['dissolved_oxygen', 'do', 'waterQuality[0].do'], visible: false, card: { show: false, order: 85 } },
    { key: 'currentStock', label: 'Current Stock', type: 'list', desc: 'Stocking records', aliases: ['currentStock', 'current_stock'], visible: false, card: { show: false, order: 90 } },
    { key: 'stocked_species', label: 'Stocked Species', type: 'string', desc: 'Comma-separated species stocked', aliases: ['stocked_species', 'species', 'currentStock'], visible: false, card: { show: false, order: 95 } },
    { key: 'number_stocked', label: 'Number Stocked', type: 'number', desc: 'Total number stocked', aliases: ['number_stocked', 'stock_count', 'currentStock'], visible: false, card: { show: false, order: 100 }, formatter: 'number' },
    { key: 'photos', label: 'Photos', type: 'list', desc: 'Array of photo URLs', aliases: ['photos', 'images'], visible: false, card: { show: false, order: 110 } },
    { key: 'lastMaintenance', label: 'Last Maintenance', type: 'date', desc: 'Last maintenance timestamp', aliases: ['lastMaintenance', 'last_maintenance', 'last_update', 'updatedAt', 'createdAt'], visible: true, card: { show: true, order: 120 }, formatter: 'date' },
    { key: 'createdAt', label: 'Created', type: 'date', desc: 'Created timestamp', aliases: ['createdAt', 'created_at'], visible: false, card: { show: false, order: 130 }, formatter: 'date' },
    { key: 'notes', label: 'Notes', type: 'string', desc: 'Freeform notes', aliases: ['notes', 'description'], visible: false, card: { show: false, order: 140 } },
  ],

  // Fish
  fish: [
    { key: 'fish_id', label: 'Fish ID', type: 'string', desc: 'Fish unique id', aliases: ['fish_id', 'id'], visible: false, card: { show: false, order: 5 } },
    { key: 'species', label: 'Species', type: 'string', desc: 'Species name', aliases: ['species', 'type', 'name'], visible: true, card: { show: true, order: 10, prominent: true } },
    { key: 'strain', label: 'Strain', type: 'string', desc: 'Strain/breed', aliases: ['strain'], visible: false, card: { show: false, order: 15 } },
    { key: 'count', label: 'Count', type: 'number', desc: 'Number of individuals', aliases: ['count', 'number'], visible: true, card: { show: true, order: 20 } },
    { key: 'average_weight', label: 'Avg Weight (g)', type: 'number', desc: 'Average weight in grams', aliases: ['average_weight', 'avg_weight'], visible: false, card: { show: false, order: 30 }, formatter: 'number2' },
    { key: 'stocked_date', label: 'Stocked Date', type: 'date', desc: 'Date stocked', aliases: ['stocked_date', 'stockedAt'], visible: false, card: { show: false, order: 40 }, formatter: 'date' },
    { key: 'pond_id', label: 'Pond ID', type: 'string', desc: 'Pond where fish present', aliases: ['pond_id', 'pondId'], visible: true, card: { show: true, order: 50 } },
    { key: 'batch_id', label: 'Batch', type: 'string', desc: 'Stocking batch id', aliases: ['batch_id', 'batchId'], visible: false, card: { show: false, order: 55 } },
    { key: 'mortality_rate', label: 'Mortality %', type: 'number', desc: 'Mortality percentage', aliases: ['mortality_rate', 'mortality'], visible: false, card: { show: false, order: 60 }, formatter: 'percent' },
    { key: 'feed_type', label: 'Feed', type: 'string', desc: 'Feed type', aliases: ['feed_type', 'feed'], visible: false, card: { show: false, order: 70 } },
  ],

  // Sampling (new resource)
  sampling: [
    { key: 'sampling_id', label: 'Sampling ID', type: 'string', desc: 'Sampling record id', aliases: ['sampling_id', 'id'], visible: false, card: { show: false, order: 5 } },
    { key: 'pond_id', label: 'Pond', type: 'string', desc: 'Pond identifier for sampling', aliases: ['pond_id', 'pondId', 'pond'], visible: true, card: { show: true, order: 10 } },
    { key: 'species', label: 'Species', type: 'string', desc: 'Species sampled', aliases: ['species', 'species_id', 'common_name'], visible: true, card: { show: true, order: 15, prominent: true } },
    { key: 'sampling_count', label: 'Sampled Count', type: 'number', desc: 'Number of fish sampled to compute average', aliases: ['sampling_count', 'sample_count'], visible: true, card: { show: true, order: 20 } },
    { key: 'total_count', label: 'Total Count', type: 'number', desc: 'Total number intended to purchase/stock', aliases: ['total_count', 'count', 'totalCount'], visible: true, card: { show: true, order: 25 } },
    { key: 'avg_weight', label: 'Avg Weight (g)', type: 'number', desc: 'Average weight per sampled fish (grams)', aliases: ['avg_weight', 'average_weight'], visible: true, card: { show: true, order: 30 }, formatter: 'number2', default: 1000 },
    { key: 'fish_cost', label: 'Fish Cost (INR/kg)', type: 'number', desc: 'Cost per kilogram used for computing total', aliases: ['fish_cost', 'cost_per_kg', 'price_per_kg'], visible: true, card: { show: true, order: 35 }, formatter: 'currency', default: 50 },
    { key: 'computed_total', label: 'Computed Total (INR)', type: 'currency', desc: 'Computed total amount (total_count * max(avg_weight,1kg) * fish_cost)', aliases: ['computed_total', 'computedAmount'], visible: true, card: { show: true, order: 40 }, formatter: 'currency' },
    { key: 'total_amount', label: 'Total Amount (INR)', type: 'currency', desc: 'Final total amount (editable override)', aliases: ['total_amount', 'amount', 'totalAmount'], visible: true, card: { show: true, order: 45 }, formatter: 'currency' },
    { key: 'manual_total', label: 'Manual Total', type: 'boolean', desc: 'Whether total_amount was manually overridden', aliases: ['manual_total'], visible: false, card: { show: false, order: 50 } },
    { key: 'notes', label: 'Notes', type: 'string', desc: 'Sampling notes', aliases: ['notes', 'remarks'], visible: false, card: { show: false, order: 60 } },
    { key: 'createdAt', label: 'Created', type: 'date', desc: 'Sampling created timestamp', aliases: ['createdAt', 'created_at', 'timestamp'], visible: false, card: { show: false, order: 70 }, formatter: 'date' },
  ],

  // Tasks
  task: [
    { key: 'task_id', label: 'Task ID', type: 'string', desc: 'Task identifier', aliases: ['task_id', 'id'], visible: false, card: { show: false, order: 5 } },
    { key: 'title', label: 'Title', type: 'string', desc: 'Task title', aliases: ['title', 'name'], visible: true, card: { show: true, order: 10, prominent: true } },
    { key: 'description', label: 'Description', type: 'string', desc: 'Task description', aliases: ['description', 'desc'], visible: false, card: { show: false, order: 20 } },
    { key: 'status', label: 'Status', type: 'string', desc: 'Task workflow status', aliases: ['status'], visible: true, card: { show: true, order: 30 } },
    { key: 'assignee', label: 'Assignee', type: 'string', desc: 'User assigned', aliases: ['assignee', 'assigned_to', 'owner'], visible: true, card: { show: true, order: 40 } },
    { key: 'reporter', label: 'Reporter', type: 'string', desc: 'User who created the task', aliases: ['reporter', 'createdBy', 'created_by'], visible: false, card: { show: false, order: 45 } },
    { key: 'due_date', label: 'Due Date', type: 'date', desc: 'Due date for the task', aliases: ['due_date', 'dueDate'], visible: false, card: { show: false, order: 50 }, formatter: 'date' },
    { key: 'priority', label: 'Priority', type: 'string', desc: 'Priority (Low/Medium/High)', aliases: ['priority'], visible: false, card: { show: false, order: 60 } },
    { key: 'tags', label: 'Tags', type: 'list', desc: 'Tags/labels', aliases: ['tags', 'labels'], visible: false, card: { show: false, order: 70 } },
    { key: 'attachments', label: 'Attachments', type: 'list', desc: 'Attachment URLs', aliases: ['attachments', 'files'], visible: false, card: { show: false, order: 80 } },
    { key: 'createdAt', label: 'Created', type: 'date', desc: 'Created timestamp', aliases: ['createdAt', 'created_at'], visible: false, card: { show: false, order: 90 }, formatter: 'date' },
    { key: 'updatedAt', label: 'Updated', type: 'date', desc: 'Last updated timestamp', aliases: ['updatedAt', 'updated_at'], visible: false, card: { show: false, order: 100 }, formatter: 'date' },
  ],
});

/**
 * Helper: get field defs for a resource
 * @param {string} resource
 * @returns {FieldDef[]}
 */
export function getFieldDefs(resource) {
  return fields[resource] || [];
}

/**
 * Helper: get fields intended for display on lists/cards (card.show=true)
 * @param {string} resource
 * @returns {FieldDef[]}
 */
export function getCardFields(resource) {
  return getFieldDefs(resource).filter(f => f.card && f.card.show).sort((a,b) => (a.card.order||0) - (b.card.order||0));
}

/**
 * Helper: get visible default fields (visible === true)
 * @param {string} resource
 * @returns {FieldDef[]}
 */
export function getVisibleFields(resource) {
  return getFieldDefs(resource).filter(f => f.visible).sort((a,b) => ((a.card && a.card.order) || 0) - ((b.card && b.card.order) || 0));
}

/**
 * Helper: find best matching value from backend object using aliases.
 * Supports nested dot paths like 'dimensions.area' and simple array access hints 'waterQuality[0].temperature'.
 * @param {FieldDef} def
 * @param {Object} src
 */
export function resolveFieldValue(def, src) {
  if (!def || !src) return undefined;
  // build keys array safely: aliases first, then canonical key
  const keys = Array.isArray(def.aliases) && def.aliases.length ? [...def.aliases] : [];
  if (def.key && !keys.includes(def.key)) keys.push(def.key);
  for (const k of keys) {
    if (typeof k !== 'string') continue;
    // direct key
    if (k in src) return src[k];
    // dotted path
    if (k.includes('.')) {
      const v = getNested(src, k);
      if (v !== undefined) return v;
    }
    // array index hint like 'waterQuality[0].temperature'
    if (k.includes('[') && k.includes(']')) {
      const v = getNested(src, k);
      if (v !== undefined) return v;
    }
  }
  // try canonical key as fallback
  if (def.key && typeof def.key === 'string' && def.key in src) return src[def.key];
  return undefined;
}

function getNested(obj, path) {
  if (!obj || !path) return undefined;
  // support parts with array indexes: e.g. 'waterQuality[0].temperature'
  const parts = path.split('.');
  let cur = obj;
  for (const part of parts) {
    if (part.includes('[')) {
      // split before bracket
      const arrKey = part.split('[')[0];
      if (!(arrKey in cur)) return undefined;
      const idxStr = part.slice(part.indexOf('[')+1, part.indexOf(']'));
      const idx = parseInt(idxStr, 10);
      if (!Array.isArray(cur[arrKey]) || cur[arrKey].length <= idx) return undefined;
      cur = cur[arrKey][idx];
      // if there's remainder after ] like 'arr[0].prop' it's handled by next loop iteration
    } else {
      if (!(part in cur)) return undefined;
      cur = cur[part];
    }
    if (cur === undefined || cur === null) return cur;
  }
  return cur;
}

const exported = { fields, getFieldDefs, getCardFields, getVisibleFields, resolveFieldValue };
export default exported;
