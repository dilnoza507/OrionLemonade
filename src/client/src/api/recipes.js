import { apiGet, apiPost, apiPut, apiDelete, apiFetch } from './client';

// Recipe operations
export async function getRecipes() {
  return apiGet('/recipes');
}

export async function getActiveRecipes() {
  return apiGet('/recipes/active');
}

export async function getRecipe(id) {
  return apiGet(`/recipes/${id}`);
}

export async function getRecipeDetail(id) {
  return apiGet(`/recipes/${id}/detail`);
}

export async function createRecipe(data) {
  return apiPost('/recipes', data);
}

export async function updateRecipe(id, data) {
  return apiPut(`/recipes/${id}`, data);
}

export async function deleteRecipe(id) {
  return apiDelete(`/recipes/${id}`);
}

// RecipeVersion operations
export async function getRecipeVersion(versionId) {
  return apiGet(`/recipes/versions/${versionId}`);
}

export async function createRecipeVersion(data) {
  return apiPost('/recipes/versions', data);
}

export async function updateRecipeVersion(versionId, data) {
  return apiPut(`/recipes/versions/${versionId}`, data);
}

export async function activateRecipeVersion(versionId) {
  const response = await apiFetch(`/recipes/versions/${versionId}/activate`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to activate recipe version');
}

export async function deleteRecipeVersion(versionId) {
  return apiDelete(`/recipes/versions/${versionId}`);
}
