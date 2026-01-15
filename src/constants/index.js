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

