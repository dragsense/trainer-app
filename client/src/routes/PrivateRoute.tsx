// React & Hooks
import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Custom Hooks
import { useAuthUser } from "@/hooks/use-auth-user";

// Config
import { CLIENT_ROUTES, COMMON_ROUTES, PUBLIC_ROUTES, ROOT_ROUTE, TRAINER_ROUTES } from "@/config/routes.config";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";

// Layout Components
import { AppLoader } from "@/components/layout-ui/app-loader";

export default function PrivateRoute() {
  const { user, isLoading } = useAuthUser();
  const location = useLocation();

  if (isLoading) return <AppLoader />;

  if (!user) {
    return (
      <Navigate to={PUBLIC_ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }


  if (location.pathname !== ROOT_ROUTE) {
    if (user.level === UserLevels[UserRole.TRAINER]) {
      const isTrainerRoute = (
        Object.values(TRAINER_ROUTES) as readonly string[]
      ).includes(location.pathname);

      if (!isTrainerRoute) {
        return <Navigate to={COMMON_ROUTES.UNAUTHORIZED} replace />;

      }
    } else {
      if (user.level === UserLevels[UserRole.USER]) {
        const isClientRoute = (
          Object.values(CLIENT_ROUTES) as readonly string[]
        ).includes(location.pathname);

        if (!isClientRoute) {
          return <Navigate to={COMMON_ROUTES.UNAUTHORIZED} replace />;

        }
      }

    }
  }

  return (
    <Suspense fallback={<AppLoader />}>
      <Outlet />
    </Suspense>
  );
}
