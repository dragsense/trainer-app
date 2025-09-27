export enum ENotificationType {
  NEW_USER = 'new_user',
  USER_UPDATED = 'user_updated',
  INVOICE_GENERATED = 'invoice_generated',
  BILLING_DUE = 'billing_due',
  SESSION_SCHEDULED = 'session_scheduled',
  PAYMENT_RECEIVED = 'payment_received',
  GENERAL = 'general'
}

export enum ENotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}