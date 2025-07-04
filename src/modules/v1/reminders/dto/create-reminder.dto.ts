import { IsNotEmpty, IsEnum, IsNumber, IsString, IsOptional, IsDate, IsArray, ArrayNotEmpty, IsPositive, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReminderType } from '../enums/reminder-type.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

export class CreateReminderDto {
  @ApiProperty({
    description: 'Type of reminder (PAYMENT, SESSION, CUSTOM)',
    enum: ReminderType,
    example: ReminderType.PAYMENT,
  })
  @IsNotEmpty()
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({
    description: 'Recipient user ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  recipientId: number;

  @ApiProperty({
    description: 'Session ID (required if type is SESSION)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @ApiProperty({
    description: 'Payment ID (required if type is PAYMENT)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  paymentId?: number;

  @ApiProperty({
    description: 'Custom message for the reminder',
    example: 'Please make your payment for the upcoming session',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Scheduled time for sending the reminder',
    example: '2025-07-01T06:49:35+05:00',
  })
  @IsNotEmpty()
  @IsDate()
  scheduledAt: Date;

  @ApiProperty({
    description: 'Maximum number of times to send this reminder',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAttempts?: number;

  @ApiProperty({
    description: 'Interval between reminder attempts (in minutes)',
    example: 1440,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  retryInterval?: number;

  @ApiProperty({
    description: 'Metadata about the reminder',
    example: { sessionId: '123', paymentId: '456' },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Delivery methods for the reminder (EMAIL, SMS, PUSH_NOTIFICATION)',
    example: ['EMAIL', 'SMS'],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  deliveryMethods?: string[];

  @ApiProperty({
    description: 'Priority level of the reminder',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  priority?: number;

  @ApiProperty({
    description: 'Whether this reminder is recurring',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Recurring interval if reminder is recurring (in days)',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  recurringInterval?: number;

  @ApiProperty({
    description: 'End date for recurring reminders',
    example: '2025-07-31T06:49:35+05:00',
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
