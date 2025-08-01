import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
;
import { User } from './entities/user.entity';
import { Profile } from './profiles/entities/profile.entity';
import { ProfilesModule } from './profiles/profiles.module';
import { AppSetting } from '../settings/app-setting/entities/app-setting.entity';
import { NotificationSetting } from '../settings/notification-settings/entities/notification-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, AppSetting, NotificationSetting]), ProfilesModule],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
 