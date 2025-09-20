import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  History,
  BookOpen, 
  Calendar,
  Settings,
  HelpCircle,
  Download,
  Upload,
  Archive,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

const MorePage: React.FC = () => {
  const menuItems = [
    {
      id: 'timetable-history',
      title: 'Timetable History',
      description: 'View and manage previously generated timetables',
      icon: History,
      path: '/timetable-history',
      primary: true
    },
    {
      id: 'courses',
      title: 'Course Manager',
      description: 'Manage courses and subjects',
      icon: BookOpen,
      path: '/courses',
      primary: true
    },
    {
      id: 'departments',
      title: 'Department Manager',
      description: 'Add and manage departments for your institute',
      icon: Settings,
      path: '/departments',
      primary: true
    },
    {
      id: 'timetable',
      title: 'Generate Timetable',
      description: 'Create new timetables with custom sessions',
      icon: Calendar,
      path: '/timetable',
      primary: true
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences and configuration',
      icon: Settings,
      path: '/settings',
      secondary: true
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and support documentation',
      icon: HelpCircle,
      action: () => console.log('Help functionality coming soon'),
      secondary: true
    }
  ];

  const primaryItems = menuItems.filter(item => item.primary);
  const secondaryItems = menuItems.filter(item => item.secondary);

  const handleItemClick = (item: typeof menuItems[0]) => {
    if (item.action) {
      item.action();
    }
  };

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const Icon = item.icon;
    
    if (item.path) {
      return (
        <Link key={item.id} href={item.path}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground" data-testid={`text-${item.id}-title`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      );
    }

    return (
      <Card 
        key={item.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleItemClick(item)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-muted rounded-lg">
                <Icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground" data-testid={`text-${item.id}-title`}>
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">More</h1>
        <p className="text-muted-foreground">Additional features and tools</p>
      </div>

      {/* Primary Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
        <div className="space-y-3">
          {primaryItems.map(renderMenuItem)}
        </div>
      </div>

      {/* Secondary Features */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Tools & Settings</h2>
        <div className="space-y-3">
          {secondaryItems.map(renderMenuItem)}
        </div>
      </div>

      {/* Back to Dashboard */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Looking for the main navigation? Use the tabs below or return to dashboard.
            </p>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MorePage;