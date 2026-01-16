import { apiFetch } from '../api/client';
import { getAuthHeaders } from './api_auth';
import { API_FISH } from './constants';

export async function listFish() {
  return apiFetch(API_FISH.BASE, { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function getFish(fishId) {
  return apiFetch(API_FISH.DETAIL(fishId), { method: 'GET', headers: getAuthHeaders({ contentType: null }) });
}

export async function addFish(fishData) {
  return apiFetch(API_FISH.CREATE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fishData),
  });
}

export async function updateFish(fishId, fishData) {
  return apiFetch(API_FISH.UPDATE(fishId), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(fishData),
  });
}

export async function deleteFish(fishId) {
  return apiFetch(API_FISH.DELETE(fishId), { method: 'DELETE', headers: getAuthHeaders({ contentType: null }) });
}

const fishApi = { listFish, getFish, addFish, updateFish, deleteFish };
export default fishApi;
