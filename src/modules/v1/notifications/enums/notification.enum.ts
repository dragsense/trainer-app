export enum NotificationType {
    NEW_USER = 'new_user',
    USER_UPDATED = 'user_updated',
    INVOICE_GENERATED = 'invoice_generated',
    BILLING_DUE = 'billing_due',
    SESSION_SCHEDULED = 'session_scheduled',
    PAYMENT_RECEIVED = 'payment_received',
    NEW_MESSAGE = 'new_message',
    GENERAL = 'general'
}

export enum NotificationStatus {
    UNREAD = 'unread',
    READ = 'read',
    ARCHIVED = 'archived'
}