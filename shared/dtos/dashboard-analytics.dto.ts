import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { EAnalyticsPeriod } from '../enums/dashboard-analytics.enum';

export class DashboardAnalyticsDto {
  @ApiPropertyOptional({
    enum: EAnalyticsPeriod,
    description: 'Predefined time period (day, week, month, year)',
  })
  @IsOptional()
  @IsEnum(EAnalyticsPeriod)
  period?: EAnalyticsPeriod;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom start date (YYYY-MM-DD)',
    example: '2025-09-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom end date (YYYY-MM-DD)',
    example: '2025-09-26',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
