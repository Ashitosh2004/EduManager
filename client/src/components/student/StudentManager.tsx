import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Users,
  TrendingUp,
  GraduationCap,
  Edit,
  Trash2,
  MoreVertical
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phoneNumber: '',
    parentContact: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Student actions state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showPassoutDialog, setShowPassoutDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      
      // Filter out graduated students (those with class set to 'Graduated')
      const activeStudents = studentList.filter(student => student.class !== 'Graduated');
      setStudents(activeStudents);
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

  // Class parsing logic to extract year and semester
  const parseClassInfo = (className: string) => {
    // Extract year from class name (e.g., "CSE-A (2nd Year)" -> 2)
    const yearMatch = className.match(/\((\d+)(?:st|nd|rd|th) Year\)/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 1;
    
    // Improved semester inference logic based on Indian academic calendar:
    // Academic year typically runs July to June
    // July-December = Odd semester (1, 3, 5, 7)
    // January-June = Even semester (2, 4, 6, 8)
    const currentMonth = new Date().getMonth() + 1; // 1-based (1=Jan, 12=Dec)
    const isOddSemester = currentMonth >= 7; // Jul-Dec = odd, Jan-Jun = even
    
    // Calculate semester based on year: Year 1 = Sem 1&2, Year 2 = Sem 3&4, etc.
    const baseSemester = (year - 1) * 2; // Year 1: 0, Year 2: 2, Year 3: 4, Year 4: 6
    const semester = baseSemester + (isOddSemester ? 1 : 2);
    
    return { year, semester };
  };

  // Helper function to get next class for promotion
  const getNextClass = (currentClass: string, department: string) => {
    // Parse current class to extract department, section, and year
    // e.g., "CSE-A (2nd Year)" -> dept: "CSE", section: "A", year: 2
    const classMatch = currentClass.match(/^([A-Z]+)-([A-Z]) \((\d+)(?:st|nd|rd|th) Year\)$/);
    if (!classMatch) return null;
    
    const [, dept, section, yearStr] = classMatch;
    const currentYear = parseInt(yearStr);
    
    // Check if student is already in final year (4th year)
    if (currentYear >= 4) return null;
    
    // Construct next year class for the same section
    const nextYear = currentYear + 1;
    const yearSuffix = getYearSuffix(nextYear);
    const nextClass = `${dept}-${section} (${nextYear}${yearSuffix} Year)`;
    
    // Verify the next class exists in our predefined classes list
    const departmentClasses = classes[department as keyof typeof classes];
    if (departmentClasses?.includes(nextClass)) {
      return nextClass;
    }
    
    return null; // Next class not found in predefined list
  };

  // Helper function to get year suffix (1st, 2nd, 3rd, 4th)
  const getYearSuffix = (year: number): string => {
    switch (year) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      case 4: return 'th';
      default: return 'th';
    }
  };

  // Student promotion function
  const handlePromoteStudent = async () => {
    if (!selectedStudent || !selectedDepartment) return;

    try {
      setActionLoading(true);
      
      const nextClass = getNextClass(selectedStudent.class, selectedDepartment);
      if (!nextClass) {
        toast({
          title: "Cannot Promote",
          description: "This student is already in the final year. Consider marking them as passed out.",
          variant: "destructive",
        });
        return;
      }

      const { year, semester } = parseClassInfo(nextClass);
      
      await firestoreService.updateStudent(selectedStudent.id, {
        class: nextClass,
        year,
        semester,
      });

      toast({
        title: "Student Promoted",
        description: `${selectedStudent.name} has been promoted to ${nextClass}.`,
      });

      setShowPromoteDialog(false);
      setSelectedStudent(null);
      await loadStudents(); // Refresh the list
    } catch (error) {
      console.error('Error promoting student:', error);
      toast({
        title: "Error",
        description: "Failed to promote student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Student passout function
  const handlePassoutStudent = async () => {
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      
      // Mark student as graduated
      const graduationDate = new Date();
      const originalClass = selectedStudent.class;
      
      await firestoreService.updateStudent(selectedStudent.id, {
        class: 'Graduated', // This removes them from active class queries
        year: selectedStudent.year, // Keep original year for records
        semester: selectedStudent.semester, // Keep original semester for records
        // Store graduation information in parentContact field as a structured note
        // This is a temporary solution - ideally we'd extend the Student type
        parentContact: `Graduated: ${originalClass} | Date: ${graduationDate.toISOString().split('T')[0]} | Original: ${selectedStudent.parentContact || 'N/A'}`,
      });

      toast({
        title: "Student Graduated",
        description: `${selectedStudent.name} has been marked as graduated from ${originalClass}.`,
      });

      setShowPassoutDialog(false);
      setSelectedStudent(null);
      await loadStudents(); // Refresh the list (graduated students are filtered out)
    } catch (error) {
      console.error('Error marking student as graduated:', error);
      toast({
        title: "Error",
        description: "Failed to mark student as graduated. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete student function
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      
      await firestoreService.deleteStudent(selectedStudent.id);

      toast({
        title: "Student Deleted",
        description: `${selectedStudent.name} has been removed from the system.`,
      });

      setShowDeleteDialog(false);
      setSelectedStudent(null);
      await loadStudents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Enhanced form validation with type safety
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Name validation
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }
    
    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 255) {
      errors.email = 'Email must be less than 255 characters';
    }
    
    // Roll number validation
    if (!formData.rollNumber?.trim()) {
      errors.rollNumber = 'Roll number is required';
    } else if (formData.rollNumber.trim().length > 50) {
      errors.rollNumber = 'Roll number must be less than 50 characters';
    } else if (students.some(s => s.rollNumber?.toLowerCase() === formData.rollNumber.trim().toLowerCase())) {
      errors.rollNumber = 'Roll number already exists in this class';
    }
    
    // Optional phone number validation with better pattern
    if (formData.phoneNumber?.trim()) {
      const phonePattern = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!phonePattern.test(formData.phoneNumber.trim())) {
        errors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
      }
    }
    
    // Validate parent contact if provided
    if (formData.parentContact?.trim()) {
      const phonePattern = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (!phonePattern.test(formData.parentContact.trim())) {
        errors.parentContact = 'Please enter a valid parent contact number';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      phoneNumber: '',
      parentContact: ''
    });
    setFormErrors({});
  };

  // Handle add student modal
  const handleAddStudent = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Enhanced form submission with comprehensive error handling
  const handleSubmit = async () => {
    // Runtime validation checks
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (!institute?.id || !selectedDepartment || !selectedClass) {
      toast({
        title: "Missing Information",
        description: "Please ensure department and class are selected.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Parse year and semester from selectedClass with error handling
      const { year, semester } = parseClassInfo(selectedClass);
      
      // Validate parsed values
      if (!year || year < 1 || year > 4) {
        throw new Error(`Invalid year extracted from class name: ${selectedClass}`);
      }
      
      if (!semester || semester < 1 || semester > 8) {
        throw new Error(`Invalid semester calculated: ${semester}`);
      }
      
      // Prepare student data with type safety
      const studentData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        rollNumber: formData.rollNumber.trim(),
        department: selectedDepartment,
        class: selectedClass,
        year,
        semester,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        parentContact: formData.parentContact?.trim() || undefined,
        instituteId: institute.id,
        createdAt: new Date()
      };
      
      // Validate data integrity before submission
      if (!studentData.name || !studentData.email || !studentData.rollNumber) {
        throw new Error('Required student information is missing');
      }
      
      await firestoreService.createStudent(studentData);
      
      toast({
        title: "Success",
        description: `Student ${studentData.name} added successfully to ${selectedClass}.`,
      });
      
      setShowAddModal(false);
      resetForm();
      await loadStudents(); // Refresh the student list
    } catch (error) {
      console.error('Error adding student:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Failed to add student. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          errorMessage = "A student with this roll number already exists in the class.";
        } else if (error.message.includes('Invalid year') || error.message.includes('Invalid semester')) {
          errorMessage = "There was an issue parsing the class information. Please contact support.";
        } else if (error.message.includes('Required student information')) {
          errorMessage = "Required student information is missing. Please check all fields.";
        }
      }
      
      toast({
        title: "Error Adding Student",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          <Button onClick={handleAddStudent} data-testid="button-add-student">
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
            <div key={student.id} className="relative">
              <PersonCard
                name={student.name}
                identifier={student.rollNumber}
                email={student.email}
                department={selectedDepartment}
                additionalInfo={[
                  { label: 'Year', value: student.year.toString() },
                  { label: 'Semester', value: student.semester.toString() }
                ]}
                onEdit={() => {
                  setSelectedStudent(student);
                  setFormData({
                    name: student.name,
                    email: student.email,
                    rollNumber: student.rollNumber,
                    phoneNumber: student.phoneNumber || '',
                    parentContact: student.parentContact || ''
                  });
                  setShowEditModal(true);
                }}
                onDelete={() => {
                  setSelectedStudent(student);
                  setShowDeleteDialog(true);
                }}
                data-testid={`student-card-${student.id}`}
              />
              
              {/* Action Dropdown */}
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      data-testid={`student-actions-${student.id}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedStudent(student);
                        setFormData({
                          name: student.name,
                          email: student.email,
                          rollNumber: student.rollNumber,
                          phoneNumber: student.phoneNumber || '',
                          parentContact: student.parentContact || ''
                        });
                        setShowEditModal(true);
                      }}
                      data-testid={`action-edit-${student.id}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Student
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowPromoteDialog(true);
                      }}
                      disabled={!getNextClass(student.class, selectedDepartment)}
                      data-testid={`action-promote-${student.id}`}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Promote Student
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowPassoutDialog(true);
                      }}
                      data-testid={`action-passout-${student.id}`}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Mark as Graduated
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive focus:text-destructive"
                      data-testid={`action-delete-${student.id}`}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Student
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
          onAction={handleAddStudent}
          data-testid="empty-state-students"
        />
      )}
      
      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md" data-testid="modal-add-student">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter student name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={formErrors.name ? "border-destructive" : ""}
                data-testid="input-student-name"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive" data-testid="error-student-name">
                  {formErrors.name}
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? "border-destructive" : ""}
                data-testid="input-student-email"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive" data-testid="error-student-email">
                  {formErrors.email}
                </p>
              )}
            </div>
            
            {/* Roll Number Field */}
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                placeholder="Enter roll number"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                className={formErrors.rollNumber ? "border-destructive" : ""}
                data-testid="input-student-roll"
              />
              {formErrors.rollNumber && (
                <p className="text-sm text-destructive" data-testid="error-student-roll">
                  {formErrors.rollNumber}
                </p>
              )}
            </div>
            
            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className={formErrors.phoneNumber ? "border-destructive" : ""}
                data-testid="input-student-phone"
              />
              {formErrors.phoneNumber && (
                <p className="text-sm text-destructive" data-testid="error-student-phone">
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>
            
            {/* Parent Contact Field */}
            <div className="space-y-2">
              <Label htmlFor="parentContact">Parent Contact (Optional)</Label>
              <Input
                id="parentContact"
                placeholder="Enter parent contact"
                value={formData.parentContact}
                onChange={(e) => setFormData(prev => ({ ...prev, parentContact: e.target.value }))}
                className={formErrors.parentContact ? "border-destructive" : ""}
                data-testid="input-student-parent"
              />
              {formErrors.parentContact && (
                <p className="text-sm text-destructive" data-testid="error-student-parent">
                  {formErrors.parentContact}
                </p>
              )}
            </div>
            
            {/* Auto-filled fields info */}
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="text-sm text-muted-foreground">
                <strong>Department:</strong> {departments.find(d => d.id === selectedDepartment)?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Class:</strong> {selectedClass}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Year & Semester:</strong> Year {parseClassInfo(selectedClass || '').year}, Semester {parseClassInfo(selectedClass || '').semester}
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
              data-testid="button-cancel-student"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              data-testid="button-submit-student"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Student'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Student Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md" data-testid="modal-edit-student">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter student name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={formErrors.name ? "border-destructive" : ""}
                data-testid="input-edit-student-name"
              />
              {formErrors.name && (
                <p className="text-sm text-destructive" data-testid="error-edit-student-name">
                  {formErrors.name}
                </p>
              )}
            </div>
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={formErrors.email ? "border-destructive" : ""}
                data-testid="input-edit-student-email"
              />
              {formErrors.email && (
                <p className="text-sm text-destructive" data-testid="error-edit-student-email">
                  {formErrors.email}
                </p>
              )}
            </div>
            
            {/* Roll Number Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-rollNumber">Roll Number *</Label>
              <Input
                id="edit-rollNumber"
                placeholder="Enter roll number"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                className={formErrors.rollNumber ? "border-destructive" : ""}
                data-testid="input-edit-student-roll"
              />
              {formErrors.rollNumber && (
                <p className="text-sm text-destructive" data-testid="error-edit-student-roll">
                  {formErrors.rollNumber}
                </p>
              )}
            </div>
            
            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="edit-phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className={formErrors.phoneNumber ? "border-destructive" : ""}
                data-testid="input-edit-student-phone"
              />
              {formErrors.phoneNumber && (
                <p className="text-sm text-destructive" data-testid="error-edit-student-phone">
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>
            
            {/* Parent Contact Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-parentContact">Parent Contact (Optional)</Label>
              <Input
                id="edit-parentContact"
                placeholder="Enter parent contact"
                value={formData.parentContact}
                onChange={(e) => setFormData(prev => ({ ...prev, parentContact: e.target.value }))}
                className={formErrors.parentContact ? "border-destructive" : ""}
                data-testid="input-edit-student-parent"
              />
              {formErrors.parentContact && (
                <p className="text-sm text-destructive" data-testid="error-edit-student-parent">
                  {formErrors.parentContact}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
              disabled={submitting}
              data-testid="button-cancel-edit-student"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!validateForm() || !selectedStudent) return;
                
                try {
                  setSubmitting(true);
                  await firestoreService.updateStudent(selectedStudent.id, {
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    rollNumber: formData.rollNumber.trim(),
                    phoneNumber: formData.phoneNumber?.trim() || undefined,
                    parentContact: formData.parentContact?.trim() || undefined,
                  });
                  
                  toast({
                    title: "Success",
                    description: `Student ${formData.name} updated successfully.`,
                  });
                  
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  resetForm();
                  await loadStudents();
                } catch (error) {
                  console.error('Error updating student:', error);
                  toast({
                    title: "Error",
                    description: "Failed to update student. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              data-testid="button-submit-edit-student"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Student'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote Student Dialog */}
      <AlertDialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <AlertDialogContent data-testid="dialog-promote-student">
          <AlertDialogHeader>
            <AlertDialogTitle>Promote Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote <strong>{selectedStudent?.name}</strong> from{' '}
              <strong>{selectedStudent?.class}</strong> to{' '}
              <strong>{selectedStudent && selectedDepartment ? getNextClass(selectedStudent.class, selectedDepartment) : ''}</strong>?
              
              This action will update their academic year and semester automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading} data-testid="button-cancel-promote">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromoteStudent}
              disabled={actionLoading}
              data-testid="button-confirm-promote"
            >
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Promoting...
                </>
              ) : (
                'Promote Student'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Passout Student Dialog */}
      <AlertDialog open={showPassoutDialog} onOpenChange={setShowPassoutDialog}>
        <AlertDialogContent data-testid="dialog-passout-student">
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Student as Graduated</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark <strong>{selectedStudent?.name}</strong> as graduated?
              
              This action will update their class status to indicate graduation. This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading} data-testid="button-cancel-passout">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePassoutStudent}
              disabled={actionLoading}
              data-testid="button-confirm-passout"
            >
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Mark as Graduated'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Student Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-student">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedStudent?.name}</strong>?
              
              This action will permanently remove the student from the system and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading} data-testid="button-cancel-delete">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Student'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};