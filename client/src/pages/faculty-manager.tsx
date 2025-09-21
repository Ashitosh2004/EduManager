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
import { Faculty, Department } from '@/types';
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
  UserCheck,
  Mail,
  Phone,
  BookOpen,
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DepartmentManager } from '@/components/department/DepartmentManager';
import { generateClassesForDepartment, departmentIconsAndColors, defaultSubjects, getIconFromKey, getSafeGradient, getDepartmentColorDetails } from '@/utils/departments';

// Helper function to get icon component from department
const getDepartmentIcon = (department: Department) => {
  return getIconFromKey(department.iconName);
};

// Helper function to get color class
const getDepartmentColor = (department: Department) => {
  return department.colorClass;
};

const FacultyManager: React.FC = () => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Record<string, string[]>>({});
  const [classes, setClasses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDepartmentManager, setShowDepartmentManager] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    classes: [] as string[],
    subjects: [] as string[]
  });

  useEffect(() => {
    if (institute) {
      loadDepartments();
    }
  }, [institute]);

  useEffect(() => {
    if (departments.length > 0) {
      loadDepartmentStats();
      generateSubjectsAndClassesData();
    }
  }, [departments]);

  useEffect(() => {
    if (selectedDepartment && institute) {
      loadFaculty();
    }
  }, [selectedDepartment, institute]);

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

  const generateSubjectsAndClassesData = () => {
    const subjectsData: Record<string, string[]> = {};
    const classesData: Record<string, string[]> = {};
    
    departments.forEach(dept => {
      // Use default subjects or generate based on department
      const deptKey = dept.shortName?.toLowerCase() || dept.name.toLowerCase();
      subjectsData[dept.id] = defaultSubjects[deptKey] || defaultSubjects.cse; // Fallback to CSE subjects
      classesData[dept.id] = generateClassesForDepartment(dept.shortName || dept.name);
    });
    
    setSubjects(subjectsData);
    setClasses(classesData);
  };

  const loadDepartmentStats = async () => {
    if (!institute) return;
    
    const stats: Record<string, number> = {};
    for (const dept of departments) {
      try {
        const facultyList = await firestoreService.getFacultyByDepartment(institute.id, dept.id);
        stats[dept.id] = facultyList.length;
      } catch (error) {
        stats[dept.id] = 0;
      }
    }
    setDepartmentStats(stats);
  };

  const loadFaculty = async () => {
    if (!institute || !selectedDepartment) return;
    
    try {
      setLoading(true);
      const facultyList = await firestoreService.getFacultyByDepartment(
        institute.id, 
        selectedDepartment
      );
      setFaculty(facultyList);
    } catch (error) {
      console.error('Error loading faculty:', error);
      toast({
        title: "Error",
        description: "Failed to load faculty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDepartment(deptId);
    setFaculty([]);
  };

  const handleBack = () => {
    setSelectedDepartment(null);
    setFaculty([]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      classes: [],
      subjects: []
    });
    setEditingFaculty(null);
  };

  const handleAddFaculty = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditFaculty = (facultyMember: Faculty) => {
    setFormData({
      name: facultyMember.name,
      email: facultyMember.email,
      phoneNumber: facultyMember.phoneNumber || '',
      classes: facultyMember.classes,
      subjects: facultyMember.subjects
    });
    setEditingFaculty(facultyMember);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!institute || !selectedDepartment) return;

    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const facultyData = {
        name: formData.name,
        email: formData.email,
        department: selectedDepartment,
        classes: formData.classes,
        subjects: formData.subjects,
        phoneNumber: formData.phoneNumber,
        instituteId: institute.id,
        createdAt: new Date()
      };

      if (editingFaculty) {
        await firestoreService.updateFaculty(editingFaculty.id, facultyData);
        toast({
          title: "Success",
          description: "Faculty member updated successfully.",
        });
      } else {
        await firestoreService.createFaculty(facultyData);
        toast({
          title: "Success",
          description: "Faculty member added successfully.",
        });
      }

      setShowAddModal(false);
      resetForm();
      loadFaculty();
      loadDepartmentStats();
    } catch (error) {
      console.error('Error saving faculty:', error);
      toast({
        title: "Error",
        description: "Failed to save faculty member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    try {
      setLoading(true);
      await firestoreService.deleteFaculty(facultyId);
      toast({
        title: "Success",
        description: "Faculty member deleted successfully.",
      });
      loadFaculty();
      loadDepartmentStats();
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: "Error",
        description: "Failed to delete faculty member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Department Selection View
  if (!selectedDepartment) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Faculty Manager</h1>
              <p className="text-muted-foreground">Manage faculty members and their assignments</p>
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
            const colorDetails = getDepartmentColorDetails(dept.colorClass);
            const count = departmentStats[dept.id] || 0;
            
            return (
              <Card 
                key={dept.id} 
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-0 overflow-hidden"
                onClick={() => handleDepartmentSelect(dept.id)}
                data-testid={`card-department-${dept.id}`}
                style={{
                  background: getSafeGradient(dept.customGradient, colorDetails.gradient),
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(59, 130, 246, 0.2)`
                }}
                onMouseEnter={(e) => {
                  const safeGradient = getSafeGradient(dept.customGradient, colorDetails.gradient);
                  if (safeGradient === colorDetails.gradient) {
                    e.currentTarget.style.background = colorDetails.hoverGradient;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = getSafeGradient(dept.customGradient, colorDetails.gradient);
                }}
              >
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-white dark:text-white" />
                    </div>
                    <span className="text-2xl font-bold text-foreground">{count}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{dept.shortName || dept.name} Department</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Department Manager Modal */}
        <Dialog 
          open={showDepartmentManager} 
          onOpenChange={(open) => {
            setShowDepartmentManager(open);
            if (!open) {
              // Refresh departments when modal is closed
              loadDepartments();
              loadDepartmentStats();
            }
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
                onClick={() => setShowDepartmentManager(false)}
                data-testid="button-close-department-manager"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Faculty List View
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
                {selectedDept?.name} Faculty
              </h1>
              <p className="text-muted-foreground">
                {selectedDept?.name} • {filteredFaculty.length} faculty members
              </p>
            </div>
          </div>
          
          <Button onClick={handleAddFaculty} data-testid="button-add-faculty">
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-faculty"
          />
        </div>
      </div>

      {/* Faculty List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((facultyMember) => (
            <Card key={facultyMember.id} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {facultyMember.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{facultyMember.name}</h3>
                      <p className="text-sm text-muted-foreground">{facultyMember.department.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground text-xs">{facultyMember.email}</span>
                  </div>
                  {facultyMember.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground text-xs">{facultyMember.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {facultyMember.subjects.slice(0, 2).map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {facultyMember.subjects.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{facultyMember.subjects.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditFaculty(facultyMember)}
                    data-testid={`button-edit-faculty-${facultyMember.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteFaculty(facultyMember.id)}
                    data-testid={`button-delete-faculty-${facultyMember.id}`}
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
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No faculty found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No faculty match your search criteria.' : 'Get started by adding your first faculty member.'}
            </p>
            <Button onClick={handleAddFaculty}>
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Faculty Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-name">Full Name *</Label>
                <Input 
                  id="faculty-name" 
                  placeholder="Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-faculty-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty-email">Email Address *</Label>
                <Input 
                  id="faculty-email" 
                  type="email" 
                  placeholder="john.smith@institute.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  data-testid="input-faculty-email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faculty-phone">Phone Number</Label>
              <Input 
                id="faculty-phone" 
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                data-testid="input-faculty-phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Subjects</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {selectedDepartment && subjects[selectedDepartment as keyof typeof subjects]?.map((subject) => (
                  <label key={subject} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.subjects.includes(subject)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, subjects: [...formData.subjects, subject]});
                        } else {
                          setFormData({...formData, subjects: formData.subjects.filter(s => s !== subject)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Classes</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {selectedDepartment && classes[selectedDepartment as keyof typeof classes]?.map((className) => (
                  <label key={className} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.classes.includes(className)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, classes: [...formData.classes, className]});
                        } else {
                          setFormData({...formData, classes: formData.classes.filter(c => c !== className)});
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{className}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)} 
                className="flex-1"
                data-testid="button-cancel-faculty"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={loading}
                data-testid="button-submit-faculty"
              >
                {loading ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyManager;