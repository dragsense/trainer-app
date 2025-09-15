import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Bell, Settings, CreditCard, Shield, Clock, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/config/routes.config";

const settingsNavItems = [
    { title: "Profile", href: ADMIN_ROUTES.SETTINGS_PROFILE, icon: User, description: "Personal info" },
    { title: "Availability", href: ADMIN_ROUTES.SETTINGS_AVAILABILITY, icon: Clock, description: "Schedule" },
    { title: "App Settings", href: ADMIN_ROUTES.SETTINGS_APP, icon: Settings, description: "Preferences" },
    { title: "Notifications", href: ADMIN_ROUTES.SETTINGS_NOTIFICATIONS, icon: Bell, description: "Alerts" },
    { title: "Payment", href: ADMIN_ROUTES.SETTINGS_PAYMENT_METHODS, icon: CreditCard, description: "Billing" },
    { title: "Security", href: ADMIN_ROUTES.SETTINGS_SECURITY, icon: Shield, description: "Privacy" },
    { title: "Stripe", href: ADMIN_ROUTES.SETTINGS_STRIPE_CONNECT, icon: LinkIcon, description: "Connect" }
];

interface SettingsMobileNavProps {
  className?: string;
  onBack?: () => void;
}

export function SettingsMobileNav({ className, onBack }: SettingsMobileNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(ADMIN_ROUTES.DASHBOARD);
    }
  };

  // Split settings items into two rows
  const firstRow = settingsNavItems.slice(0, 4);
  const secondRow = settingsNavItems.slice(4);

  const NavItem = ({ item }: { item: typeof settingsNavItems[0] }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <NavLink
        to={item.href}
        className={cn(
          "flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all duration-200 rounded-xl mx-1",
          isActive
            ? "text-primary bg-primary/10 scale-105"
            : "text-muted-foreground hover:text-primary hover:bg-muted/50"
        )}
      >
        <Icon 
          className={cn(
            "h-7 w-7 mb-1 transition-all duration-200",
            isActive && "scale-110"
          )} 
        />
        <span className={cn(
          "text-xs font-medium transition-all duration-200",
          isActive && "font-semibold"
        )}>
          {item.title}
        </span>
        <span className={cn(
          "text-xs opacity-70 transition-all duration-200",
          isActive && "opacity-100"
        )}>
          {item.description}
        </span>
      </NavLink>
    );
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg md:hidden", className)}>
      {/* Back Button */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Main</span>
        </Button>
        <div className="text-sm font-medium text-muted-foreground">Settings</div>
      </div>

      <div className="px-2 py-2">
        {/* First Row */}
        <div className="flex justify-around mb-1">
          {firstRow.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
        
        {/* Second Row */}
        <div className="flex justify-around">
          {secondRow.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
