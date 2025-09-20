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
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg shadow-lg ${className}`}>
      {/* Professional Header */}
      <div className="mb-8 text-center space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {classValue?.toUpperCase() || `${department.toUpperCase()}`}
          </h1>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">Academic Year-{academicYear}</span>
            {crNumber && <span className="font-medium bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">CR {crNumber}</span>}
            <span className="font-medium bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full">{semester}</span>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <th className="border border-white/20 p-4 text-center font-bold min-w-[80px] rounded-tl-lg">
                Time
              </th>
              {days.map((day, index) => (
                <th key={day} className={`border border-white/20 p-4 text-center font-bold min-w-[140px] ${index === days.length - 1 ? 'rounded-tr-lg' : ''}`}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.time} className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30">
                    <td className="border border-gray-200 dark:border-gray-700 p-4 text-center font-bold text-orange-700 dark:text-orange-300">
                      {slot.breakLabel}
                    </td>
                    <td colSpan={5} className="border border-gray-200 dark:border-gray-700 p-4 text-center font-bold text-orange-700 dark:text-orange-300">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{slot.breakLabel}</span>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.time} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <td className="border border-gray-200 dark:border-gray-700 p-4 text-center font-bold text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750">
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
                        <td key={day} className="border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-400 dark:text-gray-500">
                          <div className="flex items-center justify-center h-16">
                            <span className="text-lg opacity-50">-</span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={day} className="border border-gray-200 dark:border-gray-700 p-2">
                        <div className="space-y-1">
                          {dayEntries.map((entry, index) => (
                            <div key={index} className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${dayEntries.length > 1 ? 'mb-1' : ''}`}>
                              <div className="text-sm font-bold">{formatCellContent(entry)}</div>
                              <div className="text-xs opacity-90 mt-1">{entry.subjectName}</div>
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
      
      {/* Footer with additional info */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Generated Timetable</span>
          </span>
          <span className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Conflict-free Schedule</span>
          </span>
        </div>
      </div>
    </div>
  );
};