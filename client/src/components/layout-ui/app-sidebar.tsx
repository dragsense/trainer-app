// React
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, LogOutIcon, ChevronRight, ChevronDown } from "lucide-react";

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

  // State to track which nav items are expanded
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  // Effect to automatically expand parent items when child routes are active
  React.useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {};
    
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(child => 
          matchRoutePath(child.url, location.pathname)
        );
        const isParentActive = item.urls.some(url => 
          matchRoutePath(url, location.pathname)
        );
        
        // Expand if child is active or if it's Dashboard (default expanded)
        newExpandedItems[item.title] = isChildActive || isParentActive || item.title === 'Dashboard';
      }
    });
    
    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  // Toggle expanded state for nav items
  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };


  return (
    <Sidebar collapsible="offcanvas" themeClass={themeClass} {...props}>
      <SidebarHeader className="my-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-transparent"
            >
              <Link to={ROOT_ROUTE} className="h-30">
                <img src={logo} className="h-full object-contain" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
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
                            className="cursor-pointer hover:border-l-4 hover:border-primary hover:bg-primary/10 data-[active=true]:bg-primary/10 data-[active=true]:border-l-4 data-[active=true]:border-primary"
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            {isExpanded ? (
                              <ChevronDown className="ml-auto h-4 w-4" />
                            ) : (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 border-l border-sidebar-border pl-4">
                            {item.children?.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton 
                                  asChild
                                  isActive={location.pathname === child.url}
                                  className="cursor-pointer hover:bg-primary/10 data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
                                >
                                  <Link to={child.url}>
                                    {child.icon && <child.icon className="h-4 w-4" />}
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
                        className="cursor-pointer hover:border-l-4 hover:border-primary hover:bg-primary/10 data-[active=true]:bg-primary/10 data-[active=true]:border-l-4 data-[active=true]:border-primary"
                      >
                        {item.icon && <item.icon />}
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
          className="text-primary justify-start gap-2 mb-2"
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

  );
}
