import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserAvailabilityService } from './services/user-availability.service';
import { UserAvailabilityController } from './controllers/user-availability.controller';
import { UserEmailService } from './services/user-email.service';
import { UserSubscriber } from './subscribers/user.subscriber';
import { User, Profile } from 'shared/entities';
import { ProfilesModule } from './profiles/profiles.module';
import { UserAvailability } from 'shared/entities';
import { TrainerClientsModule } from '../trainer-clients/trainer-clients.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserAvailability]),
   ProfilesModule,
  TrainerClientsModule
  ],
  exports: [UsersService, UserAvailabilityService, UserEmailService],
  controllers: [UsersController, UserAvailabilityController],
  providers: [UsersService, UserAvailabilityService, UserEmailService, UserSubscriber],
})
export class UsersModule {}
 