// Utility helpers for expenses search, rendering and formatting.
// Keep these generic and flexible so role/setting-based controls can be applied later.
import { is_admin } from '../permissions';

/**
 * Permission model
 * Roles: 'admin' > 'manager' > 'user'
 * For each top-level category we define which roles can perform actions.
 * Later this mapping can be loaded from server/config UI.
 */
const DEFAULT_RULE = {
  view: ['admin', 'manager', 'user'],
  create_item: ['admin', 'manager', 'user'],
  edit_item: ['admin', 'manager'],
  delete_item: ['admin', 'manager'],
  manage_category: ['admin']
};

const PERMISSION_RULES = {
  'Finance & Treasury': { ...DEFAULT_RULE, view: ['admin'], create_item: ['admin'], edit_item: ['admin'], delete_item: ['admin'], manage_category: ['admin'] },
  'Taxes & Government Charges': { ...DEFAULT_RULE, view: ['admin'], create_item: ['admin'], edit_item: ['admin'], delete_item: ['admin'], manage_category: ['admin'] },
  'Insurance': { ...DEFAULT_RULE, view: ['admin'], create_item: ['admin', 'manager'], edit_item: ['admin', 'manager'], delete_item: ['admin'], manage_category: ['admin'] },
  'Contingency & Reserves': { ...DEFAULT_RULE, view: ['admin'], create_item: ['admin'], edit_item: ['admin'], delete_item: ['admin'], manage_category: ['admin'] },
  'Non-Cash Expenses': { ...DEFAULT_RULE, view: ['admin', 'manager'], create_item: ['admin', 'manager'], edit_item: ['admin', 'manager'], delete_item: ['admin'], manage_category: ['admin'] },
  'Infrastructure': { ...DEFAULT_RULE, manage_category: ['admin', 'manager'], edit_item: ['admin', 'manager'] },
  'Compliance & Regulatory': { ...DEFAULT_RULE, manage_category: ['admin', 'manager'], edit_item: ['admin', 'manager'] },
  'Human Resources': { ...DEFAULT_RULE, view: ['admin', 'manager'], create_item: ['admin', 'manager'], edit_item: ['admin', 'manager'], manage_category: ['admin'] },
  'R&D & Product Development': { ...DEFAULT_RULE, manage_category: ['admin', 'manager'] },
  'Professional Services': { ...DEFAULT_RULE, manage_category: ['admin', 'manager'] },
  'IT & Software': { ...DEFAULT_RULE, manage_category: ['admin', 'manager'] },
  'Operational': { ...DEFAULT_RULE },
  'Hatchery & Stock': { ...DEFAULT_RULE },
  'Sales & Marketing': { ...DEFAULT_RULE },
  'Admin & Office': { ...DEFAULT_RULE },
};

// Grouping of top-level categories so permissions can be applied by group as well
const CATEGORY_GROUPS = {
  'Finance & Treasury': 'financial',
  'Taxes & Government Charges': 'financial',
  'Insurance': 'financial',
  'Contingency & Reserves': 'financial',
  'Non-Cash Expenses': 'financial',
  'Infrastructure': 'assets',
  'Operational': 'operations',
  'Hatchery & Stock': 'operations',
  'Human Resources': 'people',
  'Compliance & Regulatory': 'compliance',
  'R&D & Product Development': 'strategy',
  'Professional Services': 'services',
  'IT & Software': 'it',
  'Sales & Marketing': 'commercial',
  'Admin & Office': 'admin',
};

function normalizeRole(candidateUserOrRole) {
  if (!candidateUserOrRole) return 'user';
  if (typeof candidateUserOrRole === 'string') return candidateUserOrRole;
  // candidate is user object, prefer explicit flags and fields
  try {
    if (is_admin(candidateUserOrRole)) return 'admin';
    const user = candidateUserOrRole.user || candidateUserOrRole;
    const role = (user.role || user.permissions || user.permission || user.roles || '').toString().toLowerCase();
    if (typeof role === 'string' && role.includes('admin')) return 'admin';
    if (typeof role === 'string' && role.includes('manager')) return 'manager';
  } catch (e) {
    // fallback
  }
  return 'user';
}

function roleAllowed(requiredRoles, userRole) {
  // requiredRoles is array like ['admin','manager'] ; userRole is 'admin'|'manager'|'user'
  if (!requiredRoles || requiredRoles.length === 0) return false;
  const rank = { user: 1, manager: 2, admin: 3 };
  const r = userRole || 'user';
  // if any requiredRole has rank <= user's rank, allow. Interpret requiredRoles as minimum role or explicit set.
  for (const rr of requiredRoles) {
    const rrk = rr === 'admin' ? 3 : (rr === 'manager' ? 2 : 1);
    if (rank[r] >= rrk) return true;
  }
  return false;
}

/**
 * Get permission flags for a given category and a user/userRole
 */
export function getPermissionsForCategory(categoryName, userOrRole) {
  const role = normalizeRole(userOrRole);
  const rules = PERMISSION_RULES[categoryName] || DEFAULT_RULE;
  return {
    role,
    canView: roleAllowed(rules.view, role),
    canCreateItem: roleAllowed(rules.create_item, role),
    canEditItem: roleAllowed(rules.edit_item, role),
    canDeleteItem: roleAllowed(rules.delete_item, role),
    canManageCategory: roleAllowed(rules.manage_category, role),
  };
}

/**
 * Load categories filtered and sorted for a given user and query.
 * Returns the same shape as searchCategories but enriched with permissions and sorted.
 */
export function loadVisibleCategories(dataObj, userOrRole, query = '') {
  const role = normalizeRole(userOrRole);
  // get deep search results
  const raw = searchCategories(dataObj, query);
  // attach permissions
  const enriched = raw.map(r => ({ ...r, permissions: getPermissionsForCategory(r.cat, role) }));
  // filter out ones user cannot view
  const visible = enriched.filter(e => e.permissions && e.permissions.canView);
  // sort: categories the user can manage first, then those editable, then others; within group sort alphabetically
  visible.sort((a, b) => {
    const pa = a.permissions;
    const pb = b.permissions;
    const weight = (p) => (p.canManageCategory ? 3 : p.canEditItem ? 2 : p.canView ? 1 : 0);
    const wa = weight(pa);
    const wb = weight(pb);
    if (wa !== wb) return wb - wa; // higher weight first
    return a.cat.localeCompare(b.cat);
  });
  return visible;
}

/**
 * Find matches within a single category (typesObj is the map of type -> subtypes)
 * (re-exporting for compatibility)
 */
export function findMatchesForCategory(catName, typesObj = {}, query = '') {
  const q = (query || '').toString().trim().toLowerCase();
  if (!q) return { matched: true, matchedTypes: [], categoryMatch: false };
  const matchedTypes = [];
  const categoryMatch = (catName || '').toString().toLowerCase().includes(q);
  Object.keys(typesObj || {}).forEach(typeName => {
    const typeLower = (typeName || '').toString().toLowerCase();
    const subObj = typesObj[typeName] || {};
    const matchedSubtypes = [];
    Object.keys(subObj || {}).forEach(sub => {
      if (sub && sub.toString().toLowerCase().includes(q)) matchedSubtypes.push(sub);
    });
    if (typeLower.includes(q) || matchedSubtypes.length > 0) matchedTypes.push({ name: typeName, matchedSubtypes });
  });
  const matched = categoryMatch || matchedTypes.length > 0;
  return { matched, matchedTypes, categoryMatch };
}

/**
 * Search all categories in a data object and return enriched results.
 * results items: { cat, typesObj, typeCount, matched, matchedTypes, categoryMatch }
 */
export function searchCategories(data = {}, query = '') {
  const cats = Object.keys(data || {});
  const qq = (query || '').toString().trim();
  const out = cats.map(cat => {
    const typesObj = data[cat] || {};
    const typeCount = Object.keys(typesObj).length;
    const matchInfo = findMatchesForCategory(cat, typesObj, qq);
    return { cat, typesObj, typeCount, ...matchInfo };
  });
  if (!qq) return out;
  return out.filter(r => r.matched);
}

/**
 * Render text with the matched substring highlighted.
 * Returns a small object with before/match/after so UI can render markup.
 */
export function renderHighlighted(text, query) {
  if (!query) return text;
  const str = text == null ? '' : String(text);
  const lower = str.toLowerCase();
  const qlow = String(query).toLowerCase();
  const idx = lower.indexOf(qlow);
  if (idx === -1) return str;
  const before = str.slice(0, idx);
  const match = str.slice(idx, idx + qlow.length);
  const after = str.slice(idx + qlow.length);
  return { before, match, after };
}

/**
 * Simple currency formatter (INR) - keep centralized for future localization.
 */
export function formatCurrency(amount = 0) {
  try {
    // show no decimal places by default
    return Number(amount).toLocaleString('en-IN');
  } catch (e) {
    return String(amount);
  }
}

/**
 * Get the group name for a category
 */
export function getCategoryGroup(categoryName) {
  return CATEGORY_GROUPS[categoryName] || 'other';
}

/**
 * Get list of categories that belong to a group
 */
export function getCategoriesForGroup(groupName) {
  return Object.keys(CATEGORY_GROUPS).filter(cat => CATEGORY_GROUPS[cat] === groupName);
}

/**
 * Compute aggregated permission rules for a group by unioning the rules of its categories.
 * Returns same shape as getPermissionsForCategory (booleans) using the union of allowed roles.
 */
export function getPermissionsForGroup(groupName, userOrRole) {
  const cats = getCategoriesForGroup(groupName);
  if (!cats || cats.length === 0) return getPermissionsForCategory('', userOrRole);

  // build union rules for the group
  const union = { view: new Set(), create_item: new Set(), edit_item: new Set(), delete_item: new Set(), manage_category: new Set() };
  for (const c of cats) {
    const rules = PERMISSION_RULES[c] || DEFAULT_RULE;
    (rules.view || []).forEach(r => union.view.add(r));
    (rules.create_item || []).forEach(r => union.create_item.add(r));
    (rules.edit_item || []).forEach(r => union.edit_item.add(r));
    (rules.delete_item || []).forEach(r => union.delete_item.add(r));
    (rules.manage_category || []).forEach(r => union.manage_category.add(r));
  }

  // convert sets to arrays
  const aggregatedRules = {
    view: Array.from(union.view),
    create_item: Array.from(union.create_item),
    edit_item: Array.from(union.edit_item),
    delete_item: Array.from(union.delete_item),
    manage_category: Array.from(union.manage_category),
  };

  // reuse roleAllowed logic to compute booleans
  const role = normalizeRole(userOrRole);
  return {
    role,
    canView: roleAllowed(aggregatedRules.view, role),
    canCreateItem: roleAllowed(aggregatedRules.create_item, role),
    canEditItem: roleAllowed(aggregatedRules.edit_item, role),
    canDeleteItem: roleAllowed(aggregatedRules.delete_item, role),
    canManageCategory: roleAllowed(aggregatedRules.manage_category, role),
  };
}

/**
 * Convenience: return categories visible to a given user (no query filter).
 */
export function getAllowedCategoriesForUser(dataObj, userOrRole) {
  const visible = loadVisibleCategories(dataObj, userOrRole, '');
  return visible.map(v => v.cat);
}
