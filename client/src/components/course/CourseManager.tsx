import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ManagerHeader,
  EmptyState,
  EntityCard
} from '@/components/ui/ManagerUI';
import { BookOpen, Plus, FileText, TrendingUp, Award } from 'lucide-react';

interface CourseManagerProps {
  onBack?: () => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ onBack }) => {
  const features = [
    {
      icon: BookOpen,
      title: 'Course Creation',
      description: 'Create and organize courses by departments'
    },
    {
      icon: FileText,
      title: 'Assignment Management',
      description: 'Track assignments and submissions'
    },
    {
      icon: TrendingUp,
      title: 'Grade Tracking',
      description: 'Monitor student performance and grades'
    },
    {
      icon: Award,
      title: 'Progress Reports',
      description: 'Generate detailed progress reports'
    }
  ];

  return (
    <div className="space-y-6">
      <ManagerHeader
        title="Course Manager"
        subtitle="Create and manage courses, assignments, and grades"
        onBack={onBack}
        actions={
          <Button data-testid="button-add-course">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        }
      />

      {/* Implementation Preview Card */}
      <EntityCard className="text-center">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-8 w-8 text-accent-foreground" />
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-4">Course Management System</h3>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Advanced course management features are being implemented. This will include 
          department-wise course creation, assignment and marks management, and comprehensive 
          progress tracking with detailed analytics and reporting.
        </p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
        
        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="text-sm py-1 px-3">Course Creation</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Assignment Management</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Grade Tracking</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Progress Reports</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Analytics Dashboard</Badge>
        </div>
      </EntityCard>
    </div>
  );
};