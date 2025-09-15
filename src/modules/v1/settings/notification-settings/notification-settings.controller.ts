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

@ApiTags('Notification Settings')
@Controller('settings/notification-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationSettingsController {
    constructor(private readonly notificationSettingsService: NotificationSettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get notification settings for the current user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Notification settings retrieved successfully', 
        type: NotificationSetting 
    })
    @ApiResponse({ status: 404, description: 'Notification settings not found' })
    async getNotificationSettings(@Request() req): Promise<NotificationSetting> {
        const userId = req.user.id;
        return this.notificationSettingsService.getNotificationSettings(userId);
    }

    @Patch()
    @ApiOperation({ summary: 'Update notification settings for the current user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Notification settings updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Notification settings updated successfully'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
    async updateNotificationSettings(
        @Request() req,
        @Body() settingDto: UpdateNotificationSettingDto
    ) {
        const userId = req.user.id;
        return this.notificationSettingsService.updateNotificationSettings(userId, settingDto);
    }
}