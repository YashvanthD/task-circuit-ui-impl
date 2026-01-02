import { apiFetch } from '../api';

export async function listFish() {
  return apiFetch('/fish', { method: 'GET' });
}
export async function getFish(fishId) {
  return apiFetch(`/fish/${fishId}`, { method: 'GET' });
}
export async function addFish(fishData) {
  return apiFetch('/fish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fishData),
  });
}
export async function updateFish(fishId, fishData) {
  return apiFetch(`/fish/${fishId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fishData),
  });
}
export async function deleteFish(fishId) {
  return apiFetch(`/fish/${fishId}`, { method: 'DELETE' });
}
const fishApi = { listFish, getFish, addFish, updateFish, deleteFish };
export default fishApi;
