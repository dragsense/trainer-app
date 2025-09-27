import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ENotificationType, ENotificationStatus } from '../../enums/notification.enum';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { Notification } from '../../entities/notifications/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ enum: ENotificationType, example: ENotificationType.GENERAL })
  @IsEnum(ENotificationType)
  type: ENotificationType;

  @ApiProperty({ example: 'New notification' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is a notification message' })
  @IsString()
  message: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  userId: number;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ example: '🔔' })
  @IsOptional()
  @IsString()
  icon?: string;


  @ApiProperty({ example: '/test' })
  @IsOptional()
  @IsString()
  link?: string;
  
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}


export class NotificationPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [Notification] })
  @Type(() => Notification)
  data: Notification[]
}