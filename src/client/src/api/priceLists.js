import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Price Lists
export async function getPriceLists(branchId = null, isActive = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (isActive !== null) params.append('isActive', isActive);
  const query = params.toString();
  return apiGet(`/price-lists${query ? `?${query}` : ''}`);
}

export async function getPriceList(id) {
  return apiGet(`/price-lists/${id}`);
}

export async function getPriceListDetail(id) {
  return apiGet(`/price-lists/${id}/detail`);
}

export async function createPriceList(data) {
  return apiPost('/price-lists', data);
}

export async function updatePriceList(id, data) {
  return apiPut(`/price-lists/${id}`, data);
}

export async function deletePriceList(id) {
  return apiDelete(`/price-lists/${id}`);
}

// Price List Items
export async function getPriceListItems(priceListId) {
  return apiGet(`/price-lists/${priceListId}/items`);
}

export async function getPriceListItem(id) {
  return apiGet(`/price-lists/items/${id}`);
}

export async function addPriceListItem(priceListId, data) {
  return apiPost(`/price-lists/${priceListId}/items`, data);
}

export async function updatePriceListItem(id, data) {
  return apiPut(`/price-lists/items/${id}`, data);
}

export async function deletePriceListItem(id) {
  return apiDelete(`/price-lists/items/${id}`);
}

export async function bulkUpdatePriceListItems(priceListId, items) {
  return apiPost(`/price-lists/${priceListId}/items/bulk`, items);
}

// Price lookup
export async function getPrice(priceListId, recipeId) {
  return apiGet(`/price-lists/${priceListId}/price/${recipeId}`);
}
