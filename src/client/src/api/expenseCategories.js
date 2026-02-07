import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getExpenseCategories() {
  return apiGet('/expensecategories');
}

export async function getExpenseCategory(id) {
  return apiGet(`/expensecategories/${id}`);
}

export async function createExpenseCategory(data) {
  return apiPost('/expensecategories', data);
}

export async function updateExpenseCategory(id, data) {
  return apiPut(`/expensecategories/${id}`, data);
}

export async function deleteExpenseCategory(id) {
  return apiDelete(`/expensecategories/${id}`);
}
