import { apiGet, apiFetch } from './client';

export async function getGeneralReport(startDate, endDate, branchId = null) {
  let url = `/reports/general?startDate=${startDate}&endDate=${endDate}`;
  if (branchId) {
    url += `&branchId=${branchId}`;
  }
  return apiGet(url);
}

export async function exportGeneralReport(startDate, endDate, branchId = null) {
  let url = `/reports/general/export?startDate=${startDate}&endDate=${endDate}`;
  if (branchId) {
    url += `&branchId=${branchId}`;
  }
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Export failed: ${response.status}`);
  }
  return response.blob();
}
