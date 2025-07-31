import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSubscriber } from './notification.subscriber';
import { UserNotificationSubscriber } from './user-notification.subscriber';
import { BillingNotificationSubscriber } from './billing-notification.subscriber';

import { ChatNotificationSubscriber } from './chat-notification.subscriber';
import { Notification } from './entities/notification.entity';
import { NotificationSetting } from '../settings/notification-settings/entities/notification-setting.entity';
import { User } from '../users/entities/user.entity';
import { AppSetting } from '../settings/app-setting/entities/app-setting.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, NotificationSetting, User, AppSetting])],
    controllers: [NotificationsController],
    providers: [
        NotificationsService, 
        NotificationSubscriber,
        UserNotificationSubscriber,
        BillingNotificationSubscriber,
        ChatNotificationSubscriber
    ],
    exports: [NotificationsService],
})
export class NotificationsModule {} 