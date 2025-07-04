import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
;
import { User } from './entities/user.entity';
import { Profile } from './profiles/entities/profile.entity';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), ProfilesModule],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
 