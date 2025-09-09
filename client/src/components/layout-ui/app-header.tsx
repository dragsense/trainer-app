// External Libraries
import { MoreHorizontal, User, Mail, LogOut, Loader2 } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Hooks
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogout } from "@/hooks/use-logout";

// Assets
import navLogo from "@/assets/logos/nav-logo.png";
import NotificationBell from "../shared-ui/notification-bell";


interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {

  const { user } = useAuthUser();
  const { logout, isLoading } = useLogout();

  const firstName = user?.profile?.firstName || "Unknown";
  const fullName = user ? `${user?.profile?.firstName} ${user?.profile?.lastName}` : "Unknown";
  const email = user?.email || "Unknown";

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-20 flex h-20  shrink-0 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex flex-row w-full  items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-1 items-center gap-1">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <h1 className="text-lg md:text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <NotificationBell />
          <Avatar className="h-6 w-6 sm:h-10 sm:w-10 rounded-lg">
            {/* User image */}
            <AvatarImage src={undefined} alt={firstName} />

            {/* Fallback: initials or icon */}
            <AvatarFallback className="rounded-xxl bg-blue/10 flex items-center justify-center">
              {firstName ? (
                firstName.substring(0, 2).toUpperCase() // show initials
              ) : (
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" /> // show icon if no name
              )}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:grid flex-1 text-left text-sm leading-tight">
            <span className=" font-semibold text-nowrap ">{fullName}</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>
          <div className="sm:hidden flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{fullName}</span>
                </DropdownMenuItem>
                {email && (
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{email}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}

                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
