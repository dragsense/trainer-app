export enum EPaymentMethodType {
  STRIPE = 'STRIPE',
  CASH = 'CASH'
}

export enum EPaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}


export const PAYMENT_METHOD_CONFIGS = {
  [EPaymentMethodType.STRIPE]: {
    name: 'Stripe',
    configSchema: {
      type: 'object',
      properties: {
        publishableKey: {
          type: 'string',
          title: 'Publishable Key',
          description: 'Your Stripe publishable key (starts with pk_)'
        },
        secretKey: {
          type: 'string',
          title: 'Secret Key',
          description: 'Your Stripe secret key (starts with sk_)'
        },
        webhookSecret: {
          type: 'string',
          title: 'Webhook Secret',
          description: 'Your Stripe webhook endpoint secret'
        }
      },
      required: ['publishableKey', 'secretKey']
    }
  },
  [EPaymentMethodType.CASH]: {
    name: 'Cash',
    configSchema: null // No configuration needed for cash
  }
}; 