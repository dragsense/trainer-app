// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IDashboardStats, ISessionsAnalytics, IRemindersAnalytics, IBillingAnalytics, ICombinedDashboardData } from "@/@types/dashboard.type";

// Constants
const DASHBOARD_API_PATH = "/dashboard";

// Dashboard Statistics
export const fetchDashboardStats = (): Promise<IDashboardStats> =>
  apiRequest(`${DASHBOARD_API_PATH}/stats`, "GET");

// Sessions Analytics
export const fetchSessionsAnalytics = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<ISessionsAnalytics> => {
  const queryParams = params?.period ? `?period=${params.period}` : '';
  return apiRequest(`${DASHBOARD_API_PATH}/sessions/analytics${queryParams}`, "GET");
};


// Reminders Analytics
export const fetchRemindersAnalytics = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<IRemindersAnalytics> => {
  const queryParams = params?.period ? `?period=${params.period}` : '';
  return apiRequest(`${DASHBOARD_API_PATH}/reminders/analytics${queryParams}`, "GET");
};


// Billing Analytics
export const fetchBillingAnalytics = (params?: {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}): Promise<IBillingAnalytics> => {
  const queryParams = new URLSearchParams();

  if (params?.period) queryParams.append("period", params.period);

  const queryString = queryParams.toString();
  return apiRequest(`${DASHBOARD_API_PATH}/billing/analytics${queryString ? `?${queryString}` : ''}`, "GET");
};

// Combined dashboard query function
export const fetchCombinedDashboardData = async (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
  date?: string;
}): Promise<ICombinedDashboardData> => {
  const { period = 'month' } = params || {};

  const [
    stats,
    reminders,
    sessions,
    billing
  ] = await Promise.all([
    fetchDashboardStats(),
    fetchRemindersAnalytics({ period }),
    fetchSessionsAnalytics({ period }),
    fetchBillingAnalytics({
      period: period === 'day' ? 'daily' : period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'yearly'
    })
  ]);

  return {
    stats,
    reminders,
    sessions,
    billing
  };
};


// Export dashboard API object for easier imports
export const dashboardApi = {
  getStats: fetchDashboardStats,
  getSessionsAnalytics: fetchSessionsAnalytics,
  getRemindersAnalytics: fetchRemindersAnalytics,
  getBillingAnalytics: fetchBillingAnalytics,
  getCombinedData: fetchCombinedDashboardData,
};
