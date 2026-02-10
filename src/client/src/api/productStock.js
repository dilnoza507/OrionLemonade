import { apiGet, apiPost, apiPut } from './client';

// Stock endpoints
export async function getStocks(branchId = null, recipeId = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (recipeId) params.append('recipeId', recipeId);
  const query = params.toString();
  return apiGet(`/product-stock/stocks${query ? `?${query}` : ''}`);
}

export async function getStock(id) {
  return apiGet(`/product-stock/stocks/${id}`);
}

export async function getStockSummary() {
  return apiGet('/product-stock/summary');
}

export async function getStockQuantity(branchId, recipeId) {
  return apiGet(`/product-stock/quantity?branchId=${branchId}&recipeId=${recipeId}`);
}

export async function addStock(data) {
  return apiPost('/product-stock/stocks', data);
}

export async function adjustStock(branchId, recipeId, data) {
  return apiPut(`/product-stock/stocks/${branchId}/${recipeId}/adjust`, data);
}

// Movement endpoints
export async function getMovements(branchId = null, recipeId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (recipeId) params.append('recipeId', recipeId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/product-stock/movements${query ? `?${query}` : ''}`);
}

export async function getMovement(id) {
  return apiGet(`/product-stock/movements/${id}`);
}

// Operations
export async function writeOffProduct(data) {
  return apiPost('/product-stock/write-off', data);
}

export async function transferProduct(data) {
  return apiPost('/product-stock/transfer', data);
}
