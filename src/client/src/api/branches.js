import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getBranches() {
  return apiGet('/branches');
}

export async function getBranch(id) {
  return apiGet(`/branches/${id}`);
}

export async function createBranch(data) {
  return apiPost('/branches', data);
}

export async function updateBranch(id, data) {
  return apiPut(`/branches/${id}`, data);
}

export async function deleteBranch(id) {
  return apiDelete(`/branches/${id}`);
}
