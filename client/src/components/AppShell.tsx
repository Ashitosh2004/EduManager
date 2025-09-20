import React, { useState, useEffect } from 'react';
import { TopAppBar } from '@/components/layout/TopAppBar';
import { NavigationRail } from '@/components/layout/NavigationRail';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { InstituteSelectionModal } from '@/components/modals/InstituteSelectionModal';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useInstitute } from '@/contexts/InstituteContext';

// Pages
import Dashboard from '@/pages/dashboard';
import StudentManager from '@/pages/student-manager';
import FacultyManager from '@/pages/faculty-manager';
import CourseManager from '@/pages/course-manager';
import DepartmentManagerPage from '@/pages/department-manager';
import TimetableGenerator from '@/pages/timetable-generator';
import TimetableHistoryPage from '@/pages/timetable-history';
import SettingsPage from '@/pages/settings';
import ProfilePage from '@/pages/profile';
import MorePage from '@/pages/more';

interface AppShellProps {
  page?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ page = 'dashboard' }) => {
  const { user, institute, loading } = useAuth();
  const { selectedInstitute, setSelectedInstitute } = useInstitute();
  const [showInstituteModal, setShowInstituteModal] = useState(false);

  useEffect(() => {
    // Show institute selection if no institute is selected and user is not logged in
    if (!loading && !user && !selectedInstitute) {
      setShowInstituteModal(true);
    }
  }, [loading, user, selectedInstitute]);

  const handleInstituteSelect = (institute: any) => {
    setSelectedInstitute(institute);
    setShowInstituteModal(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'students':
        return <StudentManager />;
      case 'faculty':
        return <FacultyManager />;
      case 'courses':
        return <CourseManager />;
      case 'departments':
        return <DepartmentManagerPage />;
      case 'timetable':
        return <TimetableGenerator />;
      case 'timetable-history':
        return <TimetableHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'more':
        return <MorePage />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show institute selection modal
  if (showInstituteModal) {
    return (
      <div className="min-h-screen bg-background">
        <InstituteSelectionModal
          open={showInstituteModal}
          onClose={() => setShowInstituteModal(false)}
          onSelect={handleInstituteSelect}
        />
      </div>
    );
  }

  // Show auth screen if no user
  if (!user && selectedInstitute) {
    return <AuthScreen />;
  }

  // Show main app if user is authenticated
  return (
    <div className="min-h-screen bg-background">
      <TopAppBar />
      
      <div className="flex">
        <NavigationRail />
        
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          {renderPage()}
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
};
