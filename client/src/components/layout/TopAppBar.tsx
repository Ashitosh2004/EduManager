import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Menu, School } from 'lucide-react';

interface TopAppBarProps {
  onMenuClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onMenuClick }) => {
  const { user, institute } = useAuth();

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-surface/95">
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
            
            {/* Profile */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-foreground hidden sm:block" data-testid="text-user-name">
                {user?.name || 'User'}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profilePhoto} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
