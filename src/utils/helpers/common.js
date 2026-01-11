/**
 * Common Utilities
 * Task-related styling and display helpers.
 *
 * @module utils/helpers/common
 */

/**
 * Task status values.
 */
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'inprogress',
  COMPLETED: 'completed',
  WONT_DO: 'wontdo',
  RESOLVE: 'resolve',
};

/**
 * Task priority levels (1 = highest, 5 = lowest).
 */
export const TASK_PRIORITY = {
  HIGH: 1,
  CRITICAL: 2,
  MEDIUM: 3,
  LOW: 4,
  NORMAL: 5,
};

const PRIORITY_COLORS = {
  1: { border: '#f44336', shadow: '#f44336' },
  2: { border: '#ff7961', shadow: '#ff7961' },
  3: { border: '#ff9800', shadow: '#ff9800' },
  4: { border: '#ffeb3b', shadow: '#ffeb3b' },
  5: { border: '#4caf50', shadow: '#4caf50' },
};

/**
 * Map task status to a MUI color variant.
 * @param {string} status
 * @returns {string}
 */
export function getNextActionColor(status) {
  switch (status) {
    case TASK_STATUS.PENDING: return 'primary';
    case TASK_STATUS.IN_PROGRESS: return 'success';
    case TASK_STATUS.COMPLETED: return 'success';
    case TASK_STATUS.WONT_DO: return 'warning';
    case TASK_STATUS.RESOLVE: return 'orange';
    default: return 'default';
  }
}

/**
 * Get inline style for task priority.
 * @param {number} priority
 * @param {string|null} status
 * @returns {object}
 */
export function getPriorityStyle(priority, status = null) {
  if (status === TASK_STATUS.COMPLETED) {
    return { border: '1.5px solid #4caf50', boxShadow: '0 0 4px #4caf50' };
  }

  const colors = PRIORITY_COLORS[priority];
  if (colors) {
    return {
      border: `1.5px solid ${colors.border}`,
      boxShadow: `0 0 4px ${colors.shadow}`
    };
  }

  return { border: '1px solid #e0e0e0' };
}

/**
 * Get human-readable priority label.
 * @param {number} priority
 * @returns {string}
 */
export function getPriorityLabel(priority) {
  switch (priority) {
    case TASK_PRIORITY.HIGH: return 'High';
    case TASK_PRIORITY.CRITICAL: return 'Critical';
    case TASK_PRIORITY.MEDIUM: return 'Medium';
    case TASK_PRIORITY.LOW: return 'Low';
    case TASK_PRIORITY.NORMAL: return 'Normal';
    default: return 'Unknown';
  }
}

/**
 * Get MUI color name for priority.
 * @param {number} priority
 * @returns {string}
 */
export function getPriorityColor(priority) {
  switch (priority) {
    case TASK_PRIORITY.HIGH: return 'error';
    case TASK_PRIORITY.CRITICAL: return 'warning';
    case TASK_PRIORITY.MEDIUM: return 'info';
    case TASK_PRIORITY.LOW: return 'success';
    case TASK_PRIORITY.NORMAL: return 'default';
    default: return 'default';
  }
}

/**
 * Get human-readable status label.
 * @param {string} status
 * @returns {string}
 */
export function getStatusLabel(status) {
  switch (status) {
    case TASK_STATUS.PENDING: return 'Pending';
    case TASK_STATUS.IN_PROGRESS: return 'In Progress';
    case TASK_STATUS.COMPLETED: return 'Completed';
    case TASK_STATUS.WONT_DO: return "Won't Do";
    case TASK_STATUS.RESOLVE: return 'Resolved';
    default: return status || 'Unknown';
  }
}

/**
 * Check if a task is overdue.
 * @param {object} task
 * @returns {boolean}
 */
export function isTaskOverdue(task) {
  if (!task) return false;
  const dueDate = task.dueDate || task.due_date;
  if (!dueDate) return false;

  return new Date(dueDate) < new Date() && task.status !== TASK_STATUS.COMPLETED;
}

/**
 * Sort tasks by priority then by due date.
 * @param {Array} tasks
 * @returns {Array}
 */
export function sortTasksByPriority(tasks) {
  if (!Array.isArray(tasks)) return [];

  return [...tasks].sort((a, b) => {
    const priorityDiff = (a.priority || 5) - (b.priority || 5);
    if (priorityDiff !== 0) return priorityDiff;

    const aDate = a.dueDate || a.due_date;
    const bDate = b.dueDate || b.due_date;
    if (aDate && bDate) return new Date(aDate) - new Date(bDate);
    if (aDate) return -1;
    if (bDate) return 1;

    return 0;
  });
}

