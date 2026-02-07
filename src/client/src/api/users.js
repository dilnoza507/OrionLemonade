import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getUsers() {
  return apiGet('/users');
}

export async function getUser(id) {
  return apiGet(`/users/${id}`);
}

export async function createUser(data) {
  return apiPost('/users', data);
}

export async function updateUser(id, data) {
  return apiPut(`/users/${id}`, data);
}

export async function deleteUser(id) {
  return apiDelete(`/users/${id}`);
}
