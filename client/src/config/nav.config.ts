import { Banknote, Clock, LayoutDashboard, LucideIcon, Settings, User2, UserCheck, Calendar, Users, User, Mail, Shield, CreditCard, Clock3 } from "lucide-react";
import { ADMIN_ROUTES } from "./routes.config";

// Separate settings configuration object
export const settingsConfig = {
    title: "Settings",
    urls: [
        ADMIN_ROUTES.SETTINGS,
        ADMIN_ROUTES.SETTINGS_PROFILE,
        ADMIN_ROUTES.SETTINGS_AVAILABILITY,
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
            icon: User,
        },
        {
            title: "Availability",
            url: ADMIN_ROUTES.SETTINGS_AVAILABILITY,
            icon: Clock3,
        },
        {
            title: "App Settings",
            url: ADMIN_ROUTES.SETTINGS_APP,
            icon: Settings,
        },
        {
            title: "Notifications",
            url: ADMIN_ROUTES.SETTINGS_NOTIFICATIONS,
            icon: Mail,
        },
        {
            title: "Payment Methods",
            url: ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS,
            icon: CreditCard,
        },
        {
            title: "Security",
            url: ADMIN_ROUTES.SETTINGS_SECURITY,
            icon: Shield,
        },
        {
            title: "Stripe Connect",
            url: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT,
            icon: Settings,
        },
    ]
};

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
            ],
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
            icon: Calendar,
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
        
    ];


