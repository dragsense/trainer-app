/* eslint-disable prettier/prettier */
export enum EBillingStatus {
    PAID = 'paid',
    PENDING = 'pending',
    FAILED = 'failed',
    OVERDUE = 'overdue',
}

export enum EBillingType {
    INDIVIDUAL = 'individual',
    BUSINESS = 'business',
    SESSION = 'session',
}

export enum EBillingCurrency {
    USD = 'usd',
    EUR = 'eur',
    AED = 'aed',
    GBP = 'gbp',
    IND = 'ind',
    PKR = 'pkr',
}
