import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Categories
export async function getExpenseCategories() {
  return apiGet('/expenses/categories');
}

export async function getExpenseCategory(id) {
  return apiGet(`/expenses/categories/${id}`);
}

export async function createExpenseCategory(data) {
  return apiPost('/expenses/categories', data);
}

export async function updateExpenseCategory(id, data) {
  return apiPut(`/expenses/categories/${id}`, data);
}

export async function deleteExpenseCategory(id) {
  return apiDelete(`/expenses/categories/${id}`);
}

// Expenses
export async function getExpenses(branchId = null, categoryId = null, from = null, to = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (categoryId) params.append('categoryId', categoryId);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/expenses${query ? `?${query}` : ''}`);
}

export async function getExpense(id) {
  return apiGet(`/expenses/${id}`);
}

export async function createExpense(data) {
  return apiPost('/expenses', data);
}

export async function updateExpense(id, data) {
  return apiPut(`/expenses/${id}`, data);
}

export async function deleteExpense(id) {
  return apiDelete(`/expenses/${id}`);
}

// Summary
export async function getExpensesSummary(from = null, to = null) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return apiGet(`/expenses/summary${query ? `?${query}` : ''}`);
}
