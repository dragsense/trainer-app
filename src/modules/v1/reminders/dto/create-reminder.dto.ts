import { IsNotEmpty, IsEnum, IsNumber, IsString, IsOptional, IsDate, IsArray, ArrayNotEmpty, IsPositive, IsBoolean, Matches, Min, Max, IsDateString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType, ReminderStatus, ReminderFrequency, ReminderActions } from '../enums/reminder.enum';
export class CreateReminderDto {
  @ApiProperty({
    description: 'Type of reminder (BILLING, SESSION, CUSTOM)',
    enum: ReminderType,
    example: ReminderType.BILLING,
  })
  @IsNotEmpty()
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({
    description: 'Recipient user ID',
    example: 1,
  })
  @ValidateIf(o => o.type === ReminderType.CUSTOM)
  @IsOptional()
  @IsNumber()
  @Min(1)
  recipientId?: number;

  @ApiProperty({
    description: 'Session ID (required if type is SESSION)',
    example: 1,
  })
  @ValidateIf(o => o.type === ReminderType.SESSION)
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @ApiProperty({
    description: 'Billing ID (required if type is PAYMENT)',
    example: 1,
  })
  @ValidateIf(o => o.type === ReminderType.BILLING)
  @IsOptional()
  @IsNumber()
  billingId?: number;

  @ApiProperty({
    description: 'Custom message for the reminder',
    example: 'Please make your payment for the upcoming session',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Frequency of the reminder',
    enum: ReminderFrequency,
    example: ReminderFrequency.DAILY,
  })
  @IsNotEmpty()
  @IsEnum(ReminderFrequency)
  frequency: ReminderFrequency;


  @ApiProperty({
    description: 'Scheduled date and time for the reminder schedule',
    example: '2025-07-08T09:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  scheduledAt: Date;


  @ApiProperty({
    description: 'Custom interval in minutes (required for MINUTELY/HOURLY frequency)',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  intervalMinutes?: number;

  @ApiProperty({
    description: 'Selected weekdays for WEEKLY frequency (0 = Sunday, 6 = Saturday)',
    example: [1, 3, 5],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays?: number[];

  @ApiProperty({
    description: 'Selected days of month for MONTHLY frequency',
    example: [1, 15, 28],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(31, { each: true })
  monthDays?: number[];

  @ApiProperty({
    description: 'Specific time of day for DAILY/WEEKLY/MONTHLY frequency (HH:mm)',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time of day must be in HH:mm format',
  })
  timeOfDay?: string;

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
    description: 'Actions for the reminder (EMAIL)',
    example: [ReminderActions.EMAIL],
    isArray: true,
    enum: ReminderActions,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ReminderActions, { each: true })
  actions?: ReminderActions[];



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
  @IsDateString()
  endDate?: Date;
}
