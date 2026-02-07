import { apiGet, apiPost, apiDelete } from './client';

// Stock
export async function getAllStock() {
  return apiGet('/warehouse/stock');
}

export async function getStockByBranch(branchId) {
  return apiGet(`/warehouse/stock/branch/${branchId}`);
}

export async function getLowStock(branchId = null) {
  const params = branchId ? `?branchId=${branchId}` : '';
  return apiGet(`/warehouse/stock/low${params}`);
}

export async function getStock(branchId, ingredientId) {
  return apiGet(`/warehouse/stock/${branchId}/${ingredientId}`);
}

export async function getStockSummary() {
  return apiGet('/warehouse/stock/summary');
}

// Receipts
export async function getReceipts(branchId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/warehouse/receipts${query ? `?${query}` : ''}`);
}

export async function getReceipt(id) {
  return apiGet(`/warehouse/receipts/${id}`);
}

export async function createReceipt(data) {
  return apiPost('/warehouse/receipts', data);
}

export async function deleteReceipt(id) {
  return apiDelete(`/warehouse/receipts/${id}`);
}

// Write-offs
export async function getWriteOffs(branchId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/warehouse/writeoffs${query ? `?${query}` : ''}`);
}

export async function getWriteOff(id) {
  return apiGet(`/warehouse/writeoffs/${id}`);
}

export async function createWriteOff(data) {
  return apiPost('/warehouse/writeoffs', data);
}

export async function deleteWriteOff(id) {
  return apiDelete(`/warehouse/writeoffs/${id}`);
}

// Movements
export async function getMovements(branchId = null, ingredientId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (ingredientId) params.append('ingredientId', ingredientId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/warehouse/movements${query ? `?${query}` : ''}`);
}

export async function createAdjustment(data) {
  return apiPost('/warehouse/adjustments', data);
}
