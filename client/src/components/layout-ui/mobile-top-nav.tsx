import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/nav.config";
import { matchRoutePath } from "@/lib/utils";

interface MobileTopNavProps {
  className?: string;
}

export function MobileTopNav({ className }: MobileTopNavProps) {
  const location = useLocation();

  // Show Clients, Trainers, Trainer-Clients in top nav
  const topNavItems = navItems.filter(item => 
    ['Clients', 'Trainers', 'Trainer-Clients'].includes(item.title)
  );

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
          "flex items-center justify-center w-12 h-12 transition-all duration-200 rounded-xl mx-1 group",
          isActive
            ? "text-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105"
            : "text-muted-foreground hover:text-primary hover:bg-muted/50 hover:shadow-md"
        )}
        title={item.title}
      >
        {Icon && (
          <Icon 
            className={cn(
              "h-6 w-6 transition-all duration-200",
              isActive && "scale-110",
              "group-hover:scale-105"
            )} 
          />
        )}
      </Link>
    );
  };

  return (
    <nav className={cn(
      "sticky top-0 z-40 md:hidden",
      className
    )}>
      <div className="px-4 py-3">
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg shadow-black/5 p-2">
          <div className="flex justify-around">
            {topNavItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
