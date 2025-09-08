export enum ReminderFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}


export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  RETRY = 'RETRY',
}


export enum ReminderType {
  BILLING = 'BILLING',
  SESSION = 'SESSION',
  CUSTOM = 'CUSTOM',
}


export enum ReminderActions {
  EMAIL = 'EMAIL',
  BILLING = 'BILLING',
  NOTIFICATION = 'NOTIFICATION',
}
