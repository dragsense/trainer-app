import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsEnum, IsOptional, IsDateString, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentStatus } from '../entities/client-trainer-assignment.entity';

export class CreateClientTrainerAssignmentDto {
  @ApiProperty({ description: 'Client ID to assign' })
  @Type(() => Number)
  @IsInt()
  clientId: number;

  @ApiProperty({ description: 'Trainer ID to assign' })
  @Type(() => Number)
  @IsInt()
  trainerId: number;

  @ApiPropertyOptional({
    enum: AssignmentStatus,
    description: 'Assignment status',
    default: AssignmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({ description: 'Assignment start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Assignment end date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Assignment notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Weekly session limit (1-20)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  weeklySessionLimit?: number;

  @ApiPropertyOptional({ description: 'Monthly session limit (1-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  monthlySessionLimit?: number;
}
