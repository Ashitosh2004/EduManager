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

export interface TimetableEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  class: string;
  room: string;
  day: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
}

export interface Timetable {
  id: string;
  class: string;
  department: string;
  semester: string;
  academicYear: string;
  entries: TimetableEntry[];
  conflicts: Conflict[];
  generatedAt: Date;
  instituteId: string;
}

export interface Conflict {
  type: 'teacher' | 'room' | 'preference';
  description: string;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
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

export interface FirestoreCollections {
  institutes: Institute;
  faculty: Faculty;
  students: Student;
  courses: Course;
  timetables: Timetable;
  users: User;
}
