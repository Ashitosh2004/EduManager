import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Student } from '@/types';
import { 
  ArrowLeft, 
  Computer, 
  Zap, 
  Cog, 
  Plus, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentManagerProps {
  onBack?: () => void;
}

const departments = [
  { id: 'cse', name: 'Computer Science', icon: Computer, color: 'bg-blue-500' },
  { id: 'ece', name: 'Electronics & Comm.', icon: Zap, color: 'bg-green-500' },
  { id: 'mech', name: 'Mechanical Engg.', icon: Cog, color: 'bg-orange-500' },
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
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground">Select Department</h2>
            <p className="text-muted-foreground">Choose a department to manage students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const studentCount = departmentStats[dept.id] || 0;
            
            return (
              <Card 
                key={dept.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                onClick={() => handleDepartmentSelect(dept.id)}
                data-testid={`dept-card-${dept.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${dept.color}/10 rounded-xl flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${dept.color.split('-')[1]}-500`} />
                    </div>
                    <span className="text-2xl font-bold text-foreground">{studentCount}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{dept.id.toUpperCase()} Department</p>
                </CardContent>
              </Card>
            );
          })}
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
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{selectedDept?.name}</h2>
            <p className="text-muted-foreground">Select a class to manage students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes[selectedDepartment as keyof typeof classes]?.map((className) => (
            <Card 
              key={className}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleClassSelect(className)}
              data-testid={`class-card-${className.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${selectedDept?.color}/10 rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${selectedDept?.color?.split('-')[1]}-500`} />
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{className}</h3>
                <p className="text-sm text-muted-foreground">Click to manage students</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Student List View
  const selectedDept = departments.find(d => d.id === selectedDepartment);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedClass} Students
            </h2>
            <p className="text-muted-foreground">
              {selectedDept?.name} • {filteredStudents.length} students
            </p>
          </div>
        </div>
        
        <Button data-testid="button-add-student">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-students"
        />
      </div>

      {/* Student List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground truncate">{student.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="text-foreground">{student.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="text-foreground">{student.semester}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No students match your search criteria.' : 'Get started by adding your first student.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
