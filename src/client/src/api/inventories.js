import { apiGet, apiPost, apiDelete } from './client';

export async function getInventories(branchId = null, type = null, status = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  const query = params.toString();
  return apiGet(`/inventories${query ? `?${query}` : ''}`);
}

export async function getInventory(id) {
  return apiGet(`/inventories/${id}`);
}

export async function getInventoryDetail(id) {
  return apiGet(`/inventories/${id}/detail`);
}

export async function createInventory(data) {
  return apiPost('/inventories', data);
}

export async function startInventory(id) {
  return apiPost(`/inventories/${id}/start`);
}

export async function completeInventory(id, data) {
  return apiPost(`/inventories/${id}/complete`, data);
}

export async function cancelInventory(id) {
  return apiPost(`/inventories/${id}/cancel`);
}

export async function deleteInventory(id) {
  return apiDelete(`/inventories/${id}`);
}
