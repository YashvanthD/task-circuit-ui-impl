import { apiFetch } from '../api';

export async function listTasks(params = {}) {
  const qs = Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  return apiFetch(`/tasks${qs ? '?' + qs : ''}`, { method: 'GET' });
}

export async function getTask(taskId) {
  return apiFetch(`/tasks/${taskId}`, { method: 'GET' });
}

export async function createTask(data) {
  return apiFetch('/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function updateTask(taskId, data) {
  return apiFetch(`/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

export async function deleteTask(taskId) {
  return apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
}

const tasksApi = { listTasks, getTask, createTask, updateTask, deleteTask };
export default tasksApi;
