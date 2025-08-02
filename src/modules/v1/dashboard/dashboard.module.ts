import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Entities
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { Billing } from '../billings/entities/billing.entity';
import { Reminder } from '../reminders/entities/reminder.entity';
import { PaymentMethod } from '../settings/payment-methods/entities/payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Session,
      Billing,
      Reminder,
      PaymentMethod
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
