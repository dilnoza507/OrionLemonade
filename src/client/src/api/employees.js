import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getEmployees() {
  return apiGet('/employees');
}

export async function getActiveEmployees() {
  return apiGet('/employees/active');
}

export async function getEmployeesByBranch(branchId) {
  return apiGet(`/employees/by-branch/${branchId}`);
}

export async function getEmployee(id) {
  return apiGet(`/employees/${id}`);
}

export async function createEmployee(data) {
  return apiPost('/employees', data);
}

export async function updateEmployee(id, data) {
  return apiPut(`/employees/${id}`, data);
}

export async function deleteEmployee(id) {
  return apiDelete(`/employees/${id}`);
}
