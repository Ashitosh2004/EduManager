import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Institute, 
  Faculty, 
  Student, 
  Course, 
  Classroom,
  Timetable, 
  SessionIndexEntry,
  User,
  Activity,
  Event as EventType,
  FirestoreCollections 
} from '@/types';

class FirestoreService {
  // Generic CRUD operations
  private async getCollection<T extends keyof FirestoreCollections>(
    collectionName: T
  ) {
    return collection(db, collectionName);
  }

  private async getDocument<T extends keyof FirestoreCollections>(
    collectionName: T,
    id: string
  ): Promise<FirestoreCollections[T] | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirestoreCollections[T];
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName} document:`, error);
      throw error;
    }
  }

  // Institute operations
  async getInstitutes(): Promise<Institute[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'institutes'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Institute[];
    } catch (error) {
      console.error('Error getting institutes:', error);
      throw error;
    }
  }

  async getInstitute(id: string): Promise<Institute | null> {
    return this.getDocument('institutes', id);
  }

  async createInstitute(institute: Omit<Institute, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'institutes'), institute);
      return docRef.id;
    } catch (error) {
      console.error('Error creating institute:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    return this.getDocument('users', id);
  }

  async createUser(user: Omit<User, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'users'), user);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserWithId(id: string, user: Omit<User, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await setDoc(docRef, user, { merge: true });
    } catch (error) {
      console.error('Error creating user with ID:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Faculty operations
  async getFacultyByInstitute(instituteId: string): Promise<Faculty[]> {
    try {
      const q = query(
        collection(db, 'faculty'),
        where('instituteId', '==', instituteId)
      );
      const querySnapshot = await getDocs(q);
      const faculty = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Faculty[];
      
      // Sort in memory instead of using Firestore orderBy
      return faculty.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Error getting faculty:', error);
      // Return empty array to prevent crashes
      return [];
    }
  }

  async getFacultyByDepartment(instituteId: string, department: string): Promise<Faculty[]> {
    try {
      // Get all faculty for institute first
      const allFaculty = await this.getFacultyByInstitute(instituteId);
      
      // Filter by department in memory
      return allFaculty.filter(faculty => faculty.department === department);
    } catch (error) {
      console.error('Error getting faculty by department:', error);
      return [];
    }
  }

  async createFaculty(faculty: Omit<Faculty, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'faculty'), {
        ...faculty,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error;
    }
  }

  async updateFaculty(id: string, updates: Partial<Faculty>): Promise<void> {
    try {
      const docRef = doc(db, 'faculty', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating faculty:', error);
      throw error;
    }
  }

  async deleteFaculty(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'faculty', id));
    } catch (error) {
      console.error('Error deleting faculty:', error);
      throw error;
    }
  }

  // Student operations
  async getStudentsByClass(instituteId: string, department: string, className: string): Promise<Student[]> {
    try {
      // Simple query without composite indexes
      const q = query(
        collection(db, 'students'),
        where('instituteId', '==', instituteId)
      );
      const querySnapshot = await getDocs(q);
      const students = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      // Filter and sort in memory
      return students
        .filter(student => student.department === department && student.class === className)
        .sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || ''));
    } catch (error) {
      console.error('Error getting students by class:', error);
      return [];
    }
  }

  async createStudent(student: Omit<Student, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }

  // Course operations
  async getCoursesByInstitute(instituteId: string): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses'),
        where('instituteId', '==', instituteId)
      );
      const querySnapshot = await getDocs(q);
      const courses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      // Sort in memory instead of using Firestore orderBy
      return courses.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }

  async getCoursesByDepartment(instituteId: string, department: string): Promise<Course[]> {
    try {
      // Get all courses for institute first
      const allCourses = await this.getCoursesByInstitute(instituteId);
      
      // Filter by department in memory
      return allCourses.filter((course: Course) => course.department === department);
    } catch (error) {
      console.error('Error getting courses by department:', error);
      return [];
    }
  }

  async createCourse(course: Omit<Course, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...course,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
    try {
      const docRef = doc(db, 'courses', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Classroom operations
  async getClassroomsByInstitute(instituteId: string): Promise<Classroom[]> {
    try {
      const q = query(
        collection(db, 'classrooms'),
        where('instituteId', '==', instituteId)
      );
      const querySnapshot = await getDocs(q);
      const classrooms = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Classroom[];
      
      return classrooms.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('Error getting classrooms:', error);
      return [];
    }
  }

  async createClassroom(classroom: Omit<Classroom, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'classrooms'), classroom);
      return docRef.id;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  }

  // Timetable operations
  async getTimetablesByInstitute(instituteId: string): Promise<Timetable[]> {
    try {
      const q = query(
        collection(db, 'timetables'),
        where('instituteId', '==', instituteId)
      );
      const querySnapshot = await getDocs(q);
      const timetables = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          generatedAt: data.generatedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        } as unknown as Timetable;
      });
      
      // Sort in memory instead of using Firestore orderBy
      return timetables.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    } catch (error) {
      console.error('Error getting timetables:', error);
      return [];
    }
  }

  async getTimetablesByFilters(instituteId: string, filters: {
    department?: string;
    class?: string;
    semester?: string;
  }): Promise<Timetable[]> {
    try {
      const allTimetables = await this.getTimetablesByInstitute(instituteId);
      
      return allTimetables.filter(timetable => {
        if (filters.department && timetable.department !== filters.department) return false;
        if (filters.class && timetable.class !== filters.class) return false;
        if (filters.semester && timetable.semester !== filters.semester) return false;
        return true;
      });
    } catch (error) {
      console.error('Error getting filtered timetables:', error);
      return [];
    }
  }

  async getTimetableByClass(instituteId: string, className: string, semester: string): Promise<Timetable | null> {
    try {
      const q = query(
        collection(db, 'timetables'),
        where('instituteId', '==', instituteId),
        where('class', '==', className),
        where('semester', '==', semester)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Convert and sort in memory to avoid composite index requirement
        const timetables = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            generatedAt: data.generatedAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as Timetable;
        });
        
        // Sort by generatedAt desc and return the most recent
        timetables.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
        return timetables[0];
      }
      return null;
    } catch (error) {
      console.error('Error getting timetable by class:', error);
      throw error;
    }
  }

  async saveTimetable(timetable: Omit<Timetable, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'timetables'), {
        ...timetable,
        generatedAt: new Date(),
        createdAt: new Date()
      });
      
      // Also save to session index for efficient conflict detection
      await this.saveSessionIndex(docRef.id, timetable.entries, timetable.instituteId, timetable.department);
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving timetable:', error);
      throw error;
    }
  }

  // Session index operations for conflict detection
  async saveSessionIndex(timetableId: string, entries: any[], instituteId: string, department: string): Promise<void> {
    try {
      const batch: Promise<void>[] = [];
      
      entries.forEach(entry => {
        const sessionIndexEntry: Omit<SessionIndexEntry, 'id'> = {
          instituteId,
          department: entry.department || department, // Use entry department or fallback to timetable department
          class: entry.class,
          day: entry.day,
          startMinutes: this.timeToMinutes(entry.startTime),
          endMinutes: this.timeToMinutes(entry.endTime),
          facultyId: entry.facultyId,
          room: entry.room,
          timetableId
        };
        
        // Use setDoc for idempotent writes
        const docId = `${timetableId}-${entry.id}`;
        const docRef = doc(db, 'session_index', docId);
        const promise = setDoc(docRef, { ...sessionIndexEntry, id: docId });
        batch.push(promise);
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error saving session index:', error);
    }
  }

  async getConflictingSessions(entry: {
    instituteId: string;
    facultyId: string;
    room: string;
    day: string;
    startMinutes: number;
    endMinutes: number;
    class: string;
  }): Promise<SessionIndexEntry[]> {
    try {
      const queries: Promise<any>[] = [];
      
      // Query for faculty conflicts (always needed)
      queries.push(
        getDocs(query(
          collection(db, 'session_index'),
          where('instituteId', '==', entry.instituteId),
          where('day', '==', entry.day),
          where('facultyId', '==', entry.facultyId)
        ))
      );
      
      // Query for room conflicts (only if room is specified)
      if (entry.room && entry.room.trim()) {
        queries.push(
          getDocs(query(
            collection(db, 'session_index'),
            where('instituteId', '==', entry.instituteId),
            where('day', '==', entry.day),
            where('room', '==', entry.room)
          ))
        );
      }
      
      const results = await Promise.all(queries);
      const allSessions = new Map<string, SessionIndexEntry>();
      
      // Merge results from all queries
      results.forEach(queryResult => {
        queryResult.docs.forEach((doc: any) => {
          const session = { id: doc.id, ...doc.data() } as SessionIndexEntry;
          allSessions.set(doc.id, session);
        });
      });
      
      // Filter for overlapping sessions (excluding same class)
      return Array.from(allSessions.values()).filter(session => {
        const hasOverlap = entry.startMinutes < session.endMinutes && session.startMinutes < entry.endMinutes;
        const differentClass = session.class !== entry.class;
        
        return hasOverlap && differentClass;
      });
    } catch (error) {
      console.error('Error getting conflicting sessions:', error);
      return [];
    }
  }

  // Helper methods
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async updateTimetable(id: string, updates: Partial<Timetable>): Promise<void> {
    try {
      const docRef = doc(db, 'timetables', id);
      await updateDoc(docRef, updates);
      
      // If entries are updated, rebuild session index
      if (updates.entries) {
        let instituteId = updates.instituteId;
        let department = updates.department;
        
        // Fetch existing timetable if instituteId or department not provided
        if (!instituteId || !department) {
          const existingTimetable = await this.getDocument('timetables', id);
          if (existingTimetable) {
            instituteId = instituteId || existingTimetable.instituteId;
            department = department || existingTimetable.department;
          }
        }
        
        if (instituteId && department) {
          await this.deleteSessionIndex(id);
          await this.saveSessionIndex(id, updates.entries, instituteId, department);
        }
      }
    } catch (error) {
      console.error('Error updating timetable:', error);
      throw error;
    }
  }

  async deleteTimetable(id: string): Promise<void> {
    try {
      // Delete session index entries first
      await this.deleteSessionIndex(id);
      
      // Then delete the timetable document
      await deleteDoc(doc(db, 'timetables', id));
    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw error;
    }
  }

  async deleteSessionIndex(timetableId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'session_index'),
        where('timetableId', '==', timetableId)
      );
      const querySnapshot = await getDocs(q);
      
      const batch: Promise<void>[] = [];
      querySnapshot.docs.forEach(doc => {
        batch.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error deleting session index:', error);
    }
  }

  // Activity operations
  async getRecentActivities(instituteId: string, limitCount: number = 10): Promise<Activity[]> {
    try {
      // Simple query without orderBy to avoid composite index requirement
      const q = query(
        collection(db, 'activities'),
        where('instituteId', '==', instituteId),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Activity[];
      
      // Sort in memory instead of using Firestore orderBy
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error getting recent activities:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  async createActivity(activity: Omit<Activity, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        timestamp: activity.timestamp || new Date(),
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  }

  // Event operations
  async getUpcomingEvents(instituteId: string, limitCount: number = 10): Promise<EventType[]> {
    try {
      // Simple query without complex where clauses to avoid composite index requirement
      const q = query(
        collection(db, 'events'),
        where('instituteId', '==', instituteId),
        limit(50) // Get more docs to filter in memory
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as EventType[];
      
      // Filter and sort in memory instead of using complex Firestore queries
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      return events
        .filter(event => event.date >= now)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  async createEvent(event: Omit<EventType, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...event,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<EventType>): Promise<void> {
    try {
      const docRef = doc(db, 'events', id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Statistics
  async getStatistics(instituteId: string) {
    try {
      const [studentsSnapshot, facultySnapshot, coursesSnapshot, timetablesSnapshot, classroomsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'students'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'faculty'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'courses'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'timetables'), where('instituteId', '==', instituteId))),
        getDocs(query(collection(db, 'classrooms'), where('instituteId', '==', instituteId)))
      ]);

      return {
        students: studentsSnapshot.size,
        faculty: facultySnapshot.size,
        courses: coursesSnapshot.size,
        timetables: timetablesSnapshot.size,
        classrooms: classroomsSnapshot.size
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
