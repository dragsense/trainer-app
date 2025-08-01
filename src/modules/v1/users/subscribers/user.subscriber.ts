import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserAvailability } from '../entities/user-availability.entity';

@EventSubscriber()
@Injectable()
export class AvailabilitySubscriber implements EntitySubscriberInterface<User> {
  constructor(private readonly dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;;
  }

  async afterInsert(event: InsertEvent<User>) {
    try {
      const user = event.entity;

      if (!user?.id) return;

      // Create default availability object
      const defaultAvailability = new UserAvailability();
      defaultAvailability.user = user;
      defaultAvailability.weeklySchedule = this.generateDefaultSchedule();
      defaultAvailability.unavailablePeriods = [];
      const savedAvailability = await event.manager.save(UserAvailability, defaultAvailability);

      // Update user to reference the saved availability
      await event.manager.update(User, user.id, {
        availability: savedAvailability,
      });

    } catch (error) {
      console.error('Failed to create default availability for staff:', error);
    }
  }

  private generateDefaultSchedule() {
    const workingDay = {
      enabled: true,
      timeSlots: [{ start: '09:00', end: '17:00' }],
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
      saturday: { ...nonWorkingDay },
      sunday: { ...nonWorkingDay },
    };
  }
}
