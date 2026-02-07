import { useAuthStore } from '../stores/auth';

const API_URL = 'http://localhost:5162/api';

// Centralized fetch with auth handling
export async function apiFetch(endpoint, options = {}) {
  const { accessToken, refreshAccessToken, setSessionExpired } = useAuthStore.getState();

  // Prepare headers
  const headers = {
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Prepare body - store original for potential retry
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const fetchOptions = {
    ...options,
    headers,
    body,
  };

  let response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry with new token
      const newToken = useAuthStore.getState().accessToken;
      fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;

      response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

      // If still 401 after refresh, session expired
      if (response.status === 401) {
        setSessionExpired();
        throw new Error('Session expired');
      }
    } else {
      // Refresh failed, session expired
      setSessionExpired();
      throw new Error('Session expired');
    }
  }

  return response;
}

// Helper methods
export async function apiGet(endpoint) {
  const response = await apiFetch(endpoint);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost(endpoint, data) {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: data,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  // Some POST endpoints return 204 No Content or 200 with no body
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function apiPut(endpoint, data) {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: data,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete(endpoint) {
  const response = await apiFetch(endpoint, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
}
