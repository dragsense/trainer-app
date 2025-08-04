import { Banknote, Clock, LayoutDashboard, LucideIcon, Settings, User2, UserCheck, TrendingUp, Calendar, CreditCard, Users, Gift } from "lucide-react";
import { ADMIN_ROUTES } from "./routes.config";

export const navItems: {
    title: string;
    icon?: LucideIcon;
    urls: string[];
    children?: {
        title: string;
        icon?: LucideIcon;
        url: string;
    }[];
}[] = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            urls: [
                ADMIN_ROUTES.DASHBOARD,
                ADMIN_ROUTES.DASHBOARD_REVENUE,
                ADMIN_ROUTES.DASHBOARD_SESSIONS,
                ADMIN_ROUTES.DASHBOARD_PAYMENTS,
                ADMIN_ROUTES.DASHBOARD_BILLING,
            ],
            children: [
                {
                    title: "Overview",
                    url: ADMIN_ROUTES.DASHBOARD,
                },
                {
                    title: "Revenue Analytics",
                    icon: TrendingUp,
                    url: ADMIN_ROUTES.DASHBOARD_REVENUE,
                },
                {
                    title: "Session Analytics",
                    icon: Calendar,
                    url: ADMIN_ROUTES.DASHBOARD_SESSIONS,
                },
                {
                    title: "Payment Analytics",
                    icon: CreditCard,
                    url: ADMIN_ROUTES.DASHBOARD_PAYMENTS,
                },
                {
                    title: "Billing Analytics",
                    icon: Banknote,
                    url: ADMIN_ROUTES.DASHBOARD_BILLING,
                }
            ]
        },
        {
            title: "Trainers",
            urls: [ADMIN_ROUTES.TRAINERS],
            icon: UserCheck,
        },
        {
            title: "Clients",
            urls: [ADMIN_ROUTES.CLIENTS],
            icon: User2,
        },
        {
            title: "Trainer-Clients",
            urls: [ADMIN_ROUTES.TRAINER_CLIENTS],
            icon: Users,
        },
        {
            title: "Sessions",
            urls: [ADMIN_ROUTES.SESSIONS],
            icon: User2,
        },
         {
            title: "Billings",
            urls: [ADMIN_ROUTES.BILLINGS],
            icon: Banknote,
        },
      
        {
            title: "Reminders",
            urls: [ADMIN_ROUTES.REMINDERS],
            icon: Clock,
        },
        {
            title: "Settings",
            urls: [
                ADMIN_ROUTES.SETTINGS,
                ADMIN_ROUTES.SETTINGS_PROFILE,
                ADMIN_ROUTES.SETTINGS_NOTIFICATIONS,
                ADMIN_ROUTES.SETTINGS_APP,
                ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS,
                ADMIN_ROUTES.SETTINGS_SECURITY,
                ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT,
            ],
            icon: Settings,
            children: [
                {
                    title: "Profile",
                    url: ADMIN_ROUTES.SETTINGS_PROFILE,
                },
                {
                    title: "Notifications",
                    url: ADMIN_ROUTES.SETTINGS_NOTIFICATIONS,
                },
                {
                    title: "App Settings",
                    url: ADMIN_ROUTES.SETTINGS_APP,
                },
                {
                    title: "Payment Methods",
                    url: ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS,
                },
                {
                    title: "Security",
                    url: ADMIN_ROUTES.SETTINGS_SECURITY,
                },
                {
                    title: "Stripe Connect",
                    url: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT,
                },
            
            ]
        }
    ];