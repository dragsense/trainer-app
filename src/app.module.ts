import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

import { configOptions, appConfig, databaseConfig, jwtConfig, stripeConfig, mailerConfig, getTypeOrmConfig, getMailerConfig } from './config';
import { SuperAdminSeeder } from './seeders/superadmin.seeder';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules
import { UsersModule } from './modules/v1/users/users.module';
import { AuthModule } from './modules/v1/auth/auth.module';
import { SessionsModule } from './modules/v1/sessions/sessions.module';
import { RemindersModule } from './modules/v1/reminders/reminders.module';

// Entities for dashboard stats
import { User } from './modules/v1/users/entities/user.entity';
import { Session } from './modules/v1/sessions/entities/session.entity';
import { Reminder } from './modules/v1/reminders/entities/reminder.entity';
import { StripeModule } from './modules/v1/stripe/stripe.module';
import { BillingsModule } from './modules/v1/billings/billings.module';
import { NotificationsModule } from './modules/v1/notifications/notifications.module';
import { FileUploadModule } from './modules/v1/file-upload/file-upload.module';
import { SettingsModule } from './modules/v1/settings/settings.module';
import { DashboardModule } from './modules/v1/dashboard/dashboard.module';
import { TrainerClientsModule } from './modules/v1/trainer-clients/trainer-clients.module';
import { NotificationGateway } from './gateways/notification.gateway';
import { join } from 'path';


@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      ...configOptions,
      load: [appConfig, databaseConfig, jwtConfig, mailerConfig, stripeConfig],
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath:   join(process.cwd(), 'public'),
      serveRoot: '/', // or use '/uploads' to serve only uploads
      
    }),

    // Cache
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // maximum number of items in cache
      isGlobal: true,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    TypeOrmModule.forFeature([
      User,
      Session,
      Reminder,
    ]),

    // Email
    MailerModule.forRootAsync({
      useFactory: getMailerConfig,
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 60,  // 60 requests per minute
    }]),

    // Feature modules
    UsersModule,
    AuthModule,
    SessionsModule,
    RemindersModule,
    SettingsModule,
    DashboardModule,
    StripeModule,
    FileUploadModule,
    BillingsModule,
    NotificationsModule,
    TrainerClientsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SuperAdminSeeder,
    NotificationGateway,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
