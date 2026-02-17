import { apiGet, apiPost, apiDelete } from './client';

export async function getNotifications(includeRead = false) {
  return apiGet(`/notifications?includeRead=${includeRead}`);
}

export async function getUnreadCount() {
  return apiGet('/notifications/unread-count');
}

export async function markAsRead(id) {
  return apiPost(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
  return apiPost('/notifications/read-all');
}

export async function deleteNotification(id) {
  return apiDelete(`/notifications/${id}`);
}
