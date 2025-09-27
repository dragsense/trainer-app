import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Entities
import { User, Session, Billing } from 'shared/entities';
import { Reminder, PaymentMethod } from 'shared/entities';

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
