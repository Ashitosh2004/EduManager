import { useState, useEffect } from 'react';
import { firestoreService } from '@/services/firestoreService';
import { useAuth } from '@/contexts/AuthContext';

export interface UseFirestoreOptions {
  enabled?: boolean;
}

export const useFirestore = () => {
  const { institute } = useAuth();

  const useStudentsByClass = (department: string, className: string, options: UseFirestoreOptions = {}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!institute || !department || !className || options.enabled === false) {
        return;
      }

      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const students = await firestoreService.getStudentsByClass(institute.id, department, className);
          setData(students);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch students');
          console.error('Error fetching students:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [institute, department, className, options.enabled]);

    return { data, loading, error, refetch: () => {} };
  };

  const useFacultyByDepartment = (department: string, options: UseFirestoreOptions = {}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!institute || !department || options.enabled === false) {
        return;
      }

      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const faculty = await firestoreService.getFacultyByDepartment(institute.id, department);
          setData(faculty);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch faculty');
          console.error('Error fetching faculty:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [institute, department, options.enabled]);

    return { data, loading, error, refetch: () => {} };
  };

  const useCoursesByDepartment = (department: string, options: UseFirestoreOptions = {}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!institute || !department || options.enabled === false) {
        return;
      }

      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const courses = await firestoreService.getCoursesByDepartment(institute.id, department);
          setData(courses);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch courses');
          console.error('Error fetching courses:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [institute, department, options.enabled]);

    return { data, loading, error, refetch: () => {} };
  };

  const useStatistics = () => {
    const [data, setData] = useState({ students: 0, faculty: 0, courses: 0, timetables: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (!institute) {
        return;
      }

      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const stats = await firestoreService.getStatistics(institute.id);
          setData(stats);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
          console.error('Error fetching statistics:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [institute]);

    return { data, loading, error, refetch: () => {} };
  };

  return {
    useStudentsByClass,
    useFacultyByDepartment,
    useCoursesByDepartment,
    useStatistics,
  };
};
