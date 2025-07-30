import { Clock, LayoutDashboard, LucideIcon, User2, UserCheck } from "lucide-react";
import { ADMIN_ROUTES } from "./routes.config";



export const navItems: {
    title: string;
    icon?: LucideIcon;
    urls: string[];
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
            title: "Sessions",
            urls: [ADMIN_ROUTES.SESSIONS],
            icon: User2,
        },
        {
            title: "Reminders",
            urls: [ADMIN_ROUTES.REMINDERS],
            icon: Clock,
        },

    ];