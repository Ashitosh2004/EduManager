import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Timetable, TimetableEntry } from '@/types';
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Download,
  Clock,
  User,
  Building,
  RefreshCw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const TimetableHistoryPage: React.FC = () => {
  const { user, institute } = useAuth();
  const [histories, setHistories] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [showTimetableView, setShowTimetableView] = useState(false);

  useEffect(() => {
    if (institute) {
      loadTimetableHistory();
    }
  }, [institute]);

  const loadTimetableHistory = async () => {
    if (!institute) return;
    
    try {
      setLoading(true);
      const historyData = await firestoreService.getTimetablesByInstitute(institute.id);
      setHistories(historyData);
    } catch (error) {
      console.error('Error loading timetable history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique classes and departments for filtering
  const uniqueClasses = Array.from(new Set(histories.map(h => h.class))).filter(Boolean);
  const uniqueDepartments = Array.from(new Set(histories.map(h => h.department))).filter(Boolean);

  // Filter histories based on search and filters
  const filteredHistories = histories.filter(history => {
    const matchesSearch = searchQuery === '' || 
      history.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
false; // No generatedBy field available in Timetable type
    
    const matchesClass = filterClass === '' || history.class === filterClass;
    const matchesDepartment = filterDepartment === '' || history.department === filterDepartment;
    
    return matchesSearch && matchesClass && matchesDepartment;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewTimetable = (history: Timetable) => {
    setSelectedTimetable(history);
    setShowTimetableView(true);
  };

  const handleCloseTimetableView = () => {
    setShowTimetableView(false);
    setSelectedTimetable(null);
  };

  if (showTimetableView && selectedTimetable) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Timetable View</h1>
            <p className="text-muted-foreground">
              {selectedTimetable.class} - {selectedTimetable.department} (Generated on {formatDate(selectedTimetable.generatedAt)})
            </p>
          </div>
          <Button onClick={handleCloseTimetableView} variant="outline" data-testid="button-close-view">
            Back to History
          </Button>
        </div>
        
        <TimetableDisplayTable entries={selectedTimetable.entries} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timetable History</h1>
          <p className="text-muted-foreground">View and manage previously generated timetables</p>
        </div>
        <Button onClick={loadTimetableHistory} variant="outline" size="icon" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by class, department, or generator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-class-filter">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {uniqueClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-dept-filter">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredHistories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Timetables Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterClass || filterDepartment 
                  ? "No timetables match your current filters. Try adjusting your search criteria."
                  : "No timetables have been generated yet. Create your first timetable to see it here."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistories.map((history) => (
            <Card key={history.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground" data-testid={`text-timetable-${history.id}`}>
                        {history.class} - {history.department}
                      </h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {history.entries.length} periods
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(history.generatedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {history.instituteId || 'Unknown Institute'}
                      </div>
                    </div>

                    {history.conflicts && history.conflicts.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-xs">
                          {history.conflicts.length} conflict{history.conflicts.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => handleViewTimetable(history)}
                      variant="outline" 
                      size="sm"
                      data-testid={`button-view-${history.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      onClick={() => {
                        // TODO: Implement PDF export functionality
                        console.log('Export timetable:', history.id);
                      }}
                      variant="outline" 
                      size="sm"
                      data-testid={`button-export-${history.id}`}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results count */}
      {!loading && filteredHistories.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredHistories.length} of {histories.length} timetable{histories.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

// Inline timetable display component
interface TimetableDisplayTableProps {
  entries: TimetableEntry[];
}

const TimetableDisplayTable: React.FC<TimetableDisplayTableProps> = ({ entries }) => {
  // Generate time slots for display (simplified version)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      slots.push({
        start: timeStr,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        label: `${timeStr} - ${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground min-w-[100px]">Time</th>
            {days.map(day => (
              <th key={day} className="text-left py-3 px-4 font-medium text-muted-foreground">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, index) => (
            <tr key={index} className="border-b border-border/50">
              <td className="py-3 px-4 font-medium text-muted-foreground">{slot.label}</td>
              {days.map((day) => {
                const entry = entries.find(e => 
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
                      <div className="text-xs text-muted-foreground capitalize">{entry.type}</div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableHistoryPage;