/**
 * Task Helper Functions
 * Business logic and utilities for task operations.
 *
 * @module utils/helpers/tasks
 */

import { TASK_STATUS, STATUS_CONFIG, PRIORITY_CONFIG } from '../../constants';

// ============================================================================
// Task ID Resolution
// ============================================================================

/**
 * Resolve task ID from various possible field names.
 * @param {Object} task - Task object
 * @returns {string|undefined}
 */
export function resolveTaskId(task) {
  if (!task) return undefined;
  const rawId = task.taskId || task.task_id || task.id || task._id;
  return rawId != null ? String(rawId) : undefined;
}

// ============================================================================
// Task Status Helpers
// ============================================================================

/**
 * Get the next action label based on current status.
 * @param {string} status - Current status
 * @returns {string}
 */
export function getNextAction(status) {
  switch (status) {
    case TASK_STATUS.PENDING:
      return 'Start';
    case TASK_STATUS.IN_PROGRESS:
      return 'Resolve';
    case TASK_STATUS.COMPLETED:
      return 'Resolved';
    default:
      return 'Next';
  }
}

/**
 * Get the next status in the workflow.
 * @param {string} currentStatus - Current status
 * @returns {string}
 */
export function getNextStatus(currentStatus) {
  switch (currentStatus) {
    case TASK_STATUS.PENDING:
      return TASK_STATUS.IN_PROGRESS;
    case TASK_STATUS.IN_PROGRESS:
      return TASK_STATUS.COMPLETED;
    default:
      return currentStatus;
  }
}

/**
 * Get status configuration (colors, labels, icons).
 * @param {string} status - Task status
 * @returns {Object}
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG[TASK_STATUS.PENDING];
}

// ============================================================================
// Task Priority Helpers
// ============================================================================

/**
 * Get priority configuration (colors, labels).
 * @param {number|string} priority - Task priority
 * @returns {Object}
 */
export function getPriorityConfig(priority) {
  const p = Number(priority) || 3;
  return PRIORITY_CONFIG[p] || PRIORITY_CONFIG[3];
}

/**
 * Get priority style for UI components.
 * @param {number|string} priority - Task priority
 * @returns {Object} Style object
 */
export function getPriorityStyle(priority) {
  const config = getPriorityConfig(priority);
  return {
    backgroundColor: config.bg,
    borderLeft: `4px solid ${config.color === 'error' ? '#f44336' : config.color === 'warning' ? '#ff9800' : config.color === 'info' ? '#2196f3' : config.color === 'success' ? '#4caf50' : '#9e9e9e'}`,
  };
}

// ============================================================================
// Task Statistics
// ============================================================================

/**
 * Compute task statistics from a list of tasks.
 * @param {Array} tasks - List of tasks
 * @returns {Object} Statistics object
 */
export function computeTaskStats(tasks) {
  return tasks.reduce(
    (acc, t) => {
      if (t.status === TASK_STATUS.COMPLETED) acc.completed++;
      else if (t.status === TASK_STATUS.IN_PROGRESS) acc.inprogress++;
      else acc.pending++;
      acc.total++;
      return acc;
    },
    { total: 0, completed: 0, inprogress: 0, pending: 0 }
  );
}

/**
 * Count active (non-completed) tasks.
 * @param {Array} tasks - List of tasks
 * @returns {number}
 */
export function countActiveTasks(tasks) {
  return tasks.filter((t) => t.status !== TASK_STATUS.COMPLETED).length;
}

/**
 * Count critical tasks (priority 1 or overdue).
 * @param {Array} tasks - List of tasks
 * @returns {number}
 */
export function countCriticalTasks(tasks) {
  const now = new Date();
  return tasks.filter((t) => {
    if (t.status === TASK_STATUS.COMPLETED) return false;
    if (t.priority === 1) return true;
    if (t.end_date) {
      try {
        return new Date(t.end_date.replace(' ', 'T')) < now;
      } catch {
        return false;
      }
    }
    return false;
  }).length;
}

// ============================================================================
// Task Time Helpers
// ============================================================================

/**
 * Get time remaining until due date.
 * @param {string} endDate - End date string
 * @returns {string}
 */
export function getTimeLeft(endDate) {
  if (!endDate) return 'No due date';

  try {
    const end = new Date(endDate.replace(' ', 'T'));
    const now = new Date();
    const diff = end - now;

    if (diff < 0) {
      const overdueDays = Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return `${overdueDays}d overdue`;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  } catch {
    return 'Invalid date';
  }
}

/**
 * Check if task is overdue.
 * @param {Object} task - Task object
 * @returns {boolean}
 */
export function isTaskOverdue(task) {
  if (task.status === TASK_STATUS.COMPLETED || !task.end_date) return false;
  try {
    return new Date(task.end_date.replace(' ', 'T')) < new Date();
  } catch {
    return false;
  }
}

// ============================================================================
// Task Filtering
// ============================================================================

/**
 * Filter tasks by status and search term.
 * @param {Array} tasks - List of tasks
 * @param {string} filterStatus - Status filter ('all' or specific status)
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional options
 * @returns {Array} Filtered tasks
 */
export function filterTasks(tasks, filterStatus, searchTerm, options = {}) {
  const { hideOldCompleted = true, completedThresholdMs = 3600000 } = options;

  return tasks
    .filter((t) => {
      // Status filter
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(term);
        const matchDesc = (t.description || '').toLowerCase().includes(term);
        if (!matchTitle && !matchDesc) return false;
      }

      // Hide old completed tasks
      if (hideOldCompleted && t.status === TASK_STATUS.COMPLETED && filterStatus !== TASK_STATUS.COMPLETED && !searchTerm) {
        const updatedAt = t.updated_at || t.updatedAt;
        if (updatedAt) {
          const updatedTime = new Date(updatedAt).getTime();
          if (Date.now() - updatedTime > completedThresholdMs) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Completed tasks at the end
      if (a.status === TASK_STATUS.COMPLETED && b.status !== TASK_STATUS.COMPLETED) return 1;
      if (a.status !== TASK_STATUS.COMPLETED && b.status === TASK_STATUS.COMPLETED) return -1;
      return 0;
    });
}

// ============================================================================
// Task Alerts
// ============================================================================

/**
 * Get top priority alerts from tasks.
 * @param {Array} tasks - List of tasks
 * @param {number} limit - Maximum number of alerts
 * @returns {Array} Alert objects
 */
export function getTaskAlerts(tasks, limit = 5) {
  return tasks
    .filter((t) => t.priority <= 3 && t.status !== TASK_STATUS.COMPLETED)
    .slice(0, limit)
    .map((t, idx) => ({
      title: t.title,
      description: t.description,
      completeBy: t.end_date ? Math.floor(new Date(t.end_date.replace(' ', 'T')).getTime() / 1000) : null,
      unread: t.unread !== false,
      priority: t.priority,
      idx,
      task_id: t.task_id,
    }));
}

