import { PartialType } from '@nestjs/mapped-types';
import { CreateReminderDto } from './create-reminder.dto';
import { IsOptional, IsEnum, IsDate, IsNumber, IsString, IsArray, ArrayNotEmpty, IsPositive, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReminderType } from '../enums/reminder-type.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @ApiProperty({
    description: 'Type of reminder',
    enum: ReminderType,
  })
  @IsOptional()
  @IsEnum(ReminderType)
  type?: ReminderType;

  @ApiProperty({
    description: 'Status of the reminder',
    enum: ReminderStatus,
  })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @ApiProperty({
    description: 'Recipient user ID',
  })
  @IsOptional()
  @IsNumber()
  recipientId?: number;

  @ApiProperty({
    description: 'Session ID',
  })
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @ApiProperty({
    description: 'Payment ID',
  })
  @IsOptional()
  @IsNumber()
  paymentId?: number;

  @ApiProperty({
    description: 'Custom message for the reminder',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Scheduled time for sending the reminder',
  })
  @IsOptional()
  @IsDate()
  scheduledAt?: Date;

  @ApiProperty({
    description: 'Maximum number of times to send this reminder',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Interval between reminder attempts (in minutes)',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  retryInterval?: number;

  @ApiProperty({
    description: 'Metadata about the reminder',
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Delivery methods for the reminder',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  deliveryMethods?: string[];

  @ApiProperty({
    description: 'Priority level of the reminder',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  priority?: number;

  @ApiProperty({
    description: 'Whether this reminder is recurring',
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Recurring interval if reminder is recurring (in days)',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  recurringInterval?: number;

  @ApiProperty({
    description: 'End date for recurring reminders',
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
