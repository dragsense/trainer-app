// React
import * as React from "react";

// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav/nav-main";
import { NavUser } from "@/components/nav/nav-user";

// Config
import { ROOT_ROUTE } from "@/config/routes.config";


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  logoSrc?: string;
  themeClass?: string;
}

export function AppSidebar({
  logoSrc,
  themeClass = "",
  ...props
}: AppSidebarProps) {
  return (
    
      <Sidebar collapsible="offcanvas" themeClass={themeClass} {...props}>
        <SidebarHeader className="my-10">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-8 hover:bg-transparent"
              >
                <a href={ROOT_ROUTE}>
                  <img src={logoSrc} />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="mt-2">
          <NavMain />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    
  );
}
