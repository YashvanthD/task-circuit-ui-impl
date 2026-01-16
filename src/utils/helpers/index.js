/**
 * Helper Utilities - Main Export
 * Re-exports all helper utilities.
 *
 * @module utils/helpers
 */

// Formatters
export {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatRelativeTime,
  formatNumber,
  formatPercent,
  formatCurrency,
  formatBytes,
  truncate,
  formatPhone,
} from './formatters';

// Date utilities
export {
  getDefaultEndDate,
  getTimeLeft,
  isToday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  addDays,
  toISODateString,
  formatTimestamp,
  formatDateTime,
} from './date';

// Common utilities
export {
  TASK_STATUS,
  TASK_PRIORITY,
  getNextActionColor,
  getPriorityStyle,
  getPriorityLabel,
  getPriorityColor,
  getStatusLabel,
  isTaskOverdue,
  sortTasksByPriority,
} from './common';

// Task helpers
export {
  resolveTaskId,
  getNextAction,
  getNextStatus,
  getStatusConfig,
  getPriorityConfig,
  computeTaskStats,
  countActiveTasks,
  countCriticalTasks,
  filterTasks,
  getTaskAlerts,
} from './tasks';

// Pond helpers
export {
  resolvePondId,
  getPondStatusConfig,
  getPondStatusStyle,
  isPondActive,
  pondNeedsAttention,
  computePondStats,
  countActivePonds,
  countPondsNeedingAttention,
  calculateTotalFish,
  filterPonds,
  sortPonds,
  validatePondForm,
  formatPondSize,
  formatFishCount,
} from './pond';

// User helpers
export {
  resolveUserId,
  getUserRoleConfig,
  getUserRoleStyle,
  isUserAdmin,
  isUserManagerOrAbove,
  canEditUser,
  computeUserStats,
  countActiveUsers,
  countUsersByRole,
  filterUsers,
  sortUsers,
  validateUserForm,
  getUserDisplayName,
  getUserInitials,
  formatUserRole,
} from './users';

// Sampling helpers
export {
  resolveSamplingId,
  getSamplingStatusConfig,
  getSamplingStatusStyle,
  isSamplingUpcoming,
  isSamplingOverdue,
  computeSamplingStats,
  countUpcomingSamplings,
  filterSamplings,
  sortSamplingsByDate,
  validateSamplingForm,
  getSamplingSummary,
  getTimeUntilSampling,
} from './sampling';

// Report helpers
export {
  getReportDateRange,
  formatDateRange,
  aggregateByDate,
  calculateTotal,
  calculateAverage,
  generateReportSummary,
  calculateGrowth,
  filterReportData,
  formatReportType,
  formatReportCategory,
  getReportPeriodLabel,
} from './reports';

// Dashboard helpers
export {
  refreshDashboardData,
  refreshAllDashboardData,
  refreshNotificationsAndAlerts,
} from './dashboard';
