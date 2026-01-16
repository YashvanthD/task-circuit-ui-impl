/**
 * App Configuration
 * Centralized configuration for Task Circuit application.
 *
 * @module config
 */

// ============================================================================
// API Configuration
// ============================================================================
export const BASE_URL = 'http://localhost:5000';

// ============================================================================
// Frontend Routes - Base Paths
// ============================================================================
export const ROUTES = {
  // Public routes
  ROOT: '/',
  HOME: '/home',
  LOGIN: '/login',
  SIGNUP: '/signup',
  REGISTER_COMPANY: '/register-company',

  // User routes base
  USER: '/user',
};

// ============================================================================
// Frontend Routes - User Section
// ============================================================================
export const USER_ROUTES = {
  BASE: '/user',
  DASHBOARD: '/user/dashboard',
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
// Legacy exports for backward compatibility
// (These will be deprecated in future versions)
// ============================================================================
export const BASE_APP_PATH = '';
export const BASE_APP_PATH_USER = USER_ROUTES.BASE;
export const BASE_APP_PATH_HOME = ROUTES.HOME;
export const BASE_APP_PATH_LOGIN = ROUTES.LOGIN;
export const BASE_APP_PATH_SIGNUP = ROUTES.SIGNUP;
export const BASE_APP_PATH_REGISTER_COMPANY = ROUTES.REGISTER_COMPANY;

// USER Endpoints (legacy)
export const BASE_APP_PATH_USER_WATER_TEST = USER_ROUTES.WATER_TEST;
export const BASE_APP_PATH_USER_SAMPLING = USER_ROUTES.SAMPLING;
export const BASE_APP_PATH_USER_FISH = USER_ROUTES.FISH;
export const BASE_APP_PATH_USER_TRANSFORM = USER_ROUTES.TRANSFORM;
export const BASE_APP_PATH_USER_TREE_VIEW = USER_ROUTES.TREE_VIEW;
export const BASE_APP_PATH_USER_AI = USER_ROUTES.AI;
export const BASE_APP_PATH_USER_DATASET = USER_ROUTES.DATASET;
export const BASE_APP_PATH_USER_MANAGE_USERS = USER_ROUTES.MANAGE_USERS;
export const BASE_APP_PATH_USER_DASHBOARD = USER_ROUTES.DASHBOARD;
export const BASE_APP_PATH_USER_TASKS = USER_ROUTES.TASKS;
export const BASE_APP_PATH_USER_POND = USER_ROUTES.POND;
export const BASE_APP_PATH_USER_REPORTS = USER_ROUTES.REPORTS;
export const BASE_APP_PATH_USER_INVOICE = USER_ROUTES.INVOICE;
export const BASE_APP_PATH_USER_CHAT = USER_ROUTES.CHAT;
export const BASE_APP_PATH_USER_SETTINGS = USER_ROUTES.SETTINGS;

// Expenses related paths (legacy)
export const BASE_APP_PATH_USER_EXPENSES = USER_ROUTES.EXPENSES;
export const BASE_APP_PATH_USER_EXPENSES_CATEGORY_LIST = USER_ROUTES.EXPENSES_CATEGORIES;
export const BASE_APP_PATH_USER_EXPENSES_TYPE_DETAIL = USER_ROUTES.EXPENSES_TYPE_DETAIL;
export const BASE_APP_PATH_USER_EXPENSES_COMPANY_ACCOUNT = USER_ROUTES.EXPENSES_COMPANY_ACCOUNT;
export const BASE_APP_PATH_USER_EXPENSES_PASSBOOK = USER_ROUTES.EXPENSES_PASSBOOK;
export const BASE_APP_PATH_USER_EXPENSES_MY_ACCOUNT = USER_ROUTES.EXPENSES_MY_ACCOUNT;
export const BASE_APP_PATH_USER_EXPENSES_PAYSLIPS = USER_ROUTES.EXPENSES_PAYSLIPS;
