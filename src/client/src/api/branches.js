import { getAuthHeader } from '../stores/auth';

const API_URL = 'http://localhost:5162/api';

export async function getBranches() {
  const response = await fetch(`${API_URL}/branches`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error('Failed to fetch branches');
  return response.json();
}

export async function getBranch(id) {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error('Failed to fetch branch');
  return response.json();
}

export async function createBranch(data) {
  const response = await fetch(`${API_URL}/branches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create branch');
  return response.json();
}

export async function updateBranch(id, data) {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update branch');
  return response.json();
}

export async function deleteBranch(id) {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error('Failed to delete branch');
}
