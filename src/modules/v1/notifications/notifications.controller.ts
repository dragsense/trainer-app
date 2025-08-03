import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notification } from './entities/notification.entity';
import { NotificationSetting } from '../settings/notification-settings/entities/notification-setting.entity';
import { JwtAuthGuard } from '@/modules/v1/auth/gaurds/jwt-auth.gaurd';
import { NotificationType } from './enums/notification.enum';
import { UpdateNotificationSettingDto } from '../settings/notification-settings/dto/update-notification-setting.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new notification' })
    @ApiResponse({ status: 201, description: 'Notification created successfully', type: Notification })
    create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
        console.log('🔔 Creating notification:', createNotificationDto);
        return this.notificationsService.create(createNotificationDto);
    }

    @Post('test')
    @ApiOperation({ summary: 'Create a test notification for current user' })
    @ApiResponse({ status: 201, description: 'Test notification created successfully', type: Notification })
    createTestNotification(@Request() req): Promise<Notification> {
        const userId = req.user.id;
        console.log('🔔 Creating test notification for user:', userId);
        return this.notificationsService.create({
            title: 'Test Notification',
            message: 'This is a test notification',
            type: NotificationType.GENERAL,
            userId: userId,
            link: '/test',
            icon: '🔔'
        });
    }

    @Get()
    @ApiOperation({ summary: 'Get all notifications for the current user' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved successfully', type: [Notification] })
    findAll(@Request() req, @Query('limit') limit?: number, @Query('offset') offset?: number): Promise<Notification[]> {
        const userId = req.user.id;
        console.log('🔔 NotificationsController.findAll called for user:', userId, 'with limit:', limit, 'offset:', offset);
        const options: any = {};
        
        if (limit) options.take = limit;
        if (offset) options.skip = offset;
        
        const result = this.notificationsService.findAll(userId, options);
        console.log('🔔 NotificationsController.findAll returning result for user:', userId);
        return result;
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count for the current user' })
    @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
    getUnreadCount(@Request() req): Promise<number> {
        const userId = req.user.id;
        return this.notificationsService.findUnreadCount(userId);
    }

    @Get('settings')
    @ApiOperation({ summary: 'Get notification settings for the current user' })
    @ApiResponse({ status: 200, description: 'Notification settings retrieved successfully', type: NotificationSetting })
    getNotificationSettings(@Request() req): Promise<NotificationSetting> {
        const userId = req.user.id;
        return this.notificationsService.getNotificationSettings(userId);
    }

    @Patch('settings')
    @ApiOperation({ summary: 'Update notification settings for the current user' })
    @ApiResponse({ status: 200, description: 'Notification settings updated successfully', type: NotificationSetting })
    updateNotificationSettings(
        @Request() req,
        @Body() settingDto: UpdateNotificationSettingDto
    ): Promise<NotificationSetting> {
        const userId = req.user.id;
        return this.notificationsService.updateNotificationSettings(userId, settingDto);
    }

    @Patch('mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read for the current user' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read successfully' })
    markAllAsRead(@Request() req): Promise<{ message: string }> {
        const userId = req.user.id;
        return this.notificationsService.markAllAsRead(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific notification' })
    @ApiResponse({ status: 200, description: 'Notification retrieved successfully', type: Notification })
    findOne(@Param('id') id: string, @Request() req): Promise<Notification> {
        const userId = req.user.id;
        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }
        return this.notificationsService.findOne(notificationId, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a notification' })
    @ApiResponse({ status: 200, description: 'Notification updated successfully', type: Notification })
    update(
        @Param('id') id: string,
        @Body() updateNotificationDto: UpdateNotificationDto,
        @Request() req
    ): Promise<Notification> {
        const userId = req.user.id;
        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }
        return this.notificationsService.update(notificationId, userId, updateNotificationDto);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read successfully', type: Notification })
    markAsRead(@Param('id') id: string, @Request() req): Promise<Notification> {
        const userId = req.user.id;
        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }
        return this.notificationsService.markAsRead(notificationId, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
    remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
        const userId = req.user.id;
        const notificationId = parseInt(id, 10);
        if (isNaN(notificationId)) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }
        return this.notificationsService.remove(notificationId, userId);
    }
} 