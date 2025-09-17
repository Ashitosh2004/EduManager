import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  ArrowRight 
} from 'lucide-react';

export const ManagementCards: React.FC = () => {
  const managementCards = [
    {
      title: 'Student Manager',
      description: 'Organize students by department and class. Add, edit, and manage student records with comprehensive profiles.',
      icon: Users,
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
      iconBg: 'bg-blue-500',
      link: '/students',
      testId: 'card-student-manager',
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
      testId: 'card-faculty-manager',
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
      testId: 'card-course-manager',
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
      testId: 'card-timetable-generator',
      features: [
        'Intelligent Conflict Detection',
        'PDF & Excel Export Options',
        'Room & Teacher Availability'
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {managementCards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Link key={index} href={card.link}>
            <Card 
              className={`bg-gradient-to-br ${card.gradient} p-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              data-testid={card.testId}
            >
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 ${card.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-600 dark:text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {card.description}
                </p>
                
                <div className="space-y-3">
                  {card.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-3 opacity-60" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
