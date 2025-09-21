import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { navItems, settingsConfig } from "@/config/nav.config";
import { matchRoutePath } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const location = useLocation();

  // Define the 5 items for mobile bottom nav: Sessions, Billings, Dashboard, Reminders, Settings
  const mobileNavItems = [
    navItems.find(item => item.title === 'Sessions'),
    navItems.find(item => item.title === 'Billings'),
    navItems.find(item => item.title === 'Dashboard'),
    navItems.find(item => item.title === 'Reminders'),
  ].filter(Boolean);

  const NavItem = ({ item }: { item: any }) => {
    const isActive =
      item.urls?.some((url) => matchRoutePath(url, location.pathname)) ||
      item.children?.some((child) =>
        matchRoutePath(child.url, location.pathname)
      );
    const Icon = item.icon;
    const isSettings = item.title === 'Settings';

    const handleClick = (e: React.MouseEvent) => {
      if (isSettings) {
        e.preventDefault();
      }
    };

    return (
      <Link
        to={isSettings ? '#' : (item.children?.[0]?.url || item.urls[0])}
        onClick={handleClick}
        className={cn(
          "flex items-center justify-center transition-all duration-200 rounded-xl p-3 w-14 h-14",
          isActive
            ? "text-primary bg-primary/10 scale-105 shadow-inner"
            : "text-muted-foreground hover:text-primary hover:bg-muted/50 shadow-inner"
        )}
      >
        {Icon && (
          <Icon 
            className="h-5 w-5 transition-all duration-200"
          />
        )}
      </Link>
    );
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg md:hidden",
      className
    )}>
      <div className="px-2 py-2">
        <div className="flex items-center justify-center gap-2">
          {mobileNavItems.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </div>
      </div>
    </nav>
  );
}
