import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeBillingService } from './services/stripe-billing.service';
import { StripeInvoiceService } from './services/stripe-invoice.service';
import { StripeTransactionService } from './services/stripe-transaction.service';
import { StripeSubscriptionService } from './services/stripe-subscription.service';
import { PaymentMethodsModule } from '../settings/payment-methods/payment-methods.module';

@Module({
  imports: [PaymentMethodsModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    StripeBillingService,
    StripeInvoiceService,
    StripeTransactionService,
    StripeSubscriptionService,
  ],
  exports: [
    StripeService,
    StripeBillingService,
    StripeInvoiceService,
    StripeTransactionService,
    StripeSubscriptionService,
  ],
})
export class StripeModule {}
