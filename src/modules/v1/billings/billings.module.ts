import { Module } from '@nestjs/common';
import { BillingsService } from './billings.service';
import { BillingsController } from './billings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Billing } from './entities/billing.entity';
import { UsersModule } from '../users/users.module';
import { getJwtConfig } from '@/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BillingSubscriber } from './subscribers/billing.subscriber';
import { MailerModule } from '@nestjs-modules/mailer';
import { StripeModule } from '../stripe/stripe.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Billing]),
    UsersModule,
    MailerModule,
    SettingsModule,
    StripeModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [BillingsController],
  providers: [
    BillingsService, 
    BillingSubscriber,
  ],
  exports: [BillingsService],
})
export class BillingsModule { }
