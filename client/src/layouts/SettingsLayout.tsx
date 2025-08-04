import { Outlet, NavLink, useLocation } from "react-router-dom";
import { User, Bell, Settings, CreditCard, Shield, Clock, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_ROUTES } from "@/config/routes.config";

const settingsNavItems = [
    {
        title: "Profile",
        href: ADMIN_ROUTES.SETTINGS_PROFILE,
        icon: User,
        description: "Manage your personal information"
    },
     {
        title: "User Availability",
        href: ADMIN_ROUTES.SETTINGS_AVAILABILITY,
        icon: Clock,
        description: "Application availability settings"
    },
    {
        title: "App Settings",
        href: ADMIN_ROUTES.SETTINGS_APP,
        icon: Settings,
        description: "Application preferences"
    },
    {
        title: "Notifications",
        href: ADMIN_ROUTES.SETTINGS_NOTIFICATIONS,
        icon: Bell,
        description: "Configure notification preferences"
    },
    {
        title: "Payment Methods",
        href: ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS,
        icon: CreditCard,
        description: "Manage payment options"
    },
    {
        title: "Security",
        href: ADMIN_ROUTES.SETTINGS_SECURITY,
        icon: Shield,
        description: "Security and privacy settings"
    },
    {
        title: "Stripe Connect",
        href: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT,
        icon: Link,
        description: "Connect your Stripe account"
    }
];

export default function SettingsLayout() {
    const location = useLocation();

    return (
        <div className="flex min-h-screen">
            {/* Settings Sidebar */}
            <div className="w-64 shadow-sm border-r">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-semibold">Settings</h1>
                    <p className="text-sm  mt-1">
                        Manage your account settings and preferences
                    </p>
                </div>

                <nav className="p-4 space-y-2">
                    {settingsNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10"
                                        : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <div>
                                    <div>{item.title}</div>
                                    <div className="text-xs mt-0.5">
                                        {item.description}
                                    </div>
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
