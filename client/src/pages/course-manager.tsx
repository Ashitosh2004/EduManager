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
import { Course, Faculty } from '@/types';
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
  BookOpen,
  Award,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const departments = [
  { id: 'cse', name: 'Computer Science', icon: Computer, color: 'bg-blue-500' },
  { id: 'ece', name: 'Electronics & Comm.', icon: Zap, color: 'bg-green-500' },
  { id: 'mech', name: 'Mechanical Engg.', icon: Cog, color: 'bg-orange-500' },
];

const CourseManager: React.FC = () => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    semester: 1,
    year: 1,
    facultyId: ''
  });

  useEffect(() => {
    if (institute) {
      loadDepartmentStats();
    }
  }, [institute]);

  useEffect(() => {
    if (selectedDepartment && institute) {
      loadCourses();
      loadFaculty();
    }
  }, [selectedDepartment, institute]);

  const loadDepartmentStats = async () => {
    if (!institute) return;
    
    const stats: Record<string, number> = {};
    for (const dept of departments) {
      try {
        const courseList = await firestoreService.getCoursesByDepartment(institute.id, dept.id);
        stats[dept.id] = courseList.length;
      } catch (error) {
        stats[dept.id] = 0;
      }
    }
    setDepartmentStats(stats);
  };

  const loadCourses = async () => {
    if (!institute || !selectedDepartment) return;
    
    try {
      setLoading(true);
      const courseList = await firestoreService.getCoursesByDepartment(
        institute.id, 
        selectedDepartment
      );
      setCourses(courseList);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFaculty = async () => {
    if (!institute || !selectedDepartment) return;
    
    try {
      const facultyList = await firestoreService.getFacultyByDepartment(
        institute.id, 
        selectedDepartment
      );
      setFaculty(facultyList);
    } catch (error) {
      console.error('Error loading faculty:', error);
    }
  };

  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDepartment(deptId);
    setCourses([]);
  };

  const handleBack = () => {
    setSelectedDepartment(null);
    setCourses([]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
      semester: 1,
      year: 1,
      facultyId: ''
    });
    setEditingCourse(null);
  };

  const handleAddCourse = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setFormData({
      name: course.name,
      code: course.code,
      credits: course.credits,
      semester: course.semester,
      year: course.year,
      facultyId: course.facultyId
    });
    setEditingCourse(course);
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!institute || !selectedDepartment) return;

    if (!formData.name || !formData.code || !formData.facultyId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Normalize course code for comparison
      const normalizedCode = formData.code.trim().toLowerCase().replace(/\s+/g, '');
      
      // Check for duplicate course code in the same department
      const existingCourses = await firestoreService.getCoursesByDepartment(
        institute.id, 
        selectedDepartment
      );
      
      const duplicateCourse = existingCourses.find(
        course => {
          const existingNormalizedCode = course.code.trim().toLowerCase().replace(/\s+/g, '');
          return existingNormalizedCode === normalizedCode && 
                 (!editingCourse || course.id !== editingCourse.id);
        }
      );
      
      if (duplicateCourse) {
        toast({
          title: "Duplicate Course",
          description: `A course with code "${formData.code}" already exists in this department.`,
          variant: "destructive",
        });
        return;
      }
      
      const courseData = {
        name: formData.name,
        code: formData.code.trim(),
        department: selectedDepartment,
        credits: formData.credits,
        semester: formData.semester,
        year: formData.year,
        facultyId: formData.facultyId,
        assignments: [],
        instituteId: institute.id,
        createdAt: editingCourse ? editingCourse.createdAt : new Date() // Preserve createdAt for existing courses
      };

      if (editingCourse) {
        await firestoreService.updateCourse(editingCourse.id, courseData);
        toast({
          title: "Success",
          description: "Course updated successfully.",
        });
      } else {
        await firestoreService.createCourse(courseData);
        toast({
          title: "Success",
          description: "Course added successfully.",
        });
      }

      setShowAddModal(false);
      resetForm();
      loadCourses();
      loadDepartmentStats();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setLoading(true);
      await firestoreService.deleteCourse(courseId);
      toast({
        title: "Success",
        description: "Course deleted successfully.",
      });
      loadCourses();
      loadDepartmentStats();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFacultyName = (facultyId: string) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? facultyMember.name : 'Unknown Faculty';
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Department Selection View
  if (!selectedDepartment) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Manager</h1>
          <p className="text-muted-foreground">Create and manage courses, assignments, and grades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const count = departmentStats[dept.id] || 0;
            
            return (
              <Card 
                key={dept.id} 
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => handleDepartmentSelect(dept.id)}
                data-testid={`card-department-${dept.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${dept.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count} courses
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {dept.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    Click to manage courses in this department
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Course List View
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
                {selectedDept?.name} Courses
              </h1>
              <p className="text-muted-foreground">
                {selectedDept?.name} • {filteredCourses.length} courses
              </p>
            </div>
          </div>
          
          <Button onClick={handleAddCourse} data-testid="button-add-course">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-courses"
          />
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.code}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="text-foreground">{course.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="text-foreground">{course.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="text-foreground">{course.semester}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground text-xs">{getFacultyName(course.facultyId)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditCourse(course)}
                    data-testid={`button-edit-course-${course.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteCourse(course.id)}
                    data-testid={`button-delete-course-${course.id}`}
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
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No courses match your search criteria.' : 'Get started by adding your first course.'}
            </p>
            <Button onClick={handleAddCourse}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Course Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-name">Course Name *</Label>
                <Input 
                  id="course-name" 
                  placeholder="Database Systems"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  data-testid="input-course-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-code">Course Code *</Label>
                <Input 
                  id="course-code" 
                  placeholder="CSE301"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  data-testid="input-course-code"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Select 
                  value={formData.credits.toString()} 
                  onValueChange={(value) => setFormData({...formData, credits: parseInt(value)})}
                >
                  <SelectTrigger data-testid="select-credits">
                    <SelectValue placeholder="Credits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Credit</SelectItem>
                    <SelectItem value="2">2 Credits</SelectItem>
                    <SelectItem value="3">3 Credits</SelectItem>
                    <SelectItem value="4">4 Credits</SelectItem>
                    <SelectItem value="5">5 Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select 
                  value={formData.year.toString()} 
                  onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}
                >
                  <SelectTrigger data-testid="select-year">
                    <SelectValue placeholder="Year" />
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
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sem 1</SelectItem>
                    <SelectItem value="2">Sem 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty *</Label>
              <Select 
                value={formData.facultyId} 
                onValueChange={(value) => setFormData({...formData, facultyId: value})}
              >
                <SelectTrigger data-testid="select-faculty">
                  <SelectValue placeholder="Select faculty member" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((facultyMember) => (
                    <SelectItem key={facultyMember.id} value={facultyMember.id}>
                      {facultyMember.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)} 
                className="flex-1"
                data-testid="button-cancel-course"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={loading}
                data-testid="button-submit-course"
              >
                {loading ? 'Saving...' : editingCourse ? 'Update Course' : 'Add Course'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseManager;