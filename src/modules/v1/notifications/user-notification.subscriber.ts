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
export class UserNotificationSubscriber implements EntitySubscriberInterface<User> {
  private static notificationsService: NotificationsService;

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  static setNotificationsService(service: NotificationsService) {
    UserNotificationSubscriber.notificationsService = service;
  }

  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>) {
    if (!UserNotificationSubscriber.notificationsService) return;

    try {
      await this.handleNewUser(event.entity, event);
    } catch (error) {
      console.error('Error in user notification subscriber:', error);
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
      
      await UserNotificationSubscriber.notificationsService.createNotificationForUsers(
        ENotificationType.NEW_USER,
        'New User Added',
        `A new user has been added to the system`,
        adminUserIds,
        `/admin/users/${user.id}`,
        '👤'
      );
    }
  }
} 