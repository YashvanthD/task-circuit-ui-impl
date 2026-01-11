import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';

export async function listFish() {
  return apiFetch('/fish', { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}
export async function getFish(fishId) {
  return apiFetch(`/fish/${fishId}`, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}
export async function addFish(fishData) {
  return apiFetch('/fish', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fishData),
  });
}
export async function updateFish(fishId, fishData) {
  return apiFetch(`/fish/${fishId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(fishData),
  });
}
export async function deleteFish(fishId) {
  return apiFetch(`/fish/${fishId}`, { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}
const fishApi = { listFish, getFish, addFish, updateFish, deleteFish };
export default fishApi;
