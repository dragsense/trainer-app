import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';


export class SessionListDto extends ListQueryDto {
  @ApiProperty({
    description: 'Filter by trainer ID',
    required: false,
    example: 1
  })
  @IsNumber()
  @Type(() => Number)
  trainerId?: number;

  @ApiProperty({
    description: 'Filter by client ID',
    required: false,
    example: 1
  })
  @IsNumber()
  @Type(() => Number)
  clientId?: number;

  @ApiProperty({
    description: 'Filter by session status',
    enum: ['scheduled', 'completed', 'cancelled'],
    required: false,
    example: 'scheduled'
  })
  status?: 'scheduled' | 'completed' | 'cancelled';

  @ApiProperty({
    description: 'Filter by minimum duration in minutes',
    required: false,
    example: 30
  })
  minDuration?: number;

  @ApiProperty({
    description: 'Filter by maximum duration in minutes',
    required: false,
    example: 90
  })
  maxDuration?: number;

  @ApiProperty({
    description: 'Filter sessions after this date (inclusive)',
    required: false,
    example: '2025-06-01'
  })
  startDate?: Date;

  @ApiProperty({
    description: 'Filter sessions before this date (inclusive)',
    required: false,
    example: '2025-06-30'
  })
  endDate?: Date;


}
