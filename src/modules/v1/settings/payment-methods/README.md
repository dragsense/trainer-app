# Payment Methods Module

This module provides dynamic payment method management for the gym application.

## Overview

The payment methods module consists of two main entities:

1. **PaymentMethod** - Defines available payment method types (e.g., Stripe, Cash, Bank Transfer)
2. **PaymentMethodSetting** - Stores admin-specific configurations for each payment method

## Features

- **Dynamic Payment Methods**: Add new payment method types without code changes
- **JSON Schema Configuration**: Each payment method can define its own configuration schema
- **Admin-Specific Settings**: Each admin can enable/disable and configure payment methods independently
- **Admin Role Protection**: Only users with admin role (level 0) can manage payment method settings
- **Full CRUD Operations**: Complete API for managing both payment methods and settings

## Database Schema

### PaymentMethod Entity
```sql
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  config_schema JSON,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### PaymentMethodSetting Entity
```sql
CREATE TABLE payment_method_settings (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  method_id INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  config JSON,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (method_id) REFERENCES payment_methods(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);
```

## API Endpoints

### Payment Methods
- `GET /payment-methods` - List all payment methods with pagination
- `GET /payment-methods/active` - Get all active payment methods
- `GET /payment-methods/:id` - Get a specific payment method
- `POST /payment-methods` - Create a new payment method
- `PATCH /payment-methods/:id` - Update a payment method
- `DELETE /payment-methods/:id` - Delete a payment method

### Payment Method Settings (Admin Only)
- `GET /payment-method-settings` - List all settings with pagination
- `GET /payment-method-settings/admin/:adminId` - Get settings for a specific admin
- `GET /payment-method-settings/:id` - Get a specific setting
- `POST /payment-method-settings` - Create a new setting
- `PATCH /payment-method-settings/:id` - Update a setting
- `DELETE /payment-method-settings/:id` - Delete a setting
- `POST /payment-method-settings/toggle/:adminId/:methodId` - Toggle payment method for an admin

## Configuration Schema Examples

### Stripe Configuration
```json
{
  "type": "object",
  "properties": {
    "apiKey": {
      "type": "string",
      "title": "API Key",
      "description": "Your Stripe secret API key"
    },
    "webhookSecret": {
      "type": "string",
      "title": "Webhook Secret",
      "description": "Your Stripe webhook endpoint secret"
    },
    "publishableKey": {
      "type": "string",
      "title": "Publishable Key",
      "description": "Your Stripe publishable key"
    }
  },
  "required": ["apiKey", "publishableKey"]
}
```

### Bank Transfer Configuration
```json
{
  "type": "object",
  "properties": {
    "accountNumber": {
      "type": "string",
      "title": "Account Number",
      "description": "Bank account number"
    },
    "routingNumber": {
      "type": "string",
      "title": "Routing Number",
      "description": "Bank routing number"
    },
    "accountName": {
      "type": "string",
      "title": "Account Name",
      "description": "Name on the bank account"
    },
    "bankName": {
      "type": "string",
      "title": "Bank Name",
      "description": "Name of the bank"
    }
  },
  "required": ["accountNumber", "routingNumber", "accountName", "bankName"]
}
```

## Usage

### Creating a New Payment Method
```typescript
const newPaymentMethod = await paymentMethodsService.create({
  key: 'paypal',
  name: 'PayPal',
  configSchema: {
    type: 'object',
    properties: {
      clientId: { type: 'string', title: 'Client ID' },
      clientSecret: { type: 'string', title: 'Client Secret' }
    },
    required: ['clientId', 'clientSecret']
  }
});
```

### Enabling a Payment Method for an Admin
```typescript
const setting = await paymentMethodSettingsService.togglePaymentMethod(
  adminId, 
  methodId, 
  true
);
```

### Configuring a Payment Method
```typescript
const updatedSetting = await paymentMethodSettingsService.update(settingId, {
  config: {
    apiKey: 'sk_test_...',
    publishableKey: 'pk_test_...'
  }
});
```

## Frontend Integration

The frontend provides a user-friendly interface for:
- Viewing all available payment methods
- Enabling/disabling payment methods for the admin
- Configuring payment method settings using dynamic forms
- Managing payment method configurations

## Seeding

The module includes a seeder that creates default payment methods:
- Cash
- Stripe
- Bank Transfer
- Check
- PayPal
- Square

Run the seeder to populate the database with these default payment methods.

## Security

- All payment method settings endpoints require admin role (level 0)
- Admin validation is performed on all operations
- Each admin can only manage their own payment method settings 