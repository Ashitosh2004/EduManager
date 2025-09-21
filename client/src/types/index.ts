export interface Institute {
  id: string;
  name: string;
  domain: string;
  address?: string;
  settings?: InstituteSettings;
  createdAt: Date;
}

export interface InstituteSettings {
  timeSlots: TimeSlot[];
  departments: string[];
  academicYear: string;
  semester: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  classes: string[];
  subjects: string[];
  phoneNumber?: string;
  profilePhoto?: string;
  instituteId: string;
  createdAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  class: string;
  year: number;
  semester: number;
  phoneNumber?: string;
  parentContact?: string;
  profilePhoto?: string;
  instituteId: string;
  createdAt: Date;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'lab' | 'both';
  location?: string;
  instituteId: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  semester: number;
  year: number;
  facultyId: string;
  assignments: Assignment[];
  instituteId: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  submissions: Submission[];
}

export interface Submission {
  studentId: string;
  marks?: number;
  submittedAt?: Date;
  feedback?: string;
}

export interface SessionInput {
  id: string;
  subjectId: string;
  facultyId: string;
  type: 'lecture' | 'lab';
  durationMinutes: number;
  classroomId?: string;
  roomText?: string;
  day?: string; // Optional - if not specified, will be distributed automatically
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  class: string;
  department: string; // Added department field
  room: string;
  day: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  type: 'lecture' | 'lab';
  durationMinutes: number;
}

export interface TimetableConfig {
  startTime: string;
  endTime: string;
  totalHours: number;
  shortBreakDuration: number;
  lunchBreakDuration: number;
  lunchBreakStart: string;
  sessionDuration: number;
}

export interface Timetable {
  id: string;
  class: string;
  department: string;
  semester: string;
  academicYear: string;
  entries: TimetableEntry[];
  sessions: SessionInput[]; // User-defined session inputs
  config: TimetableConfig; // User-defined configuration
  conflicts: Conflict[];
  generatedAt: Date;
  createdAt: Date; // Added for consistency
  instituteId: string;
}

export interface Conflict {
  type: 'teacher' | 'room' | 'preference';
  description: string;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
  sessionId?: string; // Reference to the session that has the conflict
}

export interface SessionIndexEntry {
  id: string;
  instituteId: string;
  department: string;
  class: string;
  day: string;
  startMinutes: number;
  endMinutes: number;
  facultyId: string;
  room: string;
  timetableId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'faculty' | 'admin';
  instituteId: string;
  profilePhoto?: string;
  lastLoginAt: Date;
}

export interface AuthState {
  user: User | null;
  institute: Institute | null;
  loading: boolean;
  error: string | null;
}

export interface Activity {
  id: string;
  title: string;
  type: 'student' | 'faculty' | 'course' | 'timetable' | 'general';
  icon: string;
  timestamp: Date;
  instituteId: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'meeting' | 'exam' | 'holiday' | 'class' | 'general';
  instituteId: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  name: string;
  shortName?: string;
  iconName: string;
  colorClass: string;
  customGradient?: string;
  instituteId: string;
  createdAt: Date;
}

export interface FirestoreCollections {
  institutes: Institute;
  faculty: Faculty;
  students: Student;
  courses: Course;
  timetables: Timetable;
  classrooms: Classroom;
  departments: Department;
  users: User;
  activities: Activity;
  events: Event;
}
