// React & Routing
import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";

// Custom Hooks
import { useAuth } from "@/hooks/use-auth";

// Config
import { ADMIN_ROUTES } from "@/config/routes.config";

// Layout Components
import { AppLoader } from "@/components/layout-ui/app-loader";


export default function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <AppLoader />;

    if (user) {
    return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />;
  }  

  return (
    <Suspense fallback={<AppLoader />}>
      <Outlet />
    </Suspense>
  );
} 
