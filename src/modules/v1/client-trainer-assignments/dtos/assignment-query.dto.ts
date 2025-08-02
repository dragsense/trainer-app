import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/shared-dto/list-query.dto';
import { AssignmentStatus } from '../entities/client-trainer-assignment.entity';

export class AssignmentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by client ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Filter by trainer ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  trainerId?: number;

  @ApiPropertyOptional({
    enum: AssignmentStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({ description: 'Search by client name' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Search by trainer name' })
  @IsOptional()
  @IsString()
  trainerName?: string;

  @ApiPropertyOptional({ description: 'Filter by created date (start)' })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Filter by created date (end)' })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
