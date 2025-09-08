import { ADMIN_ROUTES } from "@/config/routes.config";
import {
  DashboardPage,
  TrainersPage,
  ClientsPage,
  TrainerClientsPage,
  SessionsPage,
  RemindersPage,
  ProfilePage,
  NotificationsPage,
  AppSettingsPage,
  PaymentMethodsPage,
  SecurityPage,
  StripeConnectPage,
  BillingInvoicesPage,
  BillingTransactionsPage,
  BillingPage,
  BillingsPage
} from ".";
import { SettingsLayout } from "@/layouts";
import AvailabilityPage from "./settings/availability";

const adminRoutes = [
  {
    path: ADMIN_ROUTES.DASHBOARD,
    element: <DashboardPage />,
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
    element: <BillingPage />,
    children: [
      { index: true, element: <BillingsPage /> },

      {
        path: ADMIN_ROUTES.STRIPE_INVOICES,
        element: <BillingInvoicesPage />,

      },
      {
        path: ADMIN_ROUTES.STRIPE_TRANSACTIONS,
        element: <BillingTransactionsPage />,

      },
    ]
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
        path: ADMIN_ROUTES.SETTINGS_AVAILABILITY,
        element: <AvailabilityPage />,
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
      {
        path: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT,
        element: <StripeConnectPage />,
      },

    ],
  },
];

export default adminRoutes;
