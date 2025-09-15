import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from './entities/app-setting.entity';
import { UpdateAppSettingDto } from './dto/update-app-setting.dto';
import { CreateAppSettingDto } from './dto/create-app-setting.dto';
import { MessageResponse } from '@/interfaces/general.interface';

@Injectable()
export class AppSettingService {
  constructor(
    @InjectRepository(AppSetting)
    private readonly appSettingRepo: Repository<AppSetting>,
  ) { }

  async getAppSettingByUserId(userId: number): Promise<AppSetting> {
    const item = await this.appSettingRepo.findOne({ 
      where: { user: { id: userId } }, 
      relations: ['user'] 
    });
    
    if (!item) {
      // Create default app settings if they don't exist
      return this.createDefaultAppSetting(userId);
    }
    
    return item;
  }

  async createDefaultAppSetting(userId: number): Promise<AppSetting> {
    const defaultSettings = this.appSettingRepo.create({
      allowNotification: true,
      user: { id: userId } as any,
    });

    return await this.appSettingRepo.save(defaultSettings);
  }

  async updateAppSetting(userId: number, settingDto: UpdateAppSettingDto): Promise<MessageResponse> {
    let existingSettings = await this.appSettingRepo.findOne({ 
      where: { user: { id: userId } } 
    });

    if (!existingSettings) {
      // Create settings if they don't exist
      existingSettings = await this.createDefaultAppSetting(userId);
    }

    Object.assign(existingSettings, settingDto);
    await this.appSettingRepo.save(existingSettings);
    
    return { message: 'App settings updated successfully' };
  }

  async createAppSetting(userId: number, createDto: CreateAppSettingDto): Promise<AppSetting> {
    const appSetting = this.appSettingRepo.create({
      ...createDto,
      user: { id: userId } as any,
    });

    return await this.appSettingRepo.save(appSetting);
  }
}