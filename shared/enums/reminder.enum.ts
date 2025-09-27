export enum EReminderFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum EReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  RETRY = 'RETRY',
}

export enum EReminderType {
  BILLING = 'BILLING',
  SESSION = 'SESSION',
  CUSTOM = 'CUSTOM',
}

export enum EReminderActions {
  EMAIL = 'EMAIL',
  BILLING = 'BILLING',
  NOTIFICATION = 'NOTIFICATION',
}
