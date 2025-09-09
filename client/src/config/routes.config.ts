// Common base routes
export const ROOT_ROUTE = "/" as const;
export type RootRoute = typeof ROOT_ROUTE;

// Public routes
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;
export type PublicRoute = keyof typeof PUBLIC_ROUTES;

// Shared settings routes
const SETTINGS_ROUTES = {
  SETTINGS: "/settings",
  SETTINGS_PROFILE: "/settings/profile",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_APP: "/settings/app",
  SETTINGS_SECURITY: "/settings/security",
  SETTINGS_AVAILABILITY: "/settings/availability",
} as const;

// Shared billing routes
const BILLING_ROUTES = {
  BILLINGS: "/billings",
  STRIPE_INVOICES: "/billings/stripe-invoices",
  STRIPE_TRANSACTIONS: "/billings/stripe-transactions", // Admin only
} as const;

// Admin-specific routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  TRAINERS: "/trainers",
  CLIENTS: "/clients",
  TRAINER_CLIENTS: "/trainer-clients",
  SESSIONS: "/sessions",
  REMINDERS: "/reminders",
  SETTINGS_PAYMENT_METHODS: "/settings/payment-methods",
  SETTINGS_STRIPE_CONNECT: "/settings/stripe-connect",

  ...BILLING_ROUTES,
  ...SETTINGS_ROUTES,
} as const;
export type AdminRoute = keyof typeof ADMIN_ROUTES;

// Trainer-specific routes (subset of admin)
export const TRAINER_ROUTES = {
  DASHBOARD: "/dashboard",
  CLIENTS: "/clients",
  SESSIONS: "/sessions",
  REMINDERS: "/reminders",
  BILLINGS: BILLING_ROUTES.BILLINGS,
  STRIPE_INVOICES: BILLING_ROUTES.STRIPE_INVOICES,
  STRIPE_TRANSACTIONS: BILLING_ROUTES.STRIPE_TRANSACTIONS,
  SETTINGS_STRIPE_CONNECT: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT,

  ...SETTINGS_ROUTES,
} as const;
export type TrainerRoute = keyof typeof TRAINER_ROUTES;


// Trainer-specific routes (subset of admin)
export const CLIENT_ROUTES = {
  DASHBOARD: "/dashboard",
  SESSIONS: "/sessions",
  BILLINGS: BILLING_ROUTES.BILLINGS,
  STRIPE_TRANSACTIONS: BILLING_ROUTES.STRIPE_TRANSACTIONS,

  STRIPE_INVOICES: BILLING_ROUTES.STRIPE_INVOICES,
  ...SETTINGS_ROUTES,
} as const;
export type ClientRoute = keyof typeof CLIENT_ROUTES;

// Common routes
export const COMMON_ROUTES = {
  NOT_FOUND: "*",
  UNAUTHORIZED: "/unauthorized",
} as const;
export type CommonRoute = keyof typeof COMMON_ROUTES;



export const ROUTE_TITLES: Record<string, string> = {
    [ADMIN_ROUTES.DASHBOARD]: "Dashboard",
    [ADMIN_ROUTES.TRAINERS]: "Trainers",
    [ADMIN_ROUTES.CLIENTS]: "Clients",
    [ADMIN_ROUTES.TRAINER_CLIENTS]: "Trainer Clients",
    [ADMIN_ROUTES.SESSIONS]: "Sessions",
    [ADMIN_ROUTES.REMINDERS]: "Reminders",
    [ADMIN_ROUTES.BILLINGS]: "Billings",
    [ADMIN_ROUTES.STRIPE_INVOICES]: "Billings",
    [ADMIN_ROUTES.STRIPE_TRANSACTIONS]: "Billings",
    [ADMIN_ROUTES.SETTINGS]: "Settings",
    [ADMIN_ROUTES.SETTINGS_PROFILE]: "Settings | Profile",
    [ADMIN_ROUTES.SETTINGS_NOTIFICATIONS]: "Settings | Notifications",
    [ADMIN_ROUTES.SETTINGS_APP]: "Settings | App Settings",
    [ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS]: "Settings | Payment Methods",
    [ADMIN_ROUTES.SETTINGS_AVAILABILITY]: "Settings | Availability",
    [ADMIN_ROUTES.SETTINGS_SECURITY]: "Settings | Security",
    [ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT]: "Settings | Stripe Connect",

};