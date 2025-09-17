import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  BookOpen, 
  ArrowRight 
} from 'lucide-react';

export const RecentActivity: React.FC = () => {
  const recentActivities = [
    {
      icon: Plus,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      title: 'Added 15 new students to CSE-A batch',
      time: '2 hours ago'
    },
    {
      icon: Calendar,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
      title: 'Generated timetable for Fall 2024',
      time: '5 hours ago'
    },
    {
      icon: BookOpen,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
      title: 'Course "Advanced Algorithms" updated',
      time: '1 day ago'
    }
  ];

  const upcomingEvents = [
    {
      date: { month: 'Dec', day: '15' },
      title: 'Faculty Meeting',
      subtitle: '2:00 PM - Conference Room A'
    },
    {
      date: { month: 'Dec', day: '18' },
      title: 'Semester Exam Schedule',
      subtitle: '9:00 AM - All Departments'
    },
    {
      date: { month: 'Dec', day: '20' },
      title: 'Winter Break Begins',
      subtitle: 'All Day - Campus Wide'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start space-x-3 group">
                  <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium leading-relaxed">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Upcoming Schedule</CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-calendar">
              View Calendar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center space-x-4 group cursor-pointer hover:bg-accent/50 rounded-lg p-2 -m-2 transition-all duration-200">
                <div className="text-center flex-shrink-0">
                  <div className="text-sm font-medium text-muted-foreground">
                    {event.date.month}
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {event.date.day}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.subtitle}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
