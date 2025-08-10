import { Module, forwardRef } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeBillingService } from './services/stripe-billing.service';
import { StripeInvoiceService } from './services/stripe-invoice.service';
import { StripeTransactionService } from './services/stripe-transaction.service';
import { PaymentMethodsModule } from '../settings/payment-methods/payment-methods.module';

@Module({
  imports: [
    PaymentMethodsModule,
  ],
  controllers: [StripeController],
  providers: [
    StripeService,
    StripeBillingService,
    StripeInvoiceService,
    StripeTransactionService,
  ],
  exports: [
    StripeService,
    StripeBillingService,
    StripeInvoiceService,
    StripeTransactionService,
  ],
})
export class StripeModule {}
