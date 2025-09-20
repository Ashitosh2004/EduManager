import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar,
  History, 
  Settings, 
  LogOut 
} from 'lucide-react';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/'
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    path: '/students'
  },
  {
    id: 'faculty',
    label: 'Faculty',
    icon: UserCheck,
    path: '/faculty'
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: BookOpen,
    path: '/courses'
  },
  {
    id: 'timetable',
    label: 'Timetable',
    icon: Calendar,
    path: '/timetable'
  },
  {
    id: 'timetable-history',
    label: 'History',
    icon: History,
    path: '/timetable-history'
  }
];

export const NavigationRail: React.FC = () => {
  const [location] = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="hidden md:flex flex-col w-20 lg:w-64 bg-surface border-r border-border min-h-screen">
      <div className="p-4 lg:px-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3 px-3 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  data-testid={`nav-${item.id}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden lg:block font-medium">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
      
    </nav>
  );
};
