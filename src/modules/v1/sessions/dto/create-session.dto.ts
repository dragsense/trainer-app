
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  IsPositive, 
  Min,
  Matches,
  IsDate,
  IsDateString
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {  SessionType } from '../enums/session.enum';

export class CreateSessionDto {
  @ApiProperty({ 
    description: 'Title of the session', 
    example: 'Personal Training Session' 
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Type of session',
    enum: SessionType,
    example: SessionType.ONE_ON_ONE
  })
  @IsNotEmpty()
  @IsEnum(SessionType)
  type: SessionType;


  @ApiProperty({ 
    description: 'Date and time of the session', 
    example: '2025-07-01T10:00:00Z' 
  })
  @IsNotEmpty()
  @IsDateString()
  dateTime: Date;

  @ApiProperty({ 
    description: 'Duration of the session in minutes', 
    example: 60, 
    minimum: 15 
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(15)
  duration: number;

  @ApiProperty({ 
    description: 'Price of the session', 
    example: 100.00 
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @ApiProperty({ 
    description: 'Currency for the session price', 
    example: 'USD',
    default: 'USD'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { 
    message: 'Currency must be a 3-letter code (e.g., USD, EUR)' 
  })
  currency?: string = 'USD';

  @ApiPropertyOptional({ 
    description: 'Description or notes about the session', 
    example: 'Bring your own mat and water bottle.' 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Location of the session (can be physical address or virtual meeting link)',
    example: 'Zoom Meeting: https://zoom.us/j/123456789'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Maximum number of participants (for group sessions)',
    example: 10,
    minimum: 2
  })
  @IsOptional()
  @IsNumber() 
  @Type(() => Number)
  @Min(1)
  maxParticipants?: number;

  @ApiProperty({ 
    description: 'Whether the session payment is required in advance',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  requirePrepayment?: boolean = true;

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
  cancellationDeadline?: number = 24;

  @ApiProperty({ 
    description: 'ID of the trainer for the session', 
    example: 1 
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  trainerId: number;

  @ApiProperty({ 
    description: 'ID of the client for the session', 
    example: 2 
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clientId: number;
}