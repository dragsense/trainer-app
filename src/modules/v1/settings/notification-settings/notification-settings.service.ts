import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from './entities/notification-setting.entity';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';
import { CreateNotificationSettingDto } from './dto/create-notification-setting.dto';
import { MessageResponse } from '@/interfaces/general.interface';

@Injectable()
export class NotificationSettingsService {
    constructor(
        @InjectRepository(NotificationSetting)
        private readonly notificationSettingRepo: Repository<NotificationSetting>,
    ) { }

    async getNotificationSettings(userId: number): Promise<NotificationSetting> {
        const settings = await this.notificationSettingRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });

        if (!settings) {
            // Create default notification settings if they don't exist
            return this.createDefaultNotificationSettings(userId);
        }

        return settings;
    }

    async createDefaultNotificationSettings(userId: number): Promise<NotificationSetting> {
        const defaultSettings = this.notificationSettingRepo.create({
            emailNotifications: true,
            newUserNotifications: true,
            userUpdateNotifications: true,
            billingNotifications: true,
            sessionNotifications: true,
            user: { id: userId } as any,
        });

        return await this.notificationSettingRepo.save(defaultSettings);
    }

    async updateNotificationSettings(
        userId: number,
        settingDto: UpdateNotificationSettingDto
    ): Promise<MessageResponse> {
        let existingSettings = await this.notificationSettingRepo.findOne({
            where: { user: { id: userId } }
        });

        if (!existingSettings) {
            // Create settings if they don't exist
            existingSettings = await this.createDefaultNotificationSettings(userId);
        }

        Object.assign(existingSettings, settingDto);
        await this.notificationSettingRepo.save(existingSettings);

        return { message: 'Notification settings updated successfully' };
    }

    async createNotificationSettings(
        userId: number,
        createDto: CreateNotificationSettingDto
    ): Promise<NotificationSetting> {
        const notificationSettings = this.notificationSettingRepo.create({
            ...createDto,
            user: { id: userId } as any,
        });

        return await this.notificationSettingRepo.save(notificationSettings);
    }
}