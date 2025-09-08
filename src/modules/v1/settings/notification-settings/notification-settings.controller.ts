import {
    Controller,
    Get,
    Body,
    Patch,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { NotificationSetting } from './entities/notification-setting.entity';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';
import { NotificationSettingsService } from './notification-settings.service';

@ApiTags('notification-settings')
@Controller('settings/notification-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationSettingsController {
    constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

    
    @Get()
    @ApiOperation({ summary: 'Get notification settings for the current user' })
    @ApiResponse({ status: 200, description: 'Notification settings retrieved successfully', type: NotificationSetting })
    getNotificationSettings(@Request() req): Promise<NotificationSetting> {
        const userId = req.user.id;
        return this.notificationSettingsService.getNotificationSettings(userId);
    }

    @Patch()
    @ApiOperation({ summary: 'Update notification settings for the current user' })
    @ApiResponse({ status: 200, description: 'Notification settings updated successfully', type: NotificationSetting })
    updateNotificationSettings(
        @Request() req,
        @Body() settingDto: UpdateNotificationSettingDto
    ) {
        const userId = req.user.id;
        return this.notificationSettingsService.updateNotificationSettings(userId, settingDto);
    }

    
} 