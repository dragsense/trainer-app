import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from './entities/app-setting.entity';
import { AppSettingService } from './app-setting.service';
import { AppSettingController } from './app-setting.controller';
import { User } from '@/modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting, User])],
  controllers: [AppSettingController],
  providers: [AppSettingService],
})
export class AppSettingModule {}
