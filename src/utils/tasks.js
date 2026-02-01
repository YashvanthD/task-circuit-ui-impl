import { apiFetch, API_TASK } from '../api';
import { normalizeTask } from './store/dataStore';

// Task utility functions with centralized dataStore normalization

const TASKS_KEY = 'tasks';
const TASKS_LAST_FETCHED_KEY = 'tasks_last_fetched';
const TASKS_STALE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Normalize tasks using centralized normalizeTask
 */
function normalizeTasks(list) {
  if (!Array.isArray(list)) return [];
  return list.map(t => normalizeTask(t)).filter(Boolean);
}

function extractTasksFromResponse(data) {
  // Backend can return:
  // 1. Direct array: [task1, task2, ...]
  // 2. Wrapped: { tasks: [...] }
  // 3. Nested: { data: { tasks: [...] } }
  if (!data) return [];

  // Handle direct array
  if (Array.isArray(data)) {
    return normalizeTasks(data);
  }

  // Handle wrapped formats
  const rawTasks = data.tasks
    || (data.data && data.data.tasks)
    || (Array.isArray(data.data) ? data.data : null)
    || [];

  return normalizeTasks(rawTasks);
}

/**
 * Get tasks from localStorage, or fetch from API if missing/stale.
 * @param {boolean} [forceApiCall=false] - If true, always fetch from API and refresh cache.
 * @returns {Promise<Array|null>}
 */
export async function getTasks(forceApiCall = false) {
  const cachedRaw = localStorage.getItem(TASKS_KEY);
  const lastFetchedRaw = localStorage.getItem(TASKS_LAST_FETCHED_KEY);
  const lastFetched = lastFetchedRaw ? parseInt(lastFetchedRaw, 10) : null;
  const now = Date.now();

  let cached = null;
  if (cachedRaw) {
    try {
      cached = JSON.parse(cachedRaw);
    } catch {
      cached = null;
    }
  }

  const isFresh = lastFetched && now - lastFetched < TASKS_STALE_MS;
  const hasTasks = Array.isArray(cached) && cached.length > 0;

  // Only use cache when we have a fresh, non-empty tasks array and forceApiCall is false
  if (!forceApiCall && isFresh && hasTasks) {
    return cached;
  }

  try {
    const res = await apiFetch(API_TASK.LIST, {
      method: 'GET',
      skipCamelize: true // Backend uses snake_case
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'Failed to fetch tasks');
    }
    const tasks = extractTasksFromResponse(data);
    await saveTasks(tasks);
    return tasks;
  } catch (err) {
    // Fallback: return whatever we have cached (even empty) if API fails
    if (cached !== null) {
      return cached;
    }
    return null;
  }
}

/**
 * Save tasks to localStorage and update last fetched timestamp.
 * @param {Array} tasks
 * @returns {Promise<void>}
 */
export async function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks || []));
  localStorage.setItem(TASKS_LAST_FETCHED_KEY, Date.now().toString());
}

/**
 * Remove tasks from localStorage.
 */
export function removeTasks() {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(TASKS_LAST_FETCHED_KEY);
}

/**
 * Update a task in localStorage and API by task_id
 * @param {string} taskId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export async function updateTask(taskId, updates) {
  const tasks = await getTasks();
  if (!tasks) return;
  const updatedTasks = tasks.map(t => (t.task_id === taskId ? { ...t, ...updates } : t));
  await saveTasks(updatedTasks);
  try {
    await apiFetch(API_TASK.UPDATE(taskId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      skipCamelize: true // Backend uses snake_case
    });
  } catch {
    // ignore; cache already updated, API failure will be visible on next fetch
  }
}

/**
 * Get last fetched time for tasks
 * @returns {number|null}
 */
export function getTasksLastFetched() {
  const value = localStorage.getItem(TASKS_LAST_FETCHED_KEY);
  return value ? parseInt(value, 10) : null;
}

/**
 * Fetch all tasks from API (no cache), using /task/.
 */
export async function fetchAllTasks() {
  const res = await apiFetch(API_TASK.LIST, {
    method: 'GET',
    skipCamelize: true // Backend uses snake_case
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to fetch tasks');
  }
  return extractTasksFromResponse(data);
}

/**
 * Save a task (create or update) using /task/ endpoints.
 */
export async function saveTask(task, isEdit = false) {
  const path = isEdit && task.task_id ? API_TASK.UPDATE(task.task_id) : API_TASK.CREATE;
  const method = isEdit && task.task_id ? 'PUT' : 'POST';
  const res = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
    skipCamelize: true // Backend uses snake_case
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || (isEdit ? 'Failed to update task' : 'Failed to create task'));
  }
  return data;
}

/**
 * Delete a task using /task/<task_id>.
 */
export async function deleteTask(taskId) {
  const res = await apiFetch(API_TASK.DELETE(taskId), {
    method: 'DELETE',
    skipCamelize: true // Backend uses snake_case
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to delete task');
  }
  return data;
}

/**
 * Get task by ID from cache
 * @param {string} taskId - Task ID
 * @returns {Promise<object|null>}
 */
export async function getTaskById(taskId) {
  const tasks = await getTasks();
  if (!tasks) return null;
  return tasks.find(t => t.task_id === String(taskId)) || null;
}

/**
 * Get pending tasks
 * @returns {Promise<Array>}
 */
export async function getPendingTasks() {
  const tasks = await getTasks();
  if (!tasks) return [];
  return tasks.filter(t => t.status === 'pending');
}

/**
 * Get completed tasks
 * @returns {Promise<Array>}
 */
export async function getCompletedTasks() {
  const tasks = await getTasks();
  if (!tasks) return [];
  return tasks.filter(t => t.status === 'completed');
}
