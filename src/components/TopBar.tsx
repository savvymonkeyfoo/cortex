import { User, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import cortexLogo from 'figma:asset/46ff3a2d4bab6c426f11837c1c4973092e377e78.png';

export function TopBar() {
  return (
    <div className="h-14 border-b border-ai-primary bg-gradient-ai-primary flex items-center justify-between px-4 relative overflow-hidden">
      {/* Modern glow effect */}
      <div className="absolute inset-0 bg-gradient-glow opacity-20 pointer-events-none"></div>
      
      <div className="flex items-center gap-6 flex-1">
        {/* Logo - Using full height and auto width */}
        <img 
          src={cortexLogo} 
          alt="Cortex" 
          className="h-12 w-auto relative z-10 filter brightness-0 invert mt-[5px] mr-[0px] mb-[10px] ml-[0px]"
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full text-white hover:bg-white/15 hover:text-white z-10 hover-glow">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white text-foreground">
            <DropdownMenuItem className="text-foreground">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}