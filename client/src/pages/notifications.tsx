import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Bell, Activity } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Bell className="h-6 w-6 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Notifications & Activity</h1>
        </div>
        <p className="text-muted-foreground">
          Stay updated with recent activities, events, and system notifications
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Notifications</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-new-notifications">3</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activities</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-recent-activities">8</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-upcoming-events">2</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Component */}
      <RecentActivity />
    </div>
  );
};

export default NotificationsPage;