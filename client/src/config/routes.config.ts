export const ROOT_ROUTE = "/";
export type RootRoute = keyof typeof ROOT_ROUTE;
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password"
} as const;
export type PublicRoute = keyof typeof PUBLIC_ROUTES;
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  TRAINERS: "/trainers",
  CLIENTS: "/clients",
  SESSIONS: "/sessions",
  REMINDERS: "/reminders",
  BILLINGS: "/billings",
} as const;

export type AdminRoute = keyof typeof ADMIN_ROUTES;
export const COMMON_ROUTES = {
  NOT_FOUND: "*",
} as const;
export type CommonRoute = keyof typeof COMMON_ROUTES;
