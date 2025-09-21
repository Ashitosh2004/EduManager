import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ManagerHeader,
  EmptyState,
  EntityCard
} from '@/components/ui/ManagerUI';
import { useToast } from '@/hooks/use-toast';
import { Faculty, Department, Institute } from '@/types';
import { firestoreService } from '@/services/firestoreService';
import { 
  UserCheck, 
  Plus, 
  Users, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap,
  Search,
  Edit,
  Trash2,
  Filter,
  X
} from 'lucide-react';

interface FacultyManagerProps {
  institute: Institute | null;
  onBack?: () => void;
}

export const FacultyManager: React.FC<FacultyManagerProps> = ({ institute, onBack }) => {
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phoneNumber: '',
    classes: [] as string[],
    subjects: [] as string[],
    classInput: '',
    subjectInput: ''
  });

  useEffect(() => {
    if (institute) {
      loadFaculty();
      loadDepartments();
    }
  }, [institute]);

  const loadFaculty = async () => {
    if (!institute) return;
    
    try {
      setLoading(true);
      const facultyData = await firestoreService.getFacultyByInstitute(institute.id);
      setFaculty(facultyData);
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

  const loadDepartments = async () => {
    if (!institute) return;
    
    try {
      const departmentData = await firestoreService.getDepartmentsByInstitute(institute.id);
      setDepartments(departmentData);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      phoneNumber: '',
      classes: [],
      subjects: [],
      classInput: '',
      subjectInput: ''
    });
  };

  const handleAddFaculty = () => {
    resetForm();
    setEditingFaculty(null);
    setShowAddModal(true);
  };

  const handleEditFaculty = (facultyMember: Faculty) => {
    setFormData({
      name: facultyMember.name,
      email: facultyMember.email,
      department: facultyMember.department,
      phoneNumber: facultyMember.phoneNumber || '',
      classes: facultyMember.classes || [],
      subjects: facultyMember.subjects || [],
      classInput: '',
      subjectInput: ''
    });
    setEditingFaculty(facultyMember);
    setShowAddModal(true);
  };

  const handleAddClass = () => {
    if (formData.classInput.trim() && !formData.classes.includes(formData.classInput.trim())) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, prev.classInput.trim()],
        classInput: ''
      }));
    }
  };

  const handleRemoveClass = (classToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.filter(cls => cls !== classToRemove)
    }));
  };

  const handleAddSubject = () => {
    if (formData.subjectInput.trim() && !formData.subjects.includes(formData.subjectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, prev.subjectInput.trim()],
        subjectInput: ''
      }));
    }
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subj => subj !== subjectToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Faculty name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email address is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.department) {
      toast({
        title: "Validation Error",
        description: "Department selection is required.",
        variant: "destructive",
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicate email
    const existingFaculty = faculty.find(f => 
      f.email.toLowerCase() === formData.email.toLowerCase() && 
      f.id !== editingFaculty?.id
    );
    if (existingFaculty) {
      toast({
        title: "Validation Error",
        description: "A faculty member with this email already exists.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!institute) return;

    try {
      setLoading(true);
      
      const facultyData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department,
        phoneNumber: formData.phoneNumber.trim(),
        classes: formData.classes,
        subjects: formData.subjects,
        instituteId: institute.id
      };

      if (editingFaculty) {
        await firestoreService.updateFaculty(editingFaculty.id, facultyData);
        toast({
          title: "Success",
          description: "Faculty updated successfully.",
        });
      } else {
        await firestoreService.createFaculty({
          ...facultyData,
          createdAt: new Date()
        });
        toast({
          title: "Success",
          description: "Faculty added successfully.",
        });
      }

      setShowAddModal(false);
      resetForm();
      setEditingFaculty(null);
      loadFaculty();
    } catch (error) {
      console.error('Error saving faculty:', error);
      toast({
        title: "Error",
        description: "Failed to save faculty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteFaculty = (facultyMember: Faculty) => {
    setFacultyToDelete(facultyMember);
    setShowDeleteDialog(true);
  };

  const handleDeleteFaculty = async () => {
    if (!facultyToDelete) return;

    try {
      setDeleteLoading(true);
      await firestoreService.deleteFaculty(facultyToDelete.id);
      toast({
        title: "Success",
        description: `Faculty member "${facultyToDelete.name}" deleted successfully.`,
      });
      setShowDeleteDialog(false);
      setFacultyToDelete(null);
      loadFaculty();
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: "Error",
        description: "Failed to delete faculty. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || member.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : departmentId;
  };

  if (!institute) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No Institute Selected"
        description="Please select an institute to manage faculty members."
      />
    );
  }

  return (
    <div className="space-y-6">
      <ManagerHeader
        title="Faculty Manager"
        subtitle="Manage faculty members and their assignments"
        onBack={onBack}
        actions={
          <Button onClick={handleAddFaculty} data-testid="button-add-faculty">
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        }
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-faculty"
          />
        </div>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[200px]" data-testid="select-department-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDepartment && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDepartment('')}
              data-testid="button-clear-filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Faculty List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredFaculty.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title={searchTerm || selectedDepartment ? "No Faculty Found" : "No Faculty Added Yet"}
          description={
            searchTerm || selectedDepartment
              ? "No faculty members match your search criteria."
              : "Start by adding your first faculty member to the system."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1" data-testid={`text-faculty-name-${member.id}`}>
                      {member.name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {member.email}
                    </div>
                    {member.phoneNumber && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {member.phoneNumber}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getDepartmentName(member.department)}
                  </Badge>
                </div>

                {/* Classes */}
                {member.classes && member.classes.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-sm font-medium text-foreground mb-2">
                      <Users className="h-3 w-3 mr-1" />
                      Classes ({member.classes.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.classes.slice(0, 3).map((cls, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cls}
                        </Badge>
                      ))}
                      {member.classes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.classes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Subjects */}
                {member.subjects && member.subjects.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm font-medium text-foreground mb-2">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Subjects ({member.subjects.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {member.subjects.slice(0, 3).map((subject, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {member.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{member.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditFaculty(member)}
                    data-testid={`button-edit-${member.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDeleteFaculty(member)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-${member.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Faculty Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-faculty">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                  data-testid="input-faculty-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                  data-testid="input-faculty-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                  required
                >
                  <SelectTrigger data-testid="select-faculty-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter phone number"
                  data-testid="input-faculty-phone"
                />
              </div>
            </div>

            {/* Classes Assignment */}
            <div className="space-y-2">
              <Label>Classes Assignment</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.classInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, classInput: e.target.value }))}
                  placeholder="e.g., CSE-A, CSE-B"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClass())}
                  data-testid="input-add-class"
                />
                <Button type="button" onClick={handleAddClass} data-testid="button-add-class">
                  Add
                </Button>
              </div>
              {formData.classes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.classes.map((cls, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveClass(cls)}>
                      {cls} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Subjects Assignment */}
            <div className="space-y-2">
              <Label>Subjects Assignment</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.subjectInput}
                  onChange={(e) => setFormData(prev => ({ ...prev, subjectInput: e.target.value }))}
                  placeholder="e.g., Mathematics, Physics"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                  data-testid="input-add-subject"
                />
                <Button type="button" onClick={handleAddSubject} data-testid="button-add-subject">
                  Add
                </Button>
              </div>
              {formData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveSubject(subject)}>
                      {subject} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} data-testid="button-save-faculty">
                {loading ? 'Saving...' : editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-faculty">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{facultyToDelete?.name}</strong>?
              
              This action will permanently remove the faculty member from the system. This action cannot be undone.
              
              {/* Warning about dependent data */}
              <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Warning: Deleting this faculty member may affect:
                </p>
                <ul className="text-sm text-destructive/80 mt-1 ml-4 list-disc">
                  <li>Course assignments and teaching schedules</li>
                  <li>Generated timetables for assigned classes</li>
                  <li>Student-faculty relationships</li>
                  <li>Any pending assignments or grading</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteLoading} 
              data-testid="button-cancel-delete-faculty"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFaculty}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-faculty"
            >
              {deleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Faculty'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};