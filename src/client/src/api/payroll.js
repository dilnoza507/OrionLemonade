import { apiGet, apiPost, apiPut, apiDelete } from './client';

// Timesheets
export async function getTimesheets(employeeId = null, branchId = null, year = null, month = null) {
  const params = new URLSearchParams();
  if (employeeId) params.append('employeeId', employeeId);
  if (branchId) params.append('branchId', branchId);
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  const query = params.toString();
  return apiGet(`/payroll/timesheets${query ? `?${query}` : ''}`);
}

export async function getTimesheet(id) {
  return apiGet(`/payroll/timesheets/${id}`);
}

export async function createTimesheet(data) {
  return apiPost('/payroll/timesheets', data);
}

export async function updateTimesheet(id, data) {
  return apiPut(`/payroll/timesheets/${id}`, data);
}

export async function deleteTimesheet(id) {
  return apiDelete(`/payroll/timesheets/${id}`);
}

// Bonuses
export async function getBonuses(employeeId = null, year = null, month = null) {
  const params = new URLSearchParams();
  if (employeeId) params.append('employeeId', employeeId);
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  const query = params.toString();
  return apiGet(`/payroll/bonuses${query ? `?${query}` : ''}`);
}

export async function getBonus(id) {
  return apiGet(`/payroll/bonuses/${id}`);
}

export async function createBonus(data) {
  return apiPost('/payroll/bonuses', data);
}

export async function deleteBonus(id) {
  return apiDelete(`/payroll/bonuses/${id}`);
}

// Advances
export async function getAdvances(employeeId = null, year = null, month = null) {
  const params = new URLSearchParams();
  if (employeeId) params.append('employeeId', employeeId);
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  const query = params.toString();
  return apiGet(`/payroll/advances${query ? `?${query}` : ''}`);
}

export async function getAdvance(id) {
  return apiGet(`/payroll/advances/${id}`);
}

export async function createAdvance(data) {
  return apiPost('/payroll/advances', data);
}

export async function deleteAdvance(id) {
  return apiDelete(`/payroll/advances/${id}`);
}

// Payroll Calculations
export async function getPayrollCalculations(branchId = null, year = null, month = null) {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  const query = params.toString();
  return apiGet(`/payroll/calculations${query ? `?${query}` : ''}`);
}

export async function getPayrollCalculation(id) {
  return apiGet(`/payroll/calculations/${id}`);
}

export async function getPayrollCalculationDetail(id) {
  return apiGet(`/payroll/calculations/${id}/detail`);
}

export async function createPayrollCalculation(data) {
  return apiPost('/payroll/calculations', data);
}

export async function calculatePayroll(id) {
  return apiPost(`/payroll/calculations/${id}/calculate`);
}

export async function approvePayroll(id) {
  return apiPost(`/payroll/calculations/${id}/approve`);
}

export async function markPayrollAsPaid(id) {
  return apiPost(`/payroll/calculations/${id}/pay`);
}

export async function cancelPayroll(id) {
  return apiPost(`/payroll/calculations/${id}/cancel`);
}

export async function deletePayrollCalculation(id) {
  return apiDelete(`/payroll/calculations/${id}`);
}

export async function getPayrollSummary(year, month, branchId = null) {
  const params = new URLSearchParams();
  params.append('year', year);
  params.append('month', month);
  if (branchId) params.append('branchId', branchId);
  return apiGet(`/payroll/summary?${params.toString()}`);
}

// Employee Rate History
export async function getEmployeeRateHistory(employeeId) {
  return apiGet(`/payroll/rates/${employeeId}`);
}

export async function createEmployeeRateHistory(data) {
  return apiPost('/payroll/rates', data);
}
