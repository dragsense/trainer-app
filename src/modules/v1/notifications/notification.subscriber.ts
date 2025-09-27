import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { User } from 'shared/entities';
import { ENotificationType } from 'shared/enums';
import { EUserLevels, EUserRole } from 'shared/enums';


@Injectable()
@EventSubscriber()
export class NotificationSubscriber implements EntitySubscriberInterface<User> {
  private static notificationsService: NotificationsService;

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  static setNotificationsService(service: NotificationsService) {
    NotificationSubscriber.notificationsService = service;
  }

  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>) {
    if (!NotificationSubscriber.notificationsService) return;

    try {
      await this.handleNewUser(event.entity, event);
    } catch (error) {
      console.error('Error in notification subscriber:', error);
    }
  }

  private async handleNewUser(user: User, event: InsertEvent<User>) {
    // Get all admin users to notify
    const adminUsers = await event.manager.find(User, {
      where: { level: EUserLevels[EUserRole.SUPER_ADMIN] }, // Admin level
      relations: ['profile'],
    });

    if (adminUsers.length > 0) {
      const adminUserIds = adminUsers.map(u => u.id);
      
      await NotificationSubscriber.notificationsService.createNotificationForUsers(
        ENotificationType.NEW_USER,
        'New User Registration',
        `A new user has registered: ${user.email}`,
        adminUserIds,
        `/admin/members`,
        '👤'
      );
    }
  }
} 