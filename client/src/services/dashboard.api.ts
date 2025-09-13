// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IDashboardStats, ISessionsAnalytics, IRemindersAnalytics, IBillingAnalytics, ICombinedDashboardData } from "@/@types/dashboard.type";
import { TQueryParams } from "@/@types/api/param.type";
import { generateQueryParams } from "@/utils";

// Constants
const DASHBOARD_API_PATH = "/dashboard";

// Dashboard Statistics
export const fetchDashboardStats = (): Promise<IDashboardStats> =>
  apiRequest(`${DASHBOARD_API_PATH}/stats`, "GET");

// Sessions Analytics
export const fetchSessionsAnalytics = (params: TQueryParams): Promise<ISessionsAnalytics> => {
  const queryParams = new URLSearchParams();

  generateQueryParams(queryParams, params);

  return apiRequest(`${DASHBOARD_API_PATH}/sessions/analytics?${queryParams.toString()}`, "GET");
};


// Reminders Analytics
export const fetchRemindersAnalytics = (params: TQueryParams): Promise<IRemindersAnalytics> => {
  const queryParams = new URLSearchParams();

  generateQueryParams(queryParams, params);


  return apiRequest(`${DASHBOARD_API_PATH}/reminders/analytics?${queryParams.toString()}`, "GET");
};


// Billing Analytics
export const fetchBillingAnalytics = (params: TQueryParams): Promise<IBillingAnalytics> => {
  const queryParams = new URLSearchParams();

  generateQueryParams(queryParams, params);


  return apiRequest(`${DASHBOARD_API_PATH}/billing/analytics?${queryParams.toString()}`, "GET");
};

// Combined dashboard query function
export const fetchCombinedDashboardData = async (params: TQueryParams): Promise<ICombinedDashboardData> => {

  const [
    stats,
    reminders,
    sessions,
    billing
  ] = await Promise.all([
    fetchDashboardStats(),
    fetchRemindersAnalytics(params),
    fetchSessionsAnalytics(params),
    fetchBillingAnalytics(params)
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
