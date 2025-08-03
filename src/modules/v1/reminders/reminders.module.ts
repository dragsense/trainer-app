import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { ReminderSubscriber } from './services/reminder-subscriber.service';
import { ReminderEmailService } from './services/reminder-email.service';
import { ReminderNotificationService } from './services/reminder-notification.service';
import { Reminder } from './entities/reminder.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReminderBillingService } from './services/reminder-billing.service';
import { Billing } from '../billings/entities/billing.entity';
import { BillingsModule } from '../billings/billings.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, Billing]),
    UsersModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 10,
      ignoreErrors: true,
    }),
    NotificationsModule,
    BillingsModule,
    StripeModule
  ],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderBillingService,
    ReminderSchedulerService,
    ReminderEmailService,
    ReminderNotificationService,
    ReminderSubscriber,
  ],
  exports: [RemindersService],
})
export class RemindersModule {}
