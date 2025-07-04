import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @ApiProperty({
    description: 'The title of the session',
    example: 'Yoga Class',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Date and time when the session is scheduled',
    example: '2025-07-01T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  dateTime: Date;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 60,
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'ID of the client associated with this session',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  clientId: number;

  @ApiPropertyOptional({
    description: 'Optional description of the session',
    example: 'Bring your own mat and towel.',
  })
  @IsString()
  description?: string;
}
