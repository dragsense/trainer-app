import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthUser } from '@/hooks/use-auth-user';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
    joinUserRoom, 
    leaveUserRoom, 
    listenForNewNotification,  
    listenForUnreadCountUpdate,
    removeNewNotificationListener,
    removeUnreadCountUpdateListener
} from '@/utils/socket';
import { INotification } from '@/@types/notification.type';

interface NotificationContextType {
    isConnected: boolean;
    unreadCount: number;
    setUnreadCount: (count: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user } = useAuthUser();
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        const handleNewNotification = (notification: INotification) => {
            console.log('📨 New notification received:', notification);
            
            // Show toast notification
            toast(notification.title, {
                description: notification.message,
                duration: 5000,
            });

            // Invalidate notifications query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        };

        const handleUnreadCountUpdate = (data: { count: number }) => {
            console.log('📊 Unread count updated:', data.count);
            setUnreadCount(data.count);
        };

        const setupNotificationSocket = async () => {
            try {
                // Join user room for notifications
                await joinUserRoom(user.id);
                setIsConnected(true);

                // Listen for new notifications
                listenForNewNotification(handleNewNotification);
                listenForUnreadCountUpdate(handleUnreadCountUpdate);

                console.log('✅ Notification socket setup complete');
            } catch (error) {
                console.error('❌ Failed to setup notification socket:', error);
                setIsConnected(false);
            }
        };

        setupNotificationSocket();

        // Cleanup function
        return () => {
            if (user?.id) {
                leaveUserRoom(user.id).catch(console.error);
                removeNewNotificationListener(handleNewNotification);
                removeUnreadCountUpdateListener(handleUnreadCountUpdate);
                setIsConnected(false);
            }
        };
    }, [user?.id, queryClient]);

    const value: NotificationContextType = {
        isConnected,
        unreadCount,
        setUnreadCount,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 