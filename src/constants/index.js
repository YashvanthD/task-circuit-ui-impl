/**
 * Application Constants
 * Centralized constants for the Task Circuit application.
 *
 * @module constants
 */

// ============================================================================
// Task Status Constants
// ============================================================================

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'inprogress',
  COMPLETED: 'completed',
};

export const STATUS_OPTIONS = [
  { value: TASK_STATUS.PENDING, label: 'Pending' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TASK_STATUS.COMPLETED, label: 'Completed' },
];

export const STATUS_CONFIG = {
  [TASK_STATUS.PENDING]: {
    bg: '#fff8e1',
    color: '#f57c00',
    borderColor: '#ffb74d',
    label: 'Pending',
    icon: '⏳',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    bg: '#e3f2fd',
    color: '#1976d2',
    borderColor: '#64b5f6',
    label: 'In Progress',
    icon: '🔄',
  },
  [TASK_STATUS.COMPLETED]: {
    bg: '#e8f5e9',
    color: '#388e3c',
    borderColor: '#81c784',
    label: 'Completed',
    icon: '✅',
  },
};

// ============================================================================
// Task Priority Constants
// ============================================================================

export const PRIORITY_OPTIONS = [1, 2, 3, 4, 5];

export const PRIORITY_CONFIG = {
  1: { label: 'Critical', color: 'error', bg: '#ffebee' },
  2: { label: 'High', color: 'warning', bg: '#fff3e0' },
  3: { label: 'Medium', color: 'info', bg: '#e3f2fd' },
  4: { label: 'Low', color: 'success', bg: '#e8f5e9' },
  5: { label: 'Normal', color: 'default', bg: '#fafafa' },
};

// ============================================================================
// Form Initial States
// ============================================================================

export const INITIAL_TASK_FORM = {
  title: '',
  description: '',
  status: TASK_STATUS.PENDING,
  priority: '3',
  assigned_to: '',
  end_date: '',
  task_date: '',
  notes: '',
};

// ============================================================================
// UI Constants
// ============================================================================

export const APPBAR_HEIGHT = 56;
export const DRAWER_WIDTH_EXPANDED = 260;
export const DRAWER_WIDTH_COLLAPSED = 64;

// ============================================================================
// Reminder Options
// ============================================================================

export const REMINDER_OPTIONS = [
  { value: '5min', label: '5 min' },
  { value: '30min', label: '30 min' },
  { value: '1hour', label: '1 hour' },
  { value: 'custom', label: 'Custom (2 hours)' },
];

// ============================================================================
// Pond Constants
// ============================================================================

export const POND_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  HARVESTING: 'harvesting',
};

export const POND_STATUS_OPTIONS = [
  { value: POND_STATUS.ACTIVE, label: 'Active' },
  { value: POND_STATUS.INACTIVE, label: 'Inactive' },
  { value: POND_STATUS.MAINTENANCE, label: 'Maintenance' },
  { value: POND_STATUS.HARVESTING, label: 'Harvesting' },
];

export const POND_STATUS_CONFIG = {
  [POND_STATUS.ACTIVE]: {
    bg: '#e8f5e9',
    color: '#388e3c',
    borderColor: '#81c784',
    label: 'Active',
    icon: '🐟',
  },
  [POND_STATUS.INACTIVE]: {
    bg: '#fafafa',
    color: '#757575',
    borderColor: '#bdbdbd',
    label: 'Inactive',
    icon: '⏸️',
  },
  [POND_STATUS.MAINTENANCE]: {
    bg: '#fff3e0',
    color: '#f57c00',
    borderColor: '#ffb74d',
    label: 'Maintenance',
    icon: '🔧',
  },
  [POND_STATUS.HARVESTING]: {
    bg: '#e3f2fd',
    color: '#1976d2',
    borderColor: '#64b5f6',
    label: 'Harvesting',
    icon: '🎣',
  },
};

export const INITIAL_POND_FORM = {
  name: '',
  size: '',
  location: '',
  status: POND_STATUS.ACTIVE,
  fish_type: '',
  fish_count: '',
  start_date: '',
  notes: '',
};

// ============================================================================
// User Role Constants
// ============================================================================

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
};

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: 'Admin' },
  { value: USER_ROLES.MANAGER, label: 'Manager' },
  { value: USER_ROLES.OPERATOR, label: 'Operator' },
  { value: USER_ROLES.VIEWER, label: 'Viewer' },
];

export const USER_ROLE_CONFIG = {
  [USER_ROLES.ADMIN]: {
    bg: '#ffebee',
    color: '#c62828',
    label: 'Admin',
    icon: '👑',
  },
  [USER_ROLES.MANAGER]: {
    bg: '#e3f2fd',
    color: '#1565c0',
    label: 'Manager',
    icon: '📋',
  },
  [USER_ROLES.OPERATOR]: {
    bg: '#e8f5e9',
    color: '#2e7d32',
    label: 'Operator',
    icon: '🔧',
  },
  [USER_ROLES.VIEWER]: {
    bg: '#fafafa',
    color: '#616161',
    label: 'Viewer',
    icon: '👁️',
  },
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
};

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.INACTIVE, label: 'Inactive' },
  { value: USER_STATUS.PENDING, label: 'Pending' },
];

export const INITIAL_USER_FORM = {
  username: '',
  email: '',
  role: USER_ROLES.OPERATOR,
  status: USER_STATUS.ACTIVE,
  phone: '',
  department: '',
};

// ============================================================================
// Expense Constants
// ============================================================================

export const EXPENSE_CATEGORIES = {
  FEED: 'feed',
  EQUIPMENT: 'equipment',
  LABOR: 'labor',
  UTILITIES: 'utilities',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
};

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: EXPENSE_CATEGORIES.FEED, label: 'Feed', icon: '🍚' },
  { value: EXPENSE_CATEGORIES.EQUIPMENT, label: 'Equipment', icon: '🔧' },
  { value: EXPENSE_CATEGORIES.LABOR, label: 'Labor', icon: '👷' },
  { value: EXPENSE_CATEGORIES.UTILITIES, label: 'Utilities', icon: '💡' },
  { value: EXPENSE_CATEGORIES.MAINTENANCE, label: 'Maintenance', icon: '🛠️' },
  { value: EXPENSE_CATEGORIES.OTHER, label: 'Other', icon: '📦' },
];

export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
};

export const EXPENSE_STATUS_OPTIONS = [
  { value: EXPENSE_STATUS.PENDING, label: 'Pending' },
  { value: EXPENSE_STATUS.APPROVED, label: 'Approved' },
  { value: EXPENSE_STATUS.REJECTED, label: 'Rejected' },
  { value: EXPENSE_STATUS.PAID, label: 'Paid' },
];

export const INITIAL_EXPENSE_FORM = {
  title: '',
  category: EXPENSE_CATEGORIES.OTHER,
  amount: '',
  date: '',
  description: '',
  status: EXPENSE_STATUS.PENDING,
};

// ============================================================================
// Sampling Constants
// ============================================================================

export const SAMPLING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const SAMPLING_STATUS_OPTIONS = [
  { value: SAMPLING_STATUS.SCHEDULED, label: 'Scheduled' },
  { value: SAMPLING_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: SAMPLING_STATUS.COMPLETED, label: 'Completed' },
  { value: SAMPLING_STATUS.CANCELLED, label: 'Cancelled' },
];

export const SAMPLING_STATUS_CONFIG = {
  [SAMPLING_STATUS.SCHEDULED]: {
    bg: '#fff8e1',
    color: '#f57c00',
    label: 'Scheduled',
    icon: '📅',
  },
  [SAMPLING_STATUS.IN_PROGRESS]: {
    bg: '#e3f2fd',
    color: '#1976d2',
    label: 'In Progress',
    icon: '🔬',
  },
  [SAMPLING_STATUS.COMPLETED]: {
    bg: '#e8f5e9',
    color: '#388e3c',
    label: 'Completed',
    icon: '✅',
  },
  [SAMPLING_STATUS.CANCELLED]: {
    bg: '#ffebee',
    color: '#c62828',
    label: 'Cancelled',
    icon: '❌',
  },
};

export const INITIAL_SAMPLING_FORM = {
  pond_id: '',
  scheduled_date: '',
  sample_type: '',
  notes: '',
  status: SAMPLING_STATUS.SCHEDULED,
};

// ============================================================================
// Report Constants
// ============================================================================

export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
  CUSTOM: 'custom',
};

export const REPORT_TYPE_OPTIONS = [
  { value: REPORT_TYPES.DAILY, label: 'Daily Report' },
  { value: REPORT_TYPES.WEEKLY, label: 'Weekly Report' },
  { value: REPORT_TYPES.MONTHLY, label: 'Monthly Report' },
  { value: REPORT_TYPES.QUARTERLY, label: 'Quarterly Report' },
  { value: REPORT_TYPES.ANNUAL, label: 'Annual Report' },
  { value: REPORT_TYPES.CUSTOM, label: 'Custom Range' },
];

export const REPORT_CATEGORIES = {
  PRODUCTION: 'production',
  FINANCIAL: 'financial',
  INVENTORY: 'inventory',
  OPERATIONS: 'operations',
};

export const REPORT_CATEGORY_OPTIONS = [
  { value: REPORT_CATEGORIES.PRODUCTION, label: 'Production', icon: '📊' },
  { value: REPORT_CATEGORIES.FINANCIAL, label: 'Financial', icon: '💰' },
  { value: REPORT_CATEGORIES.INVENTORY, label: 'Inventory', icon: '📦' },
  { value: REPORT_CATEGORIES.OPERATIONS, label: 'Operations', icon: '⚙️' },
];

// ============================================================================
// Fish Constants
// ============================================================================

export const FISH_STATUS = {
  HEALTHY: 'healthy',
  SICK: 'sick',
  QUARANTINE: 'quarantine',
  SOLD: 'sold',
};

export const FISH_STATUS_OPTIONS = [
  { value: FISH_STATUS.HEALTHY, label: 'Healthy' },
  { value: FISH_STATUS.SICK, label: 'Sick' },
  { value: FISH_STATUS.QUARANTINE, label: 'Quarantine' },
  { value: FISH_STATUS.SOLD, label: 'Sold' },
];

export const FISH_STATUS_CONFIG = {
  [FISH_STATUS.HEALTHY]: {
    bg: '#e8f5e9',
    color: '#388e3c',
    label: 'Healthy',
    icon: '🐟',
  },
  [FISH_STATUS.SICK]: {
    bg: '#ffebee',
    color: '#c62828',
    label: 'Sick',
    icon: '🤒',
  },
  [FISH_STATUS.QUARANTINE]: {
    bg: '#fff3e0',
    color: '#f57c00',
    label: 'Quarantine',
    icon: '🔒',
  },
  [FISH_STATUS.SOLD]: {
    bg: '#e3f2fd',
    color: '#1976d2',
    label: 'Sold',
    icon: '💰',
  },
};

export const INITIAL_FISH_FORM = {
  species: '',
  quantity: '',
  pond_id: '',
  status: FISH_STATUS.HEALTHY,
  purchase_date: '',
  notes: '',
};
