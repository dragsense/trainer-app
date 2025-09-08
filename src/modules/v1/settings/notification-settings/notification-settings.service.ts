import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { NotificationSetting } from './entities/notification-setting.entity';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';
import { User } from '../../users/entities/user.entity';
import { MessageResponse } from '@/interfaces/general.interface';

@Injectable()
export class NotificationSettingsService {
    constructor(
        @InjectRepository(NotificationSetting)
        private readonly notificationSettingRepo: Repository<NotificationSetting>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {
    }


    async getNotificationSettings(userId: number): Promise<NotificationSetting> {
        const settings = await this.notificationSettingRepo.findOne({
            where: { user: { id: userId } },
        });

        if (!settings) {
            // Create default settings if none exist
            const user = await this.userRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            const defaultSettings = this.notificationSettingRepo.create({
                user: { id: userId },
            });
            return await this.notificationSettingRepo.save(defaultSettings);
        }

        return settings;
    }

    async updateNotificationSettings(userId: number, settingDto: UpdateNotificationSettingDto): Promise<MessageResponse> {
        const existingSettings = await this.getNotificationSettings(userId);
        Object.assign(existingSettings, settingDto);
        await this.notificationSettingRepo.save(existingSettings);
        return { message: 'Notification settings updated successfully' };
    }

} 