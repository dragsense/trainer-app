import { Outlet, NavLink, useLocation } from "react-router-dom";
import { User, Bell, Settings, CreditCard, Shield, Clock, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_ROUTES } from "@/config/routes.config";
import { SettingsMobileNav } from "@/components/layout-ui/settings-mobile-nav";

const settingsNavItems = [
    { title: "Profile", href: ADMIN_ROUTES.SETTINGS_PROFILE, icon: User, description: "Manage your personal information" },
    { title: "User Availability", href: ADMIN_ROUTES.SETTINGS_AVAILABILITY, icon: Clock, description: "Application availability settings" },
    { title: "App Settings", href: ADMIN_ROUTES.SETTINGS_APP, icon: Settings, description: "Application preferences" },
    { title: "Notifications", href: ADMIN_ROUTES.SETTINGS_NOTIFICATIONS, icon: Bell, description: "Configure notification preferences" },
    { title: "Payment Methods", href: ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS, icon: CreditCard, description: "Manage payment options" },
    { title: "Security", href: ADMIN_ROUTES.SETTINGS_SECURITY, icon: Shield, description: "Security and privacy settings" },
    { title: "Stripe Connect", href: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT, icon: LinkIcon, description: "Connect your Stripe account" }
];

export default function SettingsLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col gap-2 min-h-screen md:flex-row">
            {/* Sidebar for Desktop */}
            <div className="hidden md:block w-64 shadow-sm border-r bg-background">
                <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-sm mt-1 text-muted-foreground">
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
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 transition-all duration-200",
                                    isActive && "scale-110"
                                )} />
                                <div className="flex-1">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-xs mt-0.5 opacity-70">{item.description}</div>
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto pb-20 md:pb-0">
                <div className="p-4 md:p-6">
                    <Outlet />
                </div>
            </div>

            {/* Enhanced Mobile Bottom Nav for Settings */}
            <SettingsMobileNav />
        </div>
    );
}