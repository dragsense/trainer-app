import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateClientTrainerAssignmentDto } from './create-assignment.dto';
import { AssignmentStatus } from '../entities/client-trainer-assignment.entity';

export class UpdateClientTrainerAssignmentDto extends PartialType(CreateClientTrainerAssignmentDto) {
  @ApiPropertyOptional({
    enum: AssignmentStatus,
    description: 'Assignment status',
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
