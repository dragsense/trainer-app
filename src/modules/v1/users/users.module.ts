import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserAvailabilityService } from './services/user-availability.service';
import { UserAvailabilityController } from './controllers/user-availability.controller';
import { UserEmailService } from './services/user-email.service';
import { UserSubscriber } from './subscribers/user.subscriber';
import { User } from './entities/user.entity';
import { Profile } from './profiles/entities/profile.entity';
import { ProfilesModule } from './profiles/profiles.module';
import { AppSetting } from '../settings/app-setting/entities/app-setting.entity';
import { NotificationSetting } from '../settings/notification-settings/entities/notification-setting.entity';
import { UserAvailability } from './entities/user-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, AppSetting, NotificationSetting, UserAvailability]), ProfilesModule],
  exports: [UsersService, UserAvailabilityService, UserEmailService],
  controllers: [UsersController, UserAvailabilityController],
  providers: [UsersService, UserAvailabilityService, UserEmailService, UserSubscriber],
})
export class UsersModule {}
 