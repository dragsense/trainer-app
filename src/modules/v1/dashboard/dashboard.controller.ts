import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { EUserLevels, EUserRole } from 'shared/enums';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { RoleLevelGuard } from '@/guards/level.guard';
import { DashboardAnalyticsDto } from 'shared/dtos';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleLevelGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics overview' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(@Req() req: any,
    @Query() query: DashboardAnalyticsDto,
  ) {
    return this.dashboardService.getDashboardStats(req.user, query);
  }

  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Get('sessions/analytics')
  @ApiOperation({ summary: 'Get sessions analytics' })
  @ApiResponse({ status: 200, description: 'Sessions analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'], description: 'Time period for session analysis' })
  async getSessionsAnalytics(
    @Req() req: any,
    @Query() query: DashboardAnalyticsDto,
  ) {
    return this.dashboardService.getSessionsAnalytics(req.user, query);
  }

  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Get('reminders/analytics')
  @ApiOperation({ summary: 'Get reminders analytics' })
  @ApiResponse({ status: 200, description: 'Reminders analytics retrieved successfully' })
  async getRemindersAnalytics(@Req() req: any,
    @Query() query: DashboardAnalyticsDto) {
    return this.dashboardService.getRemindersAnalytics(req.user, query);
  }



  @MinRoleLevel(EUserLevels[EUserRole.TRAINER])
  @Get('billing/analytics')
  @ApiOperation({ summary: 'Get comprehensive billing analytics' })
  @ApiResponse({ status: 200, description: 'Billing analytics retrieved successfully' })
  async getBillingAnalytics(
    @Req() req: any,
    @Query() query: DashboardAnalyticsDto
  ) {
    return this.dashboardService.getBillingAnalytics(req.user, query);
  }
}
