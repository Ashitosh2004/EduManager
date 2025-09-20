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
import { TimetableEntry, Timetable, TimetableConfig, SessionInput, Conflict, Faculty, Course, Classroom, Student } from '@/types';
import { 
  Calendar,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Clock,
  Settings,
  Plus,
  Trash2,
  Users,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TimetableGrid } from './TimetableGrid';

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
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [classes, setClasses] = useState<Record<string, string[]>>({});  // Session configuration state
  const [sessions, setSessions] = useState<SessionInput[]>([]);
  const [sessionConflicts, setSessionConflicts] = useState<Record<string, Conflict[]>>({});
  
  const [formData, setFormData] = useState({
    department: '',
    class: '',
    semester: 'Sem 1'
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

  // Calculate total hours automatically
  useEffect(() => {
    const startMinutes = parseTimeToMinutes(timetableParams.startTime);
    const endMinutes = parseTimeToMinutes(timetableParams.endTime);
    const totalMinutes = endMinutes - startMinutes;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal
    
    setTimetableParams(prev => ({ ...prev, totalHours }));
  }, [timetableParams.startTime, timetableParams.endTime]);

  // Session management functions
  const addSession = () => {
    const newSession: SessionInput = {
      id: `session-${Date.now()}`,
      subjectId: '',
      facultyId: '',
      type: 'lecture',
      durationMinutes: timetableParams.sessionDuration,
      classroomId: '',
      roomText: ''
    };
    setSessions(prev => [...prev, newSession]);
  };

  const updateSession = (sessionId: string, updates: Partial<SessionInput>) => {
    setSessions(prev => {
      const updated = prev.map(session => 
        session.id === sessionId ? { ...session, ...updates } : session
      );
      return updated;
    });
    
    // Clear existing conflicts for this session
    setSessionConflicts(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
  };

  const removeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    setSessionConflicts(prev => {
      const updated = { ...prev };
      delete updated[sessionId];
      return updated;
    });
  };

  // Helper function to get room name from session (prefer ID over name for consistency)
  const getRoomName = (session: SessionInput): string => {
    if (session.classroomId && session.classroomId !== '' && session.classroomId !== 'custom') {
      const classroom = classrooms.find(c => c.id === session.classroomId);
      return classroom ? classroom.name : session.roomText || '';
    }
    return session.roomText || '';
  };

  // Helper function to get room ID for conflict checking (prefer ID when available)
  const getRoomId = (session: SessionInput): string => {
    return session.classroomId || session.roomText || '';
  };

  // Helper function to create tentative schedule for conflict checking
  const createTentativeSchedule = (sessionList: SessionInput[]) => {
    const schedule: {
      session: SessionInput;
      day: string;
      startMinutes: number;
      endMinutes: number;
    }[] = [];
    
    const timeSlots = generateTimeSlots();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let slotIndex = 0;
    let dayIndex = 0;
    
    for (const session of sessionList) {
      if (!session.subjectId || !session.facultyId) continue;
      
      // Calculate how many time slots this session needs
      const slotsNeeded = Math.ceil(session.durationMinutes / timetableParams.sessionDuration);
      
      if (session.day) {
        // Session has a specified day - must honor it
        if (slotIndex + slotsNeeded <= timeSlots.length) {
          const startSlot = timeSlots[slotIndex];
          const endSlot = timeSlots[Math.min(slotIndex + slotsNeeded - 1, timeSlots.length - 1)];
          
          schedule.push({
            session,
            day: session.day,
            startMinutes: parseTimeToMinutes(startSlot.start),
            endMinutes: parseTimeToMinutes(endSlot.end)
          });
          
          slotIndex += slotsNeeded;
        }
        // If no room on the specified day, skip this session (will be detected as conflict)
      } else {
        // No day specified - assign automatically
        const assignedDay = days[dayIndex % days.length];
        
        if (slotIndex + slotsNeeded <= timeSlots.length) {
          const startSlot = timeSlots[slotIndex];
          const endSlot = timeSlots[Math.min(slotIndex + slotsNeeded - 1, timeSlots.length - 1)];
          
          schedule.push({
            session,
            day: assignedDay,
            startMinutes: parseTimeToMinutes(startSlot.start),
            endMinutes: parseTimeToMinutes(endSlot.end)
          });
          
          slotIndex += slotsNeeded;
        } else {
          // Move to next day
          dayIndex++;
          slotIndex = 0;
          
          if (dayIndex < days.length && slotIndex + slotsNeeded <= timeSlots.length) {
            const startSlot = timeSlots[slotIndex];
            const endSlot = timeSlots[Math.min(slotIndex + slotsNeeded - 1, timeSlots.length - 1)];
            
            schedule.push({
              session,
              day: days[dayIndex],
              startMinutes: parseTimeToMinutes(startSlot.start),
              endMinutes: parseTimeToMinutes(endSlot.end)
            });
            
            slotIndex += slotsNeeded;
          }
        }
      }
    }
    
    return schedule;
  };

  // Validate sessions for conflicts (run after sessions state updates)
  useEffect(() => {
    if (!institute || !formData.class || sessions.length === 0) {
      return;
    }

    const validateAllSessions = async () => {
      const newConflicts: Record<string, Conflict[]> = {};
      
      // First, create a tentative schedule to determine where each session would be placed
      const tentativeSchedule = createTentativeSchedule(sessions);
      
      // Parallelize external conflict detection
      const externalConflictPromises = tentativeSchedule.map(async (scheduledSession) => {
        const conflicts: Conflict[] = [];
        
        try {
          const conflictEntry = {
            instituteId: institute.id,
            facultyId: scheduledSession.session.facultyId,
            room: getRoomId(scheduledSession.session), // Use ID for more precise matching
            day: scheduledSession.day,
            startMinutes: scheduledSession.startMinutes,
            endMinutes: scheduledSession.endMinutes,
            class: formData.class
          };
          
          const conflictingSessions = await firestoreService.getConflictingSessions(conflictEntry);
          
          conflictingSessions.forEach(conflictingSession => {
            const conflict: Conflict = {
              type: conflictingSession.facultyId === scheduledSession.session.facultyId ? 'teacher' : 'room',
              severity: 'high',
              description: conflictingSession.facultyId === scheduledSession.session.facultyId 
                ? `Faculty ${faculty.find(f => f.id === scheduledSession.session.facultyId)?.name || 'Unknown'} is already scheduled on ${scheduledSession.day} at ${formatMinutesToTime(scheduledSession.startMinutes)}`
                : `Room ${getRoomName(scheduledSession.session)} is already booked on ${scheduledSession.day} at ${formatMinutesToTime(scheduledSession.startMinutes)}`,
              resolved: false,
              sessionId: scheduledSession.session.id
            };
            conflicts.push(conflict);
          });
        } catch (error) {
          console.error('Error validating external conflicts for session:', scheduledSession.session.id, error);
          // Add a warning about external validation failure
          conflicts.push({
            type: 'preference',
            severity: 'low',
            description: 'Unable to check conflicts against existing timetables. Please verify manually.',
            resolved: false,
            sessionId: scheduledSession.session.id
          });
        }
        
        return { sessionId: scheduledSession.session.id, externalConflicts: conflicts, scheduledSession };
      });
      
      const externalResults = await Promise.all(externalConflictPromises);
      
      // Process results and add internal conflicts
      for (const result of externalResults) {
        const { sessionId, externalConflicts, scheduledSession } = result;
        const allConflicts = [...externalConflicts];
          
        // Check for conflicts within the current session set
        tentativeSchedule.forEach(otherScheduled => {
          if (otherScheduled.session.id !== scheduledSession.session.id &&
              otherScheduled.day === scheduledSession.day &&
              scheduledSession.startMinutes < otherScheduled.endMinutes &&
              otherScheduled.startMinutes < scheduledSession.endMinutes) {
            
            if (otherScheduled.session.facultyId === scheduledSession.session.facultyId) {
              allConflicts.push({
                type: 'teacher',
                severity: 'high',
                description: `Faculty scheduling conflict with another session on ${scheduledSession.day}`,
                resolved: false,
                sessionId: scheduledSession.session.id
              });
            }
            
            // Use room ID comparison when available for more precise matching
            const roomId1 = getRoomId(otherScheduled.session);
            const roomId2 = getRoomId(scheduledSession.session);
            if (roomId1 === roomId2 && roomId1 !== '') {
              allConflicts.push({
                type: 'room',
                severity: 'medium',
                description: `Room scheduling conflict with another session on ${scheduledSession.day}`,
                resolved: false,
                sessionId: scheduledSession.session.id
              });
            }
          }
        });
        
        newConflicts[sessionId] = allConflicts;
      }
      
      setSessionConflicts(newConflicts);
    };

    const timeoutId = setTimeout(validateAllSessions, 500); // Debounce validation
    return () => clearTimeout(timeoutId);
  }, [sessions, institute, formData.class, faculty, classrooms, timetableParams]);

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
      
      // Load faculty, courses, and classrooms from Firebase
      const [facultyData, coursesData, classroomsData] = await Promise.all([
        firestoreService.getFacultyByInstitute(institute.id),
        firestoreService.getCoursesByInstitute(institute.id),
        firestoreService.getClassroomsByInstitute(institute.id)
      ]);  setFaculty(facultyData);
      setCourses(coursesData);
      setClassrooms(classroomsData);

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

    // Require session configuration
    if (sessions.length === 0) {
      toast({
        title: "Sessions Required",
        description: "Please add at least one session before generating the timetable. Use the 'Add Session' button to configure your classes.",
        variant: "destructive",
      });
      return;
    }

    // Validate that all sessions have required fields (subject, faculty, and classroom)
    const incompleteSessions = sessions.filter(session => 
      !session.subjectId || 
      !session.facultyId || 
      (!session.classroomId && !session.roomText) ||
      (session.classroomId === 'custom' && !session.roomText)
    );
    
    if (incompleteSessions.length > 0) {
      toast({
        title: "Incomplete Sessions",
        description: `${incompleteSessions.length} session(s) are missing required information (subject, faculty, or classroom). Please complete all sessions before generating.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Generate timetable with dynamic data and user parameters
      const config: TimetableConfig = {
        startTime: timetableParams.startTime,
        endTime: timetableParams.endTime,
        totalHours: timetableParams.totalHours,
        shortBreakDuration: timetableParams.shortBreakDuration,
        lunchBreakDuration: timetableParams.lunchBreakDuration,
        lunchBreakStart: timetableParams.lunchBreakStart,
        sessionDuration: timetableParams.sessionDuration
      };

      const dynamicTimetable: Timetable = {
        id: `tt-${Date.now()}`,
        class: formData.class,
        department: formData.department,
        semester: formData.semester,
        academicYear: '2025-26',
        entries: generateEntriesFromSessions(), // Always use sessions-based generation
        sessions,
        config,
        conflicts: [],
        generatedAt: new Date(),
        createdAt: new Date(),
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
    // Fixed university timetable time slots to match TimetableGrid display
    // Based on reference university format: 09:00, 10:00, 11:15, 12:15, 14:00, 15:00
    return [
      { index: 0, start: "09:00", end: "10:00", label: "09:00-10:00" },
      { index: 1, start: "10:00", end: "11:00", label: "10:00-11:00" },
      { index: 2, start: "11:15", end: "12:15", label: "11:15-12:15" },
      { index: 3, start: "12:15", end: "13:15", label: "12:15-13:15" },
      { index: 4, start: "14:00", end: "15:00", label: "14:00-15:00" },
      { index: 5, start: "15:00", end: "16:00", label: "15:00-16:00" }
    ];
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


  // Generate timetable entries from user-defined sessions
  const generateEntriesFromSessions = (): TimetableEntry[] => {
    if (sessions.length === 0) {
      return [];
    }
    
    const entries: TimetableEntry[] = [];
    const tentativeSchedule = createTentativeSchedule(sessions);
    
    tentativeSchedule.forEach((scheduledSession, index) => {
      const session = scheduledSession.session;
      const course = courses.find(c => c.id === session.subjectId);
      const facultyMember = faculty.find(f => f.id === session.facultyId);
      
      if (course && facultyMember) {
        const entry: TimetableEntry = {
          id: `entry-${scheduledSession.day}-${index}`,
          subjectId: session.subjectId,
          subjectName: course.name,
          facultyId: session.facultyId,
          facultyName: facultyMember.name,
          class: formData.class,
          department: formData.department,
          room: getRoomName(session),
          day: scheduledSession.day,
          timeSlot: `slot-${index}`,
          startTime: formatMinutesToTime(scheduledSession.startMinutes),
          endTime: formatMinutesToTime(scheduledSession.endMinutes),
          type: session.type,
          durationMinutes: session.durationMinutes
        };
        
        entries.push(entry);
      }
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
                      value={timetableParams.sessionDuration.toString()}
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
                      value={timetableParams.shortBreakDuration.toString()}
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
                    value={timetableParams.lunchBreakDuration.toString()}
                    onChange={(e) => setTimetableParams(prev => ({ ...prev, lunchBreakDuration: parseInt(e.target.value) || 60 }))}
                    className="h-8 text-xs"
                    data-testid="input-lunch-duration"
                    min="30"
                    max="120"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="total-hours" className="text-xs">Total Hours</Label>
                  <Input
                    id="total-hours"
                    type="number"
                    value={isNaN(timetableParams.totalHours) ? '8' : timetableParams.totalHours.toString()}
                    onChange={(e) => setTimetableParams(prev => ({ ...prev, totalHours: parseFloat(e.target.value) || 8 }))}
                    className="h-8 text-xs"
                    data-testid="input-total-hours"
                    step="0.5"
                    min="1"
                    max="12"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">Auto-calculated from start/end times</p>
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
                    <SelectItem value="Sem 1">Sem 1</SelectItem>
                    <SelectItem value="Sem 2">Sem 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Simplified button moved to session section */}
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Configure sessions in the main panel to generate your timetable
                </p>
              </div>
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

        {/* Session Configuration */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Session Configuration</span>
                </CardTitle>
                <Button
                  onClick={addSession}
                  size="sm"
                  disabled={!formData.department || !formData.class}
                  data-testid="button-add-session"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Manually configure individual sessions for your timetable. You must add and configure each session before generating a timetable.
              </p>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No sessions configured</p>
                  <p className="text-sm">Add and configure sessions to create your timetable. Each session must be manually configured with subject, faculty, and classroom details.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, index) => {
                    const course = courses.find(c => c.id === session.subjectId);
                    const facultyMember = faculty.find(f => f.id === session.facultyId);
                    const classroom = classrooms.find(c => c.id === session.classroomId);
                    const conflicts = sessionConflicts[session.id] || [];
                    
                    return (
                      <Card key={session.id} className={`${conflicts.length > 0 ? 'border-destructive' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            {/* Subject/Course */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Subject</Label>
                              <Select
                                value={session.subjectId}
                                onValueChange={(value) => updateSession(session.id, { subjectId: value })}
                              >
                                <SelectTrigger className="h-8 text-xs" data-testid={`select-subject-${index}`}>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {courses
                                    .filter(c => c.department === formData.department)
                                    .map(course => (
                                      <SelectItem key={course.id} value={course.id}>
                                        {course.name} ({course.code})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Faculty */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Faculty</Label>
                              <Select
                                value={session.facultyId}
                                onValueChange={(value) => updateSession(session.id, { facultyId: value })}
                              >
                                <SelectTrigger className="h-8 text-xs" data-testid={`select-faculty-${index}`}>
                                  <SelectValue placeholder="Select faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                  {faculty
                                    .filter(f => f.department === formData.department)
                                    .map(facultyMember => (
                                      <SelectItem key={facultyMember.id} value={facultyMember.id}>
                                        {facultyMember.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Type */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Type</Label>
                              <Select
                                value={session.type}
                                onValueChange={(value) => updateSession(session.id, { type: value as 'lecture' | 'lab' })}
                              >
                                <SelectTrigger className="h-8 text-xs" data-testid={`select-type-${index}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lecture">Lecture</SelectItem>
                                  <SelectItem value="lab">Lab</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Duration */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Duration (min)</Label>
                              <Input
                                type="number"
                                value={session.durationMinutes}
                                onChange={(e) => updateSession(session.id, { durationMinutes: parseInt(e.target.value) || 60 })}
                                className="h-8 text-xs"
                                min="30"
                                max="180"
                                step="15"
                                data-testid={`input-duration-${index}`}
                              />
                            </div>
                            
                            {/* Classroom */}
                            <div className="space-y-1">
                              <Label className="text-xs font-medium">Classroom</Label>
                              {classrooms.length > 0 ? (
                                <Select
                                  value={session.classroomId}
                                  onValueChange={(value) => updateSession(session.id, { classroomId: value, roomText: '' })}
                                >
                                  <SelectTrigger className="h-8 text-xs" data-testid={`select-classroom-${index}`}>
                                    <SelectValue placeholder="Select classroom" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="custom">Custom room</SelectItem>
                                    {classrooms.map(classroom => (
                                      <SelectItem key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.capacity} capacity)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  value={session.roomText}
                                  onChange={(e) => updateSession(session.id, { roomText: e.target.value, classroomId: '' })}
                                  placeholder="Room name"
                                  className="h-8 text-xs"
                                  data-testid={`input-room-${index}`}
                                />
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-end">
                              <Button
                                onClick={() => removeSession(session.id)}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive"
                                data-testid={`button-remove-session-${index}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Conflict Indicators */}
                          {conflicts.length > 0 && (
                            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                              <p className="text-xs font-medium text-destructive mb-1">Conflicts detected:</p>
                              {conflicts.map((conflict, conflictIndex) => (
                                <p key={conflictIndex} className="text-xs text-destructive">
                                  • {conflict.description}
                                </p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Timetable Section */}
          {sessions.length > 0 && (
            <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-8 text-center">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Generate?</h3>
                    <p className="text-muted-foreground">
                      You've configured {sessions.length} session{sessions.length !== 1 ? 's' : ''}. 
                      Generate your optimized timetable with intelligent conflict detection.
                    </p>
                  </div>

                  {/* Session Summary */}
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sessions.length}</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {sessions.filter(s => s.subjectId && s.facultyId && (s.classroomId || s.roomText)).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {sessions.reduce((total, s) => total + (s.durationMinutes || 60), 0) / 60}h
                      </div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </div>
                  </div>

                  {/* Validation Status */}
                  {sessions.some(s => !s.subjectId || !s.facultyId || (!s.classroomId && !s.roomText)) ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                      <div className="flex items-center justify-center space-x-2 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Some sessions need completion</span>
                      </div>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                        Please fill in all required fields for each session before generating.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                      <div className="flex items-center justify-center space-x-2 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">All sessions are ready!</span>
                      </div>
                    </div>
                  )}

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerateTimetable}
                    disabled={loading || !formData.department || !formData.class || sessions.length === 0 || sessions.some(s => !s.subjectId || !s.facultyId || (!s.classroomId && !s.roomText))}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    data-testid="button-generate-timetable"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        <span className="text-lg">Generating Your Timetable...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        <span className="text-lg">Generate Intelligent Timetable</span>
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Conflict Detection
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Optimized
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Ready
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Timetable Display */}
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
                <TimetableGrid 
                  entries={generatedTimetable.entries}
                  department={generatedTimetable.department}
                  class={generatedTimetable.class}
                  semester={generatedTimetable.semester}
                  academicYear={generatedTimetable.academicYear || '2025-26'}
                />
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
