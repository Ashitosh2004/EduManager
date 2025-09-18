import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { timetableService } from '@/services/timetableService';
import { exportService } from '@/services/exportService';
import { TimetableEntry, Timetable, Conflict, Faculty, Course, Student } from '@/types';
import { 
  Calendar,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Clock,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimetableGeneratorProps {
  onBack?: () => void;
}

export const TimetableGenerator: React.FC<TimetableGeneratorProps> = ({ onBack }) => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [generatedTimetable, setGeneratedTimetable] = useState<Timetable | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  
  // Dynamic data from Firebase
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [classes, setClasses] = useState<Record<string, string[]>>({});
  
  const [formData, setFormData] = useState({
    department: '',
    class: '',
    semester: 'Fall 2024'
  });

  // User-defined timetable parameters
  const [timetableParams, setTimetableParams] = useState({
    totalHours: 8,
    startTime: '09:00',
    endTime: '17:00',
    shortBreakDuration: 10,
    lunchBreakDuration: 60,
    lunchBreakStart: '12:00',
    sessionDuration: 60
  });

  // Load dynamic data from Firebase
  useEffect(() => {
    if (institute) {
      loadDynamicData();
    }
  }, [institute]);

  const loadDynamicData = async () => {
    if (!institute) return;

    try {
      setLoadingData(true);
      
      // Load faculty and courses from Firebase
      const [facultyData, coursesData] = await Promise.all([
        firestoreService.getFacultyByInstitute(institute.id),
        firestoreService.getCoursesByInstitute(institute.id)
      ]);

      setFaculty(facultyData);
      setCourses(coursesData);

      // Extract unique departments from faculty and courses
      const deptSet = new Set([
        ...facultyData.map(f => f.department),
        ...coursesData.map(c => c.department)
      ]);
      const uniqueDepts = Array.from(deptSet).filter(Boolean);
      setDepartments(uniqueDepts);

      // Build dynamic classes mapping based on available data
      const classesMap: Record<string, string[]> = {};
      uniqueDepts.forEach(dept => {
        // Generate class options for each department (you can modify this logic)
        classesMap[dept] = [
          `${dept.toUpperCase()}-A (1st Year)`,
          `${dept.toUpperCase()}-B (1st Year)`,
          `${dept.toUpperCase()}-A (2nd Year)`,
          `${dept.toUpperCase()}-B (2nd Year)`,
          `${dept.toUpperCase()}-A (3rd Year)`,
          `${dept.toUpperCase()}-B (3rd Year)`,
          `${dept.toUpperCase()}-A (4th Year)`,
          `${dept.toUpperCase()}-B (4th Year)`
        ];
      });
      setClasses(classesMap);

    } catch (error) {
      console.error('Error loading dynamic data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load faculty and course data.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateTimetable = async () => {
    if (!formData.department || !formData.class || !institute) {
      toast({
        title: "Missing Information",
        description: "Please select department and class before generating timetable.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Generate timetable with dynamic data and user parameters
      const dynamicTimetable: Timetable = {
        id: `tt-${Date.now()}`,
        class: formData.class,
        department: formData.department,
        semester: formData.semester,
        academicYear: '2024-2025',
        entries: generateDynamicEntries(),
        conflicts: [],
        generatedAt: new Date(),
        instituteId: institute.id
      };

      // Validate for conflicts using historical data
      const detectedConflicts = await validateTimetableWithHistory(dynamicTimetable.entries);
      dynamicTimetable.conflicts = detectedConflicts;
      
      // Save generated timetable to Firebase for historical analysis
      try {
        const timetableId = await firestoreService.saveTimetable(dynamicTimetable);
        dynamicTimetable.id = timetableId;
      } catch (saveError) {
        console.warn('Failed to save timetable to Firebase:', saveError);
        // Continue without saving - don't block the generation
      }
      
      setGeneratedTimetable(dynamicTimetable);
      setConflicts(detectedConflicts);
      
      toast({
        title: "Timetable Generated",
        description: detectedConflicts.length === 0 
          ? "Timetable generated successfully with no conflicts!" 
          : `Timetable generated with ${detectedConflicts.length} conflict(s) detected.`,
      });
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate timetable. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic time slots based on user parameters
  const generateTimeSlots = () => {
    const slots = [];
    const startMinutes = parseTimeToMinutes(timetableParams.startTime);
    const endMinutes = parseTimeToMinutes(timetableParams.endTime);
    const sessionDuration = timetableParams.sessionDuration;
    const shortBreak = timetableParams.shortBreakDuration;
    const lunchStart = parseTimeToMinutes(timetableParams.lunchBreakStart);
    const lunchDuration = timetableParams.lunchBreakDuration;

    let currentTime = startMinutes;
    let slotIndex = 0;

    while (currentTime + sessionDuration <= endMinutes) {
      const slotStart = formatMinutesToTime(currentTime);
      const slotEnd = formatMinutesToTime(currentTime + sessionDuration);
      
      // Check if this slot conflicts with lunch break
      const isLunchTime = currentTime < lunchStart + lunchDuration && currentTime + sessionDuration > lunchStart;
      
      if (!isLunchTime) {
        slots.push({
          index: slotIndex++,
          start: slotStart,
          end: slotEnd,
          label: `${slotStart}-${slotEnd}`
        });
      }

      currentTime += sessionDuration;
      
      // Add short break, except if we're about to hit lunch
      if (currentTime < lunchStart || currentTime >= lunchStart + lunchDuration) {
        currentTime += shortBreak;
      }
      
      // Skip lunch break
      if (currentTime < lunchStart + lunchDuration && currentTime + sessionDuration > lunchStart) {
        currentTime = lunchStart + lunchDuration;
      }
    }

    return slots;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const generateDynamicEntries = (): TimetableEntry[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = generateTimeSlots();
    
    // Get courses for selected department
    const departmentCourses = courses.filter(course => course.department === formData.department);
    const departmentFaculty = faculty.filter(f => f.department === formData.department);
    
    if (departmentCourses.length === 0 || departmentFaculty.length === 0) {
      toast({
        title: "No Data Available",
        description: `No courses or faculty found for ${formData.department} department. Please add faculty and courses first.`,
        variant: "destructive",
      });
      return [];
    }

    const entries: TimetableEntry[] = [];
    let courseIndex = 0;

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((slot, slotIndex) => {
        // Generate classes with some randomness but ensure good coverage
        if (Math.random() > 0.25) { // 75% chance of having a class
          const course = departmentCourses[courseIndex % departmentCourses.length];
          const assignedFaculty = departmentFaculty.find(f => f.id === course.facultyId) || 
                                 departmentFaculty[Math.floor(Math.random() * departmentFaculty.length)];
          
          entries.push({
            id: `entry-${dayIndex}-${slotIndex}`,
            subjectId: course.id,
            subjectName: course.name,
            facultyId: assignedFaculty.id,
            facultyName: assignedFaculty.name,
            class: formData.class,
            room: `Room ${Math.floor(Math.random() * 500) + 100}`, // Generate room numbers dynamically
            day,
            timeSlot: `slot-${slotIndex}`,
            startTime: slot.start,
            endTime: slot.end
          });
          courseIndex++;
        }
      });
    });

    return entries;
  };

  // Validate timetable against historical data for conflicts
  const validateTimetableWithHistory = async (entries: TimetableEntry[]): Promise<Conflict[]> => {
    if (!institute) return [];

    try {
      // Get historical timetables for conflict analysis
      const historicalTimetables = await firestoreService.getTimetablesByInstitute(institute.id);
      const conflicts: Conflict[] = [];

      entries.forEach(entry => {
        // Check for faculty conflicts across all historical timetables
        historicalTimetables.forEach(historicalTT => {
          historicalTT.entries?.forEach(historicalEntry => {
            if (historicalEntry.facultyId === entry.facultyId &&
                historicalEntry.day === entry.day &&
                historicalEntry.startTime === entry.startTime &&
                historicalEntry.class !== entry.class) {
              conflicts.push({
                type: 'teacher',
                severity: 'high',
                description: `Faculty ${entry.facultyName} is already scheduled at ${entry.startTime} on ${entry.day} for ${historicalEntry.class}`,
                resolved: false
              });
            }
          });
        });

        // Check for room conflicts within the same timetable
        const roomConflicts = entries.filter(otherEntry => 
          otherEntry.id !== entry.id &&
          otherEntry.room === entry.room &&
          otherEntry.day === entry.day &&
          otherEntry.startTime === entry.startTime
        );

        roomConflicts.forEach(conflictEntry => {
          conflicts.push({
            type: 'room',
            severity: 'medium',
            description: `Room ${entry.room} is double-booked at ${entry.startTime} on ${entry.day}`,
            resolved: false
          });
        });
      });

      return conflicts;
    } catch (error) {
      console.error('Error validating timetable with history:', error);
      return [];
    }
  };

  const handleExportPDF = async () => {
    if (!generatedTimetable) return;
    
    try {
      await exportService.exportTimetableToPDF(generatedTimetable);
      toast({
        title: "Export Successful",
        description: "Timetable exported as PDF successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export timetable as PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = async () => {
    if (!generatedTimetable) return;
    
    try {
      await exportService.exportTimetableToExcel(generatedTimetable);
      toast({
        title: "Export Successful",
        description: "Timetable exported as Excel successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export timetable as Excel.",
        variant: "destructive",
      });
    }
  };

  const getConflictSummary = () => {
    const highSeverity = conflicts.filter(c => c.severity === 'high').length;
    const mediumSeverity = conflicts.filter(c => c.severity === 'medium').length;
    const lowSeverity = conflicts.filter(c => c.severity === 'low').length;
    
    return { high: highSeverity, medium: mediumSeverity, low: lowSeverity };
  };

  const conflictSummary = getConflictSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Timetable Generator</h2>
          <p className="text-muted-foreground">Generate intelligent timetables with conflict detection</p>
        </div>
        
        {generatedTimetable && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleExportPDF} data-testid="button-export-pdf">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel} data-testid="button-export-excel">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Configure Timetable</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timetable Parameters */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  <span>Timetable Parameters</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={timetableParams.startTime}
                      onChange={(e) => setTimetableParams(prev => ({ ...prev, startTime: e.target.value }))}
                      className="h-8 text-xs"
                      data-testid="input-start-time"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="end-time" className="text-xs">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={timetableParams.endTime}
                      onChange={(e) => setTimetableParams(prev => ({ ...prev, endTime: e.target.value }))}
                      className="h-8 text-xs"
                      data-testid="input-end-time"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="session-duration" className="text-xs">Session (min)</Label>
                    <Input
                      id="session-duration"
                      type="number"
                      value={timetableParams.sessionDuration}
                      onChange={(e) => setTimetableParams(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) || 60 }))}
                      className="h-8 text-xs"
                      data-testid="input-session-duration"
                      min="30"
                      max="120"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="short-break" className="text-xs">Short Break (min)</Label>
                    <Input
                      id="short-break"
                      type="number"
                      value={timetableParams.shortBreakDuration}
                      onChange={(e) => setTimetableParams(prev => ({ ...prev, shortBreakDuration: parseInt(e.target.value) || 10 }))}
                      className="h-8 text-xs"
                      data-testid="input-short-break"
                      min="5"
                      max="30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lunch-break" className="text-xs">Lunch Break Start</Label>
                  <Input
                    id="lunch-break"
                    type="time"
                    value={timetableParams.lunchBreakStart}
                    onChange={(e) => setTimetableParams(prev => ({ ...prev, lunchBreakStart: e.target.value }))}
                    className="h-8 text-xs"
                    data-testid="input-lunch-start"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lunch-duration" className="text-xs">Lunch Duration (min)</Label>
                  <Input
                    id="lunch-duration"
                    type="number"
                    value={timetableParams.lunchBreakDuration}
                    onChange={(e) => setTimetableParams(prev => ({ ...prev, lunchBreakDuration: parseInt(e.target.value) || 60 }))}
                    className="h-8 text-xs"
                    data-testid="input-lunch-duration"
                    min="30"
                    max="120"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value, class: '' }))}
                >
                  <SelectTrigger data-testid="select-department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select 
                  value={formData.class} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
                  disabled={!formData.department}
                >
                  <SelectTrigger data-testid="select-class">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.department && classes[formData.department as keyof typeof classes]?.map(className => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={formData.semester} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger data-testid="select-semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                    <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                    <SelectItem value="Summer 2024">Summer 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleGenerateTimetable}
                disabled={loading || !formData.department || !formData.class}
                className="w-full"
                data-testid="button-generate-timetable"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Timetable
                  </>
                )}
              </Button>
              </div>
              
              {/* Conflict Detection Status */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Conflict Detection
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      High Priority
                    </span>
                    <Badge variant={conflictSummary.high > 0 ? "destructive" : "secondary"}>
                      {conflictSummary.high}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-yellow-600">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      Medium Priority
                    </span>
                    <Badge variant={conflictSummary.medium > 0 ? "secondary" : "outline"}>
                      {conflictSummary.medium}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-blue-600">
                      <Clock className="h-3 w-3 mr-2" />
                      Low Priority
                    </span>
                    <Badge variant="outline">
                      {conflictSummary.low}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable Display */}
        <div className="lg:col-span-3">
          {generatedTimetable ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {generatedTimetable.class} - {generatedTimetable.semester}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Generated: {new Date(generatedTimetable.generatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[100px]">Time</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Monday</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tuesday</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Wednesday</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Thursday</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Friday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateTimeSlots().map((slot, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium text-muted-foreground">{slot.label}</td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                            const entry = generatedTimetable.entries.find(e => 
                              e.day === day && e.startTime === slot.start
                            );
                            
                            if (!entry) {
                              return <td key={day} className="py-3 px-4 text-center text-muted-foreground">-</td>;
                            }
                            
                            const colors = [
                              'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500',
                              'bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500',
                              'bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500',
                              'bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500',
                              'bg-teal-50 dark:bg-teal-950/30 border-l-4 border-teal-500',
                            ];
                            const colorClass = colors[index % colors.length];
                            
                            return (
                              <td key={day} className="py-3 px-4">
                                <div className={`${colorClass} rounded-lg p-3`}>
                                  <div className="font-medium text-sm text-foreground">{entry.subjectName}</div>
                                  <div className="text-xs text-muted-foreground">{entry.facultyName}</div>
                                  <div className="text-xs text-muted-foreground">{entry.room}</div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Generate Your Timetable</h3>
                <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                  Configure your department, class, and semester settings, then generate an 
                  intelligent timetable with automatic conflict detection.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline">Conflict Detection</Badge>
                  <Badge variant="outline">Room Management</Badge>
                  <Badge variant="outline">Faculty Scheduling</Badge>
                  <Badge variant="outline">Export Options</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
