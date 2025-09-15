import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/nav.config";
import { matchRoutePath } from "@/lib/utils";

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const location = useLocation();

  // Split nav items into two rows (4 items per row)
  const firstRow = navItems.slice(0, 4);
  const secondRow = navItems.slice(4);

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive =
      item.urls?.some((url) => matchRoutePath(url, location.pathname)) ||
      item.children?.some((child) =>
        matchRoutePath(child.url, location.pathname)
      );
    const Icon = item.icon;

    return (
      <Link
        to={item.children?.[0]?.url || item.urls[0]}
        className={cn(
          "flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all duration-200 rounded-xl mx-1",
          isActive
            ? "text-primary bg-primary/10 scale-105"
            : "text-muted-foreground hover:text-primary hover:bg-muted/50"
        )}
      >
        {Icon && (
          <Icon 
            className={cn(
              "h-7 w-7 mb-1 transition-all duration-200",
              isActive && "scale-110"
            )} 
          />
        )}
        <span className={cn(
          "text-xs font-medium transition-all duration-200",
          isActive && "font-semibold"
        )}>
          {item.title}
        </span>
      </Link>
    );
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg md:hidden",
      className
    )}>
      <div className="px-2 py-2">
        {/* First Row */}
        <div className="flex justify-around mb-1">
          {firstRow.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </div>
        
        {/* Second Row */}
        <div className="flex justify-around">
          {secondRow.map((item) => (
            <NavItem key={item.title} item={item} />
          ))}
        </div>
      </div>
    </nav>
  );
}
