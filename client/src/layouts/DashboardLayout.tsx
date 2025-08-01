// React & Hooks
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// External Libraries
import { Outlet } from "react-router-dom";

// Config
import { ADMIN_ROUTES } from "@/config/routes.config";


// Layout Components
import { AppSidebar } from "@/components/layout-ui/app-sidebar";
import { AppHeader } from "@/components/layout-ui/app-header";

// Utilities
import { matchRoutePath } from "@/lib/utils";

// UI Components
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";



interface DashboardLayoutProps {
  children: ReactNode;
}

const ROUTE_TITLES: Record<string, string> = {
  [ADMIN_ROUTES.DASHBOARD]: "Dashboard",
  [ADMIN_ROUTES.TRAINERS]: "Trainers",
  [ADMIN_ROUTES.CLIENTS]: "Clients",
  [ADMIN_ROUTES.SESSIONS]: "Sessions",
  [ADMIN_ROUTES.REMINDERS]: "Reminders",
  [ADMIN_ROUTES.BILLINGS]: "Billings",
  [ADMIN_ROUTES.SETTINGS]: "Settings",
  [ADMIN_ROUTES.SETTINGS_PROFILE]: "Settings | Profile",
  [ADMIN_ROUTES.SETTINGS_NOTIFICATIONS]: "Settings | Notifications",
  [ADMIN_ROUTES.SETTINGS_APP]: "Settings | App Settings",
  [ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS]: "Settings | Payment Methods",
  [ADMIN_ROUTES.SETTINGS_SECURITY]: "Settings | Security",
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();


  const getRouteTitle = () => {
    if (ROUTE_TITLES[location.pathname]) {
      return ROUTE_TITLES[location.pathname];
    }

    for (const [pattern, title] of Object.entries(ROUTE_TITLES)) {
      if (pattern.includes(":") && matchRoutePath(pattern, location.pathname)) {
        return title;
      }
    }

    return "Unknown Page";
  };

  const title = getRouteTitle();

  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        className="p-0"
        themeClass="dark"
      />
      <SidebarInset
        className="light w-100"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <AppHeader title={title} />
        <div className="flex flex-1 flex-col p-4 lg:px-6">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayoutWrapper() {

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
