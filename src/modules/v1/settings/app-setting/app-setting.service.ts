import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';

@Injectable()
export class AppSettingService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly appSettingRepo: Repository<AppSetting>,
  ) { }

  async getAppSettingByUserId(userId: number): Promise<AppSetting> {
    const item = await this.appSettingRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!item) {
      throw new NotFoundException(`AppSetting with User ID ${userId} not found`);
    }
    return item;
  }

  async updateAllowNotification(userId: number, allowNotification: boolean): Promise<AppSetting> {
    let appSetting = await this.getAppSettingByUserId(userId);
    if (!appSetting) {
      throw new NotFoundException(`AppSetting with User ID ${userId} not found`);
    } else {
      appSetting.allowNotification = allowNotification;
    }
    return this.appSettingRepo.save(appSetting);
  }
}
