import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Department } from '@/types';
import { departmentIconsAndColors, departmentColors, getDepartmentColorDetails, DepartmentColor, getIconFromKey } from '@/utils/departments';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users, 
  BookOpen,
  Calendar,
  Settings
} from 'lucide-react';

export const DepartmentManager: React.FC = () => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    iconIndex: 0,
    colorIndex: 0,
    customGradient: ''
  });

  useEffect(() => {
    if (institute) {
      loadDepartments();
    }
  }, [institute]);

  const loadDepartments = async () => {
    if (!institute) return;
    
    try {
      setLoading(true);
      const departmentList = await firestoreService.getDepartmentsByInstitute(institute.id);
      setDepartments(departmentList);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      iconIndex: 0,
      colorIndex: 0,
      customGradient: ''
    });
    setEditingDepartment(null);
  };

  const handleAddDepartment = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    // Find the icon index by matching the icon key
    const iconIndex = departmentIconsAndColors.findIndex(
      item => item.key === department.iconName
    );
    
    // Find the color index by matching the color class in departmentColors
    const colorIndex = departmentColors.findIndex(
      item => item.class === department.colorClass
    );
    
    setFormData({
      name: department.name,
      shortName: department.shortName || '',
      iconIndex: Math.max(0, iconIndex),
      colorIndex: Math.max(0, colorIndex),
      customGradient: department.customGradient || ''
    });
    setEditingDepartment(department);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!institute) return;

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a department name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check for duplicate department name
      const existingDepartment = departments.find(
        dept => dept.name.toLowerCase() === formData.name.trim().toLowerCase() &&
                (!editingDepartment || dept.id !== editingDepartment.id)
      );
      
      if (existingDepartment) {
        toast({
          title: "Duplicate Department",
          description: `A department with the name "${formData.name}" already exists.`,
          variant: "destructive",
        });
        return;
      }

      const selectedIcon = departmentIconsAndColors[formData.iconIndex];
      const selectedColor = departmentColors[formData.colorIndex];
      const departmentData = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim() || undefined,
        iconName: selectedIcon.key,
        colorClass: selectedColor.class,
        customGradient: formData.customGradient || selectedColor.gradient,
        instituteId: institute.id,
        createdAt: editingDepartment ? editingDepartment.createdAt : new Date()
      };

      if (editingDepartment) {
        await firestoreService.updateDepartment(editingDepartment.id, departmentData);
        toast({
          title: "Success",
          description: "Department updated successfully.",
        });
      } else {
        await firestoreService.createDepartment(departmentData);
        toast({
          title: "Success",
          description: "Department added successfully.",
        });
      }

      setShowAddModal(false);
      resetForm();
      loadDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: "Error",
        description: "Failed to save department. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      setLoading(true);
      await firestoreService.deleteDepartment(departmentId);
      toast({
        title: "Success",
        description: "Department deleted successfully.",
      });
      loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: "Error",
        description: "Failed to delete department. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.shortName && dept.shortName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Department Manager</h1>
            <p className="text-muted-foreground">Manage departments for your institute</p>
          </div>
          
          <Button onClick={handleAddDepartment} data-testid="button-add-department">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-departments"
          />
        </div>
      </div>

      {/* Department List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="w-16 h-6 bg-muted rounded"></div>
                  </div>
                  <div className="w-3/4 h-6 bg-muted rounded"></div>
                  <div className="w-1/2 h-4 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No departments found</h3>
            <p className="text-muted-foreground mb-4">
              {departments.length === 0
                ? "Get started by adding your first department."
                : "Try adjusting your search terms."}
            </p>
            {departments.length === 0 && (
              <Button onClick={handleAddDepartment}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => {
            const Icon = getIconFromKey(department.iconName);
            const colorDetails = getDepartmentColorDetails(department.colorClass);
            
            return (
              <Card 
                key={department.id} 
                className="hover:shadow-md transition-all duration-300 overflow-hidden border-0"
                style={{
                  background: department.customGradient || colorDetails.gradient,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(59, 130, 246, 0.2)`
                }}
                onMouseEnter={(e) => {
                  if (!department.customGradient) {
                    e.currentTarget.style.background = colorDetails.hoverGradient;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = department.customGradient || colorDetails.gradient;
                }}
                data-testid={`card-department-${department.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${department.colorClass} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {department.name}
                  </h3>
                  
                  {department.shortName && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Short Name: {department.shortName}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDepartment(department)}
                        data-testid={`button-edit-${department.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${department.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        0
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3 mr-1" />
                        0
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Department Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Department Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Computer Science"
                data-testid="input-department-name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Short Name (Optional)
              </label>
              <Input
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                placeholder="e.g., CS, CSE"
                data-testid="input-department-short-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Icon
                </label>
                <Select 
                  value={formData.iconIndex.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, iconIndex: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-department-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentIconsAndColors.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <SelectItem key={index} value={index.toString()}>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <span>Icon {index + 1}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Color
                </label>
                <Select 
                  value={formData.colorIndex.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, colorIndex: parseInt(value) })}
                >
                  <SelectTrigger data-testid="select-department-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentColors.map((item, index) => {
                      return (
                        <SelectItem key={index} value={index.toString()}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-6 h-6 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                              style={{ background: item.gradient }}
                            ></div>
                            <span>{item.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Custom Gradient (Optional)
              </label>
              <Input
                value={formData.customGradient}
                onChange={(e) => setFormData({ ...formData, customGradient: e.target.value })}
                placeholder="linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.08))"
                data-testid="input-custom-gradient"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use the selected color's default gradient
              </p>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                data-testid="button-cancel-department"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                data-testid="button-save-department"
              >
                {loading ? 'Saving...' : editingDepartment ? 'Update Department' : 'Add Department'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};