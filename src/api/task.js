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
 * Backend returns snake_case, so skip camelization
 */
export async function listTasks(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`${API_TASK.LIST}${qs ? '?' + qs : ''}`, {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
    skipCamelize: true, // Backend uses snake_case
  });
}

/**
 * Get task by ID
 * Backend returns snake_case, so skip camelization
 */
export async function getTask(taskId) {
  return apiFetch(API_TASK.DETAIL(taskId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
    skipCamelize: true, // Backend uses snake_case
  });
}

/**
 * Create new task
 * Backend expects and returns snake_case
 */
export async function createTask(data) {
  return apiFetch(API_TASK.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    skipCamelize: true, // Backend uses snake_case
  });
}

/**
 * Update task
 * Backend expects and returns snake_case
 */
export async function updateTask(taskId, data) {
  return apiFetch(API_TASK.UPDATE(taskId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    skipCamelize: true, // Backend uses snake_case
  });
}

/**
 * Delete task
 */
export async function deleteTask(taskId) {
  return apiFetch(API_TASK.DELETE(taskId), {
    method: 'DELETE',
    headers: getAuthHeaders({ contentType: null }),
    skipCamelize: true, // Backend uses snake_case
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
    skipCamelize: true, // Backend uses snake_case
  });
}

/**
 * Get tasks by pond
 */
export async function getTasksByPond(pondId) {
  return apiFetch(API_TASK.BY_POND(pondId), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
    skipCamelize: true, // Backend uses snake_case
  });
}

/**
 * Get tasks by user
 */
export async function getTasksByUser(userKey) {
  return apiFetch(API_TASK.BY_USER(userKey), {
    method: 'GET',
    headers: getAuthHeaders({ contentType: null }),
    skipCamelize: true, // Backend uses snake_case
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

