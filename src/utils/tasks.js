import { apiFetch } from './api';
import { BASE_URL } from '../config';

// Task utility functions

const TASKS_KEY = 'tasks';
const TASKS_LAST_FETCHED_KEY = 'tasks_last_fetched';
const TASKS_STALE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get tasks from localStorage, or fetch from API if missing/stale.
 * @returns {Promise<Array|null>}
 */
export async function getTasks() {
  const value = localStorage.getItem(TASKS_KEY);
  const lastFetched = localStorage.getItem(TASKS_LAST_FETCHED_KEY);
  const now = Date.now();
  if (value && lastFetched && (now - parseInt(lastFetched, 10) < TASKS_STALE_MS)) {
    return JSON.parse(value);
  }
  // Fetch from API
  try {
    const res = await apiFetch(`${BASE_URL}/task/`, { method: 'GET' });
    const data = await res.json();
    if (res.ok && data.success) {
      saveTasks(data.tasks || []);
      return data.tasks || [];
    }
  } catch (err) {}
  // Fallback to localStorage if API fails
  return value ? JSON.parse(value) : null;
}

/**
 * Save tasks to localStorage and update last fetched timestamp.
 * Also send update to API if needed.
 * @param {Array} tasks
 * @returns {Promise<void>}
 */
export async function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(TASKS_LAST_FETCHED_KEY, Date.now().toString());
  // Optionally send update to API (bulk PUT/PATCH if supported)
  // Not recommended for most APIs, so usually only localStorage
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
  const updatedTasks = tasks.map(t => t.task_id === taskId ? { ...t, ...updates } : t);
  await saveTasks(updatedTasks);
  // Update task in API
  try {
    await apiFetch(`${BASE_URL}/task/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {}
}

/**
 * Get last fetched time for tasks
 * @returns {number|null}
 */
export function getTasksLastFetched() {
  const value = localStorage.getItem(TASKS_LAST_FETCHED_KEY);
  return value ? parseInt(value, 10) : null;
}

// User info utility functions

/**
 * Get user info from localStorage
 * @returns {object|null}
 */
export function getUserInfo() {
  const value = localStorage.getItem('user');
  return value ? JSON.parse(value) : null;
}

/**
 * Save user info to localStorage
 * @param {object} userInfo
 */
export function saveUserInfo(userInfo) {
  localStorage.setItem('user', JSON.stringify(userInfo));
}

/**
 * Remove user info from localStorage
 */
export function removeUserInfo() {
  localStorage.removeItem('user');
}

/**
 * Update user info in localStorage
 * @param {object} updates
 */
export function updateUserInfo(updates) {
  const user = getUserInfo();
  if (!user) return;
  const updated = { ...user, ...updates };
  saveUserInfo(updated);
}
