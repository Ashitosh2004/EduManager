import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Mail, Phone, BookOpen, Users } from 'lucide-react';

const FacultyManager: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Faculty Manager</h1>
            <p className="text-muted-foreground">Manage faculty members and their assignments</p>
          </div>
          <Button data-testid="button-add-faculty">
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Faculty Management</h3>
          <p className="text-muted-foreground mb-4">
            Faculty management features are being implemented. This will include department-based organization,
            multi-class subject assignments, and Firebase Cloud Messaging integration.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Department Organization</Badge>
            <Badge variant="outline">Subject Assignments</Badge>
            <Badge variant="outline">Class Scheduling</Badge>
            <Badge variant="outline">Notifications</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyManager;
