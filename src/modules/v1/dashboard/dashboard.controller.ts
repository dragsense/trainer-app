import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';
import { UserLevels, UserRole } from '../users/enums/user.enum';
import { MinRoleLevel } from '@/decorators/level.decorator';
import { RoleLevelGuard } from '@/guards/level.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleLevelGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics overview' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(@Req() req: any) {
    return this.dashboardService.getDashboardStats(req.user);
  }

 @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Get('sessions/analytics')
  @ApiOperation({ summary: 'Get sessions analytics' })
  @ApiResponse({ status: 200, description: 'Sessions analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'], description: 'Time period for session analysis' })
  async getSessionsAnalytics(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getSessionsAnalytics(req.user, period);
  }

  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Get('reminders/analytics')
  @ApiOperation({ summary: 'Get reminders analytics' })
  @ApiResponse({ status: 200, description: 'Reminders analytics retrieved successfully' })
  async getRemindersAnalytics(@Req() req: any) {
    return this.dashboardService.getRemindersAnalytics(req.user);
  }



  @MinRoleLevel(UserLevels[UserRole.TRAINER])
  @Get('billing/analytics')
  @ApiOperation({ summary: 'Get comprehensive billing analytics' })
  @ApiResponse({ status: 200, description: 'Billing analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'], description: 'Time period for billing analysis' })
  async getBillingAnalytics(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getBillingAnalytics(req.user, period);
  }
}
