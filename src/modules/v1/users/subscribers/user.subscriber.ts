import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserAvailability } from '../entities/user-availability.entity';
import { AppSetting } from '../../settings/app-setting/entities/app-setting.entity';
import { NotificationSetting } from '../../settings/notification-settings/entities/notification-setting.entity';
import { UserRole, UserLevels } from '../enums/user.enum';

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  private readonly logger = new Logger(UserSubscriber.name);

  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>): Promise<void> {
    try {
      const user = event.entity;

      if (!user?.id) {
        this.logger.warn('User ID not found, skipping post-creation setup');
        return;
      }

      this.logger.log(`Setting up initial configuration for user ${user.id} (${user.email})`);

      // Initialize all user-related settings in parallel for better performance
      await Promise.all([
        this.createDefaultAppSettings(event, user),
        this.createDefaultNotificationSettings(event, user),
        this.createDefaultAvailability(event, user),
      ]);

      this.logger.log(`Successfully initialized all settings for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to initialize user settings for user ${event.entity?.id}:`, error);
      // Don't throw the error to prevent user creation from failing
    }
  }

  private async createDefaultAppSettings(event: InsertEvent<User>, user: User): Promise<void> {
    try {
      const appSetting = new AppSetting();
      appSetting.user = user;
      appSetting.allowNotification = true;

      await event.manager.save(AppSetting, appSetting);
      this.logger.log(`Created default app settings for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Failed to create app settings for user ${user.id}:`, error);
    }
  }

  private async createDefaultNotificationSettings(event: InsertEvent<User>, user: User): Promise<void> {
    try {
      const notificationSetting = new NotificationSetting();
      notificationSetting.user = user;
      
      // Set default notification preferences based on user role
      const isAdmin = user.level <= UserLevels[UserRole.TRAINER];
      const isTrainer = user.level === UserLevels[UserRole.TRAINER];
      
      // Admin and trainers get all notifications by default
      // Regular users get basic notifications
      notificationSetting.emailNotifications = true;
      notificationSetting.newUserNotifications = isAdmin;
      notificationSetting.userUpdateNotifications = isAdmin || isTrainer;
      notificationSetting.billingNotifications = true;
      notificationSetting.sessionNotifications = true;

      await event.manager.save(NotificationSetting, notificationSetting);
      this.logger.log(`Created default notification settings for user ${user.id} (role-based)`);
    } catch (error) {
      this.logger.error(`Failed to create notification settings for user ${user.id}:`, error);
    }
  }

  private async createDefaultAvailability(event: InsertEvent<User>, user: User): Promise<void> {
    try {
      const userAvailability = new UserAvailability();
      userAvailability.user = user;
      
      // Set default availability based on user role
      const isTrainer = user.level === UserLevels[UserRole.TRAINER];
      userAvailability.weeklySchedule = this.generateDefaultSchedule(isTrainer);
      userAvailability.unavailablePeriods = [];

      const savedAvailability = await event.manager.save(UserAvailability, userAvailability);

      // Update user to reference the saved availability
      await event.manager.update(User, user.id, {
        availability: savedAvailability,
      });

      this.logger.log(`Created default availability for user ${user.id} (${isTrainer ? 'trainer' : 'client'} schedule)`);
    } catch (error) {
      this.logger.error(`Failed to create availability for user ${user.id}:`, error);
    }
  }

  private generateDefaultSchedule(isTrainer: boolean = false) {
    // Trainers get extended hours, clients get standard business hours
    const trainerHours = { start: '06:00', end: '22:00' };
    const clientHours = { start: '09:00', end: '18:00' };
    
    const workingHours = isTrainer ? trainerHours : clientHours;
    
    const workingDay = {
      enabled: true,
      timeSlots: [workingHours],
    };

    const partialWorkingDay = {
      enabled: true,
      timeSlots: [{ start: workingHours.start, end: '14:00' }],
    };

    const nonWorkingDay = {
      enabled: false,
      timeSlots: [],
    };

    return {
      monday: { ...workingDay },
      tuesday: { ...workingDay },
      wednesday: { ...workingDay },
      thursday: { ...workingDay },
      friday: { ...workingDay },
      saturday: isTrainer ? { ...partialWorkingDay } : { ...nonWorkingDay },
      sunday: { ...nonWorkingDay },
    };
  }
}
