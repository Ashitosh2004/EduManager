import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ManagerHeader,
  ManagerToolbar,
  DepartmentCard,
  PersonCard,
  EmptyState,
  EntityCard
} from '@/components/ui/ManagerUI';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Student } from '@/types';
import { 
  Computer, 
  Zap, 
  Cog, 
  Plus, 
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentManagerProps {
  onBack?: () => void;
}

const departments = [
  { id: 'cse', name: 'Computer Science', icon: Computer },
  { id: 'ece', name: 'Electronics & Comm.', icon: Zap },
  { id: 'mech', name: 'Mechanical Engg.', icon: Cog },
];

const classes = {
  cse: ['CSE-A (1st Year)', 'CSE-B (1st Year)', 'CSE-A (2nd Year)', 'CSE-B (2nd Year)', 'CSE-A (3rd Year)', 'CSE-B (3rd Year)', 'CSE-A (4th Year)', 'CSE-B (4th Year)'],
  ece: ['ECE-A (1st Year)', 'ECE-B (1st Year)', 'ECE-A (2nd Year)', 'ECE-B (2nd Year)', 'ECE-A (3rd Year)', 'ECE-B (3rd Year)', 'ECE-A (4th Year)', 'ECE-B (4th Year)'],
  mech: ['MECH-A (1st Year)', 'MECH-B (1st Year)', 'MECH-A (2nd Year)', 'MECH-B (2nd Year)', 'MECH-A (3rd Year)', 'MECH-B (3rd Year)', 'MECH-A (4th Year)', 'MECH-B (4th Year)'],
};

export const StudentManager: React.FC<StudentManagerProps> = ({ onBack }) => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (institute && !selectedDepartment) {
      loadDepartmentStats();
    }
  }, [institute, selectedDepartment]);

  useEffect(() => {
    if (selectedDepartment && selectedClass && institute) {
      loadStudents();
    }
  }, [selectedDepartment, selectedClass, institute]);

  const loadDepartmentStats = async () => {
    if (!institute) return;
    
    const stats: Record<string, number> = {};
    for (const dept of departments) {
      try {
        // Approximate count across all classes
        stats[dept.id] = Math.floor(Math.random() * 200) + 50; // Placeholder for demo
      } catch (error) {
        stats[dept.id] = 0;
      }
    }
    setDepartmentStats(stats);
  };

  const loadStudents = async () => {
    if (!institute || !selectedDepartment || !selectedClass) return;
    
    try {
      setLoading(true);
      const studentList = await firestoreService.getStudentsByClass(
        institute.id, 
        selectedDepartment, 
        selectedClass
      );
      setStudents(studentList);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDepartment(deptId);
    setSelectedClass(null);
    setStudents([]);
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
  };

  const handleBack = () => {
    if (selectedClass) {
      setSelectedClass(null);
      setStudents([]);
    } else if (selectedDepartment) {
      setSelectedDepartment(null);
    } else if (onBack) {
      onBack();
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Department Selection View
  if (!selectedDepartment) {
    return (
      <div className="space-y-6">
        <ManagerHeader
          title="Select Department"
          subtitle="Choose a department to manage students"
          onBack={onBack}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              id={dept.id}
              name={dept.name}
              icon={dept.icon}
              count={departmentStats[dept.id]}
              onClick={() => handleDepartmentSelect(dept.id)}
              data-testid={`dept-card-${dept.id}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Class Selection View
  if (!selectedClass) {
    const selectedDept = departments.find(d => d.id === selectedDepartment);
    const Icon = selectedDept?.icon || Computer;
    
    return (
      <div className="space-y-6">
        <ManagerHeader
          title={selectedDept?.name || ''}
          subtitle="Select a class to manage students"
          onBack={handleBack}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes[selectedDepartment as keyof typeof classes]?.map((className) => (
            <EntityCard 
              key={className}
              department={selectedDepartment}
              onClick={() => handleClassSelect(className)}
              data-testid={`class-card-${className.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 dept-icon" />
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{className}</h3>
              <p className="text-sm text-muted-foreground">Click to manage students</p>
            </EntityCard>
          ))}
        </div>
      </div>
    );
  }

  // Student List View
  const selectedDept = departments.find(d => d.id === selectedDepartment);
  
  return (
    <div className="space-y-6">
      <ManagerHeader
        title={`${selectedClass} Students`}
        subtitle={`${selectedDept?.name} • ${filteredStudents.length} students`}
        onBack={handleBack}
        actions={
          <Button data-testid="button-add-student">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        }
      />

      <ManagerToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search students..."
      />

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <PersonCard
              key={student.id}
              name={student.name}
              identifier={student.rollNumber}
              email={student.email}
              department={selectedDepartment}
              additionalInfo={[
                { label: 'Year', value: student.year.toString() },
                { label: 'Semester', value: student.semester.toString() }
              ]}
              onEdit={() => {
                // Handle edit
                console.log('Edit student:', student.id);
              }}
              onDelete={() => {
                // Handle delete
                console.log('Delete student:', student.id);
              }}
              data-testid={`student-card-${student.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No students found"
          description={
            searchTerm 
              ? 'No students match your search criteria.' 
              : 'Get started by adding your first student.'
          }
          actionLabel="Add Student"
          onAction={() => console.log('Add student')}
          data-testid="empty-state-students"
        />
      )}
    </div>
  );
};