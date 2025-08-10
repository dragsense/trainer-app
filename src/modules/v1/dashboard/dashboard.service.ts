import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { Billing } from '../billings/entities/billing.entity';
import { Reminder } from '../reminders/entities/reminder.entity';
import { PaymentMethod } from '../settings/payment-methods/entities/payment-method.entity';
import { BillingStatus, BillingCurrency } from '../billings/enums/billing.enum';
import { SessionStatus } from '../sessions/enums/session.enum';
import { ReminderStatus } from '../reminders/enums/reminder.enum';
import { UserRole, UserLevels } from '../users/enums/user.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) { }

  async getDashboardStats(user: User) {
    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];

    // Get counts
    const [
      totalClients,
      totalTrainers,
      totalActiveTrainers,
      totalActiveClients,
      totalSessions,
      totalBillings,
      totalReminders,
      activeSessions,
      pendingBillings,
      completedSessions,
      paidBillings
    ] = await Promise.all([
      this.userRepository.count({
        where: isAdmin ? { level: UserLevels[UserRole.USER] } : { owner: { id: user.id } }
      }),
   
       isAdmin
        ? this.userRepository.count({
          where: { level: UserLevels[UserRole.TRAINER] },
        })
        : Promise.resolve(0),
      isAdmin
        ? this.userRepository.count({
          where: { level: UserLevels[UserRole.TRAINER], isActive: true },
        })
        : Promise.resolve(0),
      this.userRepository.count({
        where: isAdmin ? { level: UserLevels[UserRole.USER], isActive: true } : { owner: { id: user.id }, isActive: true }
      }),
      this.sessionRepository.count({
        where: isAdmin ? {} : { trainer: { id: user.id } }
      }),
      this.billingRepository.count({
        where: isAdmin ? {} : { user: { id: user.id } }
      }),
      this.reminderRepository.count({
        where: isAdmin ? {} : { recipient: { id: user.id } }
      }),
      this.sessionRepository.count({
        where: {
          status: SessionStatus.SCHEDULED,
          ...(isAdmin ? {} : { trainer: { id: user.id } })
        }
      }),
      this.billingRepository.count({
        where: {
          status: BillingStatus.PENDING,
          ...(isAdmin ? {} : { user: { id: user.id } })
        }
      }),
      this.sessionRepository.count({
        where: {
          status: SessionStatus.COMPLETED,
          ...(isAdmin ? {} : { trainer: { id: user.id } })
        }
      }),
      this.billingRepository.count({
        where: {
          status: BillingStatus.PAID,
          ...(isAdmin ? {} : { user: { id: user.id } })
        }
      })
    ]);


    // Calculate completion rates
    const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const paymentSuccessRate = totalBillings > 0 ? (paidBillings / totalBillings) * 100 : 0;

    return {
      overview: {
        totalClients,
        totalTrainers,
        totalActiveClients,
        totalActiveTrainers,
        totalSessions,
        totalBillings,
        totalReminders,
        activeSessions,
        pendingBillings,
        completedSessions,
        paidBillings
      },
      metrics: {
        sessionCompletionRate: Math.round(sessionCompletionRate * 100) / 100,
        paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
        averageSessionsPerClient: totalClients > 0 ? Math.round((totalSessions / totalClients) * 100) / 100 : 0
      }
    };
  }

  async getSessionsAnalytics(user: User, period = 'monthly') {
    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const userCondition = isAdmin ? '' : `AND s."trainerId" = ${user.id}`;

    let groupBy = "DATE_TRUNC('month', s.\"dateTime\")";
    if (period === 'daily') groupBy = "DATE_TRUNC('day', s.\"dateTime\")";
    if (period === 'weekly') groupBy = "DATE_TRUNC('week', s.\"dateTime\")";

    const sessionStatsQuery = `
      SELECT 
        ${groupBy} as period,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'COMPLETED' THEN s.id END) as completed_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'SCHEDULED' THEN s.id END) as scheduled_sessions,
        COUNT(DISTINCT CASE WHEN s.status = 'CANCELLED' THEN s.id END) as cancelled_sessions,
        AVG(s."pricePerClient") as average_price,
        SUM(s."pricePerClient" * COALESCE(client_counts.client_count, 1)) as total_potential_revenue
      FROM sessions s
      LEFT JOIN (
        SELECT "sessionId", COUNT(*) as client_count 
        FROM sessions_clients 
        GROUP BY "sessionId"
      ) client_counts ON s.id = client_counts."sessionId"
      WHERE s."dateTime" >= NOW() - INTERVAL '12 months' ${userCondition}
      GROUP BY ${groupBy}
      ORDER BY period DESC 
    `;

    const sessionStats = await this.sessionRepository.query(sessionStatsQuery);

    // Get session type distribution
    const sessionTypeQuery = `
      SELECT 
        s.type,
        COUNT(*) as count,
        AVG(s."pricePerClient") as average_price
      FROM sessions s
      WHERE s."dateTime" >= NOW() - INTERVAL '12 months' ${userCondition}
      GROUP BY s.type
      ORDER BY count DESC
    `;

    const sessionTypes = await this.sessionRepository.query(sessionTypeQuery);

    return {
      period,
      timeline: sessionStats.map(row => ({
        period: row.period,
        totalSessions: parseInt(row.total_sessions),
        completedSessions: parseInt(row.completed_sessions),
        scheduledSessions: parseInt(row.scheduled_sessions),
        cancelledSessions: parseInt(row.cancelled_sessions),
        averagePrice: parseFloat(row.average_price) || 0,
        totalPotentialRevenue: parseFloat(row.total_potential_revenue) || 0,
        completionRate: row.total_sessions > 0 ? (row.completed_sessions / row.total_sessions) * 100 : 0
      })),
      sessionTypes: sessionTypes.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        averagePrice: parseFloat(row.average_price) || 0
      }))
    };
  }

  async getRemindersAnalytics(user: User) {
    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const userCondition = isAdmin ? '' : `AND r."creatorId" = ${user.id}`;

    const reminderStatsQuery = `
      SELECT 
        DATE_TRUNC('week', r."createdAt") as period,
        COUNT(*) as total_reminders,
        COUNT(CASE WHEN r.status = 'SENT' THEN 1 END) as sent_reminders,
        COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END) as pending_reminders,
        COUNT(CASE WHEN r.status = 'FAILED' THEN 1 END) as failed_reminders
      FROM reminders r
      WHERE r."createdAt" >= NOW() - INTERVAL '8 weeks' ${userCondition}
      GROUP BY DATE_TRUNC('week', r."createdAt")
      ORDER BY period DESC
    `;

    const reminderStats = await this.reminderRepository.query(reminderStatsQuery);

    // Reminder type distribution
    const reminderTypeQuery = `
      SELECT 
        r.type,
        COUNT(*) as count,
        COUNT(CASE WHEN r.status = 'SENT' THEN 1 END) as successful_count
      FROM reminders r
      WHERE r."createdAt" >= NOW() - INTERVAL '30 days' ${userCondition}
      GROUP BY r.type
      ORDER BY count DESC
    `;

    const reminderTypes = await this.reminderRepository.query(reminderTypeQuery);

    return {
      timeline: reminderStats.map(row => ({
        period: row.period,
        totalReminders: parseInt(row.total_reminders),
        sentReminders: parseInt(row.sent_reminders),
        pendingReminders: parseInt(row.pending_reminders),
        failedReminders: parseInt(row.failed_reminders),
        successRate: row.total_reminders > 0 ? (row.sent_reminders / row.total_reminders) * 100 : 0
      })),
      reminderTypes: reminderTypes.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        successfulCount: parseInt(row.successful_count),
        successRate: row.count > 0 ? (row.successful_count / row.count) * 100 : 0
      }))
    };
  }

  async getFinancialSummary(user: User, period = 'month') {
    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const PLATFORM_FEE_PERCENTAGE = 0.02; // 2% platform fee
    const userCondition = isAdmin ? '' : `AND b."creatorId" = ${user.id}`;

    let dateInterval = '1 month';
    if (period === 'quarter') dateInterval = '3 months';
    if (period === 'year') dateInterval = '1 year';

    const financialQuery = `
      SELECT 
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as total_revenue,
        ${isAdmin ? `SUM(CASE WHEN b.status = 'paid' THEN (b."invoiceAmount" * ${PLATFORM_FEE_PERCENTAGE}) ELSE 0 END) as platform_revenue,` : ''}
        SUM(CASE WHEN b.status = 'pending' THEN b."invoiceAmount" ELSE 0 END) as pending_revenue,
        COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_transactions,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN b.status = 'failed' THEN 1 END) as failed_transactions,
        AVG(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" END) as average_transaction_value,
        b.currency
      FROM billings b
      WHERE b."createdAt" >= NOW() - INTERVAL '${dateInterval}' ${userCondition}
      GROUP BY b.currency
    `;

    const financialData = await this.billingRepository.query(financialQuery);

    // Previous period comparison
    const previousPeriodQuery = `
      SELECT 
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as previous_revenue,
        ${isAdmin ? `SUM(CASE WHEN b.status = 'paid' THEN (b."invoiceAmount" * ${PLATFORM_FEE_PERCENTAGE}) ELSE 0 END) as previous_platform_revenue,` : ''}
        b.currency
      FROM billings b
      WHERE b."createdAt" >= NOW() - INTERVAL '${dateInterval}' * 2
        AND b."createdAt" < NOW() - INTERVAL '${dateInterval}' ${userCondition}
      GROUP BY b.currency
    `;

    const previousPeriodData = await this.billingRepository.query(previousPeriodQuery);

    return {
      period,
      currentPeriod: financialData.map(row => {
        const prevData = previousPeriodData.find(p => p.currency === row.currency);
        const currentRevenue = parseFloat(row.total_revenue) || 0;
        const previousRevenue = parseFloat(prevData?.previous_revenue) || 0;
        const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Platform revenue calculations
        const platformRevenue = isAdmin ? parseFloat(row.platform_revenue) || 0 : 0;
        const previousPlatformRevenue = isAdmin ? parseFloat(prevData?.previous_platform_revenue) || 0 : 0;
        const platformGrowthRate = previousPlatformRevenue > 0 ?
          ((platformRevenue - previousPlatformRevenue) / previousPlatformRevenue) * 100 : 0;

        return {
          currency: row.currency,
          totalRevenue: currentRevenue,
          platformRevenue, // 2% of total paid revenue
          trainerRevenue: currentRevenue - platformRevenue, // 98% remaining
          pendingRevenue: parseFloat(row.pending_revenue) || 0,
          paidTransactions: parseInt(row.paid_transactions),
          pendingTransactions: parseInt(row.pending_transactions),
          failedTransactions: parseInt(row.failed_transactions),
          averageTransactionValue: parseFloat(row.average_transaction_value) || 0,
          growthRate: Math.round(growthRate * 100) / 100,
          platformGrowthRate: Math.round(platformGrowthRate * 100) / 100,
          previousPeriodRevenue: previousRevenue,
          previousPlatformRevenue
        };
      })
    };
  }

  async getBillingAnalytics(user: User, period = 'monthly', startDate?: string, endDate?: string) {
    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const userCondition = isAdmin ? '' : `AND b."creatorId" = ${user.id}`;

    let dateCondition = '';
    let groupBy = '';
    let selectFields = '';

    // Set up date grouping based on period
    switch (period) {
      case 'daily':
        groupBy = "DATE_TRUNC('day', b.\"createdAt\")";
        selectFields = `${groupBy} as period, `;
        break;
      case 'weekly':
        groupBy = "DATE_TRUNC('week', b.\"createdAt\")";
        selectFields = `${groupBy} as period, `;
        break;
      case 'monthly':
        groupBy = "DATE_TRUNC('month', b.\"createdAt\")";
        selectFields = `${groupBy} as period, `;
        break;
      case 'yearly':
        groupBy = "DATE_TRUNC('year', b.\"createdAt\")";
        selectFields = `${groupBy} as period, `;
        break;
    }

    // Custom date range
    if (startDate && endDate) {
      dateCondition = `AND b."createdAt" >= '${startDate}' AND b."createdAt" <= '${endDate}'`;
    } else {
      // Default to last 12 periods
      const periodMap = {
        daily: '30 days',
        weekly: '12 weeks',
        monthly: '12 months',
        yearly: '5 years'
      };
      dateCondition = `AND b."createdAt" >= NOW() - INTERVAL '${periodMap[period] || '12 months'}'`;
    }

    // Billing timeline analytics
    const billingTimelineQuery = `
      SELECT 
        ${selectFields}
        COUNT(*) as total_billings,
        COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_billings,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_billings,
        COUNT(CASE WHEN b.status = 'failed' THEN 1 END) as failed_billings,
        COUNT(CASE WHEN b.status = 'overdue' THEN 1 END) as overdue_billings,
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as paid_amount,
        SUM(CASE WHEN b.status = 'pending' THEN b."invoiceAmount" ELSE 0 END) as pending_amount,
        SUM(CASE WHEN b.status = 'failed' THEN b."invoiceAmount" ELSE 0 END) as failed_amount,
        SUM(CASE WHEN b.status = 'overdue' THEN b."invoiceAmount" ELSE 0 END) as overdue_amount,
        AVG(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" END) as average_paid_amount,
        b.currency
      FROM billings b
      WHERE 1=1 ${dateCondition} ${userCondition}
      GROUP BY ${groupBy ? `${groupBy}, ` : ''}b.currency
      ORDER BY ${groupBy ? `${groupBy} DESC` : 'paid_amount DESC'}
    `;

    const billingTimeline = await this.billingRepository.query(billingTimelineQuery);

    // Billing status distribution
    const statusDistributionQuery = `
      SELECT 
        b.status,
        COUNT(*) as count,
        SUM(b."invoiceAmount") as total_amount,
        AVG(b."invoiceAmount") as average_amount,
        b.currency
      FROM billings b
      WHERE 1=1 ${dateCondition} ${userCondition}
      GROUP BY b.status, b.currency
      ORDER BY count DESC
    `;

    const statusDistribution = await this.billingRepository.query(statusDistributionQuery);

    // Billing type distribution
    const typeDistributionQuery = `
      SELECT 
        b.type,
        COUNT(*) as count,
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as paid_amount,
        SUM(b."invoiceAmount") as total_amount,
        AVG(b."invoiceAmount") as average_amount,
        b.currency
      FROM billings b
      WHERE 1=1 ${dateCondition} ${userCondition}
      GROUP BY b.type, b.currency
      ORDER BY count DESC
    `;

    const typeDistribution = await this.billingRepository.query(typeDistributionQuery);

    // Currency breakdown
    const currencyBreakdownQuery = `
      SELECT 
        b.currency,
        COUNT(*) as total_billings,
        COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_count,
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as paid_amount,
        SUM(b."invoiceAmount") as total_amount,
        AVG(b."invoiceAmount") as average_amount
      FROM billings b
      WHERE 1=1 ${dateCondition} ${userCondition}
      GROUP BY b.currency
      ORDER BY total_amount DESC
    `;

    const currencyBreakdown = await this.billingRepository.query(currencyBreakdownQuery);

    // Recent billing trends
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('day', b."createdAt") as date,
        COUNT(*) as daily_count,
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as daily_revenue
      FROM billings b
      WHERE b."createdAt" >= NOW() - INTERVAL '30 days' ${userCondition}
      GROUP BY DATE_TRUNC('day', b."createdAt")
      ORDER BY date DESC
      LIMIT 30
    `;

    const trends = await this.billingRepository.query(trendsQuery);

    // Payment method performance (if connected to payment methods)
    const paymentPerformanceQuery = `
      SELECT 
        CASE 
          WHEN b."stripeInvoiceId" IS NOT NULL THEN 'stripe'
          ELSE 'manual'
        END as payment_method,
        COUNT(*) as total_count,
        COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as success_count,
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as success_amount,
        AVG(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" END) as average_success_amount
      FROM billings b
      WHERE 1=1 ${dateCondition} ${userCondition}
      GROUP BY 
        CASE 
          WHEN b."stripeInvoiceId" IS NOT NULL THEN 'stripe'
          ELSE 'manual'
        END
      ORDER BY success_amount DESC
    `;

    const paymentPerformance = await this.billingRepository.query(paymentPerformanceQuery);

    // Summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_billings,
        COUNT(CASE WHEN b.status = 'paid' THEN 1 END) as paid_billings,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_billings,
        COUNT(CASE WHEN b.status = 'failed' THEN 1 END) as failed_billings,
        COUNT(CASE WHEN b.status = 'overdue' THEN 1 END) as overdue_billings,
        SUM(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" ELSE 0 END) as total_paid,
        SUM(CASE WHEN b.status = 'pending' THEN b."invoiceAmount" ELSE 0 END) as total_pending,
        SUM(CASE WHEN b.status = 'failed' THEN b."invoiceAmount" ELSE 0 END) as total_failed,
        SUM(CASE WHEN b.status = 'overdue' THEN b."invoiceAmount" ELSE 0 END) as total_overdue,
        AVG(b."invoiceAmount") as average_billing_amount,
        AVG(CASE WHEN b.status = 'paid' THEN b."invoiceAmount" END) as average_paid_amount
      FROM billings b
      WHERE 1=1 ${dateCondition} ${userCondition}
    `;

    const summary = await this.billingRepository.query(summaryQuery);

    return {
      period,
      timeline: billingTimeline.map(row => ({
        period: row.period || 'Total',
        totalBillings: parseInt(row.total_billings),
        paidBillings: parseInt(row.paid_billings),
        pendingBillings: parseInt(row.pending_billings),
        failedBillings: parseInt(row.failed_billings),
        overdueBillings: parseInt(row.overdue_billings),
        paidAmount: parseFloat(row.paid_amount) || 0,
        pendingAmount: parseFloat(row.pending_amount) || 0,
        failedAmount: parseFloat(row.failed_amount) || 0,
        overdueAmount: parseFloat(row.overdue_amount) || 0,
        averagePaidAmount: parseFloat(row.average_paid_amount) || 0,
        currency: row.currency,
        successRate: row.total_billings > 0 ? (row.paid_billings / row.total_billings) * 100 : 0
      })),
      statusDistribution: statusDistribution.map(row => ({
        status: row.status,
        count: parseInt(row.count),
        totalAmount: parseFloat(row.total_amount) || 0,
        averageAmount: parseFloat(row.average_amount) || 0,
        currency: row.currency
      })),
      typeDistribution: typeDistribution.map(row => ({
        type: row.type,
        count: parseInt(row.count),
        paidAmount: parseFloat(row.paid_amount) || 0,
        totalAmount: parseFloat(row.total_amount) || 0,
        averageAmount: parseFloat(row.average_amount) || 0,
        currency: row.currency
      })),
      currencyBreakdown: currencyBreakdown.map(row => ({
        currency: row.currency,
        totalBillings: parseInt(row.total_billings),
        paidCount: parseInt(row.paid_count),
        paidAmount: parseFloat(row.paid_amount) || 0,
        totalAmount: parseFloat(row.total_amount) || 0,
        averageAmount: parseFloat(row.average_amount) || 0,
        conversionRate: row.total_billings > 0 ? (row.paid_count / row.total_billings) * 100 : 0
      })),
      recentTrends: trends.map(row => ({
        date: row.date,
        dailyCount: parseInt(row.daily_count),
        dailyRevenue: parseFloat(row.daily_revenue) || 0
      })),
      paymentPerformance: paymentPerformance.map(row => ({
        paymentMethod: row.payment_method,
        totalCount: parseInt(row.total_count),
        successCount: parseInt(row.success_count),
        successAmount: parseFloat(row.success_amount) || 0,
        averageSuccessAmount: parseFloat(row.average_success_amount) || 0,
        successRate: row.total_count > 0 ? (row.success_count / row.total_count) * 100 : 0
      })),
      summary: summary[0] ? {
        totalBillings: parseInt(summary[0].total_billings),
        paidBillings: parseInt(summary[0].paid_billings),
        pendingBillings: parseInt(summary[0].pending_billings),
        failedBillings: parseInt(summary[0].failed_billings),
        overdueBillings: parseInt(summary[0].overdue_billings),
        totalPaid: parseFloat(summary[0].total_paid) || 0,
        totalPending: parseFloat(summary[0].total_pending) || 0,
        totalFailed: parseFloat(summary[0].total_failed) || 0,
        totalOverdue: parseFloat(summary[0].total_overdue) || 0,
        averageBillingAmount: parseFloat(summary[0].average_billing_amount) || 0,
        averagePaidAmount: parseFloat(summary[0].average_paid_amount) || 0,
        overallSuccessRate: summary[0].total_billings > 0 ? (summary[0].paid_billings / summary[0].total_billings) * 100 : 0
      } : null
    };
  }
}
