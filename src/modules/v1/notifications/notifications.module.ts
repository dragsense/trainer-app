import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSubscriber } from './notification.subscriber';
import { UserNotificationSubscriber } from './user-notification.subscriber';
import { BillingNotificationSubscriber } from './billing-notification.subscriber';

import { Notification, NotificationSetting, User, AppSetting } from 'shared/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Notification, NotificationSetting, User, AppSetting])],
    controllers: [NotificationsController],
    providers: [
        NotificationsService, 
        NotificationSubscriber,
        UserNotificationSubscriber,
        BillingNotificationSubscriber
    ],
    exports: [NotificationsService],
})
export class NotificationsModule {} 