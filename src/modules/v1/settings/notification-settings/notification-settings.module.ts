import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSetting, User } from 'shared/entities';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsController } from './notification-settings.controller';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationSetting, User])],
    exports: [TypeOrmModule],
    controllers: [NotificationSettingsController],
    providers: [NotificationSettingsService],
})
export class NotificationSettingsModule {} 