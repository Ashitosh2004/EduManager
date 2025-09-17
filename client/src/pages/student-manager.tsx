import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const StudentManager: React.FC = () => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (institute) {
      loadDepartmentStats();
    }
  }, [institute]);

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
        // This is a simplified count - in real implementation, you'd count across all classes
        const sampleClass = classes[dept.id as keyof typeof classes][0];
        const students = await firestoreService.getStudentsByClass(institute.id, dept.id, sampleClass);
        stats[dept.id] = students.length * 4; // Approximation for all years
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
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedDepartment) {
    // Department Selection View
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Manager</h1>
          <p className="text-muted-foreground">Select a department to manage students</p>
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

  if (!selectedClass) {
    // Class Selection View
    const selectedDept = departments.find(d => d.id === selectedDepartment);
    const Icon = selectedDept?.icon || Computer;
    
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
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
              <h1 className="text-3xl font-bold text-foreground">{selectedDept?.name}</h1>
              <p className="text-muted-foreground">Select a class to manage students</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes[selectedDepartment as keyof typeof classes]?.map((className) => (
            <Card 
              key={className}
              className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleClassSelect(className)}
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
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
              <h1 className="text-3xl font-bold text-foreground">
                {selectedClass} Students
              </h1>
              <p className="text-muted-foreground">
                {selectedDept?.name} • {filteredStudents.length} students
              </p>
            </div>
          </div>
          
          <Button onClick={() => setShowAddModal(true)} data-testid="button-add-student">
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
                      <span className="text-primary-foreground font-medium">
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{student.email}</span>
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
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Full Name</Label>
                <Input id="student-name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll-number">Roll Number</Label>
                <Input id="roll-number" placeholder="CSE2024001" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="student-email">Email Address</Label>
              <Input id="student-email" type="email" placeholder="john.doe@student.edu" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Semester</SelectItem>
                    <SelectItem value="2">2nd Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Add Student</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManager;
