import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Link } from 'wouter';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  ArrowRight
} from 'lucide-react';

interface DashboardStats {
  students: number;
  faculty: number;
  courses: number;
  timetables: number;
}

const Dashboard: React.FC = () => {
  const { user, institute } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ students: 0, faculty: 0, courses: 0, timetables: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (institute) {
      loadStatistics();
    }
  }, [institute]);

  const loadStatistics = async () => {
    if (!institute) return;
    
    try {
      setLoading(true);
      const statistics = await firestoreService.getStatistics(institute.id);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const managementCards = [
    {
      title: 'Student Manager',
      description: 'Organize students by department and class. Add, edit, and manage student records with comprehensive profiles.',
      icon: Users,
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      iconBg: 'bg-blue-500',
      link: '/students',
      features: [
        'Department → Class → Student Navigation',
        'CRUD Operations for Student Records',
        'Real-time Firestore Synchronization'
      ]
    },
    {
      title: 'Faculty Manager',
      description: 'Manage faculty members by department. Assign multiple classes and subjects to teachers with flexible scheduling.',
      icon: UserCheck,
      gradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
      iconBg: 'bg-green-500',
      link: '/faculty',
      features: [
        'Department-based Organization',
        'Multi-class Subject Assignments',
        'Firebase Cloud Messaging'
      ]
    },
    {
      title: 'Course Manager',
      description: 'Create and manage courses by department. Track assignments, manage grades, and monitor student progress.',
      icon: BookOpen,
      gradient: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20',
      iconBg: 'bg-purple-500',
      link: '/courses',
      features: [
        'Department-wise Course Creation',
        'Assignment & Marks Management',
        'Progress Tracking & Reports'
      ]
    },
    {
      title: 'Timetable Generator',
      description: 'AI-powered timetable generation with conflict detection. Export to PDF and Excel formats.',
      icon: Calendar,
      gradient: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
      iconBg: 'bg-orange-500',
      link: '/timetable',
      features: [
        'Intelligent Conflict Detection',
        'PDF & Excel Export Options',
        'Room & Teacher Availability'
      ]
    }
  ];


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, <span data-testid="text-user-name">{user?.name || 'User'}</span>
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening at <span data-testid="text-institute-name">{institute?.name || 'Your Institute'}</span> today
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-students">
              {loading ? '...' : stats.students}
            </h3>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-faculty">
              {loading ? '...' : stats.faculty}
            </h3>
            <p className="text-sm text-muted-foreground">Faculty Members</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-courses">
              {loading ? '...' : stats.courses}
            </h3>
            <p className="text-sm text-muted-foreground">Active Courses</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">Updated</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-timetables">
              {loading ? '...' : stats.timetables}
            </h3>
            <p className="text-sm text-muted-foreground">Timetables Generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {managementCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} href={card.link}>
              <Card className={`bg-gradient-to-br ${card.gradient} p-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{card.description}</p>
                  
                  <div className="space-y-3">
                    {card.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-current rounded-full mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
};

export default Dashboard;
