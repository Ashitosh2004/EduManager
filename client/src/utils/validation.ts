import { z } from 'zod';

// Email domain validation
export const validateEmailDomain = (email: string, instituteDomain: string): boolean => {
  const emailDomain = email.substring(email.indexOf('@'));
  return emailDomain === instituteDomain;
};

// Student validation schemas
export const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  rollNumber: z.string().min(3, 'Roll number must be at least 3 characters').max(20, 'Roll number must be less than 20 characters'),
  department: z.string().min(1, 'Department is required'),
  class: z.string().min(1, 'Class is required'),
  year: z.number().min(1, 'Year must be at least 1').max(4, 'Year must be at most 4'),
  semester: z.number().min(1, 'Semester must be at least 1').max(2, 'Semester must be at most 2'),
  phoneNumber: z.string().optional(),
  parentContact: z.string().optional(),
});

// Faculty validation schemas
export const facultySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  classes: z.array(z.string()).min(1, 'At least one class must be assigned'),
  subjects: z.array(z.string()).min(1, 'At least one subject must be assigned'),
  phoneNumber: z.string().optional(),
});

// Course validation schemas
export const courseSchema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters').max(100, 'Course name must be less than 100 characters'),
  code: z.string().min(3, 'Course code must be at least 3 characters').max(20, 'Course code must be less than 20 characters'),
  department: z.string().min(1, 'Department is required'),
  credits: z.number().min(1, 'Credits must be at least 1').max(10, 'Credits must be at most 10'),
  semester: z.number().min(1, 'Semester must be at least 1').max(2, 'Semester must be at most 2'),
  year: z.number().min(1, 'Year must be at least 1').max(4, 'Year must be at most 4'),
  facultyId: z.string().min(1, 'Faculty assignment is required'),
});

// Institute validation schemas
export const instituteSchema = z.object({
  name: z.string().min(3, 'Institute name must be at least 3 characters').max(200, 'Institute name must be less than 200 characters'),
  domain: z.string().regex(/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email domain format (e.g., @university.edu)'),
  address: z.string().optional(),
});

// Authentication validation schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Assignment validation schemas
export const assignmentSchema = z.object({
  title: z.string().min(3, 'Assignment title must be at least 3 characters').max(200, 'Assignment title must be less than 200 characters'),
  description: z.string().min(10, 'Assignment description must be at least 10 characters').max(1000, 'Assignment description must be less than 1000 characters'),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
  maxMarks: z.number().min(1, 'Maximum marks must be at least 1').max(1000, 'Maximum marks must be at most 1000'),
});

// Timetable validation schemas
export const timetableEntrySchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  facultyId: z.string().min(1, 'Faculty is required'),
  class: z.string().min(1, 'Class is required'),
  room: z.string().min(1, 'Room is required'),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  timeSlot: z.string().min(1, 'Time slot is required'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format'),
});

// Utility validation functions
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validateRollNumber = (rollNumber: string, department: string): boolean => {
  // Basic validation - can be customized based on institute requirements
  const rollRegex = new RegExp(`^${department.toUpperCase()}[0-9]{4}[0-9]{3}$`, 'i');
  return rollRegex.test(rollNumber);
};

export const validateTimeSlot = (startTime: string, endTime: string): boolean => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return end > start;
};

export const validateClassCapacity = (currentStudents: number, maxCapacity: number = 60): boolean => {
  return currentStudents < maxCapacity;
};

export const validateAcademicYear = (year: string): boolean => {
  const yearRegex = /^20[0-9]{2}-20[0-9]{2}$/;
  if (!yearRegex.test(year)) return false;
  
  const [startYear, endYear] = year.split('-').map(Number);
  return endYear === startYear + 1;
};

// Form validation helpers
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  return errors?.[fieldName]?.message;
};

export const hasFieldError = (errors: any, fieldName: string): boolean => {
  return !!errors?.[fieldName];
};

// Type exports for form validation
export type StudentFormData = z.infer<typeof studentSchema>;
export type FacultyFormData = z.infer<typeof facultySchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type InstituteFormData = z.infer<typeof instituteSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type TimetableEntryFormData = z.infer<typeof timetableEntrySchema>;
