import { apiGet, apiPost, apiPut, apiDelete } from './client';

export async function getExchangeRates() {
  return apiGet('/exchangerates');
}

export async function getExchangeRate(id) {
  return apiGet(`/exchangerates/${id}`);
}

export async function getLatestExchangeRate() {
  return apiGet('/exchangerates/latest');
}

export async function createExchangeRate(data) {
  return apiPost('/exchangerates', data);
}

export async function updateExchangeRate(id, data) {
  return apiPut(`/exchangerates/${id}`, data);
}

export async function deleteExchangeRate(id) {
  return apiDelete(`/exchangerates/${id}`);
}
