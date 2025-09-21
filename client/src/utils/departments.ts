import { Computer, Zap, Cog, BookOpen, Monitor, Wrench, Factory, Calculator, Beaker, Briefcase, Palette } from 'lucide-react';

export interface DepartmentTemplate {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export interface DepartmentColor {
  name: string;
  class: string;
  gradient: string;
  iconClass: string;
  hoverGradient: string;
}

// Enhanced color system with gradients
export const departmentColors: DepartmentColor[] = [
  {
    name: 'Ocean Blue',
    class: 'bg-blue-500',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.08))',
    iconClass: 'bg-blue-500',
    hoverGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.12))'
  },
  {
    name: 'Forest Green',
    class: 'bg-green-500',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(134, 239, 172, 0.08))',
    iconClass: 'bg-green-500',
    hoverGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(134, 239, 172, 0.12))'
  },
  {
    name: 'Sunset Orange',
    class: 'bg-orange-500',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(254, 215, 170, 0.08))',
    iconClass: 'bg-orange-500',
    hoverGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(254, 215, 170, 0.12))'
  },
  {
    name: 'Royal Purple',
    class: 'bg-purple-500',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(221, 214, 254, 0.08))',
    iconClass: 'bg-purple-500',
    hoverGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(221, 214, 254, 0.12))'
  },
  {
    name: 'Cherry Red',
    class: 'bg-red-500',
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(252, 165, 165, 0.08))',
    iconClass: 'bg-red-500',
    hoverGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(252, 165, 165, 0.12))'
  },
  {
    name: 'Golden Yellow',
    class: 'bg-yellow-500',
    gradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(254, 240, 138, 0.08))',
    iconClass: 'bg-yellow-500',
    hoverGradient: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(254, 240, 138, 0.12))'
  },
  {
    name: 'Steel Gray',
    class: 'bg-gray-500',
    gradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15), rgba(209, 213, 219, 0.08))',
    iconClass: 'bg-gray-500',
    hoverGradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(209, 213, 219, 0.12))'
  },
  {
    name: 'Deep Indigo',
    class: 'bg-indigo-500',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(199, 210, 254, 0.08))',
    iconClass: 'bg-indigo-500',
    hoverGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(199, 210, 254, 0.12))'
  },
  {
    name: 'Rose Pink',
    class: 'bg-pink-500',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(251, 207, 232, 0.08))',
    iconClass: 'bg-pink-500',
    hoverGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(251, 207, 232, 0.12))'
  },
  {
    name: 'Mint Teal',
    class: 'bg-teal-500',
    gradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(153, 246, 228, 0.08))',
    iconClass: 'bg-teal-500',
    hoverGradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(153, 246, 228, 0.12))'
  },
  {
    name: 'Violet Dream',
    class: 'bg-violet-500',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(221, 214, 254, 0.08))',
    iconClass: 'bg-violet-500',
    hoverGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(221, 214, 254, 0.12))'
  },
  {
    name: 'Emerald Green',
    class: 'bg-emerald-500',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(167, 243, 208, 0.08))',
    iconClass: 'bg-emerald-500',
    hoverGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(167, 243, 208, 0.12))'
  }
];

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
  { icon: Palette, color: 'bg-violet-500' },
];

// Helper function to get color details
export const getDepartmentColorDetails = (colorClass: string): DepartmentColor => {
  return departmentColors.find(color => color.class === colorClass) || departmentColors[0];
};

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