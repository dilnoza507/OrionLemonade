import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getClients() {
  return apiGet('/clients');
}

export async function getActiveClients() {
  return apiGet('/clients/active');
}

export async function getClient(id) {
  return apiGet(`/clients/${id}`);
}

export async function createClient(data) {
  return apiPost('/clients', data);
}

export async function updateClient(id, data) {
  return apiPut(`/clients/${id}`, data);
}

export async function deleteClient(id) {
  return apiDelete(`/clients/${id}`);
}
