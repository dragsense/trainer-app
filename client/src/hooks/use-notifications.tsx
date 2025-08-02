import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
    fetchNotifications, 
    fetchUnreadCount, 
    fetchNotificationSettings,
    updateNotificationSettings,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '@/services/notification.api';

export const useNotifications = (params?: { limit?: number; offset?: number }) => {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => fetchNotifications(params),
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: fetchUnreadCount,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useNotificationSettings = () => {
    return useQuery({
        queryKey: ['notifications', 'settings'],
        queryFn: fetchNotificationSettings,
    });
};

export const useUpdateNotificationSettings = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: updateNotificationSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', 'settings'] });
            toast.success('Notification settings updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update notification settings');
        },
    });
};

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to mark notification as read');
        },
    });
};

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            toast.success('All notifications marked as read');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to mark all notifications as read');
        },
    });
};

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            toast.success('Notification deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete notification');
        },
    });
}; 