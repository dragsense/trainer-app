import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { StripeBillingService } from './services/stripe-billing.service';
import { StripeInvoiceService } from './services/stripe-invoice.service';
import { StripeTransactionService } from './services/stripe-transaction.service';
import { PaymentMethodsModule } from '../settings/payment-methods/payment-methods.module';
import { PlatformSettingsModule } from '../settings/platform/platform-settings.module';
import { BillingsModule } from '../billings/billings.module';
import { UsersModule } from '../users/users.module';
import { StripeConnectAccount } from '../settings/stripe-connect/entities/stripe-connect-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StripeConnectAccount]),
    PaymentMethodsModule,
    PlatformSettingsModule,
    forwardRef(() => BillingsModule),
    UsersModule,
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
