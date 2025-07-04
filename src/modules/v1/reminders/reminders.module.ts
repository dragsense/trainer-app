import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { Reminder } from './entities/reminder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder]),
  ],
  controllers: [RemindersController],
  providers: [RemindersService, ReminderSchedulerService],
})
export class RemindersModule {}
