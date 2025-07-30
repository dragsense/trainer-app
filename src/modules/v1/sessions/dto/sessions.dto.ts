import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SessionType, SessionStatus } from '../enums/session.enum';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsEnum(SessionType)
  type: SessionType;

  @IsDateString()
  dateTime: Date;

  @IsNumber()
  @Min(15)
  @Max(480) // Max 8 hours
  duration: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxParticipants?: number = 1;

  @IsOptional()
  @IsBoolean()
  requirePrepayment?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168) // Max 1 week
  cancellationDeadline?: number = 24;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  recurringInterval?: number;

  @IsOptional()
  @IsDateString()
  recurringEndDate?: Date;

  @IsNumber()
  trainerId: number;

  @IsOptional()
  @IsNumber()
  clientId?: number;
}


export class BookSessionDto {
  @IsNumber()
  sessionId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  useStoredPaymentMethod?: boolean;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class SessionFiltersDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  trainerId?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  clientId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsEnum(SessionType)
  type?: SessionType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  includeHistory?: boolean;
}

export class BookingConfirmationResponseDto {
  booking: any; // Will be populated with SessionBooking entity
  requiresPayment: boolean;
  paymentIntentClientSecret?: string;
  subscriptionClientSecret?: string;
  message: string;
}

export class SessionAvailabilityResponseDto {
  available: boolean;
  spotsRemaining: number;
  session: any; // Will be populated with Session entity
  message: string;
}

export class CancelSessionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
