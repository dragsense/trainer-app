import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics overview' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(@Req() req: any) {
    return this.dashboardService.getDashboardStats(req.user);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'], description: 'Time period for revenue analysis' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string', description: 'Start date for custom period (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string', description: 'End date for custom period (YYYY-MM-DD)' })
  async getRevenueAnalytics(
    @Req() req: any,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getRevenueAnalytics(req.user, period, startDate, endDate);
  }

  @Get('payments/overview')
  @ApiOperation({ summary: 'Get payment methods overview' })
  @ApiResponse({ status: 200, description: 'Payment methods overview retrieved successfully' })
  async getPaymentMethodsOverview(@Req() req: any) {
    return this.dashboardService.getPaymentMethodsOverview(req.user);
  }

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

  @Get('clients/overview')
  @ApiOperation({ summary: 'Get clients overview and growth' })
  @ApiResponse({ status: 200, description: 'Clients overview retrieved successfully' })
  async getClientsOverview(@Req() req: any) {
    return this.dashboardService.getClientsOverview(req.user);
  }

  @Get('reminders/analytics')
  @ApiOperation({ summary: 'Get reminders analytics' })
  @ApiResponse({ status: 200, description: 'Reminders analytics retrieved successfully' })
  async getRemindersAnalytics(@Req() req: any) {
    return this.dashboardService.getRemindersAnalytics(req.user);
  }

  @Get('financial/summary')
  @ApiOperation({ summary: 'Get financial summary for dashboard' })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year'], description: 'Time period for financial summary' })
  async getFinancialSummary(
    @Req() req: any,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getFinancialSummary(req.user, period);
  }

  @Get('billing/analytics')
  @ApiOperation({ summary: 'Get comprehensive billing analytics' })
  @ApiResponse({ status: 200, description: 'Billing analytics retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'], description: 'Time period for billing analysis' })
  @ApiQuery({ name: 'startDate', required: false, type: 'string', description: 'Start date for custom period (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: 'string', description: 'End date for custom period (YYYY-MM-DD)' })
  async getBillingAnalytics(
    @Req() req: any,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getBillingAnalytics(req.user, period, startDate, endDate);
  }
}
