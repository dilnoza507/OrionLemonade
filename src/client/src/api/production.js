import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Batches
export async function getBatches(branchId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/production/batches${query ? `?${query}` : ''}`);
}

export async function getBatch(id) {
  return apiGet(`/production/batches/${id}`);
}

export async function getBatchDetail(id) {
  return apiGet(`/production/batches/${id}/detail`);
}

export async function createBatch(data) {
  return apiPost('/production/batches', data);
}

export async function updateBatch(id, data) {
  return apiPut(`/production/batches/${id}`, data);
}

export async function deleteBatch(id) {
  return apiDelete(`/production/batches/${id}`);
}

// Batch Operations
export async function startBatch(id, data = {}) {
  return apiPost(`/production/batches/${id}/start`, data);
}

export async function completeBatch(id, data) {
  return apiPost(`/production/batches/${id}/complete`, data);
}

export async function cancelBatch(id) {
  return apiPost(`/production/batches/${id}/cancel`, {});
}

// Summary & Helpers
export async function getProductionSummary(from = null, to = null) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/production/summary${query ? `?${query}` : ''}`);
}

export async function calculateConsumption(recipeVersionId, plannedQuantity) {
  return apiGet(`/production/calculate-consumption?recipeVersionId=${recipeVersionId}&plannedQuantity=${plannedQuantity}`);
}
