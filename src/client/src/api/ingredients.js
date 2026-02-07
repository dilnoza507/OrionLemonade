import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getIngredients() {
  return apiGet('/ingredients');
}

export async function getActiveIngredients() {
  return apiGet('/ingredients/active');
}

export async function getIngredient(id) {
  return apiGet(`/ingredients/${id}`);
}

export async function createIngredient(data) {
  return apiPost('/ingredients', data);
}

export async function updateIngredient(id, data) {
  return apiPut(`/ingredients/${id}`, data);
}

export async function deleteIngredient(id) {
  return apiDelete(`/ingredients/${id}`);
}
