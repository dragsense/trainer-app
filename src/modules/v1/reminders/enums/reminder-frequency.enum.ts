export enum ReminderFrequency {
  ONCE = 'ONCE',
  MINUTELY = 'MINUTELY',
  HOURLY = 'HOURLY',
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
  PAYMENT = 'PAYMENT',
  SESSION = 'SESSION',
  CUSTOM = 'CUSTOM',
}
