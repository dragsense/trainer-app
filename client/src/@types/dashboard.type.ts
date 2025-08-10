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

// Financial Summary
export interface IFinancialSummary {
  period: string;
  currentPeriod: {
    currency: string;
    totalRevenue: number;
    platformRevenue: number;
    trainerRevenue: number;
    pendingRevenue: number;
    paidTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    averageTransactionValue: number;
    growthRate: number;
    platformGrowthRate: number;
    previousPeriodRevenue: number;
    previousPlatformRevenue: number;
    successRate?: number; // Optional success rate percentage
    platformFeePercentage: number; // Always 2% in our case
  }[];
}

// Billing Analytics
export interface IBillingAnalytics {
  period: string;
  timeline: {
    period: string;
    totalBillings: number;
    paidBillings: number;
    pendingBillings: number;
    failedBillings: number;
    overdueBillings: number;
    paidAmount: number;
    pendingAmount: number;
    failedAmount: number;
    overdueAmount: number;
    averagePaidAmount: number;
    currency: string;
    successRate: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
    currency: string;
  }[];
  typeDistribution: {
    type: string;
    count: number;
    paidAmount: number;
    totalAmount: number;
    averageAmount: number;
    currency: string;
  }[];
  currencyBreakdown: {
    currency: string;
    totalBillings: number;
    paidCount: number;
    paidAmount: number;
    totalAmount: number;
    averageAmount: number;
    conversionRate: number;
  }[];
  recentTrends: {
    date: string;
    dailyCount: number;
    dailyRevenue: number;
  }[];
  paymentPerformance: {
    paymentMethod: string;
    totalCount: number;
    successCount: number;
    successAmount: number;
    averageSuccessAmount: number;
    successRate: number;
  }[];
  summary: {
    totalBillings: number;
    paidBillings: number;
    pendingBillings: number;
    failedBillings: number;
    overdueBillings: number;
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    totalOverdue: number;
    averageBillingAmount: number;
    averagePaidAmount: number;
    overallSuccessRate: number;
  } | null;
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
  financial: IFinancialSummary;
  billing: IBillingAnalytics;
}
