// External Libraries
import { User, Mail, LogOut, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

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
import NotificationBell from "@/components/shared-ui/notification-bell";

// Config
import { settingsConfig } from "@/config/nav.config";


interface AppHeaderProps {
  title: string;
}

// Use separate settings config object

export function AppHeader({ title }: AppHeaderProps) {
  const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthUser();
  const { logout, isLoading } = useLogout();

  // Close desktop settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsDesktopSettingsOpen(false);
      }
    };

    if (isDesktopSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDesktopSettingsOpen]);

  const firstName = user?.profile?.firstName || "Unknown";
  const fullName = user ? `${user?.profile?.firstName} ${user?.profile?.lastName}` : "Unknown";
  const email = user?.email || "Unknown";

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-20 flex h-30 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex flex-row w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-1 items-center gap-4" ref={settingsRef}>
          <SidebarTrigger className="-ml-1 block md:hidden" />
          
          {/* Desktop: Inline Settings Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Settings Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsDesktopSettingsOpen(!isDesktopSettingsOpen)}
              className="group flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-all duration-300 rounded-lg shadow-sm border border-border/50"
            >
              {settingsConfig.icon && <settingsConfig.icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />}
              <span className="font-medium">{settingsConfig.title}</span>
              <ChevronRight className={`h-3 w-3 opacity-60 transition-all duration-300 group-hover:opacity-100 ${isDesktopSettingsOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
            </Button>

            {/* Inline Settings Menu Items */}
            <div className={`flex items-center gap-2 transition-all duration-300 overflow-hidden bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg border border-border/20 ${isDesktopSettingsOpen ? 'max-w-screen opacity-100' : 'max-w-0 opacity-0'}`}>
              {settingsConfig.children?.map((item, index) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setIsDesktopSettingsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-all duration-200 whitespace-nowrap transform shadow-sm border border-border/30 bg-background/80 backdrop-blur-sm ${
                    isDesktopSettingsOpen 
                      ? 'translate-x-0 opacity-100' 
                      : 'translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium text-sm">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: Settings button hidden - settings are now in profile dropdown */}
        </div>

        <div className="flex items-center gap-5 p-4 text-left text-sm bg-header rounded-full p-4 shadow-sm">
          <NotificationBell />
          
          {/* Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 p-2 hover:bg-muted/50 transition-all duration-200 rounded-lg"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* User image */}
                  <AvatarImage src={undefined} alt={firstName} />

                  {/* Fallback: initials or icon */}
                  <AvatarFallback className="rounded-lg bg-foreground/2 flex items-center justify-center">
                    {firstName ? (
                      firstName.substring(0, 2).toUpperCase() // show initials
                    ) : (
                      <User className="w-4 h-4" /> // show icon if no name
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="font-semibold text-sm">{fullName}</div>
                  <div className="text-xs text-muted-foreground">{email}</div>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 animate-in slide-in-from-top-2 fade-in duration-200 shadow-lg border border-border/50"
              sideOffset={8}
            >
              {/* Mobile User Info Header */}
              <div className="md:hidden flex items-center gap-3 p-4 border-b border-border/50">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={undefined} alt={firstName} />
                  <AvatarFallback className="rounded-lg bg-foreground/2 flex items-center justify-center">
                    {firstName ? (
                      firstName.substring(0, 2).toUpperCase()
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{fullName}</div>
                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                </div>
              </div>

              {/* Desktop Profile Actions */}
              <div className="hidden md:block p-2">
                <DropdownMenuItem asChild>
                  <Link 
                    to="/settings/profile"
                    className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-muted/50 p-3 rounded-md"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    to="/settings/notifications"
                    className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-muted/50 p-3 rounded-md"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Notifications</span>
                  </Link>
                </DropdownMenuItem>
              </div>

              {/* Mobile Settings Menu Items */}
              <div className="md:hidden">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Settings
                  </div>
                  {settingsConfig.children?.map((item) => (
                    <DropdownMenuItem key={item.title} asChild>
                      <Link 
                        to={item.url}
                        className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-muted/50 p-3 rounded-md"
                      >
                        {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Logout Button */}
              <div className="p-2">
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive p-3 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {isLoading ? "Logging out..." : "Log out"}
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
