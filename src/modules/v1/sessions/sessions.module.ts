import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session } from './entities/session.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/profiles/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User, Profile])],
  controllers: [SessionsController],
  providers: [SessionsService, UsersService],
})
export class SessionsModule {}
