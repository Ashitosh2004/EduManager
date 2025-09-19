import React from 'react';
import { TimetableEntry } from '@/types';

interface TimetableGridProps {
  entries: TimetableEntry[];
  className?: string;
  department: string;
  class: string;
  semester: string;
  academicYear: string;
  crNumber?: string;
}

interface TimeSlotConfig {
  time: string;
  label: string;
  isBreak?: boolean;
  breakLabel?: string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  className,
  department,
  class: classValue,
  semester,
  academicYear,
  crNumber
}) => {
  // Fixed university timetable time slots based on reference image
  const timeSlots: TimeSlotConfig[] = [
    { time: "09:00", label: "9:00" },
    { time: "10:00", label: "10:00" },
    { time: "break1", label: "", isBreak: true, breakLabel: "Short Break" },
    { time: "11:15", label: "11:15" },
    { time: "12:15", label: "12:15" },
    { time: "break2", label: "", isBreak: true, breakLabel: "Lunch Break" },
    { time: "14:00", label: "2:00" },
    { time: "15:00", label: "3:00" }
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Helper function to get subject code from subject name
  const getSubjectCode = (subjectName: string): string => {
    // Extract initials/codes from subject name 
    // e.g., "Database Engineering" -> "DBE"
    return subjectName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3) || subjectName.substring(0, 3).toUpperCase();
  };

  // Helper function to get faculty initials
  const getFacultyInitials = (facultyName: string): string => {
    return facultyName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3) || facultyName.substring(0, 3).toUpperCase();
  };

  // Helper function to format room number
  const formatRoom = (room: string): string => {
    // Convert room to "CR XXX" format
    if (!room) return '';
    if (room.toLowerCase().includes('cr')) return room.toUpperCase();
    return `CR ${room}`;
  };

  // Helper function to format cell content like "DBE-KKA CR 022"
  const formatCellContent = (entry: TimetableEntry): string => {
    const subjectCode = getSubjectCode(entry.subjectName);
    const facultyInitials = getFacultyInitials(entry.facultyName);
    const room = formatRoom(entry.room);
    return `${subjectCode}-${facultyInitials}${room ? ' ' + room : ''}`;
  };

  // Convert time to match our fixed slots (e.g., "14:00" for "2:00 PM")
  const normalizeTime = (timeStr: string): string => {
    if (!timeStr) return '';
    // Handle different time formats
    const time24 = timeStr.includes('AM') || timeStr.includes('PM') 
      ? convert12to24(timeStr) 
      : timeStr;
    return time24.substring(0, 5); // Get HH:MM format
  };

  // Helper to convert 12-hour to 24-hour format
  const convert12to24 = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-background ${className}`}>
      {/* Professional Header */}
      <div className="mb-6 text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {classValue?.toUpperCase() || `${department.toUpperCase()}`}
        </h1>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span className="font-medium">Academic Year-{academicYear}</span>
          {crNumber && <span className="font-medium">CR {crNumber}</span>}
          <span className="font-medium">{semester}</span>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-primary/10">
              <th className="border border-border p-3 text-center font-semibold text-foreground min-w-[80px]">
                Time
              </th>
              {days.map(day => (
                <th key={day} className="border border-border p-3 text-center font-semibold text-foreground min-w-[120px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.time} className="bg-muted/30">
                    <td className="border border-border p-4 text-center font-medium text-muted-foreground">
                      {slot.breakLabel}
                    </td>
                    <td colSpan={5} className="border border-border p-4 text-center font-medium text-muted-foreground">
                      {slot.breakLabel}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.time} className="hover:bg-muted/20">
                  <td className="border border-border p-3 text-center font-medium text-muted-foreground bg-muted/20">
                    {slot.label}
                  </td>
                  {days.map(day => {
                    // Find all entries for this day and time slot
                    const dayEntries = entries.filter(e => {
                      const entryDay = e.day?.substring(0, 3); // Convert "Monday" to "Mon"
                      const entryTime = normalizeTime(e.startTime);
                      return entryDay === day && entryTime === slot.time;
                    });

                    if (dayEntries.length === 0) {
                      return (
                        <td key={day} className="border border-border p-3 text-center text-muted-foreground">
                          -
                        </td>
                      );
                    }

                    return (
                      <td key={day} className="border border-border p-3 text-center">
                        <div className="text-sm font-medium text-foreground space-y-1">
                          {dayEntries.map((entry, index) => (
                            <div key={index} className={dayEntries.length > 1 ? "border-b border-border/30 pb-1 last:border-b-0 last:pb-0" : ""}>
                              {formatCellContent(entry)}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};