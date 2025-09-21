import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ManagerHeader,
  EmptyState,
  EntityCard
} from '@/components/ui/ManagerUI';
import { UserCheck, Plus, Users, Bell, Calendar } from 'lucide-react';

interface FacultyManagerProps {
  onBack?: () => void;
}

export const FacultyManager: React.FC<FacultyManagerProps> = ({ onBack }) => {
  const features = [
    {
      icon: Users,
      title: 'Department Organization',
      description: 'Organize faculty members by departments'
    },
    {
      icon: Calendar,
      title: 'Subject Assignments', 
      description: 'Assign multiple classes and subjects to teachers'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Firebase Cloud Messaging integration'
    }
  ];

  return (
    <div className="space-y-6">
      <ManagerHeader
        title="Faculty Manager"
        subtitle="Manage faculty members and their assignments"
        onBack={onBack}
        actions={
          <Button data-testid="button-add-faculty">
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        }
      />

      {/* Implementation Preview Card */}
      <EntityCard className="text-center">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <UserCheck className="h-8 w-8 text-accent-foreground" />
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-4">Faculty Management System</h3>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Comprehensive faculty management features are being implemented. This will include 
          department-based organization, multi-class subject assignments, and Firebase Cloud 
          Messaging integration for real-time notifications.
        </p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <Badge variant="outline" className="text-sm py-1 px-3">Department Organization</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Subject Assignments</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Class Scheduling</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Notifications</Badge>
          <Badge variant="outline" className="text-sm py-1 px-3">Performance Tracking</Badge>
        </div>
      </EntityCard>
    </div>
  );
};