import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, LogOutIcon } from "lucide-react";

// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Config
import { navItems } from "@/config/nav.config";
import { ROOT_ROUTE } from "@/config/routes.config";

// Utils
import { matchRoutePath } from "@/lib/utils";

// Hooks
import { useLogout } from "@/hooks/use-logout";

// Assets
import logo from "@/assets/logos/logo.png";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  themeClass?: string;
}

export function AppSidebar({
  themeClass = "",
  ...props
}: AppSidebarProps) {
  const location = useLocation();
  const { logout, isLoading } = useLogout();

  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          matchRoutePath(child.url, location.pathname)
        );
        const isParentActive = item.urls.some((url) =>
          matchRoutePath(url, location.pathname)
        );
        newExpandedItems[item.title] =
          isChildActive || isParentActive || item.title === "Dashboard";
      }
    });
    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsible="offcanvas" themeClass={themeClass} {...props}>
          <SidebarHeader >
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-transparent">
                  <Link to={ROOT_ROUTE} className="h-13">
                    <img src={logo} className="h-full object-contain" />
                    <span className="text-900 text-xl uppercase">Formance</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="mt-2">
            <SidebarGroup>
              <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu className="gap-3">
                  {navItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedItems[item.title];

                    if (hasChildren) {
                      return (
                        <Collapsible
                          key={item.title}
                          open={isExpanded}
                          onOpenChange={() => toggleExpanded(item.title)}
                        >
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                isActive={item.urls?.some((url) =>
                                  matchRoutePath(url, location.pathname)
                                )}
                                tooltip={item.title}
                                className="group cursor-pointer text-muted-foreground/50 p-6 rounded-xl"
                              >
                                {item.icon && <item.icon className="group-data-[active=true]:text-background"   />}
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="ml-4 border-l border-sidebar-border pl-4">
                                {item.children?.map((child) => (
                                  <SidebarMenuSubItem key={child.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={location.pathname === child.url}
                                      className="group cursor-pointer text-muted-foreground/50 p-4 rounded-xl"
                                    >
                                      <Link to={child.url}>
                                        {child.icon && (
                                          <child.icon className="group-data-[active=true]:text-background hover:text-background"  />
                                        )}
                                        <span>{child.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    }

                    return (
                      <SidebarMenuItem key={item.title}>
                        <Link to={item.urls[0]}>
                          <SidebarMenuButton
                            isActive={item.urls?.some((url) =>
                              matchRoutePath(url, location.pathname)
                            )}
                            tooltip={item.title}
                            className="group cursor-pointer text-muted-foreground/50 p-6 rounded-xl"
                          >
                            {item.icon && <item.icon className="group-data-[active=true]:text-background hover:text-background"  />}
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button
              onClick={logout}
              variant="secondary"
              className="justify-start gap-2 mb-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOutIcon className="h-4 w-4" />
              )}
              {isLoading ? "Logging out..." : "Log out"} 
            </Button>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md md:hidden">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive =
              item.urls?.some((url) => matchRoutePath(url, location.pathname)) ||
              item.children?.some((child) =>
                matchRoutePath(child.url, location.pathname)
              );
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.children?.[0]?.url || item.urls[0]}
                className={`flex flex-col items-center justify-center py-2 text-xs transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {Icon && <Icon className="h-5 w-5 mb-0.5" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
