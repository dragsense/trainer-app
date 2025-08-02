import { ADMIN_ROUTES } from "@/config/routes.config";
import { 
  DashboardPage, 
  RevenueAnalyticsPage,
  SessionAnalyticsPage,
  PaymentAnalyticsPage,
  BillingAnalyticsPage,
  TrainersPage, 
  ClientsPage, 
  TrainerClientsPage,
  SessionsPage, 
  RemindersPage, 
  BillingsPage, 
  ProfilePage,  
  NotificationsPage, 
  AppSettingsPage, 
  PaymentMethodsPage, 
  SecurityPage 
} from ".";
import { SettingsLayout } from "@/layouts";

const adminRoutes = [
  {
    path: ADMIN_ROUTES.DASHBOARD,
    element: <DashboardPage />,
  },
  {
    path: ADMIN_ROUTES.DASHBOARD_REVENUE,
    element: <RevenueAnalyticsPage />,
  },
  {
    path: ADMIN_ROUTES.DASHBOARD_SESSIONS,
    element: <SessionAnalyticsPage />,
  },
  {
    path: ADMIN_ROUTES.DASHBOARD_PAYMENTS,
    element: <PaymentAnalyticsPage />,
  },
  {
    path: ADMIN_ROUTES.DASHBOARD_BILLING,
    element: <BillingAnalyticsPage />,
  },
  {
    path: ADMIN_ROUTES.TRAINERS,
    element: <TrainersPage />,
  },
  {
    path: ADMIN_ROUTES.CLIENTS,
    element: <ClientsPage />,
  },
  {
    path: ADMIN_ROUTES.TRAINER_CLIENTS,
    element: <TrainerClientsPage />,
  },
  {
    path: ADMIN_ROUTES.SESSIONS,
    element: <SessionsPage />,
  },
  {
    path: ADMIN_ROUTES.REMINDERS,
    element: <RemindersPage />,
  },
  {
    path: ADMIN_ROUTES.BILLINGS,
    element: <BillingsPage />,
  },
  {
    path: ADMIN_ROUTES.SETTINGS,
    element: <SettingsLayout />,
    children: [
      {
        path: ADMIN_ROUTES.SETTINGS_PROFILE,
        element: <ProfilePage />,
      },
      {
        path: ADMIN_ROUTES.SETTINGS_NOTIFICATIONS,
        element: <NotificationsPage />,
      },
      {
        path: ADMIN_ROUTES.SETTINGS_APP,
        element: <AppSettingsPage />,
      },
      {
        path: ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS,
        element: <PaymentMethodsPage />,
      },
      {
        path: ADMIN_ROUTES.SETTINGS_SECURITY,
        element: <SecurityPage />,
      },
    ],
  },
];

export default adminRoutes;
