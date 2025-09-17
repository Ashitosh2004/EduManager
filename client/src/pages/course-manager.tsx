import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, FileText, TrendingUp, Award } from 'lucide-react';

const CourseManager: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Course Manager</h1>
            <p className="text-muted-foreground">Create and manage courses, assignments, and grades</p>
          </div>
          <Button data-testid="button-add-course">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Coming Soon Message */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Course Management</h3>
          <p className="text-muted-foreground mb-4">
            Course management features are being implemented. This will include department-wise course creation,
            assignment and marks management, and progress tracking with detailed reports.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Course Creation</Badge>
            <Badge variant="outline">Assignment Management</Badge>
            <Badge variant="outline">Grade Tracking</Badge>
            <Badge variant="outline">Progress Reports</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManager;
