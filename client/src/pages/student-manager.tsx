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
import { Student, Department } from '@/types';
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
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DepartmentManager } from '@/components/department/DepartmentManager';
import { generateClassesForDepartment, departmentIconsAndColors } from '@/utils/departments';

// Helper function to get icon component from department
const getDepartmentIcon = (department: Department) => {
  // First try to use the saved iconName
  if (department.iconName) {
    const iconData = departmentIconsAndColors.find(item => item.icon.name === department.iconName);
    if (iconData) return iconData.icon;
  }
  
  // Fallback to finding by colorClass
  const iconData = departmentIconsAndColors.find(item => item.color === department.colorClass);
  return iconData ? iconData.icon : Building2;
};

// Helper function to get color class
const getDepartmentColor = (department: Department) => {
  return department.colorClass;
};

const StudentManager: React.FC = () => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepartmentManager, setShowDepartmentManager] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    year: 1,
    semester: 1,
    phoneNumber: '',
    parentContact: ''
  });

  useEffect(() => {
    if (institute) {
      loadDepartments();
    }
  }, [institute]);

  useEffect(() => {
    if (departments.length > 0) {
      loadDepartmentStats();
      generateClassesData();
    }
  }, [departments]);

  useEffect(() => {
    if (selectedDepartment && selectedClass && institute) {
      loadStudents();
    }
  }, [selectedDepartment, selectedClass, institute]);

  const loadDepartments = async () => {
    if (!institute) return;
    
    try {
      const departmentList = await firestoreService.getDepartmentsByInstitute(institute.id);
      setDepartments(departmentList);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateClassesData = () => {
    const classesData: Record<string, string[]> = {};
    departments.forEach(dept => {
      classesData[dept.id] = generateClassesForDepartment(dept.shortName || dept.name);
    });
    setClasses(classesData);
  };

  const loadDepartmentStats = async () => {
    if (!institute) return;
    
    const stats: Record<string, number> = {};
    for (const dept of departments) {
      try {
        // Generate classes for this department dynamically instead of relying on classes state
        const deptClasses = generateClassesForDepartment(dept.shortName || dept.name);
        const sampleClass = deptClasses[0];
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      year: 1,
      semester: 1,
      phoneNumber: '',
      parentContact: ''
    });
    setEditingStudent(null);
  };

  const handleAddStudent = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      year: student.year,
      semester: student.semester,
      phoneNumber: student.phoneNumber || '',
      parentContact: student.parentContact || ''
    });
    setEditingStudent(student);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!institute || !selectedDepartment || !selectedClass) return;

    if (!formData.name || !formData.email || !formData.rollNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const baseStudentData = {
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        department: selectedDepartment,
        class: selectedClass,
        year: formData.year,
        semester: formData.semester,
        phoneNumber: formData.phoneNumber,
        parentContact: formData.parentContact,
        instituteId: institute.id
      };

      if (editingStudent) {
        await firestoreService.updateStudent(editingStudent.id, baseStudentData);
        toast({
          title: "Success",
          description: "Student updated successfully.",
        });
      } else {
        const studentData = {
          ...baseStudentData,
          createdAt: new Date()
        };
        await firestoreService.createStudent(studentData);
        toast({
          title: "Success",
          description: "Student added successfully.",
        });
      }

      setShowAddModal(false);
      resetForm();
      loadStudents();
      loadDepartmentStats();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Failed to save student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setLoading(true);
      await firestoreService.deleteStudent(studentId);
      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });
      loadStudents();
      loadDepartmentStats();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Student Manager</h1>
              <p className="text-muted-foreground">Select a department to manage students</p>
            </div>
            <Button
              onClick={() => setShowDepartmentManager(true)}
              className="flex items-center gap-2"
              data-testid="button-add-department"
            >
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const Icon = getDepartmentIcon(dept);
            const colorClass = getDepartmentColor(dept);
            const studentCount = departmentStats[dept.id] || 0;
            
            return (
              <Card 
                key={dept.id}
                className="cursor-pointer dept-card-gradient"
                onClick={() => handleDepartmentSelect(dept.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
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
    const Icon = selectedDept ? getDepartmentIcon(selectedDept) : Computer;
    
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
                  <div className={`w-10 h-10 ${selectedDept ? getDepartmentColor(selectedDept) : 'bg-gray-500'}/10 rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${selectedDept ? getDepartmentColor(selectedDept).replace('bg-', 'text-') : 'text-gray-500'}`} />
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
          
          <Button onClick={handleAddStudent} data-testid="button-add-student">
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditStudent(student)}
                    data-testid={`button-edit-student-${student.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteStudent(student.id)}
                    data-testid={`button-delete-student-${student.id}`}
                  >
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
            <Button onClick={handleAddStudent}>
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
            <DialogTitle>
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Full Name *</Label>
                <Input 
                  id="student-name" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-student-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roll-number">Roll Number *</Label>
                <Input 
                  id="roll-number" 
                  placeholder="CSE2024001"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  data-testid="input-roll-number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="student-email">Email Address *</Label>
              <Input 
                id="student-email" 
                type="email" 
                placeholder="john.doe@student.edu"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                data-testid="input-student-email"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={formData.year.toString()} 
                  onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}
                >
                  <SelectTrigger data-testid="select-year">
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
                <Select 
                  value={formData.semester.toString()} 
                  onValueChange={(value) => setFormData({...formData, semester: parseInt(value)})}
                >
                  <SelectTrigger data-testid="select-semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sem 1</SelectItem>
                    <SelectItem value="2">Sem 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 123-4567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent-contact">Parent Contact</Label>
                <Input 
                  id="parent-contact" 
                  placeholder="+1 (555) 987-6543"
                  value={formData.parentContact}
                  onChange={(e) => setFormData({...formData, parentContact: e.target.value})}
                  data-testid="input-parent-contact"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)} 
                className="flex-1"
                data-testid="button-cancel-student"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={loading}
                data-testid="button-submit-student"
              >
                {loading ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Department Manager Modal */}
      <Dialog 
        open={showDepartmentManager} 
        onOpenChange={(open) => {
          setShowDepartmentManager(open);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Management
            </DialogTitle>
          </DialogHeader>
          <DepartmentManager />
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => {
                setShowDepartmentManager(false);
                // Force reload departments to reflect any changes
                loadDepartments();
              }}
              data-testid="button-close-department-manager"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManager;
