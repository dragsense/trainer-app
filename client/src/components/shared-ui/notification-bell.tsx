import { useState, useContext } from 'react';
import { Bell, X, Check, Trash2, AlertCircle } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification, useUnreadCount } from '@/hooks/use-notifications';
import { INotification } from '@/@types/notification.type';
import { NotificationType } from '#/modules/v1/notifications/enums/notification.enum';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { fetchAppSettings } from '@/services/setting.api';
import { useQuery } from '@tanstack/react-query';

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case NotificationType.NEW_USER:
            return '👤';
        case NotificationType.USER_UPDATED:
            return '📝';

        case NotificationType.INVOICE_GENERATED:
            return '📄';
        case NotificationType.BILLING_DUE:
            return '💰';
        case NotificationType.PAYMENT_RECEIVED:
            return '💳';
        default:
            return '🔔';
    }
};

const getNotificationColor = (type: NotificationType) => {
    switch (type) {
        case NotificationType.NEW_USER:
            return 'bg-green-100 text-green-800';
        case NotificationType.USER_UPDATED:
            return 'bg-orange-100 text-orange-800';
        case NotificationType.INVOICE_GENERATED:
        case NotificationType.BILLING_DUE:
            return 'bg-blue-100 text-blue-800';
        case NotificationType.PAYMENT_RECEIVED:
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

interface NotificationItemProps {
    notification: INotification;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
    onNotificationClick: (notification: INotification) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onNotificationClick }: NotificationItemProps) => {
    const isUnread = notification.status === 'unread';

    const handleClick = () => {
        onNotificationClick(notification);
    };

    return (
        <div
            className={`p-3 border-b last:border-b-0 ${isUnread ? 'bg-blue-50' : ''} cursor-pointer hover:bg-gray-50 transition-colors`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                            {isUnread && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onMarkAsRead(notification.id)}
                                    className="h-6 w-6 p-0"
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(notification.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { data: notifications = [], isLoading, error } = useNotifications({ limit: 10 });
    const { data: unreadCountData } = useUnreadCount();
    const navigate = useNavigate();

    // Get app settings to check if global notifications are enabled
    const { data: appSettings } = useQuery({
        queryKey: ['app-settings'],
        queryFn: fetchAppSettings,
    });

    // Safely access notification context
    const unreadCount = unreadCountData || 0;


    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const deleteMutation = useDeleteNotification();

    const handleMarkAsRead = (id: number) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleNotificationClick = (notification: INotification) => {
        // Mark as read if unread
        if (notification.status === 'unread') {
            markAsReadMutation.mutate(notification.id);
        }

        if (notification.link) {
            navigate(notification.link);
        }

        // Close the popover
        setIsOpen(false);
    };

    const unreadNotifications = notifications?.filter(n => n.status === 'unread');

    return (
        <div className="flex items-center gap-2">
            {/* Debug info */}
            <div className="text-xs text-gray-500">
                {isLoading ? 'Loading...' : ``}
            </div>

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">

                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Notifications</h3>
                            {unreadNotifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    disabled={markAllAsReadMutation.isPending}
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                    </div>
                    <ScrollArea className="h-80">
                        {!appSettings?.allowNotification ? (
                            <div className="p-4 text-center">
                                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Global notifications are disabled</p>
                                <p className="text-xs text-gray-500">
                                    Enable notifications in your app settings to receive updates
                                </p>
                            </div>
                        ) : isLoading ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading notifications...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        onNotificationClick={handleNotificationClick}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    );
} 