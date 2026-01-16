/**
 * Tasks Cache
 * Caches task list data with lazy loading and sub-functions.
 *
 * @module utils/cache/tasksCache
 */

import {
  createCache,
  isCacheStale,
  hasValidCache,
  updateCache,
  setCacheLoading,
  setCacheError,
  clearCache,
  getFromCacheById,
  cacheToOptions,
  persistCache,
  loadPersistedCache,
} from './baseCache';
import { listTasks } from '../../api';

// ============================================================================
// Cache Instance
// ============================================================================
const STORAGE_KEY = 'tc_cache_tasks';
const cache = createCache('tasks', 3 * 60 * 1000); // 3 min TTL (tasks change frequently)

// Load from localStorage on init
loadPersistedCache(cache, STORAGE_KEY, 'task_id');

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get tasks list (lazy loaded).
 * @param {boolean} force - Force refresh even if cache is valid
 * @returns {Promise<Array>} Tasks array
 */
export async function getTasks(force = false) {
  if (!force && hasValidCache(cache)) {
    return cache.data;
  }

  if (cache.loading) {
    return cache.data;
  }

  setCacheLoading(cache, true);

  try {
    const response = await listTasks();
    let data = response;

    if (response && typeof response.json === 'function') {
      data = await response.json();
    }
    if (data && data.data) {
      data = data.data;
    }
    if (data && data.tasks) {
      data = data.tasks;
    }

    updateCache(cache, data, 'task_id');
    persistCache(cache, STORAGE_KEY);

    return cache.data;
  } catch (error) {
    setCacheError(cache, error);
    console.error('[TasksCache] Failed to fetch tasks:', error);
    return cache.data;
  }
}

/**
 * Force refresh tasks cache.
 * @returns {Promise<Array>} Tasks array
 */
export async function refreshTasks() {
  return getTasks(true);
}

/**
 * Get cached tasks synchronously (no fetch).
 * @returns {Array} Cached tasks array
 */
export function getTasksSync() {
  return cache.data;
}

/**
 * Clear tasks cache.
 */
export function clearTasksCache() {
  clearCache(cache);
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cache loading state.
 * @returns {boolean}
 */
export function isTasksLoading() {
  return cache.loading;
}

/**
 * Get cache error.
 * @returns {Error|null}
 */
export function getTasksError() {
  return cache.error;
}

// ============================================================================
// Sub-functions (Entity-specific)
// ============================================================================

/**
 * Get task by ID.
 * @param {string} id - Task ID
 * @returns {object|null} Task object
 */
export function getTaskById(id) {
  return getFromCacheById(cache, id);
}

/**
 * Get tasks for dropdown options.
 * @param {object} config - Configuration
 * @param {function} config.filter - Optional filter function
 * @returns {Array} Options array [{ label, value, id, raw }]
 */
export function getTaskOptions(config = {}) {
  return cacheToOptions(cache, {
    labelField: (t) => t.title || t.name || t.task_id,
    valueField: 'task_id',
    ...config,
  });
}

/**
 * Get tasks by status.
 * @param {string} status - Status ('pending', 'in_progress', 'completed', 'cancelled')
 * @returns {Array} Filtered tasks
 */
export function getTasksByStatus(status) {
  if (!status) return cache.data;
  const statusLower = status.toLowerCase();
  return cache.data.filter((t) =>
    (t.status || 'pending').toLowerCase() === statusLower
  );
}

/**
 * Get pending tasks.
 * @returns {Array} Pending tasks
 */
export function getPendingTasks() {
  return getTasksByStatus('pending');
}

/**
 * Get in-progress tasks.
 * @returns {Array} In-progress tasks
 */
export function getInProgressTasks() {
  return cache.data.filter((t) =>
    ['in_progress', 'inprogress', 'in-progress'].includes((t.status || '').toLowerCase())
  );
}

/**
 * Get completed tasks.
 * @returns {Array} Completed tasks
 */
export function getCompletedTasks() {
  return getTasksByStatus('completed');
}

/**
 * Get tasks by user.
 * @param {string} userKey - User key
 * @returns {Array} Filtered tasks
 */
export function getTasksByUser(userKey) {
  if (!userKey) return cache.data;
  return cache.data.filter((t) =>
    t.assigned_to === userKey ||
    t.assignee === userKey ||
    t.user_key === userKey ||
    t.created_by === userKey
  );
}

/**
 * Get tasks assigned to user.
 * @param {string} userKey - User key
 * @returns {Array} Filtered tasks
 */
export function getTasksAssignedTo(userKey) {
  if (!userKey) return cache.data;
  return cache.data.filter((t) =>
    t.assigned_to === userKey || t.assignee === userKey
  );
}

/**
 * Get tasks created by user.
 * @param {string} userKey - User key
 * @returns {Array} Filtered tasks
 */
export function getTasksCreatedBy(userKey) {
  if (!userKey) return cache.data;
  return cache.data.filter((t) => t.created_by === userKey);
}

/**
 * Get tasks by pond.
 * @param {string} pondId - Pond ID
 * @returns {Array} Filtered tasks
 */
export function getTasksByPond(pondId) {
  if (!pondId) return cache.data;
  return cache.data.filter((t) => t.pond_id === pondId);
}

/**
 * Get tasks by priority.
 * @param {string} priority - Priority ('low', 'medium', 'high', 'urgent')
 * @returns {Array} Filtered tasks
 */
export function getTasksByPriority(priority) {
  if (!priority) return cache.data;
  const priorityLower = priority.toLowerCase();
  return cache.data.filter((t) =>
    (t.priority || 'medium').toLowerCase() === priorityLower
  );
}

/**
 * Get high priority tasks.
 * @returns {Array} High/urgent priority tasks
 */
export function getHighPriorityTasks() {
  return cache.data.filter((t) =>
    ['high', 'urgent'].includes((t.priority || '').toLowerCase())
  );
}

/**
 * Get overdue tasks.
 * @returns {Array} Overdue tasks
 */
export function getOverdueTasks() {
  const now = Date.now();
  return cache.data.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    const dueDate = t.due_date || t.deadline;
    if (!dueDate) return false;
    return new Date(dueDate).getTime() < now;
  });
}

/**
 * Get tasks due soon (within N days).
 * @param {number} days - Number of days (default 3)
 * @returns {Array} Tasks due soon
 */
export function getTasksDueSoon(days = 3) {
  const now = Date.now();
  const cutoff = now + days * 24 * 60 * 60 * 1000;

  return cache.data.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    const dueDate = t.due_date || t.deadline;
    if (!dueDate) return false;
    const due = new Date(dueDate).getTime();
    return due >= now && due <= cutoff;
  });
}

/**
 * Get tasks within date range.
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Filtered tasks
 */
export function getTasksByDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Infinity;

  return cache.data.filter((t) => {
    const date = new Date(t.due_date || t.deadline || t.created_at).getTime();
    return date >= start && date <= end;
  });
}

/**
 * Get task counts by status.
 * @returns {object} { pending, inProgress, completed, cancelled, total }
 */
export function getTaskCounts() {
  const counts = {
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    total: cache.data.length,
  };

  const now = Date.now();

  cache.data.forEach((t) => {
    const status = (t.status || 'pending').toLowerCase();
    if (status === 'pending') counts.pending++;
    else if (['in_progress', 'inprogress', 'in-progress'].includes(status)) counts.inProgress++;
    else if (status === 'completed') counts.completed++;
    else if (status === 'cancelled') counts.cancelled++;

    // Check overdue
    if (status !== 'completed' && status !== 'cancelled') {
      const dueDate = t.due_date || t.deadline;
      if (dueDate && new Date(dueDate).getTime() < now) {
        counts.overdue++;
      }
    }
  });

  return counts;
}

// ============================================================================
// Events
// ============================================================================

/**
 * Subscribe to cache events.
 * @param {string} event - Event name ('updated', 'loading', 'error', 'cleared')
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export function onTasksChange(event, callback) {
  return cache.events.on(event, callback);
}

// ============================================================================
// Export cache for advanced usage
// ============================================================================
export const tasksCache = cache;

