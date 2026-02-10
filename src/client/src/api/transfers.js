import { apiGet, apiPost, apiDelete } from './client';

export async function getTransfers(branchId = null, type = null, status = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  const query = params.toString();
  return apiGet(`/transfers${query ? `?${query}` : ''}`);
}

export async function getTransfer(id) {
  return apiGet(`/transfers/${id}`);
}

export async function getTransferDetail(id) {
  return apiGet(`/transfers/${id}/detail`);
}

export async function createTransfer(data) {
  return apiPost('/transfers', data);
}

export async function sendTransfer(id) {
  return apiPost(`/transfers/${id}/send`);
}

export async function receiveTransfer(id, data) {
  return apiPost(`/transfers/${id}/receive`, data);
}

export async function cancelTransfer(id) {
  return apiPost(`/transfers/${id}/cancel`);
}

export async function deleteTransfer(id) {
  return apiDelete(`/transfers/${id}`);
}
