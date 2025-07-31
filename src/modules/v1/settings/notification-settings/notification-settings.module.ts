import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSetting } from './entities/notification-setting.entity';
import { User } from '../../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationSetting, User])],
    exports: [TypeOrmModule],
})
export class NotificationSettingsModule {} 