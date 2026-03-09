import { apiGet } from './client';

export async function getAuditLogs(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.branchId) searchParams.append('branchId', params.branchId);
  if (params.entityType) searchParams.append('entityType', params.entityType);
  if (params.action) searchParams.append('action', params.action);
  if (params.userId) searchParams.append('userId', params.userId);
  if (params.from) searchParams.append('from', params.from);
  if (params.to) searchParams.append('to', params.to);
  if (params.page) searchParams.append('page', params.page);
  if (params.pageSize) searchParams.append('pageSize', params.pageSize);
  const query = searchParams.toString();
  return apiGet(`/auditlog${query ? `?${query}` : ''}`);
}

export async function getAuditLogById(id) {
  return apiGet(`/auditlog/${id}`);
}

export async function getAuditLogEntityTypes() {
  return apiGet('/auditlog/entity-types');
}
