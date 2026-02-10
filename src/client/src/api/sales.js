import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Sales
export async function getSales(branchId = null, clientId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (clientId) params.append('clientId', clientId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/sales${query ? `?${query}` : ''}`);
}

export async function getSale(id) {
  return apiGet(`/sales/${id}`);
}

export async function getSaleDetail(id) {
  return apiGet(`/sales/${id}/detail`);
}

export async function createSale(data) {
  return apiPost('/sales', data);
}

export async function updateSale(id, data) {
  return apiPut(`/sales/${id}`, data);
}

export async function deleteSale(id) {
  return apiDelete(`/sales/${id}`);
}

// Sale operations
export async function confirmSale(id) {
  return apiPost(`/sales/${id}/confirm`);
}

export async function shipSale(id) {
  return apiPost(`/sales/${id}/ship`);
}

export async function cancelSale(id) {
  return apiPost(`/sales/${id}/cancel`);
}

// Payments
export async function addPayment(saleId, data) {
  return apiPost(`/sales/${saleId}/payments`, data);
}

export async function deletePayment(paymentId) {
  return apiDelete(`/sales/payments/${paymentId}`);
}

// Summary
export async function getSalesSummary(from = null, to = null) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/sales/summary${query ? `?${query}` : ''}`);
}
