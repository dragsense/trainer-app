// Dashboard Statistics Overview
export interface IDashboardStats {
  overview: {
    totalClients: number;
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
export interface IDashboardRevenue {
  period: string;
  revenueData: {
    period: string;
    transactionCount: number;
    totalRevenue: number;
    pendingRevenue: number;
    averageTransaction: number;
    currency: string;
  }[];
  summary: {
    totalPaid: number;
    totalPending: number;
    totalTransactions: number;
    currency: string;
  }[];
}

// Payment Methods Overview
export interface IPaymentMethodsOverview {
  paymentMethods: {
    id: number;
    name: string;
    key: string;
    isEnabled: boolean;
    configSchema: Record<string, any>;
  }[];
  statistics: {
    paymentMethod: string;
    isEnabled: boolean;
    usageCount: number;
    totalRevenue: number;
  }[];
}

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

// Clients Overview
export interface IClientsOverview {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientGrowth: {
    period: string;
    newClients: number;
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
    pendingRevenue: number;
    paidTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    averageTransactionValue: number;
    growthRate: number;
    previousPeriodRevenue: number;
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
