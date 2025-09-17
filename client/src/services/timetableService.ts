import { Faculty, Course, TimetableEntry, Conflict, TimeSlot } from '@/types';

interface TimetableConstraints {
  faculty: Faculty[];
  courses: Course[];
  timeSlots: TimeSlot[];
  days: string[];
  rooms: string[];
}

interface TimetableRequest {
  class: string;
  department: string;
  semester: string;
  academicYear: string;
  constraints: TimetableConstraints;
}

class TimetableService {
  private readonly DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  /**
   * Generate a timetable with intelligent conflict detection
   */
  async generateTimetable(request: TimetableRequest): Promise<{
    entries: TimetableEntry[];
    conflicts: Conflict[];
  }> {
    const { constraints } = request;
    const entries: TimetableEntry[] = [];
    const conflicts: Conflict[] = [];
    const occupiedSlots: Map<string, string[]> = new Map(); // day-time -> [facultyId, room]

    // Initialize occupied slots
    this.DAYS.forEach(day => {
      constraints.timeSlots.forEach(slot => {
        occupiedSlots.set(`${day}-${slot.id}`, []);
      });
    });

    // Get relevant courses for the class
    const classCourses = constraints.courses.filter(course => 
      course.department === request.department
    );

    // Generate entries for each course
    for (const course of classCourses) {
      const faculty = constraints.faculty.find(f => f.id === course.facultyId);
      if (!faculty) {
        conflicts.push({
          type: 'teacher',
          description: `No faculty assigned for course ${course.name}`,
          severity: 'high',
          resolved: false
        });
        continue;
      }

      // Check if faculty is assigned to this class
      if (!faculty.classes.includes(request.class)) {
        conflicts.push({
          type: 'teacher',
          description: `${faculty.name} is not assigned to class ${request.class}`,
          severity: 'high',
          resolved: false
        });
        continue;
      }

      // Try to assign time slots for this course
      const slotsNeeded = this.calculateSlotsNeeded(course);
      const assignedSlots = this.assignTimeSlots(
        course,
        faculty,
        slotsNeeded,
        occupiedSlots,
        constraints,
        request.class
      );

      entries.push(...assignedSlots.entries);
      conflicts.push(...assignedSlots.conflicts);
    }

    return { entries, conflicts };
  }

  /**
   * Calculate number of time slots needed based on course credits
   */
  private calculateSlotsNeeded(course: Course): number {
    // Typically 1 credit = 1 hour per week
    return Math.max(course.credits, 1);
  }

  /**
   * Assign time slots for a specific course
   */
  private assignTimeSlots(
    course: Course,
    faculty: Faculty,
    slotsNeeded: number,
    occupiedSlots: Map<string, string[]>,
    constraints: TimetableConstraints,
    className: string
  ): { entries: TimetableEntry[]; conflicts: Conflict[] } {
    const entries: TimetableEntry[] = [];
    const conflicts: Conflict[] = [];
    let assignedSlots = 0;

    // Try to assign slots across different days
    for (const day of this.DAYS) {
      if (assignedSlots >= slotsNeeded) break;

      for (const timeSlot of constraints.timeSlots) {
        if (assignedSlots >= slotsNeeded) break;

        const slotKey = `${day}-${timeSlot.id}`;
        const occupiedData = occupiedSlots.get(slotKey) || [];

        // Check for faculty conflicts
        if (occupiedData.includes(faculty.id)) {
          conflicts.push({
            type: 'teacher',
            description: `${faculty.name} has conflicting schedule on ${day} at ${timeSlot.label}`,
            severity: 'medium',
            resolved: false
          });
          continue;
        }

        // Find available room
        const availableRoom = this.findAvailableRoom(occupiedData, constraints.rooms);
        if (!availableRoom) {
          conflicts.push({
            type: 'room',
            description: `No room available on ${day} at ${timeSlot.label}`,
            severity: 'high',
            resolved: false
          });
          continue;
        }

        // Check for room conflicts
        if (occupiedData.includes(availableRoom)) {
          conflicts.push({
            type: 'room',
            description: `Room ${availableRoom} is already occupied on ${day} at ${timeSlot.label}`,
            severity: 'high',
            resolved: false
          });
          continue;
        }

        // Create timetable entry
        const entry: TimetableEntry = {
          id: `${course.id}-${day}-${timeSlot.id}`,
          subjectId: course.id,
          subjectName: course.name,
          facultyId: faculty.id,
          facultyName: faculty.name,
          class: className,
          room: availableRoom,
          day,
          timeSlot: timeSlot.id,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        };

        entries.push(entry);
        
        // Mark slot as occupied
        occupiedData.push(faculty.id, availableRoom);
        occupiedSlots.set(slotKey, occupiedData);
        
        assignedSlots++;
      }
    }

    // Check if all required slots were assigned
    if (assignedSlots < slotsNeeded) {
      conflicts.push({
        type: 'preference',
        description: `Could only assign ${assignedSlots}/${slotsNeeded} slots for ${course.name}`,
        severity: 'medium',
        resolved: false
      });
    }

    return { entries, conflicts };
  }

  /**
   * Find an available room for the time slot
   */
  private findAvailableRoom(occupiedData: string[], availableRooms: string[]): string | null {
    for (const room of availableRooms) {
      if (!occupiedData.includes(room)) {
        return room;
      }
    }
    return null;
  }

  /**
   * Validate timetable for conflicts
   */
  async validateTimetable(entries: TimetableEntry[]): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const slotMap: Map<string, TimetableEntry[]> = new Map();

    // Group entries by day-time slot
    entries.forEach(entry => {
      const key = `${entry.day}-${entry.timeSlot}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, []);
      }
      slotMap.get(key)!.push(entry);
    });

    // Check for conflicts in each time slot
    slotMap.forEach((slotEntries, slotKey) => {
      if (slotEntries.length > 1) {
        const facultyIds = new Set<string>();
        const rooms = new Set<string>();

        slotEntries.forEach(entry => {
          // Check for faculty double-booking
          if (facultyIds.has(entry.facultyId)) {
            conflicts.push({
              type: 'teacher',
              description: `${entry.facultyName} is double-booked at ${slotKey.replace('-', ' ')}`,
              severity: 'high',
              resolved: false
            });
          }
          facultyIds.add(entry.facultyId);

          // Check for room double-booking
          if (rooms.has(entry.room)) {
            conflicts.push({
              type: 'room',
              description: `Room ${entry.room} is double-booked at ${slotKey.replace('-', ' ')}`,
              severity: 'high',
              resolved: false
            });
          }
          rooms.add(entry.room);
        });
      }
    });

    return conflicts;
  }

  /**
   * Optimize timetable to minimize conflicts
   */
  async optimizeTimetable(entries: TimetableEntry[], constraints: TimetableConstraints): Promise<{
    optimizedEntries: TimetableEntry[];
    conflicts: Conflict[];
  }> {
    // Implementation for genetic algorithm or other optimization techniques
    // For now, return the original entries with validation
    const conflicts = await this.validateTimetable(entries);
    
    return {
      optimizedEntries: entries,
      conflicts
    };
  }

  /**
   * Get faculty workload distribution
   */
  async getFacultyWorkload(facultyId: string, entries: TimetableEntry[]): Promise<{
    totalHours: number;
    dailyHours: Record<string, number>;
    subjects: string[];
  }> {
    const facultyEntries = entries.filter(entry => entry.facultyId === facultyId);
    
    const dailyHours: Record<string, number> = {};
    const subjects = new Set<string>();

    facultyEntries.forEach(entry => {
      if (!dailyHours[entry.day]) {
        dailyHours[entry.day] = 0;
      }
      dailyHours[entry.day]++;
      subjects.add(entry.subjectName);
    });

    return {
      totalHours: facultyEntries.length,
      dailyHours,
      subjects: Array.from(subjects)
    };
  }
}

export const timetableService = new TimetableService();
