import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getSaleReturns(branchId = null, clientId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (clientId) params.append('clientId', clientId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/returns${query ? `?${query}` : ''}`);
}

export async function getSaleReturn(id) {
  return apiGet(`/returns/${id}`);
}

export async function getSaleReturnDetail(id) {
  return apiGet(`/returns/${id}/detail`);
}

export async function createSaleReturn(data) {
  return apiPost('/returns', data);
}

export async function updateSaleReturn(id, data) {
  return apiPut(`/returns/${id}`, data);
}

export async function deleteSaleReturn(id) {
  return apiDelete(`/returns/${id}`);
}
