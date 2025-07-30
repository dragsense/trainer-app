import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { ReminderSubscriber } from './services/reminder-subscriber.service';
import { ReminderEmailService } from './services/reminder-email.service';
import { Reminder } from './entities/reminder.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/profiles/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, User, Profile]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      // Enable wildcard event listeners
      wildcard: true,
      // Max listeners per event to prevent memory leaks
      maxListeners: 10,
      // Ignore errors in event handlers (they're already logged)
      ignoreErrors: true,
    }),
  ],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    ReminderEmailService,
    ReminderSubscriber,
    UsersService,
  ],
  exports: [RemindersService],
})
export class RemindersModule {}
