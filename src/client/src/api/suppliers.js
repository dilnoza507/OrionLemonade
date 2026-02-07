import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getSuppliers() {
  return apiGet('/suppliers');
}

export async function getActiveSuppliers() {
  return apiGet('/suppliers/active');
}

export async function getSupplier(id) {
  return apiGet(`/suppliers/${id}`);
}

export async function createSupplier(data) {
  return apiPost('/suppliers', data);
}

export async function updateSupplier(id, data) {
  return apiPut(`/suppliers/${id}`, data);
}

export async function deleteSupplier(id) {
  return apiDelete(`/suppliers/${id}`);
}
