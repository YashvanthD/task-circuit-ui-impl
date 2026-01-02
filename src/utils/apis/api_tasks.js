import { apiFetch } from '../api';
import { getAuthHeaders } from './api_auth';

export async function listTasks(params = {}) {
  const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  return apiFetch(`/tasks${qs ? '?' + qs : ''}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getTask(taskId) {
  return apiFetch(`/tasks/${taskId}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function createTask(data) {
  return apiFetch('/tasks', { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data) });
}

export async function updateTask(taskId, data) {
  return apiFetch(`/tasks/${taskId}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) });
}

export async function deleteTask(taskId) {
  return apiFetch(`/tasks/${taskId}`, { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

const tasksApi = { listTasks, getTask, createTask, updateTask, deleteTask };
export default tasksApi;
