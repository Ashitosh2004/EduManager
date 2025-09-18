import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Calendar, 
  BookOpen, 
  ArrowRight,
  Users,
  UserCheck,
  Clock,
  Edit,
  Trash2,
  CalendarIcon 
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { firestoreService } from '@/services/firestoreService';
import { Activity, Event as EventType } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const RecentActivity: React.FC = () => {
  const { institute } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: undefined as Date | undefined,
    startTime: '',
    endTime: '',
    location: '',
    type: 'general' as EventType['type']
  });

  useEffect(() => {
    if (institute) {
      loadData();
    }
  }, [institute]);

  useEffect(() => {
    // Filter events for selected date only
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      const selected = new Date(selectedDate);
      return eventDate.toDateString() === selected.toDateString();
    });
    setFilteredEvents(filtered);
  }, [events, selectedDate]);

  const loadData = async () => {
    if (!institute) return;
    
    try {
      setLoading(true);
      const [recentActivities, upcomingEvents] = await Promise.all([
        firestoreService.getRecentActivities(institute.id, 5),
        firestoreService.getUpcomingEvents(institute.id, 5)
      ]);
      setActivities(recentActivities);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load recent activities and events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'student': return Users;
      case 'faculty': return UserCheck;
      case 'course': return BookOpen;
      case 'timetable': return Calendar;
      default: return Plus;
    }
  };

  const getActivityIconStyles = (type: Activity['type']) => {
    switch (type) {
      case 'student': return { bg: 'bg-blue-500/10', color: 'text-blue-600' };
      case 'faculty': return { bg: 'bg-green-500/10', color: 'text-green-600' };
      case 'course': return { bg: 'bg-purple-500/10', color: 'text-purple-600' };
      case 'timetable': return { bg: 'bg-orange-500/10', color: 'text-orange-600' };
      default: return { bg: 'bg-primary/10', color: 'text-primary' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: undefined,
      startTime: '',
      endTime: '',
      location: '',
      type: 'general'
    });
    setEditingEvent(null);
  };

  const handleAddEvent = () => {
    resetEventForm();
    setShowAddEvent(true);
  };

  const handleEditEvent = (event: EventType) => {
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      type: event.type
    });
    setEditingEvent(event);
    setShowAddEvent(true);
  };

  const handleSaveEvent = async () => {
    if (!institute || !eventForm.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingEvent) {
        const updateData = {
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          location: eventForm.location,
          type: eventForm.type,
          instituteId: institute.id
        };
        await firestoreService.updateEvent(editingEvent.id, updateData);
        toast({
          title: "Success",
          description: "Event updated successfully.",
        });
      } else {
        const createData = {
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          location: eventForm.location,
          type: eventForm.type,
          instituteId: institute.id,
          createdAt: new Date()
        };
        await firestoreService.createEvent(createData);
        toast({
          title: "Success",
          description: "Event created successfully.",
        });
      }
      
      setShowAddEvent(false);
      resetEventForm();
      loadData();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await firestoreService.deleteEvent(eventId);
      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });
      loadData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const styles = getActivityIconStyles(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 group">
                    <div className={`w-8 h-8 ${styles.bg} rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                      <Icon className={`h-4 w-4 ${styles.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium leading-relaxed">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activities
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Upcoming Schedule</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAddEvent}
              data-testid="button-add-event"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Calendar */}
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasEvent: events.map(event => new Date(event.date))
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: 'bold',
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))'
                  }
                }}
                data-testid="calendar-upcoming-events"
              />
            </div>
            
            {/* Event List */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {format(selectedDate, 'MMMM d, yyyy')} 
                <span className="text-xs">({filteredEvents.length} events)</span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 group cursor-pointer hover:bg-accent/50 rounded-lg p-2 -m-2 transition-all duration-200">
                        <div className="text-center flex-shrink-0 min-w-[40px]">
                          <div className="text-xs font-medium text-muted-foreground">
                            {format(event.date, 'MMM')}
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            {format(event.date, 'd')}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.startTime} - {event.endTime}{event.location && ` • ${event.location}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditEvent(event);
                            }}
                            data-testid={`button-edit-event-${event.id}`}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            data-testid={`button-delete-event-${event.id}`}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No events for this date
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Event title"
                data-testid="input-event-title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Event description"
                data-testid="textarea-event-description"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventForm.date && "text-muted-foreground"
                    )}
                    data-testid="button-select-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventForm.date ? format(eventForm.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={eventForm.date}
                    onSelect={(date) => setEventForm({ ...eventForm, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  data-testid="input-start-time"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  data-testid="input-end-time"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Location (Optional)</label>
              <Input
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Event location"
                data-testid="input-event-location"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={eventForm.type} 
                onValueChange={(value: EventType['type']) => setEventForm({ ...eventForm, type: value })}
              >
                <SelectTrigger data-testid="select-event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddEvent(false)}
                data-testid="button-cancel-event"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEvent}
                data-testid="button-save-event"
              >
                {editingEvent ? 'Update' : 'Create'} Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
