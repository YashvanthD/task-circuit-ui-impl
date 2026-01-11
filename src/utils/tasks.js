import { apiFetch } from './api/client';
import { BASE_URL } from '../config';

// Task utility functions

const TASKS_KEY = 'tasks';
const TASKS_LAST_FETCHED_KEY = 'tasks_last_fetched';
const TASKS_STALE_MS = 5 * 60 * 1000; // 5 minutes

function normalizeTasks(list) {
  if (!Array.isArray(list)) return [];
  return list.map((t) => {
    // Priority: taskId (camelCase), then task_id, then id/_id
    const rawId = t.taskId || t.task_id || t.id || t._id;
    const task_id = rawId != null ? String(rawId) : undefined;
    return { ...t, task_id };
  });
}

function extractTasksFromResponse(data) {
  // API_DOC: GET /task/ -> { meta, tasks: [...] }
  if (!data) return [];
  const rawTasks = Array.isArray(data.tasks)
    ? data.tasks
    : data.data && Array.isArray(data.data.tasks)
    ? data.data.tasks
    : [];
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
    const res = await apiFetch('/task/', { method: 'GET' });
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
    await apiFetch(`/task/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
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
  const res = await apiFetch('/task/', { method: 'GET' });
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
  const path = isEdit && task.task_id ? `/task/${task.task_id}` : '/task/';
  const method = isEdit && task.task_id ? 'PUT' : 'POST';
  const res = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
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
  const res = await apiFetch(`/task/${taskId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Failed to delete task');
  }
  return data;
}
