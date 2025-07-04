// External Libraries
import { MoreHorizontal, User, Mail, LogOut, LogOutIcon, Loader2 } from "lucide-react";

// Custom Hooks
import { useAuth } from "@/hooks/use-auth";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface MobileUserDropdownProps {
  userName?: string;
  email?: string;
}

export const MobileUserDropdown = ({
  userName,
  email,
}: MobileUserDropdownProps) => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>{userName}</span>
        </DropdownMenuItem>
        {email && (
          <DropdownMenuItem>
            <Mail className="mr-2 h-4 w-4" />
            <span>{email}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}

          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function NavUser() {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    logout();
  };

  return (
    <Button
      onClick={handleLogout}
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
  );
}
