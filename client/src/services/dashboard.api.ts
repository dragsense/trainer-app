// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IDashboardStats, IDashboardRevenue, IPaymentMethodsOverview, ISessionsAnalytics, IClientsOverview, IRemindersAnalytics, IFinancialSummary, IBillingAnalytics } from "@/@types/dashboard.type";

// Constants
const DASHBOARD_API_PATH = "/dashboard";

// Dashboard Statistics
export const fetchDashboardStats = (): Promise<IDashboardStats> =>
  apiRequest(`${DASHBOARD_API_PATH}/stats`, "GET");

// Revenue Analytics
export const fetchRevenueAnalytics = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
  date?: string;
}): Promise<IDashboardRevenue> => {
  const queryParams = new URLSearchParams();
  
  if (params?.period) queryParams.append("period", params.period);
  if (params?.date) queryParams.append("date", params.date);

  const queryString = queryParams.toString();
  return apiRequest(`${DASHBOARD_API_PATH}/revenue${queryString ? `?${queryString}` : ''}`, "GET");
};

// Payment Methods Overview
export const fetchPaymentMethodsOverview = (): Promise<IPaymentMethodsOverview> =>
  apiRequest(`${DASHBOARD_API_PATH}/payments/overview`, "GET");

// Sessions Analytics
export const fetchSessionsAnalytics = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<ISessionsAnalytics> => {
  const queryParams = params?.period ? `?period=${params.period}` : '';
  return apiRequest(`${DASHBOARD_API_PATH}/sessions/analytics${queryParams}`, "GET");
};

// Clients Overview
export const fetchClientsOverview = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<IClientsOverview> => {
  const queryParams = params?.period ? `?period=${params.period}` : '';
  return apiRequest(`${DASHBOARD_API_PATH}/clients/overview${queryParams}`, "GET");
};

// Reminders Analytics
export const fetchRemindersAnalytics = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<IRemindersAnalytics> => {
  const queryParams = params?.period ? `?period=${params.period}` : '';
  return apiRequest(`${DASHBOARD_API_PATH}/reminders/analytics${queryParams}`, "GET");
};

// Financial Summary
export const fetchFinancialSummary = (params?: {
  period?: 'day' | 'week' | 'month' | 'year';
}): Promise<IFinancialSummary> => {
  const queryParams = params?.period ? `?period=${params.period}` : '';
  return apiRequest(`${DASHBOARD_API_PATH}/financial/summary${queryParams}`, "GET");
};

// Billing Analytics
export const fetchBillingAnalytics = (params?: {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
}): Promise<IBillingAnalytics> => {
  const queryParams = new URLSearchParams();
  
  if (params?.period) queryParams.append("period", params.period);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);

  const queryString = queryParams.toString();
  return apiRequest(`${DASHBOARD_API_PATH}/billing/analytics${queryString ? `?${queryString}` : ''}`, "GET");
};

// Export dashboard API object for easier imports
export const dashboardApi = {
  getStats: fetchDashboardStats,
  getRevenueAnalytics: fetchRevenueAnalytics,
  getPaymentMethodsOverview: fetchPaymentMethodsOverview,
  getSessionsAnalytics: fetchSessionsAnalytics,
  getClientsOverview: fetchClientsOverview,
  getRemindersAnalytics: fetchRemindersAnalytics,
  getFinancialSummary: fetchFinancialSummary,
  getBillingAnalytics: fetchBillingAnalytics,
};
