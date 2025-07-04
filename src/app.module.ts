import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';


import { configOptions, appConfig, databaseConfig, jwtConfig, mailerConfig, getTypeOrmConfig, getMongooseConfig, getMailerConfig, fileUploadConfig } from './config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './modules/v1/users/users.module';
import { AuthModule } from './modules/v1/auth/auth.module';
import { SessionsModule } from './modules/v1/sessions/sessions.module';
import { PaymentMethodsModule } from './modules/v1/payment-methods/payment-methods.module';
import { PaymentsModule } from './modules/v1/payments/payments.module';
import { RemindersModule } from './modules/v1/reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ...configOptions,
      load: [appConfig, databaseConfig, jwtConfig, mailerConfig, fileUploadConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    MongooseModule.forRootAsync({
      useFactory: getMongooseConfig,
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 200,
      },
    ]),

    AuthModule,
    UsersModule,
    SessionsModule,
    PaymentMethodsModule,
    PaymentsModule,
    RemindersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule { }
