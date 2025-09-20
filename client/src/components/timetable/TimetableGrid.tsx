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
    let time24 = timeStr.includes('AM') || timeStr.includes('PM') 
      ? convert12to24(timeStr) 
      : timeStr;
    
    // Ensure HH:MM format by padding with leading zero if needed
    const timeMatch = time24.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const [, hours, minutes] = timeMatch;
      time24 = `${hours.padStart(2, '0')}:${minutes}`;
    }
    
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
    <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 rounded-2xl shadow-2xl ${className}`}>
      {/* Enhanced Professional Header */}
      <div className="mb-10 text-center space-y-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 dark:border-slate-700/50">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-3">
            {classValue?.toUpperCase() || `${department.toUpperCase()}`}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium mb-6">Weekly Schedule Overview</p>
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm">
            <span className="font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-md">
              Academic Year {academicYear}
            </span>
            {crNumber && (
              <span className="font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-md">
                CR {crNumber}
              </span>
            )}
            <span className="font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-md">
              {semester}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Timetable Grid */}
      <div className="overflow-x-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white">
              <th className="border-0 p-5 text-center font-bold min-w-[100px] rounded-tl-2xl">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Time</span>
                </div>
              </th>
              {days.map((day, index) => (
                <th key={day} className={`border-0 p-5 text-center font-bold min-w-[160px] ${index === days.length - 1 ? 'rounded-tr-2xl' : ''}`}>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{day}</span>
                    <div className="w-8 h-0.5 bg-white/50 rounded-full"></div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => {
              if (slot.isBreak) {
                return (
                  <tr key={slot.time} className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20">
                    <td className="border-0 p-4 text-center font-bold">
                      <div className="flex items-center justify-center space-x-2 text-amber-700 dark:text-amber-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Break</span>
                      </div>
                    </td>
                    <td colSpan={5} className="border-0 p-4 text-center">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-3 px-6 shadow-lg">
                        <div className="flex items-center justify-center space-x-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="font-bold text-lg">{slot.breakLabel}</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slot.time} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-300 group">
                  <td className="border-0 p-5 text-center font-bold bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{slot.label}</span>
                      <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 rounded-full group-hover:bg-blue-500 transition-colors duration-300"></div>
                    </div>
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
                        <td key={day} className="border-0 p-4 text-center">
                          <div className="flex items-center justify-center h-20 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-600/50 rounded-xl transition-all duration-300">
                            <div className="text-slate-300 dark:text-slate-600 text-2xl font-light">
                              <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4" />
                              </svg>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Color schemes for different types of sessions
                    const getSessionColors = (entry: TimetableEntry, index: number) => {
                      const colorSchemes = [
                        'from-blue-500 via-blue-600 to-indigo-600',
                        'from-purple-500 via-purple-600 to-pink-600', 
                        'from-emerald-500 via-emerald-600 to-teal-600',
                        'from-orange-500 via-orange-600 to-red-600',
                        'from-violet-500 via-violet-600 to-purple-600',
                        'from-cyan-500 via-cyan-600 to-blue-600'
                      ];
                      return colorSchemes[index % colorSchemes.length];
                    };

                    return (
                      <td key={day} className="border-0 p-3">
                        <div className="space-y-2">
                          {dayEntries.map((entry, index) => (
                            <div key={index} className={`bg-gradient-to-br ${getSessionColors(entry, index)} text-white rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 group/card ${dayEntries.length > 1 ? 'mb-2' : ''}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-sm font-bold tracking-wide">{formatCellContent(entry)}</div>
                                <div className="w-2 h-2 bg-white/40 rounded-full group-hover/card:bg-white/60 transition-colors"></div>
                              </div>
                              <div className="text-xs opacity-90 font-medium mb-1">{entry.subjectName}</div>
                              <div className="flex items-center justify-between text-xs opacity-75">
                                <span>{entry.facultyName}</span>
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{entry.room}</span>
                                </div>
                              </div>
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
      
      {/* Enhanced Footer with Statistics */}
      <div className="mt-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Schedule Status */}
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200">Conflict-Free</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Optimized Schedule</p>
            </div>
          </div>

          {/* Generation Info */}
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200">AI Generated</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Smart Allocation</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="flex items-center justify-center md:justify-end space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-700 dark:text-slate-200">Export Ready</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">PDF & Excel</p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Lectures</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Practicals</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Tutorials</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Breaks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};