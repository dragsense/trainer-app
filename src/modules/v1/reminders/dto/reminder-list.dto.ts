import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, IsDate, IsBoolean, IsArray, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ReminderType, ReminderStatus, ReminderFrequency } from '../enums/reminder.enum';

export class ReminderListDto extends ListQueryDto {
  constructor() {
    super();
    this.page = this.page || 1;
    this.limit = this.limit || 10;
  }

  @ApiProperty({
    description: 'Filter by reminder type',
    enum: ReminderType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReminderType)
  type?: ReminderType;

  @ApiProperty({
    description: 'Filter by reminder status',
    enum: ReminderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @ApiProperty({
    description: 'Filter by reminder frequency',
    enum: ReminderFrequency,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReminderFrequency)
  frequency?: ReminderFrequency;

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
  @IsDate()
  @Type(() => Date)
  startDateFrom?: Date;

  @ApiProperty({
    description: 'Filter by start date range (end)',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDateTo?: Date;
}
