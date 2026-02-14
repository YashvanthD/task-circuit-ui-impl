/**
 * API Constants
 * Centralized API endpoint paths matching the backend routes.
 *
 * NOTE: These are path fragments (relative URLs).
 * Use with apiFetch() which adds BASE_URL automatically.
 *
 * Last Updated: 2026-01-16
 * Backend Version: 1.2.0
 *
 * @module utils/apis/constants
 */

// ============================================================================
// Authentication Endpoints (/api/auth/*)
// ============================================================================
export const API_AUTH = {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VALIDATE: '/api/auth/validate',
    REFRESH: '/api/auth/refresh',
    PASSWORD_CHANGE: '/api/auth/password/change',
    PASSWORD_FORGOT: '/api/auth/password/forgot',
    PASSWORD_RESET: '/api/auth/password/reset',
    TOKEN: '/api/auth/token',
    SESSIONS: '/api/auth/sessions',
    SESSION_REVOKE: (sessionKey) => `/api/auth/sessions/${sessionKey}`,
    // Legacy support
    SIGNUP: '/api/auth/register',
    SIGNUP_USER: (accountKey) => `/api/auth/account/${accountKey}/signup`,
    ME: '/api/auth/me',
    PERMISSIONS: '/api/auth/permissions',
    SETTINGS: '/api/auth/settings',
    SUBSCRIPTIONS: '/api/auth/subscriptions',
    ACCOUNT_USERS: '/api/auth/account/users',
    COMPANY: (accountKey) => `/api/auth/account/${accountKey}/company`,
};

// ============================================================================
// User Management Endpoints (/api/user/*)
// ============================================================================
export const API_USER = {
    BASE: '/api/user',
    CREATE: '/api/user',
    ME: '/api/user/me',
    ME_UPDATE: '/api/user/me',
    SETTINGS: '/api/user/settings',
    SETTINGS_UPDATE: '/api/user/settings',
    PROFILE: '/api/user/profile',
    PROFILE_UPDATE: '/api/user/profile',
    AUTH: '/api/user/auth',
    AUTH_UPDATE: '/api/user/auth',
    AUTH_TOKEN_SETTINGS: '/api/user/auth/token-settings',
    AUTH_TOKEN_SETTINGS_UPDATE: '/api/user/auth/token-settings',
    PERMISSIONS: '/api/user/permissions',
    PERMISSIONS_UPDATE: '/api/user/permissions',
    DETAIL: (userKey) => `/api/user/${userKey}`,
    UPDATE: (userKey) => `/api/user/${userKey}`,
    DELETE: (userKey) => `/api/user/${userKey}`,
    USER_SETTINGS: (userKey) => `/api/user/${userKey}/settings`,
    USER_SETTINGS_UPDATE: (userKey) => `/api/user/${userKey}/settings`,
    USER_PROFILE: (userKey) => `/api/user/${userKey}/profile`,
    USER_PROFILE_UPDATE: (userKey) => `/api/user/${userKey}/profile`,
    USER_PERMISSIONS: (userKey) => `/api/user/${userKey}/permissions`,
    USER_PERMISSIONS_UPDATE: (userKey) => `/api/user/${userKey}/permissions`,
    LIST: '/api/users/list',
    // Legacy support
    PASSWORD: '/api/user/password',
    LOGOUT: '/api/user/logout',
    SETTINGS_NOTIFICATIONS: '/api/user/settings/notifications',
    SETTINGS_HELP: '/api/user/settings/help_support',
};

// ============================================================================
// Task Endpoints (/api/tasks/*)
// ============================================================================
export const API_TASK = {
    BASE: '/api/tasks',
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    DETAIL: (taskId) => `/api/tasks/${taskId}`,
    UPDATE: (taskId) => `/api/tasks/${taskId}`,
    DELETE: (taskId) => `/api/tasks/${taskId}`,
    COMPLETE: (taskId) => `/api/tasks/${taskId}/complete`,
    MY_PENDING: '/api/tasks/my/pending',
    // Legacy support
    MOVE: (taskId) => `/api/tasks/${taskId}/move`,
    BY_POND: (pondId) => `/api/tasks/pond/${pondId}`,
    BY_USER: (userKey) => `/api/task/user/${userKey}`,
};

// ============================================================================
// Pond Endpoints (/api/pond/*)
// ============================================================================
export const API_POND = {
    BASE: '/api/pond',
    LIST: '/api/ponds',
    CREATE: '/api/pond/create',
    DETAIL: (pondId) => `/api/pond/${pondId}`,
    UPDATE: (pondId) => `/api/pond/${pondId}`,
    DELETE: (pondId) => `/api/pond/${pondId}`,
    DAILY_UPDATE: (pondId) => `/api/pond/${pondId}/daily`,
    STOCK: (pondId) => `/api/pond/${pondId}/stock`,
    HARVEST: (pondId) => `/api/pond/${pondId}/harvest`,
    TRANSFER: (pondId) => `/api/pond/${pondId}/transfer`,
    STATS: (pondId) => `/api/pond/${pondId}/stats`,
};

// ============================================================================
// Pond Event Endpoints (/api/pond_event/*)
// ============================================================================
export const API_POND_EVENT = {
    BASE: '/api/pond_event',
    LIST: '/api/pond_event',
    CREATE: '/api/pond_event',
    DETAIL: (eventId) => `/api/pond_event/${eventId}`,
    UPDATE: (eventId) => `/api/pond_event/${eventId}`,
    DELETE: (eventId) => `/api/pond_event/${eventId}`,
    BY_POND: (pondId) => `/api/pond_event/pond/${pondId}`,
};

// ============================================================================
// Fish Farming Endpoints (/api/fish/*)
// ============================================================================
export const API_FISH = {
    BASE: '/api/fish',

    // Farms
    FARMS: '/api/fish/farms',
    FARMS_CREATE: '/api/fish/farms',
    FARM_DETAIL: (farmId) => `/api/fish/farms/${farmId}`,
    FARM_UPDATE: (farmId) => `/api/fish/farms/${farmId}`,
    FARM_DELETE: (farmId) => `/api/fish/farms/${farmId}`,
    FARM_PONDS: (farmId) => `/api/fish/farms/${farmId}/ponds`,

    // Ponds
    PONDS: '/api/fish/ponds',
    PONDS_CREATE: '/api/fish/ponds',
    POND_DETAIL: (pondId) => `/api/fish/ponds/${pondId}`,
    POND_UPDATE: (pondId) => `/api/fish/ponds/${pondId}`,
    POND_DELETE: (pondId) => `/api/fish/ponds/${pondId}`,
    POND_WATER_QUALITY: (pondId) => `/api/fish/ponds/${pondId}/water-quality`,
    POND_STOCK: (pondId) => `/api/fish/ponds/${pondId}/stock`,

    // Species
    SPECIES: '/api/fish/species',
    SPECIES_CREATE: '/api/fish/species',
    SPECIES_DETAIL: (speciesId) => `/api/fish/species/${speciesId}`,
    SPECIES_UPDATE: (speciesId) => `/api/fish/species/${speciesId}`,
    SPECIES_DELETE: (speciesId) => `/api/fish/species/${speciesId}`,

    // Stocks
    STOCKS: '/api/fish/stocks',
    STOCKS_CREATE: '/api/fish/stocks',
    STOCK_DETAIL: (stockId) => `/api/fish/stocks/${stockId}`,
    STOCK_UPDATE: (stockId) => `/api/fish/stocks/${stockId}`,
    STOCK_TERMINATE: (stockId) => `/api/fish/stocks/${stockId}/terminate`,
    STOCK_SUMMARY: (stockId) => `/api/fish/stocks/${stockId}/summary`,

    // Feedings
    FEEDINGS: '/api/fish/feedings',
    FEEDINGS_CREATE: '/api/fish/feedings',
    FEEDING_DETAIL: (feedingId) => `/api/fish/feedings/${feedingId}`,
    FEEDING_UPDATE: (feedingId) => `/api/fish/feedings/${feedingId}`,
    FEEDING_DELETE: (feedingId) => `/api/fish/feedings/${feedingId}`,

    // Samplings
    SAMPLINGS: '/api/fish/samplings',
    SAMPLINGS_CREATE: '/api/fish/samplings',
    SAMPLING_DETAIL: (samplingId) => `/api/fish/samplings/${samplingId}`,
    SAMPLING_UPDATE: (samplingId) => `/api/fish/samplings/${samplingId}`,
    SAMPLING_DELETE: (samplingId) => `/api/fish/samplings/${samplingId}`,

    // Harvests
    HARVESTS: '/api/fish/harvests',
    HARVESTS_CREATE: '/api/fish/harvests',
    HARVEST_DETAIL: (harvestId) => `/api/fish/harvests/${harvestId}`,
    HARVEST_UPDATE: (harvestId) => `/api/fish/harvests/${harvestId}`,
    HARVEST_DELETE: (harvestId) => `/api/fish/harvests/${harvestId}`,

    // Mortalities
    MORTALITIES: '/api/fish/mortalities',
    MORTALITIES_CREATE: '/api/fish/mortalities',
    MORTALITY_DETAIL: (mortalityId) => `/api/fish/mortalities/${mortalityId}`,
    MORTALITY_UPDATE: (mortalityId) => `/api/fish/mortalities/${mortalityId}`,
    MORTALITY_DELETE: (mortalityId) => `/api/fish/mortalities/${mortalityId}`,

    // Purchases
    PURCHASES: '/api/fish/purchases',
    PURCHASES_CREATE: '/api/fish/purchases',
    PURCHASE_DETAIL: (purchaseId) => `/api/fish/purchases/${purchaseId}`,
    PURCHASE_UPDATE: (purchaseId) => `/api/fish/purchases/${purchaseId}`,
    PURCHASE_DELETE: (purchaseId) => `/api/fish/purchases/${purchaseId}`,

    // Transfers
    TRANSFERS: '/api/fish/transfers',
    TRANSFERS_CREATE: '/api/fish/transfers',
    TRANSFER_DETAIL: (transferId) => `/api/fish/transfers/${transferId}`,
    TRANSFER_UPDATE: (transferId) => `/api/fish/transfers/${transferId}`,
    TRANSFER_DELETE: (transferId) => `/api/fish/transfers/${transferId}`,

    // Maintenance
    MAINTENANCE: '/api/fish/maintenance',
    MAINTENANCE_CREATE: '/api/fish/maintenance',
    MAINTENANCE_DETAIL: (maintenanceId) => `/api/fish/maintenance/${maintenanceId}`,
    MAINTENANCE_UPDATE: (maintenanceId) => `/api/fish/maintenance/${maintenanceId}`,
    MAINTENANCE_DELETE: (maintenanceId) => `/api/fish/maintenance/${maintenanceId}`,

    // Treatments
    TREATMENTS: '/api/fish/treatments',
    TREATMENTS_CREATE: '/api/fish/treatments',
    TREATMENT_DETAIL: (treatmentId) => `/api/fish/treatments/${treatmentId}`,
    TREATMENT_UPDATE: (treatmentId) => `/api/fish/treatments/${treatmentId}`,
    TREATMENT_DELETE: (treatmentId) => `/api/fish/treatments/${treatmentId}`,
    TREATMENT_WITHDRAWAL_STATUS: (stockId) => `/api/fish/treatments/withdrawal-status/${stockId}`,

    // Activity Log
    ACTIVITY: '/api/fish/activity',
};

// ============================================================================
// Sampling Endpoints (/api/fish/samplings/*)
// ============================================================================
export const API_SAMPLING = {
    BASE: '/api/fish/samplings',
    LIST: '/api/fish/samplings',
    CREATE: '/api/fish/samplings',
    DETAIL: (samplingId) => `/api/fish/samplings/${samplingId}`,
    UPDATE: (samplingId) => `/api/fish/samplings/${samplingId}`,
    DELETE: (samplingId) => `/api/fish/samplings/${samplingId}`,
    // Note: Already defined in API_FISH.SAMPLINGS - this is for backward compatibility
};

// ============================================================================
// Feeding Endpoints (/api/feeding/*)
// ============================================================================
export const API_FEEDING = {
    BASE: '/api/feeding',
    LIST: '/api/feeding',
    CREATE: '/api/feeding',
    BY_POND: (pondId) => `/api/feeding/pond/${pondId}`,
};

// ============================================================================
// Company Endpoints (/api/company/*)
// ============================================================================
export const API_COMPANY = {
    BASE: '/api/company',
    REGISTER: '/api/company/register',
    PROFILE: '/api/company/profile',
    PROFILE_UPDATE: '/api/company/profile',
    // Legacy support
    DETAIL: (accountKey) => `/api/company/${accountKey}`,
    UPDATE: (accountKey) => `/api/company/${accountKey}`,
    PUBLIC: (accountKey) => `/api/company/public/${accountKey}`,
    USERS: (accountKey) => `/api/company/${accountKey}/users`,
    DELETE_USER: (accountKey, userKey) => `/api/company/${accountKey}/users/${userKey}`,
};

// ============================================================================
// Expense Endpoints (/api/expenses/*)
// ============================================================================
export const API_EXPENSE = {
    BASE: '/api/expenses',
    LIST: '/api/expenses',
    CREATE: '/api/expenses',
    DETAIL: (expenseId) => `/api/expenses/${expenseId}`,
    UPDATE: (expenseId) => `/api/expenses/${expenseId}`,
    DELETE: (expenseId) => `/api/expenses/${expenseId}`,
    PAY: (expenseId) => `/api/expenses/${expenseId}/pay`,
    APPROVE: (expenseId) => `/api/expenses/${expenseId}/approve`,
    REJECT: (expenseId) => `/api/expenses/${expenseId}/reject`,
    CANCEL: (expenseId) => `/api/expenses/${expenseId}/cancel`,
    CATEGORIES: '/api/expenses/categories',
    CATEGORIES_TOP: '/api/expenses/categories/top',
    CATEGORIES_OPTIONS: '/api/expenses/categories/options',
    CATEGORIES_SUBCATEGORIES: '/api/expenses/categories/subcategories',
    CATEGORIES_VALIDATE: '/api/expenses/categories/validate',
    CATEGORIES_SEARCH: '/api/expenses/categories/search',
    CATEGORIES_SUGGEST: '/api/expenses/categories/suggest',
    SUMMARY: '/api/expenses/summary',
    BY_POND: (pondId) => `/api/expenses/by-pond/${pondId}`,
    TRANSACTIONS: '/api/expenses/transactions',
    PAYMENTS: '/api/expenses/payments',
    PAYMENT_DETAIL: (paymentId) => `/api/expenses/payments/${paymentId}`,
    BANK_IMPORT: '/api/expenses/bank_statements/import',
    RECONCILE: '/api/expenses/reconcile/by-external',
};

// ============================================================================
// Transaction Endpoints (/api/transactions/*)
// ============================================================================
export const API_TRANSACTION = {
    BASE: '/api/transactions',
    LIST: '/api/transactions',
    CREATE: '/api/transactions',
    DETAIL: (txId) => `/api/transactions/${txId}`,
    UPDATE: (txId) => `/api/transactions/${txId}`,
    DELETE: (txId) => `/api/transactions/${txId}`,
};

// ============================================================================
// Dashboard Endpoints (/api/dashboard/*)
// ============================================================================
export const API_DASHBOARD = {
    BASE: '/api/dashboard',
    GET: '/api/dashboard',
    ALERTS: '/api/dashboard/alerts',
    ACKNOWLEDGE_ALERT: (alertId) => `/api/dashboard/alerts/${alertId}/acknowledge`,
};

// ============================================================================
// Role Endpoints (/api/role/*)
// ============================================================================
export const API_ROLE = {
    BASE: '/api/role',
    LIST: '/api/role',
    CREATE: '/api/role',
    DETAIL: (roleCode) => `/api/role/${roleCode}`,
    UPDATE: (roleCode) => `/api/role/${roleCode}`,
    DELETE: (roleCode) => `/api/role/${roleCode}`,
    PERMISSIONS: (roleCode) => `/api/role/${roleCode}/permissions`,
};

// ============================================================================
// Permission Endpoints (/api/permission/*)
// ============================================================================
export const API_PERMISSION = {
    BASE: '/api/permission',
    MY: '/api/permission/my',
    USER: (userKey) => `/api/permission/user/${userKey}`,
    USER_OVERRIDES: (userKey) => `/api/permission/user/${userKey}/overrides`,
    CHECK: '/api/permission/check',
    GRANT: '/api/permission/grant',
    REVOKE: '/api/permission/revoke',
    SET: '/api/permission/set',
    SET_BULK: '/api/permission/set-bulk',
    ASSIGN_PONDS: '/api/permission/assign-ponds',
    MY_PONDS: '/api/permission/my-ponds',
    TEMPLATE: '/api/permission/template',
    ROLES: '/api/permission/roles',
    ROLE: (role) => `/api/permission/role/${role}`,
};

// ============================================================================
// AI / OpenAI Endpoints (/api/ai/*)
// ============================================================================
export const API_AI = {
    CHAT: '/api/ai/chat',
    QUERY: '/api/ai/query',
};

// ============================================================================
// Media Service - Alerts Endpoints (/api/alerts/*)
// ============================================================================
export const API_ALERT = {
    BASE: '/api/alerts',
    LIST: '/api/alerts',
    CREATE: '/api/alerts',
    DETAIL: (alertId) => `/api/alerts/${alertId}`,
    UPDATE: (alertId) => `/api/alerts/${alertId}`,
    DELETE: (alertId) => `/api/alerts/${alertId}`,
    ACKNOWLEDGE: (alertId) => `/api/alerts/${alertId}/acknowledge`,
    RESOLVE: (alertId) => `/api/alerts/${alertId}/resolve`,
    STATS: '/api/alerts/stats',
};

// ============================================================================
// Media Service - Notifications Endpoints (/api/notifications/*)
// ============================================================================
export const API_NOTIFICATION = {
    BASE: '/api/notifications',
    LIST: '/api/notifications',
    CREATE: '/api/notifications',
    DETAIL: (notificationId) => `/api/notifications/${notificationId}`,
    UPDATE: (notificationId) => `/api/notifications/${notificationId}`,
    DELETE: (notificationId) => `/api/notifications/${notificationId}`,
    MARK_READ: (notificationId) => `/api/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
    UNREAD_COUNT: '/api/notifications/unread-count',
    // Legacy support
    BROADCAST: '/api/notification/broadcast',
    ALERT_LIST: '/api/notification/alert/',
    ALERT_CREATE: '/api/notification/alert/',
    ALERT_DETAIL: (id) => `/api/notification/alert/${id}`,
    ALERT_ACKNOWLEDGE: (id) => `/api/notification/alert/${id}/acknowledge`,
    ALERT_DELETE: (id) => `/api/notification/alert/${id}`,
};

// ============================================================================
// Media Service - Chat Endpoints (/api/chat/*)
// ============================================================================
export const API_CHAT = {
    BASE: '/api/chat',
    CONVERSATIONS: '/api/chat/conversations',
    CONVERSATIONS_CREATE: '/api/chat/conversations',
    CONVERSATION_DETAIL: (conversationId) => `/api/chat/conversations/${conversationId}`,
    CONVERSATION_UPDATE: (conversationId) => `/api/chat/conversations/${conversationId}`,
    CONVERSATION_DELETE: (conversationId) => `/api/chat/conversations/${conversationId}`,
    MESSAGES: '/api/chat/messages',
    MESSAGES_CREATE: '/api/chat/messages',
    CONVERSATION_MESSAGES: (conversationId) => `/api/chat/messages/${conversationId}`,
    CONVERSATION_UNREAD_COUNT: (conversationId) => `/api/chat/conversations/${conversationId}/unread-count`,
};

// ============================================================================
// Public Endpoints (/api/public/*)
// ============================================================================
export const API_PUBLIC = {
    BASE: '/api/public',
    PERMISSIONS: '/api/public/permissions',
};

// ============================================================================
// Helper function to build full URL
// ============================================================================
export const buildUrl = (baseUrl, path) => {
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const pathStr = path.startsWith('/') ? path : `/${path}`;
    return `${base}${pathStr}`;
};

// ============================================================================
// Default export with all API groups
// ============================================================================
