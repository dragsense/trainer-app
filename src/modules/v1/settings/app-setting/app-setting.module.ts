import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from 'shared/entities';
import { AppSettingService } from './app-setting.service';
import { AppSettingController } from './app-setting.controller';
import { User } from 'shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting, User])],
  controllers: [AppSettingController],
  providers: [AppSettingService],
})
export class AppSettingModule {}
