import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Notification} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationSetting } from '../settings/notification-settings/entities/notification-setting.entity';
import { User } from '../users/entities/user.entity';
import { AppSetting } from '../settings/app-setting/entities/app-setting.entity';
import { NotificationGateway } from '@/gateways/notification.gateway';
import { NotificationSubscriber } from './notification.subscriber';
import { UserNotificationSubscriber } from './user-notification.subscriber';
import { BillingNotificationSubscriber } from './billing-notification.subscriber';
import { NotificationStatus, NotificationType } from './enums/notification.enum';
import { UpdateNotificationSettingDto } from '../settings/notification-settings/dto/update-notification-setting.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,
        @InjectRepository(NotificationSetting)
        private readonly notificationSettingRepo: Repository<NotificationSetting>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(AppSetting)
        private readonly appSettingRepo: Repository<AppSetting>,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {
        // Set up all notification subscribers
        NotificationSubscriber.setNotificationsService(this);
        UserNotificationSubscriber.setNotificationsService(this);
        BillingNotificationSubscriber.setNotificationsService(this);
    }

    async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
        // Check if global notifications are enabled
        const globalNotificationsEnabled = await this.isGlobalNotificationsEnabled(createNotificationDto.userId);
        if (!globalNotificationsEnabled) {
            console.log(`🔕 Global notifications disabled for user ${createNotificationDto.userId}, skipping notification creation`);
            throw new Error('Global notifications are disabled for this user');
        }

        const notification = this.notificationRepo.create(createNotificationDto);
        const savedNotification = await this.notificationRepo.save(notification);
        
        // Send real-time notification via socket
        NotificationGateway.sendNotificationToUser(createNotificationDto.userId, savedNotification);
        
        // Update unread count
        const unreadCount = await this.findUnreadCount(createNotificationDto.userId);
        NotificationGateway.updateUnreadCount(createNotificationDto.userId, unreadCount);
        
        // Send email notification
        const user = await this.userRepo.findOne({ where: { id: createNotificationDto.userId } });
        if (user) {
            this.sendEmailNotification(user, savedNotification);
        }
        
        return savedNotification;
    }

    async findAll(userId: number, options?: FindManyOptions<Notification>): Promise<Notification[]> {
        console.log('🔍 Fetching notifications for user:', userId, 'with options:', options);
        const notifications = await this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            ...options,
        });
        console.log('📋 Found notifications:', notifications.length);
        return notifications;
    }

    async findUnreadCount(userId: number): Promise<number> {
        return await this.notificationRepo.count({
            where: { 
                userId, 
                status: NotificationStatus.UNREAD 
            }
        });
    }

    async findOne(id: number, userId: number): Promise<Notification> {
        // Validate that id is a valid number
        if (!id || isNaN(id) || id <= 0) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }

        const notification = await this.notificationRepo.findOne({
            where: { id, userId },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with ID ${id} not found`);
        }

        return notification;
    }

    async update(id: number, userId: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
        // Validate that id is a valid number
        if (!id || isNaN(id) || id <= 0) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }

        const notification = await this.findOne(id, userId);
        Object.assign(notification, updateNotificationDto);
        return await this.notificationRepo.save(notification);
    }

    async markAsRead(id: number, userId: number): Promise<Notification> {
        // Validate that id is a valid number
        if (!id || isNaN(id) || id <= 0) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }

        const notification = await this.update(id, userId, { status: NotificationStatus.READ });
        
        // Update unread count after marking as read
        const unreadCount = await this.findUnreadCount(userId);
        NotificationGateway.updateUnreadCount(userId, unreadCount);
        
        return notification;
    }

    async markAllAsRead(userId: number): Promise<{ message: string }> {
        await this.notificationRepo.update(
            { userId, status: NotificationStatus.UNREAD },
            { status: NotificationStatus.READ }
        );
        
        // Update unread count after marking all as read
        const unreadCount = await this.findUnreadCount(userId);
        NotificationGateway.updateUnreadCount(userId, unreadCount);
        
        return { message: 'All notifications marked as read' };
    }

    async remove(id: number, userId: number): Promise<{ message: string }> {
        // Validate that id is a valid number
        if (!id || isNaN(id) || id <= 0) {
            throw new NotFoundException(`Invalid notification ID: ${id}`);
        }

        const notification = await this.findOne(id, userId);
        await this.notificationRepo.remove(notification);
        return { message: 'Notification deleted successfully' };
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

    async updateNotificationSettings(userId: number, settingDto: UpdateNotificationSettingDto): Promise<NotificationSetting> {
        const existingSettings = await this.getNotificationSettings(userId);
        Object.assign(existingSettings, settingDto);
        return await this.notificationSettingRepo.save(existingSettings);
    }

    // Method to check if global notifications are enabled for a user
    private async isGlobalNotificationsEnabled(userId: number): Promise<boolean> {
        try {
            const appSetting = await this.appSettingRepo.findOne({
                where: { user: { id: userId } }
            });
            
            // If no app setting exists, default to true (allow notifications)
            if (!appSetting) {
                return true;
            }
            
            return appSetting.allowNotification;
        } catch (error) {
            console.error('Error checking global notification settings:', error);
            // Default to true if there's an error
            return true;
        }
    }

    // Method to create notifications for specific events
    async createNotificationForEvent(
        type: NotificationType,
        title: string,
        message: string,
        userId: number,
        link?: string,
        icon?: string,
        metadata?: Record<string, any>
    ): Promise<Notification | null> {
        // First check if global notifications are enabled
        const globalNotificationsEnabled = await this.isGlobalNotificationsEnabled(userId);
        if (!globalNotificationsEnabled) {
            console.log(`🔕 Global notifications disabled for user ${userId}, skipping notification`);
            return null;
        }

        // Check if user has notifications enabled for this type
        const settings = await this.getNotificationSettings(userId);
        
        let shouldNotify = false;
        switch (type) {
            case NotificationType.NEW_USER:
                shouldNotify = settings.newUserNotifications;
                break;
            case NotificationType.USER_UPDATED:
                shouldNotify = settings.userUpdateNotifications;
                break;
           
            case NotificationType.BILLING_DUE:
            case NotificationType.PAYMENT_RECEIVED:
                shouldNotify = settings.billingNotifications;
                break;
            case NotificationType.SESSION_SCHEDULED:
                shouldNotify = settings.sessionNotifications;
                break;
            default:
                shouldNotify = true;
        }

        if (!shouldNotify) {
            return null;
        }

        const notification = this.notificationRepo.create({
            type,
            title,
            message,
            userId,
            link,
            icon,
            metadata,
        });

        const savedNotification = await this.notificationRepo.save(notification);
        
        // Send real-time notification via socket
        NotificationGateway.sendNotificationToUser(userId, savedNotification);
        
        // Update unread count
        const unreadCount = await this.findUnreadCount(userId);
        NotificationGateway.updateUnreadCount(userId, unreadCount);
        
        // Send email notification
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user) {
            this.sendEmailNotification(user, savedNotification);
        }
        
        return savedNotification;
    }

    // Method to create notifications for multiple users
    async createNotificationForUsers(
        type: NotificationType,
        title: string,
        message: string,
        userIds: number[],
        link?: string,
        icon?: string,
        metadata?: Record<string, any>
    ): Promise<Notification[]> {
        const notifications: Notification[] = [];

        for (const userId of userIds) {
            const notification = await this.createNotificationForEvent(
                type,
                title,
                message,
                userId,
                link,
                icon,
                metadata
            );
            
            if (notification) {
                notifications.push(notification);
            }
        }

        return notifications;
    }

    // Method to send email notification
    private async sendEmailNotification(
        user: User,
        notification: Notification
    ): Promise<void> {
        try {
        

            // Check if user has email notifications enabled
            const settings = await this.getNotificationSettings(user.id);
            if (!settings.emailNotifications) {
                return;
            }

            const appConfig = this.configService.get('app');
            const appName = appConfig.name;
            const appUrl = appConfig.appUrl;

            await this.mailerService.sendMail({
                to: user.email,
                from: this.configService.get('MAIL_FROM'),
                subject: `[${appName}] ${notification.title}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${notification.title} - ${appName}</title>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                      </head>
                      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
                          <!-- Header -->
                          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🔔 ${notification.title}</h1>
                            <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Important notification from ${appName}</p>
                          </div>
                          
                          <!-- Content -->
                          <div style="padding: 40px 30px;">
                            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                              <p style="color: #4b5563; line-height: 1.6; margin: 0; font-size: 16px;">${notification.message}</p>
                            </div>
                            
                            ${notification.link ? `
                            <div style="text-align: center; margin: 32px 0;">
                              <a href="${appUrl}${notification.link}" style="
                                display: inline-block;
                                padding: 16px 32px;
                                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 12px;
                                font-weight: 600;
                                font-size: 16px;
                                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                                transition: all 0.2s ease;
                              ">View Details</a>
                            </div>
                            ` : ''}
                          </div>

                          <!-- Footer -->
                          <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">You can manage your notification preferences in your account settings.</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                          </div>
                        </div>
                      </body>
                    </html>
                `,
                text: `
${notification.title}

${notification.message}

${notification.link ? `View Details: ${appUrl}${notification.link}` : ''}

You can manage your notification preferences in your account settings.
                `,
            });

            console.log(`📧 Email notification sent to ${user.email}`);
        } catch (error) {
            console.error('Failed to send email notification:', error);
        }
    }
} 