import { Module } from '@nestjs/common';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { AppSettingModule } from './app-setting/app-setting.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { StripeConnectModule } from './stripe-connect/stripe-connect.module';


@Module({
  imports: [
    PaymentMethodsModule,
    AppSettingModule,
    NotificationSettingsModule,
    StripeConnectModule
  ],
})
export class SettingsModule { }
