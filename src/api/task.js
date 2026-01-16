/**
 * Task API Module
 * Task-related API calls.
 *
 * @module api/task
 */

import { apiFetch } from './client';
import { getAuthHeaders } from './auth';
import { API_TASK } from './constants';

/**
 * List all tasks
 */
export async function listTasks(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_TASK.LIST}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get task by ID
 */
export async function getTask(taskId) {
  return apiFetch(API_TASK.DETAIL(taskId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Create new task
 */
export async function createTask(data) {
  return apiFetch(API_TASK.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Update task
 */
export async function updateTask(taskId, data) {
  return apiFetch(API_TASK.UPDATE(taskId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Delete task
 */
export async function deleteTask(taskId) {
  return apiFetch(API_TASK.DELETE(taskId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Move task to different status/stage
 */
export async function moveTask(taskId, data) {
  return apiFetch(API_TASK.MOVE(taskId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
}

/**
 * Get tasks by pond
 */
export async function getTasksByPond(pondId) {
  return apiFetch(API_TASK.BY_POND(pondId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

/**
 * Get tasks by user
 */
export async function getTasksByUser(userKey) {
  return apiFetch(API_TASK.BY_USER(userKey), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
  });
}

const taskApi = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksByPond,
  getTasksByUser,
};

export default taskApi;

