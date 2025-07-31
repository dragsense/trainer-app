import { Module } from '@nestjs/common';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { AppSettingModule } from './app-setting/app-setting.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';


@Module({
  imports: [
    PaymentMethodsModule,
    AppSettingModule,
    NotificationSettingsModule
  ],
})
export class SettingsModule { }
