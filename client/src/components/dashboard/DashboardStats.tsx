import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, BookOpen, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    students: number;
    faculty: number;
    courses: number;
    timetables: number;
  };
  loading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const statsCards = [
    {
      title: 'Total Students',
      value: stats.students,
      icon: Users,
      color: 'bg-primary',
      testId: 'stat-students'
    },
    {
      title: 'Faculty Members',
      value: stats.faculty,
      icon: UserCheck,
      color: 'bg-green-500',
      testId: 'stat-faculty'
    },
    {
      title: 'Active Courses',
      value: stats.courses,
      icon: BookOpen,
      color: 'bg-purple-500',
      testId: 'stat-courses'
    },
    {
      title: 'Timetables Generated',
      value: stats.timetables,
      icon: Calendar,
      color: 'bg-orange-500',
      testId: 'stat-timetables'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color}/10 rounded-xl flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 text-${card.color.split('-')[1]}-500`} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-1" data-testid={card.testId}>
                {loading ? '...' : card.value.toLocaleString()}
              </h3>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
