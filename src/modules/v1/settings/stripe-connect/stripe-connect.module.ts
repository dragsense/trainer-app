import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeConnectController } from './stripe-connect.controller';
import { StripeConnectService } from './stripe-connect.service';
import { StripeConnectAccount } from './entities/stripe-connect-account.entity';
import { PaymentMethodsModule } from '../payment-methods/payment-methods.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StripeConnectAccount]),
    PaymentMethodsModule
  ],
  controllers: [StripeConnectController],
  providers: [StripeConnectService],
  exports: [StripeConnectService]
})
export class StripeConnectModule {}
