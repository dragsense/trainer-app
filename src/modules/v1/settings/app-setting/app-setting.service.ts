import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';
import { UpdateAppSettingDto } from './dto/update-app-setting.dto';
import { MessageResponse } from '@/interfaces/general.interface';

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

  async updateAppSetting(userId: number, settingDto: UpdateAppSettingDto): Promise<MessageResponse> {
    const existingSettings = await this.getAppSettingByUserId(userId);
    Object.assign(existingSettings, settingDto);
    await this.appSettingRepo.save(existingSettings);
    return { message: 'App setting updated successfully' };
  }
}
