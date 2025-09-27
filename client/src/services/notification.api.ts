import { apiRequest } from '@/utils/fetcher';
import { INotification } from '@shared/interfaces/notification.interface';
import { INotificationSetting } from '@shared/interfaces/settings.interface';
import { IMessageResponse } from '@shared/interfaces/api/response.interface';
import { TNotficationData } from '@shared/types/notification.type';

const BASE_URL = '/notifications';

// Get all notifications for current user
export const fetchNotifications = async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const url = queryParams.toString() ? `${BASE_URL}?${queryParams.toString()}` : BASE_URL;
    return apiRequest<INotification[]>(url, 'GET');
};

// Get unread notification count
export const fetchUnreadCount = async () => {
    return apiRequest<number>(`${BASE_URL}/unread-count`, 'GET');
};

// Get notification settings
export const fetchNotificationSettings = async () => {
    return apiRequest<INotificationSetting>(`${BASE_URL}/settings`, 'GET');
};

// Update notification settings
export const updateNotificationSettings = async (settings: Partial<INotificationSetting>) => {
    return apiRequest<INotificationSetting>(`${BASE_URL}/settings`, 'PATCH', settings);
};

// Get a specific notification
export const fetchNotification = async (id: number) => {
    return apiRequest<INotification>(`${BASE_URL}/${id}`, 'GET');
};

// Update a notification
export const updateNotification = async (id: number, data: Partial<TNotficationData>) => {
    return apiRequest<INotification>(`${BASE_URL}/${id}`, 'PATCH', data);
};

// Mark notification as read
export const markNotificationAsRead = async (id: number) => {
    return apiRequest<INotification>(`${BASE_URL}/${id}/read`, 'PATCH');
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
    return apiRequest<IMessageResponse>(`${BASE_URL}/mark-all-read`, 'PATCH');
};

// Delete a notification
export const deleteNotification = async (id: number) => {
    return apiRequest<IMessageResponse>(`${BASE_URL}/${id}`, 'DELETE');
};

// Create a notification (admin only)
export const createNotification = async (data: TNotficationData) => {
    return apiRequest<INotification>(BASE_URL, 'POST', data);
}; 