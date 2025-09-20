import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserCheck, MoreHorizontal } from 'lucide-react';

const bottomNavItems = [
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
    id: 'more',
    label: 'More',
    icon: MoreHorizontal,
    path: '/more'
  }
];

export const BottomNavigation: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 border-t border-border/50 md:hidden z-40 backdrop-blur-glass supports-[backdrop-filter]:bg-background/60">
      <div className="grid grid-cols-4 h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.id} href={item.path}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`bottom-nav-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
