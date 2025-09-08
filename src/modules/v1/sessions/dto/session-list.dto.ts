import { 
  IsEnum, 
  IsOptional, 
  IsDateString, 
  IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { SessionStatus, SessionType } from '../enums/session.enum';

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
    enum: SessionType,
    example: SessionType.ONE_ON_ONE
  })
  @IsOptional()
  @IsEnum(SessionType)
  type?: SessionType;

  @ApiPropertyOptional({ 
    description: 'Filter by session status',
    enum: SessionStatus,
    example: SessionStatus.SCHEDULED
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({ 
    description: 'Filter by sessions from this date',
    example: '2025-07-01' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by sessions until this date',
    example: '2025-07-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
