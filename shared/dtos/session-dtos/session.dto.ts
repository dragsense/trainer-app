import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
  IsDateString,
  ValidateNested,
  IsArray
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '../../lib/dto-type-adapter';
import { Type } from 'class-transformer';
import { ESessionType, ESessionStatus } from '../../enums/session.enum';
import { EBillingCurrency } from '../../enums/billing.enum';
import { EPaymentMethodType } from '../../enums/payment-method.enum';
import { UserDto } from '../user-dtos';
import { ListQueryDto } from '../common/list-query.dto';
import { PaginationMetaDto } from '../common/pagination.dto';
import { Session } from '../../entities/sessions/session.entity';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';


export class CreateSessionDto {
  @ApiProperty({
    description: 'Title of the session',
    example: 'Personal Training Session'
  })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  title: string;

  @ApiProperty({
    description: 'Type of session',
    enum: ESessionType,
    example: ESessionType.ONE_ON_ONE
  })
  @IsNotEmpty()
  @IsEnum(ESessionType)
  @FieldType("select", true)
  @FieldOptions(Object.values(ESessionType).map(v => ({ value: v, label: v })))
  type: ESessionType;

  @ApiProperty({
    description: 'Date and time of the session',
    example: '2025-07-01T10:00:00Z'
  })
  @IsNotEmpty()
  @IsDateString()
  @FieldType("datetime", true)
  dateTime: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 60,
    minimum: 15
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Duration must be a valid number' })
  @Type(() => Number)
  @Min(15, { message: 'Duration must be at least 15 minutes' })
  @FieldType("number", true)
  duration: number;

  @ApiProperty({
    description: 'Price of the session',
    example: 100.00
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @FieldType("number", true)
  pricePerClient: number;

  @ApiProperty({ enum: EBillingCurrency, example: EBillingCurrency.USD })
  @IsOptional()
  @IsEnum(EBillingCurrency)
  @FieldType("select", true)
  currency?: EBillingCurrency;

  @ApiPropertyOptional({
    description: 'Description or notes about the session',
    example: 'Bring your own mat and water bottle.'
  })
  @IsOptional()
  @IsString()
  @FieldType("textarea", true)
  description?: string;

  @ApiPropertyOptional({
    description: 'Location of the session (can be physical address or virtual meeting link)',
    example: 'Zoom Meeting: https://zoom.us/j/123456789'
  })
  @IsOptional()
  @IsString()
  @FieldType("text", true)
  location?: string;

  @ApiProperty({
    description: 'Whether the session payment is required in advance',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @FieldType("switch", true)
  requirePrepayment?: boolean = true;

  @ApiProperty({
    enum: EPaymentMethodType,
    example: EPaymentMethodType.STRIPE,
    description: 'Payment method type'
  })
  @IsEnum(EPaymentMethodType)
  @FieldOptions(Object.values(EPaymentMethodType).map(v => ({ value: v, label: v })))
  @FieldType("select", true)
  paymentMethodType: EPaymentMethodType;

  @ApiProperty({
    description: 'Cancellation deadline in hours before session',
    example: 24,
    default: 24,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @FieldType("number", true)
  cancellationDeadline?: number = 24;

  @ApiProperty({ 
    type: () => UserDto,
    description: 'Trainer assigned to the session - only id field required'
  })
  @ValidateNested()
  @Type(() => UserDto)
  @FieldType("custom", true, UserDto)
  trainer: UserDto;

  @ApiProperty({ 
    type: () => [Number],
    description: 'Clients assigned to the session - only id field required for each',
    isArray: true
  })
  @IsArray()
  @Type(() => UserDto)
  @FieldType("custom", true, UserDto)
  clients: UserDto[];
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}

export class BookSessionDto {
  @IsNumber()
  sessionId: number;
}

export class SessionListDto extends ListQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by trainer ID', 
    example: 1 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  trainerId?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by client ID', 
    example: 2 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number;

  @ApiPropertyOptional({ 
    description: 'Filter by session type',
    enum: ESessionType,
    example: ESessionType.ONE_ON_ONE
  })
  @IsOptional()
  @IsEnum(ESessionType)
  type?: ESessionType;

  @ApiPropertyOptional({ 
    description: 'Filter by session status',
    enum: ESessionStatus,
    example: ESessionStatus.SCHEDULED
  })
  @IsOptional()
  @IsEnum(ESessionStatus)
  status?: ESessionStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by sessions from this date',
    example: '2025-07-01' 
  })
  @IsOptional()
  @IsDateString()
  startDateAfter?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by sessions from this date',
    example: '2025-07-01' 
  })
  @IsOptional()
  @IsDateString()
  startDateBefore?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by sessions until this date',
    example: '2025-07-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}



export class SessionPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [Session] })
  @Type(() => Session)
  data: Session[]
}


export class SessionDto {
  @ApiProperty({ example: 1, description: 'Session ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'Session title', description: 'Session title' })
  @IsOptional()
  @IsString()
  @FieldType("text", false)
  title: string;
}

