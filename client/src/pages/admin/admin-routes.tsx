import { ADMIN_ROUTES } from "@/config/routes.config";
import { DashboardPage, TrainersPage, ClientsPage, SessionsPage, RemindersPage, BillingsPage } from ".";


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
];

export default adminRoutes;
