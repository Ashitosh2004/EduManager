import { Computer, Zap, Cog, BookOpen, Monitor, Wrench, Factory, Calculator, Beaker, Briefcase } from 'lucide-react';

export interface DepartmentTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
}

// Default icons and colors for departments
export const departmentIconsAndColors = [
  { icon: Computer, color: 'bg-blue-500' },
  { icon: Zap, color: 'bg-green-500' },
  { icon: Cog, color: 'bg-orange-500' },
  { icon: BookOpen, color: 'bg-purple-500' },
  { icon: Monitor, color: 'bg-red-500' },
  { icon: Wrench, color: 'bg-yellow-500' },
  { icon: Factory, color: 'bg-gray-500' },
  { icon: Calculator, color: 'bg-indigo-500' },
  { icon: Beaker, color: 'bg-pink-500' },
  { icon: Briefcase, color: 'bg-teal-500' },
];

// Default departments for new institutes
export const defaultDepartments = [
  { id: 'cse', name: 'Computer Science', icon: Computer, color: 'bg-blue-500' },
  { id: 'ece', name: 'Electronics & Comm.', icon: Zap, color: 'bg-green-500' },
  { id: 'mech', name: 'Mechanical Engg.', icon: Cog, color: 'bg-orange-500' },
];

// Generate class options for a department
export const generateClassesForDepartment = (departmentId: string): string[] => {
  const deptCode = departmentId.toUpperCase();
  return [
    `${deptCode}-A (1st Year)`,
    `${deptCode}-B (1st Year)`,
    `${deptCode}-A (2nd Year)`,
    `${deptCode}-B (2nd Year)`,
    `${deptCode}-A (3rd Year)`,
    `${deptCode}-B (3rd Year)`,
    `${deptCode}-A (4th Year)`,
    `${deptCode}-B (4th Year)`,
  ];
};

// Default subjects for departments
export const defaultSubjects: Record<string, string[]> = {
  cse: ['Data Structures', 'Algorithms', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
  ece: ['Digital Electronics', 'Signal Processing', 'Communication Systems', 'Microprocessors', 'VLSI Design', 'Control Systems'],
  mech: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes', 'Heat Transfer', 'Dynamics'],
};