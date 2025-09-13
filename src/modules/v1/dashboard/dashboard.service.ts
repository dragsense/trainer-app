import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { Billing } from '../billings/entities/billing.entity';
import { Reminder } from '../reminders/entities/reminder.entity';
import { PaymentMethod } from '../settings/payment-methods/entities/payment-method.entity';
import { BillingStatus, BillingCurrency } from '../billings/enums/billing.enum';
import { SessionStatus } from '../sessions/enums/session.enum';
import { ReminderStatus } from '../reminders/enums/reminder.enum';
import { UserRole, UserLevels } from '../users/enums/user.enum';
import { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto';
import { AnalyticsPeriod } from './enums/dashboard-analytics.enum';
import { resolveDateRange } from '@/lib/date-range';

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
  ) { }

  async getDashboardStats(user: User, query: DashboardAnalyticsDto) {
    const { period, from, to } = query;
    const { start, end } = resolveDateRange(period, from, to);

    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];

    const dateFilter = { createdAt: Between(start, end) };

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
      paidBillings,
    ] = await Promise.all([
      // Clients
      this.userRepository.count({
        where: {
          ...(isAdmin
            ? { level: UserLevels[UserRole.USER] }
            : { owner: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Trainers (admin only)
      isAdmin
        ? this.userRepository.count({
          where: { level: UserLevels[UserRole.TRAINER], ...dateFilter },
        })
        : Promise.resolve(0),

      // Active Trainers (admin only)
      isAdmin
        ? this.userRepository.count({
          where: {
            level: UserLevels[UserRole.TRAINER],
            isActive: true,
            ...dateFilter,
          },
        })
        : Promise.resolve(0),

      // Active Clients
      this.userRepository.count({
        where: {
          ...(isAdmin
            ? { level: UserLevels[UserRole.USER], isActive: true }
            : { owner: { id: user.id }, isActive: true }),
          ...dateFilter,
        },
      }),

      // Sessions
      this.sessionRepository.count({
        where: {
          ...(isAdmin ? {} : { trainer: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Billings
      this.billingRepository.count({
        where: {
          ...(isAdmin ? {} : { user: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Reminders
      this.reminderRepository.count({
        where: {
          ...(isAdmin ? {} : { recipient: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Active Sessions
      this.sessionRepository.count({
        where: {
          status: SessionStatus.SCHEDULED,
          ...(isAdmin ? {} : { trainer: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Pending Billings
      this.billingRepository.count({
        where: {
          status: BillingStatus.PENDING,
          ...(isAdmin ? {} : { user: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Completed Sessions
      this.sessionRepository.count({
        where: {
          status: SessionStatus.COMPLETED,
          ...(isAdmin ? {} : { trainer: { id: user.id } }),
          ...dateFilter,
        },
      }),

      // Paid Billings
      this.billingRepository.count({
        where: {
          status: BillingStatus.PAID,
          ...(isAdmin ? {} : { user: { id: user.id } }),
          ...dateFilter,
        },
      }),
    ]);

    // Metrics
    const sessionCompletionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const paymentSuccessRate =
      totalBillings > 0 ? (paidBillings / totalBillings) * 100 : 0;

    return {
      period,
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
        paidBillings,
      },
      metrics: {
        sessionCompletionRate: Math.round(sessionCompletionRate * 100) / 100,
        paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
        averageSessionsPerClient:
          totalClients > 0
            ? Math.round((totalSessions / totalClients) * 100) / 100
            : 0,
      },
    };
  }


  async getSessionsAnalytics(user: User, query: DashboardAnalyticsDto,) {

    const { period, from, to } = query;
    const { start, end } = resolveDateRange(period, from, to);


    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const userCondition = isAdmin ? '' : `AND s."trainerId" = ${user.id}`;


    let groupBy = `DATE_TRUNC('month', s."dateTime")`;
    if (period === AnalyticsPeriod.DAY) groupBy = `DATE_TRUNC('day', s."dateTime")`;
    if (period === AnalyticsPeriod.WEEK) groupBy = `DATE_TRUNC('week', s."dateTime")`;
    if (period === AnalyticsPeriod.MONTH) groupBy = `DATE_TRUNC('month', s."dateTime")`;
    if (period === AnalyticsPeriod.YEAR) groupBy = `DATE_TRUNC('year', s."dateTime")`;

    // use BETWEEN $1 AND $2 and pass start/end (DB driver handles Date or ISO)
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
  WHERE s."dateTime" BETWEEN $1 AND $2 ${userCondition}
  GROUP BY ${groupBy}
  ORDER BY period DESC
`;

    const sessionStats = await this.sessionRepository.query(sessionStatsQuery, [start, end]);

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

  async getRemindersAnalytics(user: User, query: DashboardAnalyticsDto) {
    const { period, from, to } = query;
    const { start, end } = resolveDateRange(period, from, to);

    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const userCondition = isAdmin ? '' : `AND r."creatorId" = ${user.id}`;

    // Dynamic grouping by selected period
    const groupBy =
      period === AnalyticsPeriod.YEAR
        ? `DATE_TRUNC('year', r."createdAt")`
        : period === AnalyticsPeriod.MONTH
          ? `DATE_TRUNC('month', r."createdAt")`
          : period === AnalyticsPeriod.WEEK
            ? `DATE_TRUNC('week', r."createdAt")`
            : `DATE_TRUNC('day', r."createdAt")`;

    /** Timeline stats */
    const reminderStatsQuery = `
    SELECT 
      ${groupBy} as period,
      COUNT(*) as total_reminders,
      COUNT(CASE WHEN r.status = 'SENT' THEN 1 END) as sent_reminders,
      COUNT(CASE WHEN r.status = 'PENDING' THEN 1 END) as pending_reminders,
      COUNT(CASE WHEN r.status = 'FAILED' THEN 1 END) as failed_reminders
    FROM reminders r
    WHERE r."createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY ${groupBy}
    ORDER BY period ASC
  `;

    const reminderStats = await this.reminderRepository.query(reminderStatsQuery, [start, end]);

    /** Type distribution (within the same range) */
    const reminderTypeQuery = `
    SELECT 
      r.type,
      COUNT(*) as count,
      COUNT(CASE WHEN r.status = 'SENT' THEN 1 END) as successful_count
    FROM reminders r
    WHERE r."createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY r.type
    ORDER BY count DESC
  `;

    const reminderTypes = await this.reminderRepository.query(reminderTypeQuery, [start, end]);

    return {
      period,
      timeline: reminderStats.map((row) => ({
        period: row.period,
        totalReminders: parseInt(row.total_reminders),
        sentReminders: parseInt(row.sent_reminders),
        pendingReminders: parseInt(row.pending_reminders),
        failedReminders: parseInt(row.failed_reminders),
        successRate:
          row.total_reminders > 0
            ? (row.sent_reminders / row.total_reminders) * 100
            : 0,
      })),
      reminderTypes: reminderTypes.map((row) => ({
        type: row.type,
        count: parseInt(row.count),
        successfulCount: parseInt(row.successful_count),
        successRate:
          row.count > 0 ? (row.successful_count / row.count) * 100 : 0,
      })),
    };
  }


  async getBillingAnalytics(user: User, query: DashboardAnalyticsDto) {
    const { period, from, to } = query;
    const { start, end } = resolveDateRange(period, from, to);

    const isAdmin = user.level === UserLevels[UserRole.SUPER_ADMIN];
    const PLATFORM_FEE_PERCENTAGE = 0.02;
    const userCondition = isAdmin ? '' : `AND "creatorId" = ${user.id}`;

    /** 2. Revenue Stats */
    const revenueStats = await this.billingRepository.query(
      `
    SELECT
      SUM("invoiceAmount") as total_revenue,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" ELSE 0 END) as paid_revenue,
      SUM(CASE WHEN status = 'pending' THEN "invoiceAmount" ELSE 0 END) as pending_revenue,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" * ${PLATFORM_FEE_PERCENTAGE} ELSE 0 END) as platform_revenue,
      COUNT(*) as total_transactions
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    `,
      [start, end],
    );

    /** 3. Timeline (dynamic based on period) */
    const groupBy =
      period === AnalyticsPeriod.YEAR
        ? `DATE_TRUNC('year', "createdAt")`
        : period === AnalyticsPeriod.MONTH
          ? `DATE_TRUNC('month', "createdAt")`
          : period === AnalyticsPeriod.WEEK
            ? `DATE_TRUNC('week', "createdAt")`
            : `DATE_TRUNC('day', "createdAt")`;

    const timeline = await this.billingRepository.query(
      `
    SELECT 
      TO_CHAR(${groupBy}, 'YYYY-MM-DD') as bucket,
      SUM("invoiceAmount") as total,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" * ${PLATFORM_FEE_PERCENTAGE} ELSE 0 END) as platform_fee
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY bucket
    ORDER BY bucket ASC
    `,
      [start, end],
    );

    /** 4. Payment Methods */
    const paymentMethods = await this.billingRepository.query(
      `
    SELECT 
      CASE WHEN "stripeInvoiceId" IS NOT NULL THEN 'stripe' ELSE 'cash' END as method,
      COUNT(*) as count,
      SUM("invoiceAmount") as amount
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY method
    `,
      [start, end],
    );

    /** 5. Detailed Summary */
    const summary = await this.billingRepository.query(
      `
    SELECT
      COUNT(*) as total_billings,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_billings,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_billings,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_billings,
      SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_billings,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'pending' THEN "invoiceAmount" ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'failed' THEN "invoiceAmount" ELSE 0 END) as total_failed,
      SUM(CASE WHEN status = 'overdue' THEN "invoiceAmount" ELSE 0 END) as total_overdue,
      AVG("invoiceAmount") as average_billing_amount,
      AVG(CASE WHEN status = 'paid' THEN "invoiceAmount" END) as average_paid_amount
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    `,
      [start, end],
    );

    /** 6. Type Distribution */
    const typeDistribution = await this.billingRepository.query(
      `
    SELECT 
      "type" as type,
      COUNT(*) as count,
      SUM("invoiceAmount") as total_amount,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" ELSE 0 END) as paid_amount,
      AVG("invoiceAmount") as average_amount
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY type
    `,
      [start, end],
    );

    /** 7. Currency Breakdown */
    const currencyBreakdown = await this.billingRepository.query(
      `
    SELECT
      currency,
      COUNT(*) as total_billings,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN status = 'paid' THEN "invoiceAmount" ELSE 0 END) as paid_amount,
      SUM("invoiceAmount") as total_amount,
      AVG("invoiceAmount") as average_amount
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY currency
    `,
      [start, end],
    );

    return {
      period,
      revenue: {
        total: Number(revenueStats[0]?.total_revenue || 0),
        paid: Number(revenueStats[0]?.paid_revenue || 0),
        pending: Number(revenueStats[0]?.pending_revenue || 0),
        platform: Number(revenueStats[0]?.platform_revenue || 0),
        trainer:
          Number(revenueStats[0]?.paid_revenue || 0) -
          Number(revenueStats[0]?.platform_revenue || 0),
        transactions: Number(revenueStats[0]?.total_transactions || 0),
      },
      timeline: timeline.map((item) => ({
        bucket: item.bucket,
        total: Number(item.total),
        paid: Number(item.paid),
        platformFee: Number(item.platform_fee),
        trainerPayout: Number(item.paid) - Number(item.platform_fee),
      })),
      paymentMethods,
      summary: summary[0] || null,
      typeDistribution,
      currencyBreakdown,
    };
  }



}
