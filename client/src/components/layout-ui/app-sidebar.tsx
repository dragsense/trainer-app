// React
import * as React from "react";
import { Link } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";


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

  const { logout, isLoading } = useLogout();


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
              {navItems.map((item) => (
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
              ))}
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
