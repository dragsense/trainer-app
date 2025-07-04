import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, IsDate, IsBoolean } from 'class-validator';
import { ReminderType } from '../enums/reminder-type.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

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
    description: 'Filter by creator ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  creatorId?: number;

  @ApiProperty({
    description: 'Filter by recipient ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  recipientId?: number;

  @ApiProperty({
    description: 'Filter by session ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @ApiProperty({
    description: 'Filter by payment ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  paymentId?: number;

  @ApiProperty({
    description: 'Filter by message',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Filter by scheduled time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  scheduledAt?: Date;

  @ApiProperty({
    description: 'Filter by sent time',
    required: false,
  })
  @IsOptional()
  @IsDate()
  sentAt?: Date;

  @ApiProperty({
    description: 'Filter by priority',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({
    description: 'Filter by recurring status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Filter by delivery method',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryMethod?: string;

  @ApiProperty({
    description: 'Filter by start date',
    required: false,
  })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'Filter by end date',
    required: false,
  })
  @IsOptional()
  @IsDate()
  endDate?: Date;
}
