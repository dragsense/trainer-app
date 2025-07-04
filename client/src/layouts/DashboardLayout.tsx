// React & Hooks
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// External Libraries
import { Outlet } from "react-router-dom";

// Types
import { AuthUser } from "@/@types/auth.type";

// Config
import { ADMIN_ROUTES } from "@/config/routes.config";

// Hooks
import { useAuth } from "@/hooks/use-auth";

// Layout Components
import { AppSidebar } from "@/components/layout-ui/app-sidebar";
import { AppHeader } from "@/components/layout-ui/app-header";

// Utilities
import { matchRoutePath } from "@/lib/utils";

// UI Components
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Assets
import logo from "@/assets/logos/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
  user: AuthUser;
}

const ROUTE_TITLES: Record<string, string> = {
};

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
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

    return "Dashboard";
  };

  const title = getRouteTitle();

  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        logoSrc={logo}
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
        <AppHeader title={title} user={user} />
       
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayoutWrapper() {
  const { user } = useAuth();

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <DashboardLayout user={user as AuthUser}>
      <Outlet />
    </DashboardLayout>
  );
}
