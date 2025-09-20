import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu, School, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useLocation } from 'wouter';

interface TopAppBarProps {
  onMenuClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onMenuClick }) => {
  const { user, institute, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileClick = () => {
    setLocation('/profile');
  };

  const handleSettingsClick = () => {
    setLocation('/settings');
  };

  return (
    <header className="bg-gradient-secondary border-b border-border sticky top-0 z-50 backdrop-blur-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-full hover:bg-accent transition-colors duration-200 md:hidden"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <School className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-medium text-foreground">EduManager</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-full hover:bg-accent transition-colors duration-200 relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></div>
            </Button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors duration-200"
                  data-testid="button-profile-dropdown"
                >
                  <span className="text-sm font-medium text-foreground hidden sm:block" data-testid="text-user-name">
                    {user?.name || 'User'}
                  </span>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profilePhoto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className="w-64 p-2"
                data-testid="dropdown-profile-menu"
              >
                {/* User Info Header */}
                <DropdownMenuLabel className="px-2 py-3 text-left">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.profilePhoto} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground" data-testid="dropdown-user-name">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="dropdown-user-email">
                        {user?.email || 'user@example.com'}
                      </p>
                      {institute?.name && (
                        <p className="text-xs text-muted-foreground" data-testid="dropdown-institute-name">
                          {institute.name}
                        </p>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                {/* Profile Option */}
                <DropdownMenuItem 
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent"
                  data-testid="dropdown-profile"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                {/* Settings Option */}
                <DropdownMenuItem 
                  onClick={handleSettingsClick}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer hover:bg-accent focus:bg-accent"
                  data-testid="dropdown-settings"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Logout Option */}
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
                  data-testid="dropdown-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
