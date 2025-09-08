import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session } from './entities/session.entity';
import { UsersModule } from '../users/users.module';
import { RemindersModule } from '../reminders/reminders.module';
import { SessionSubscriber } from './subscribers/session.subscriber';
import { BillingsModule } from '../billings/billings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    UsersModule,
    RemindersModule,
    BillingsModule
  ],
  controllers: [SessionsController],
  providers: [SessionsService, SessionSubscriber],
  exports: [SessionsService],
})
export class SessionsModule {}
