import { IsNotEmpty, IsEnum, IsNumber, IsString, IsOptional, IsArray, ArrayNotEmpty,  Max, Matches, IsPositive, IsBoolean, Min, IsDateString, ValidateIf, ValidateNested, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { EReminderType, EReminderActions, EReminderStatus, EReminderFrequency } from '../../enums/reminder.enum';
import { FrequencyConfigDto } from './frequency-config.dto';
import { Type } from 'class-transformer';

import { IReminder } from '../../interfaces/reminder.interface';
import { PaginationMetaDto } from '../common/pagination.dto';
import { Reminder } from '../../entities/reminders/reminder.entity';
import { ListQueryDto } from '../common/list-query.dto';

@ValidatorConstraint({ name: 'futureDate', async: false })
export class FutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date, args: ValidationArguments) {
    if (!date) return true; // Optional field, so empty is valid
    return date > new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return 'Scheduled date must be in the future';
  }
}

@ValidatorConstraint({ name: 'frequencyConfig', async: false })
export class FrequencyConfigConstraint implements ValidatorConstraintInterface {
  validate(frequencyConfig: any, args: ValidationArguments) {
    const { frequency, timeOfDay, intervalMinutes, weekdays, monthDays } = frequencyConfig;

    // For non-ONCE frequencies, require either timeOfDay or intervalMinutes
    if (frequency !== EReminderFrequency.ONCE) {
      if (!timeOfDay && !intervalMinutes) {
        return false;
      }
    }

    // For WEEKLY frequency, require weekdays
    if (frequency === EReminderFrequency.WEEKLY) {
      if (!weekdays || weekdays.length === 0) {
        return false;
      }
    }

    // For MONTHLY frequency, require monthDays
    if (frequency === EReminderFrequency.MONTHLY) {
      if (!monthDays || monthDays.length === 0) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const { frequency, timeOfDay, intervalMinutes, weekdays, monthDays } = args.object as any;

    if (frequency !== EReminderFrequency.ONCE) {
      if (!timeOfDay && !intervalMinutes) {
        return 'Select either a time of day or an interval for reminders';
      }
    }

    if (frequency === EReminderFrequency.WEEKLY) {
      if (!weekdays || weekdays.length === 0) {
        return 'Select at least one day of the week';
      }
    }

    if (frequency === EReminderFrequency.MONTHLY) {
      if (!monthDays || monthDays.length === 0) {
        return 'Select at least one date of the month';
      }
    }

    return 'Invalid frequency configuration';
  }
}

export class CreateReminderDto {
  @ApiProperty({
    description: 'Type of reminder (BILLING, SESSION, CUSTOM)',
    enum: EReminderType,
    example: EReminderType.BILLING,
  })
  @IsNotEmpty()
  @IsEnum(EReminderType)
  type: EReminderType;

  @ApiProperty({
    description: 'Recipient user ID',
    example: 1,
  })
  @ValidateIf(o => o.type === EReminderType.CUSTOM)
  @IsOptional()
  @IsNumber()
  @Min(1)
  recipientId?: number;

  @ApiProperty({
    description: 'Session ID (required if type is SESSION)',
    example: 1,
  })
  @ValidateIf(o => o.type === EReminderType.SESSION)
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @ApiProperty({
    description: 'Billing ID (required if type is PAYMENT)',
    example: 1,
  })
  @ValidateIf(o => o.type === EReminderType.BILLING)
  @IsOptional()
  @IsNumber()
  billingId?: number;

  @ApiProperty({
    description: 'Title message for the reminder',
    example: 'Please make your payment for the upcoming session',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Custom message for the reminder',
    example: 'Please make your payment for the upcoming session',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Scheduled date and time for the reminder schedule',
    example: '2025-07-08T09:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  @Validate(FutureDateConstraint)
  scheduledAt: Date;

  @ApiProperty({
    description: 'Frequency configuration object',
    type: FrequencyConfigDto,
  })
  @ValidateNested()
  @Validate(FrequencyConfigConstraint)
  @Type(() => FrequencyConfigDto)
  frequencyConfig: FrequencyConfigDto;

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
    example: [EReminderActions.EMAIL],
    isArray: true,
    enum: EReminderActions,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(EReminderActions, { each: true })
  actions?: EReminderActions[];

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

export class UpdateReminderDto extends PartialType(CreateReminderDto) { }



export class ReminderListDto extends ListQueryDto<IReminder> {

  @ApiProperty({
    description: 'Filter by reminder type',
    enum: EReminderType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EReminderType)
  type?: EReminderType;

  @ApiProperty({
    description: 'Filter by reminder status',
    enum: EReminderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EReminderStatus)
  status?: EReminderStatus;

  @ApiProperty({
    description: 'Filter by reminder frequency',
    enum: EReminderFrequency,
    required: false,
  })
  @IsOptional()
  @IsEnum(EReminderFrequency)
  frequency?: EReminderFrequency;

  @ApiProperty({
    description: 'Filter by creator ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creatorId?: number;

  @ApiProperty({
    description: 'Filter by recipient ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recipientId?: number;

  @ApiProperty({
    description: 'Filter by session ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sessionId?: number;

  @ApiProperty({
    description: 'Filter by payment ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paymentId?: number;

  @ApiProperty({
    description: 'Filter by message content',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Filter by specific weekdays (0-6, where 0 is Sunday)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays?: number[];

  @ApiProperty({
    description: 'Filter by specific days of month (1-31)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(31, { each: true })
  monthDays?: number[];

  @ApiProperty({
    description: 'Filter by specific time of day (HH:mm)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time of day must be in HH:mm format',
  })
  timeOfDay?: string;

  @ApiProperty({
    description: 'Filter by interval minutes',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  intervalMinutes?: number;

  @ApiProperty({
    description: 'Filter by priority',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priority?: number;

  @ApiProperty({
    description: 'Filter by start date range (start)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  startDateFrom?: Date;

  @ApiProperty({
    description: 'Filter by start date range (end)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  startDateTo?: Date;

  @ApiProperty({
    description: 'Filter by scheduled date range (start)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  scheduledDateFrom?: Date;

  @ApiProperty({
    description: 'Filter by scheduled date range (end)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  scheduledDateTo?: Date;

  @ApiProperty({
    description: 'Filter by delivery method',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @ApiProperty({
    description: 'Filter by recipient email',
    required: false,
  })
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiProperty({
    description: 'Filter by creator email',
    required: false,
  })
  @IsOptional()
  @IsString()
  creatorEmail?: string;

  @ApiProperty({
    description: 'Filter by reminder title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}


export class ReminderPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [Reminder] })
  @Type(() => Reminder)
  data: Reminder[]
}