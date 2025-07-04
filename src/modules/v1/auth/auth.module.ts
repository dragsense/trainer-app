import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { getJwtConfig } from '@/config/jwt.config';

import { UsersService } from '@/modules/v1/users/users.service';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/profiles/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService],
})
export class AuthModule { }
