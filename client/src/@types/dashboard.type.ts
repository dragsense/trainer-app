// Dashboard Statistics Overview
export interface IDashboardStats {
  overview: {
    totalClients: number;
    totalTrainers: number;
    totalActiveTrainers: number;
    totalActiveClients: number;
    totalSessions: number;
    totalBillings: number;
    totalReminders: number;
    activeSessions: number;
    pendingBillings: number;
    completedSessions: number;
    paidBillings: number;
  };
  metrics: {
    sessionCompletionRate: number;
    paymentSuccessRate: number;
    averageSessionsPerClient: number;
  };
}

// Revenue Analytics


// Sessions Analytics
export interface ISessionsAnalytics {
  period: string;
  timeline: {
    period: string;
    totalSessions: number;
    completedSessions: number;
    scheduledSessions: number;
    cancelledSessions: number;
    averagePrice: number;
    totalPotentialRevenue: number;
    completionRate: number;
  }[];
  sessionTypes: {
    type: string;
    count: number;
    averagePrice: number;
  }[];
}


// Reminders Analytics
export interface IRemindersAnalytics {
  timeline: {
    period: string;
    totalReminders: number;
    sentReminders: number;
    pendingReminders: number;
    failedReminders: number;
    successRate: number;
  }[];
  reminderTypes: {
    type: string;
    count: number;
    successfulCount: number;
    successRate: number;
  }[];
}




export interface RevenueStats {
  total: number;
  paid: number;
  pending: number;
  platform: number;
  trainer: number;
  transactions: number;
}

export interface TimelineItem {
  month: string;
  total: number;
  paid: number;
  platformFee: number;
  trainerPayout: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
}

export interface SummaryStats {
  total_billings: number;
  paid_billings: number;
  pending_billings: number;
  failed_billings: number;
  overdue_billings: number;
  total_paid: number;
  total_pending: number;
  total_failed: number;
  total_overdue: number;
  average_billing_amount: number;
  average_paid_amount: number;
}




export interface TypeDistributionItem {
  type: string;
  count: number;
  total_amount: number;
  paid_amount: number;
  average_amount: number;
}

export interface CurrencyBreakdownItem {
  currency: string;
  total_billings: number;
  paid_count: number;
  paid_amount: number;
  total_amount: number;
  average_amount: number;
}


export interface IBillingAnalytics {
  period: string;
  revenue: RevenueStats;
  timeline: TimelineItem[];
  paymentMethods: PaymentMethodBreakdown[];
  summary: SummaryStats;
  typeDistribution: TypeDistributionItem[];
  currencyBreakdown: CurrencyBreakdownItem[];
}
// Chart Data Types for frontend usage
export interface IChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ILineChartData {
  name: string;
  data: {
    x: string;
    y: number;
  }[];
}

export interface IBarChartData {
  name: string;
  value: number;
  fill?: string;
}

// Combined Dashboard Data Interface
export interface ICombinedDashboardData {
  stats: IDashboardStats;
  reminders: IRemindersAnalytics;
  sessions: ISessionsAnalytics;
  billing: IBillingAnalytics;
}




