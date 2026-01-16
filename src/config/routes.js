/**
 * Frontend Routes Configuration
 * All frontend route paths.
 *
 * @module config/routes
 */

// ============================================================================
// Public Routes
// ============================================================================
export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  LOGIN: '/login',
  SIGNUP: '/signup',
  REGISTER_COMPANY: '/register-company',
  USER: '/user',
};

// ============================================================================
// User Section Routes
// ============================================================================
export const USER_ROUTES = {
  BASE: '/user',
  DASHBOARD: '/user/dashboard',
  NOTIFICATIONS: '/user/notifications',
  TASKS: '/user/tasks',
  POND: '/user/pond',
  FISH: '/user/fish',
  SAMPLING: '/user/sampling',
  TRANSFORM: '/user/transform',
  WATER_TEST: '/user/water-test',
  REPORTS: '/user/reports',
  INVOICE: '/user/invoice',
  CHAT: '/user/chat',
  AI: '/user/ai',
  DATASET: '/user/dataset',
  MANAGE_USERS: '/user/manage-users',
  SETTINGS: '/user/settings',
  TREE_VIEW: '/user/tree-view',

  // Expenses sub-routes
  EXPENSES: '/user/expenses',
  EXPENSES_CATEGORIES: '/user/expenses/categories',
  EXPENSES_TYPE_DETAIL: '/user/expenses/type/:typeId',
  EXPENSES_COMPANY_ACCOUNT: '/user/expenses/company-account',
  EXPENSES_PASSBOOK: '/user/expenses/passbook',
  EXPENSES_MY_ACCOUNT: '/user/expenses/my-account',
  EXPENSES_PAYSLIPS: '/user/expenses/pay-slips',
};

// ============================================================================
// Route Helpers
// ============================================================================

/**
 * Build a route with parameters
 * @param {string} route - Route template (e.g., '/user/expenses/type/:typeId')
 * @param {Object} params - Parameters to replace (e.g., { typeId: '123' })
 * @returns {string} Built route
 */
export function buildRoute(route, params = {}) {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
}

