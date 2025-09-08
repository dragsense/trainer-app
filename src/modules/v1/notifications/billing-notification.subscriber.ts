import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';
import { Billing } from '../billings/entities/billing.entity';
import { NotificationType } from './enums/notification.enum';

@Injectable()
@EventSubscriber()
export class BillingNotificationSubscriber implements EntitySubscriberInterface<Billing> {
  private static notificationsService: NotificationsService;

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  static setNotificationsService(service: NotificationsService) {
    BillingNotificationSubscriber.notificationsService = service;
  }

  listenTo() {
    return Billing;
  }

  async afterInsert(event: InsertEvent<Billing>) {
    if (!BillingNotificationSubscriber.notificationsService) return;

    try {
      await this.handleNewBilling(event.entity, event);
    } catch (error) {
      console.error('Error in billing notification subscriber:', error);
    }
  }

  private async handleNewBilling(billing: Billing, event: InsertEvent<Billing>) {
    // Get all admin users to notify
    const adminUsers = await event.manager.find(User, {
      where: { level: 1 }, // Admin level
      relations: ['profile'],
    });

    if (adminUsers.length > 0) {
      const adminUserIds = adminUsers.map(u => u.id);
      
      await BillingNotificationSubscriber.notificationsService.createNotificationForUsers(
        NotificationType.INVOICE_GENERATED,
        'New Invoice Generated',
        `A new invoice has been generated for billing`,
        adminUserIds,
        `/admin/billing/invoices`,
        '📄'
      );
    }
  }
} 