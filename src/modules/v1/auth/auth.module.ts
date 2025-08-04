import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { getJwtConfig } from '@/config/jwt.config';

import { UsersModule } from '@/modules/v1/users/users.module';
import { ReferralsModule } from '@/modules/v1/referrals/referrals.module';

@Module({
  imports: [
    UsersModule,
    ReferralsModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
