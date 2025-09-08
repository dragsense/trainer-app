import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { NotificationStatus, NotificationType } from '../enums/notification.enum';

export class CreateNotificationDto {
    @ApiProperty({ example: 'New member registered', description: 'Title of the notification' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'John Doe has registered as a new member', description: 'Message content of the notification' })
    @IsString()
    message: string;

    @ApiProperty({
        example: NotificationType.NEW_USER,
        description: 'Type of notification',
        enum: NotificationType
    })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({ example: 1, description: 'ID of the user who should receive this notification' })
    @IsNumber()
    userId: number;

    @ApiProperty({ example: '/members/123', description: 'Link to related content', required: false })
    @IsOptional()
    @IsString()
    link?: string;

    @ApiProperty({ example: 'user_avatar.jpg', description: 'Icon for the notification', required: false })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiProperty({ example: { memberId: 123, membershipType: 'premium' }, description: 'Additional data for the notification', required: false })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @ApiProperty({
        example: NotificationStatus.READ,
        description: 'Status of the notification',
        enum: NotificationStatus
    })
    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;
} 