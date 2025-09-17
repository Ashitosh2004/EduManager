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
import { useAuth } from '@/contexts/AuthContext';
import { timetableService } from '@/services/timetableService';
import { exportService } from '@/services/exportService';
import { TimetableEntry, Timetable, Conflict } from '@/types';
import { 
  Calendar,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimetableGeneratorProps {
  onBack?: () => void;
}

export const TimetableGenerator: React.FC<TimetableGeneratorProps> = ({ onBack }) => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<Timetable | null>(null);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [formData, setFormData] = useState({
    department: '',
    class: '',
    semester: 'Fall 2024'
  });

  const departments = [
    { value: 'cse', label: 'Computer Science' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'mech', label: 'Mechanical Engineering' }
  ];

  const classes = {
    cse: ['CSE-A (3rd Year)', 'CSE-B (3rd Year)', 'CSE-A (2nd Year)', 'CSE-B (2nd Year)'],
    ece: ['ECE-A (3rd Year)', 'ECE-B (3rd Year)', 'ECE-A (2nd Year)', 'ECE-B (2nd Year)'],
    mech: ['MECH-A (3rd Year)', 'MECH-B (3rd Year)', 'MECH-A (2nd Year)', 'MECH-B (2nd Year)']
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
      
      // Simulate timetable generation with sample data
      const sampleTimetable: Timetable = {
        id: `tt-${Date.now()}`,
        class: formData.class,
        department: formData.department,
        semester: formData.semester,
        academicYear: '2024-2025',
        entries: generateSampleEntries(),
        conflicts: [],
        generatedAt: new Date(),
        instituteId: institute.id
      };

      // Validate for conflicts
      const detectedConflicts = await timetableService.validateTimetable(sampleTimetable.entries);
      sampleTimetable.conflicts = detectedConflicts;
      
      setGeneratedTimetable(sampleTimetable);
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

  const generateSampleEntries = (): TimetableEntry[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '09:00', end: '10:00', label: '09:00-10:00' },
      { start: '10:00', end: '11:00', label: '10:00-11:00' },
      { start: '11:30', end: '12:30', label: '11:30-12:30' },
      { start: '14:00', end: '15:00', label: '14:00-15:00' },
      { start: '15:00', end: '16:00', label: '15:00-16:00' }
    ];

    const subjects = [
      { name: 'Data Structures', faculty: 'Dr. Johnson', room: 'Room 301' },
      { name: 'Algorithms', faculty: 'Prof. Smith', room: 'Room 205' },
      { name: 'Database Systems', faculty: 'Dr. Williams', room: 'Lab 1' },
      { name: 'Operating Systems', faculty: 'Prof. Davis', room: 'Room 401' },
      { name: 'Software Engineering', faculty: 'Dr. Brown', room: 'Room 302' },
      { name: 'Computer Networks', faculty: 'Prof. Wilson', room: 'Lab 2' },
      { name: 'Machine Learning', faculty: 'Dr. Anderson', room: 'Room 501' },
      { name: 'Web Technologies', faculty: 'Prof. Taylor', room: 'Lab 3' }
    ];

    const entries: TimetableEntry[] = [];
    let subjectIndex = 0;

    days.forEach((day, dayIndex) => {
      timeSlots.forEach((slot, slotIndex) => {
        if (Math.random() > 0.2) { // 80% chance of having a class
          const subject = subjects[subjectIndex % subjects.length];
          entries.push({
            id: `entry-${dayIndex}-${slotIndex}`,
            subjectId: `subject-${subjectIndex}`,
            subjectName: subject.name,
            facultyId: `faculty-${subjectIndex}`,
            facultyName: subject.faculty,
            class: formData.class,
            room: subject.room,
            day,
            timeSlot: `slot-${slotIndex}`,
            startTime: slot.start,
            endTime: slot.end
          });
          subjectIndex++;
        }
      });
    });

    return entries;
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
            <CardContent className="space-y-4">
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
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
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
                      {['09:00-10:00', '10:00-11:00', '11:30-12:30', '14:00-15:00', '15:00-16:00'].map((timeSlot, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium text-muted-foreground">{timeSlot}</td>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                            const entry = generatedTimetable.entries.find(e => 
                              e.day === day && e.startTime === timeSlot.split('-')[0]
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
