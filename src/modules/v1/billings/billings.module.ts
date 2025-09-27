import { Module, forwardRef } from '@nestjs/common';
import { BillingsService } from './billings.service';
import { BillingsController } from './billings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from 'shared/entities';
import { UsersModule } from '../users/users.module';
import { getJwtConfig } from '@/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BillingSubscriber } from './subscribers/billing.subscriber';
import { MailerModule } from '@nestjs-modules/mailer';
import { StripeModule } from '../stripe/stripe.module';
import { SettingsModule } from '../settings/settings.module';
import { SessionsService } from '../sessions/sessions.service';
import { Session } from 'shared/entities';
import { PaymentMethodsModule } from '../settings/payment-methods/payment-methods.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Billing, Session]),
    UsersModule,
    MailerModule,
    SettingsModule,
    StripeModule,
    PaymentMethodsModule,
    FileUploadModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [BillingsController],
  providers: [
    BillingsService, 
    BillingSubscriber,
    SessionsService
  ],
  exports: [BillingsService],
})
export class BillingsModule { }
